import { jwtVerify, SignJWT } from "jose";

export const SESSION_COOKIE = "lounge_admin_session";

export interface AdminSession {
  role: "admin";
  issuedAt: number;
}

function secretKey(): Uint8Array {
  const secret = process.env.DASHBOARD_JWT_SECRET;
  if (!secret || secret.length < 16) throw new Error("DASHBOARD_JWT_SECRET est manquant ou trop court.");
  return new TextEncoder().encode(secret);
}

export async function signSession(): Promise<string> {
  return new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(secretKey());
}

export async function verifySessionToken(token?: string): Promise<AdminSession | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey());
    if (payload.role !== "admin") return null;
    return { role: "admin", issuedAt: Number(payload.iat ?? 0) };
  } catch {
    return null;
  }
}

export function assertAdminPassword(password: string): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  return Boolean(expected && password && password === expected);
}

