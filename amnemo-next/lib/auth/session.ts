import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyToken, type JwtPayload } from "./jwt";
import { AUTH_CONFIG } from "./config";
import { prisma } from "@/lib/prisma";

export async function getSession(): Promise<JwtPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_CONFIG.cookieName)?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function requireSession(): Promise<JwtPayload> {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  // Vérifier en base que l'utilisateur a toujours accès à l'organisation
  // Cela permet de détecter:
  // - Utilisateur supprimé
  // - Utilisateur retiré de l'organisation
  // - Organisation supprimée
  // - Changement de rôle
  const userOrg = await prisma.userOrganization.findUnique({
    where: {
      userId_organizationId: {
        userId: session.userId,
        organizationId: session.organizationId
      }
    }
  });

  if (!userOrg) {
    // Accès révoqué : rediriger vers logout qui supprime le cookie et redirige vers login
    redirect("/api/auth/logout");
  }

  // IMPORTANT: Utiliser le rôle de la base de données, pas celui du JWT
  // Cela garantit que les changements de rôle sont instantanés
  return {
    userId: session.userId,
    organizationId: session.organizationId,
    role: userOrg.role,
  };
}
