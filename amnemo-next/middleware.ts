import { NextResponse, NextRequest } from "next/server";
import { verifyToken } from "./lib/auth/jwt";
import { AUTH_CONFIG } from "./lib/auth/config";

export async function middleware(request: NextRequest) {
  const token = request.cookies.get(AUTH_CONFIG.cookieName)?.value;

  // Routes publiques (accessibles sans authentification)
  const publicPaths = ["/login", "/setup", "/api/setup"];
  const isPublicPath = publicPaths.some(path =>
    request.nextUrl.pathname.startsWith(path)
  );

  if (isPublicPath) {
    if (token && await verifyToken(token)) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }

  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const payload = await verifyToken(token);
  if (!payload) {
    const response = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.delete(AUTH_CONFIG.cookieName);
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/auth).*)"],
};
