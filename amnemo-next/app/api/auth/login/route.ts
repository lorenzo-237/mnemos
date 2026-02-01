import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { comparePassword } from "@/lib/auth/password";
import { signToken } from "@/lib/auth/jwt";
import { AUTH_CONFIG } from "@/lib/auth/config";
import { z } from "zod";

const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password } = loginSchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { username },
      include: {
        organizations: {
          include: {
            organization: true
          }
        }
      }
    });

    if (!user || !(await comparePassword(password, user.passwordHash))) {
      return NextResponse.json({ error: "Identifiants invalides" }, { status: 401 });
    }

    if (user.organizations.length === 0) {
      return NextResponse.json({ error: "Aucune organisation associée" }, { status: 403 });
    }

    const firstOrg = user.organizations[0];
    const token = await signToken({
      userId: user.id,
      organizationId: firstOrg.organizationId,
      role: firstOrg.role,
    });

    const response = NextResponse.json({ success: true });
    response.cookies.set(AUTH_CONFIG.cookieName, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return response;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Données invalides" }, { status: 400 });
    }
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
