import { NextResponse } from "next/server";
import { AUTH_CONFIG } from "@/lib/auth/config";

export async function POST() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete(AUTH_CONFIG.cookieName);
  return response;
}

export async function GET() {
  const response = NextResponse.redirect(new URL("/login", process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"));
  response.cookies.delete(AUTH_CONFIG.cookieName);
  return response;
}
