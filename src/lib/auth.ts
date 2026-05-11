import { jwtVerify, SignJWT } from "jose";

export const SESSION_COOKIE = "lounge_admin_session";
export const OWNER_SESSION_COOKIE = "lounge_owner_session";
export const DISCORD_OAUTH_STATE_COOKIE = "lounge_discord_oauth_state";

export interface AdminSession {
  role: "admin";
  issuedAt: number;
}

export interface OwnerSession {
  role: "owner";
  discordUserId: string;
  username: string;
  avatarUrl: string | null;
  issuedAt: number;
}

interface DiscordOAuthState {
  kind: "discord_oauth_state";
  next: string;
}

function secretKey(): Uint8Array {
  const secret = process.env.DASHBOARD_JWT_SECRET;
  if (!secret || secret.length < 16) throw new Error("DASHBOARD_JWT_SECRET est manquant ou trop court.");
  return new TextEncoder().encode(secret);
}

function safeNextPath(next: string): string {
  if (!next.startsWith("/")) return "/";
  if (next.startsWith("//")) return "/";
  return next;
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

export async function signOwnerSession(input: { discordUserId: string; username: string; avatarUrl: string | null }): Promise<string> {
  return new SignJWT({
    role: "owner",
    discordUserId: input.discordUserId,
    username: input.username,
    avatarUrl: input.avatarUrl
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(secretKey());
}

export async function verifyOwnerSessionToken(token?: string): Promise<OwnerSession | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey());
    if (payload.role !== "owner" || typeof payload.discordUserId !== "string" || typeof payload.username !== "string") return null;
    return {
      role: "owner",
      discordUserId: payload.discordUserId,
      username: payload.username,
      avatarUrl: typeof payload.avatarUrl === "string" ? payload.avatarUrl : null,
      issuedAt: Number(payload.iat ?? 0)
    };
  } catch {
    return null;
  }
}

export async function signDiscordOAuthState(next: string): Promise<string> {
  return new SignJWT({ kind: "discord_oauth_state", next: safeNextPath(next) })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("10m")
    .sign(secretKey());
}

export async function verifyDiscordOAuthState(token?: string): Promise<DiscordOAuthState | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey());
    if (payload.kind !== "discord_oauth_state" || typeof payload.next !== "string") return null;
    return { kind: "discord_oauth_state", next: safeNextPath(payload.next) };
  } catch {
    return null;
  }
}

export function assertAdminPassword(password: string): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  return Boolean(expected && password && password === expected);
}
