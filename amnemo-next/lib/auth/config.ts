export const AUTH_CONFIG = {
  cookieName: "amnemo_session",
  secret: process.env.JWT_SECRET!,
  expiresIn: "7d",
} as const;
