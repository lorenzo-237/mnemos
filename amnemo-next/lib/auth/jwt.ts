import { SignJWT, jwtVerify, type JWTPayload } from "jose";
import { AUTH_CONFIG } from "./config";

const secret = new TextEncoder().encode(AUTH_CONFIG.secret);

export interface JwtPayload extends JWTPayload {
  userId: number;
  organizationId: number;
  role: "UTILISATEUR" | "GESTIONNAIRE" | "ADMIN";
}

export async function signToken(payload: JwtPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(AUTH_CONFIG.expiresIn)
    .sign(secret);
}

export async function verifyToken(token: string): Promise<JwtPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as JwtPayload;
  } catch {
    return null;
  }
}
