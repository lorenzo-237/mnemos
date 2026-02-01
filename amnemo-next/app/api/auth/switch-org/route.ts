import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { signToken } from "@/lib/auth/jwt";
import { AUTH_CONFIG } from "@/lib/auth/config";

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const { organizationId } = await request.json();

    const membership = await prisma.userOrganization.findUnique({
      where: {
        userId_organizationId: {
          userId: session.userId,
          organizationId: Number(organizationId)
        },
      },
    });

    if (!membership) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    const token = await signToken({
      userId: session.userId,
      organizationId: Number(organizationId),
      role: membership.role,
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
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
