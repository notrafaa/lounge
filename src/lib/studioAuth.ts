import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { OWNER_SESSION_COOKIE, SESSION_COOKIE, verifyOwnerSessionToken, verifySessionToken } from "./auth";

export interface StudioAccess {
  role: "admin" | "owner";
  discordUserId?: string;
  username?: string;
  avatarUrl?: string | null;
}

export async function getStudioAccess(ownerUserId: string): Promise<StudioAccess | null> {
  const cookieStore = await cookies();
  const admin = await verifySessionToken(cookieStore.get(SESSION_COOKIE)?.value);
  if (admin) return { role: "admin" };

  const owner = await verifyOwnerSessionToken(cookieStore.get(OWNER_SESSION_COOKIE)?.value);
  if (!owner || owner.discordUserId !== ownerUserId) return null;

  return {
    role: "owner",
    discordUserId: owner.discordUserId,
    username: owner.username,
    avatarUrl: owner.avatarUrl
  };
}

export async function getOwnerStudioSession() {
  const cookieStore = await cookies();
  return verifyOwnerSessionToken(cookieStore.get(OWNER_SESSION_COOKIE)?.value);
}

export async function ensureStudioApiAccess(ownerUserId: string): Promise<NextResponse | null> {
  const access = await getStudioAccess(ownerUserId);
  if (access) return null;
  return NextResponse.json({ error: "Connecte-toi avec le compte Discord owner de ce lounge." }, { status: 403 });
}

export function discordLoginUrl(nextPath: string): string {
  return `/api/auth/discord/start?next=${encodeURIComponent(nextPath)}`;
}
