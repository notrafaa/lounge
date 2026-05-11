import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  DISCORD_OAUTH_STATE_COOKIE,
  OWNER_SESSION_COOKIE,
  signOwnerSession,
  verifyDiscordOAuthState
} from "@/lib/auth";

interface DiscordTokenResponse {
  access_token?: string;
  token_type?: string;
}

interface DiscordUserResponse {
  id: string;
  username: string;
  avatar: string | null;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const clientId = process.env.DISCORD_CLIENT_ID;
  const clientSecret = process.env.DISCORD_CLIENT_SECRET;

  if (!code || !state) return NextResponse.json({ error: "Connexion Discord incomplète." }, { status: 400 });
  if (!clientId || !clientSecret) return NextResponse.json({ error: "DISCORD_CLIENT_ID ou DISCORD_CLIENT_SECRET manquant côté web." }, { status: 500 });

  const cookieStore = await cookies();
  const expectedState = cookieStore.get(DISCORD_OAUTH_STATE_COOKIE)?.value;
  if (expectedState !== state) return NextResponse.json({ error: "Session Discord expirée. Réessaie." }, { status: 400 });

  const verifiedState = await verifyDiscordOAuthState(state);
  if (!verifiedState) return NextResponse.json({ error: "Session Discord invalide." }, { status: 400 });

  const redirectUri = `${url.origin}/api/auth/discord/callback`;
  const tokenResponse = await fetch("https://discord.com/api/oauth2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri
    })
  });

  if (!tokenResponse.ok) return NextResponse.json({ error: "Discord a refusé la connexion." }, { status: 401 });
  const token = (await tokenResponse.json()) as DiscordTokenResponse;
  if (!token.access_token) return NextResponse.json({ error: "Token Discord manquant." }, { status: 401 });

  const userResponse = await fetch("https://discord.com/api/users/@me", {
    headers: { Authorization: `Bearer ${token.access_token}` }
  });
  if (!userResponse.ok) return NextResponse.json({ error: "Impossible de lire le profil Discord." }, { status: 401 });

  const user = (await userResponse.json()) as DiscordUserResponse;
  const ownerToken = await signOwnerSession({
    discordUserId: user.id,
    username: user.username,
    avatarUrl: user.avatar ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=128` : null
  });

  cookieStore.set(OWNER_SESSION_COOKIE, ownerToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 30 * 24 * 60 * 60
  });
  cookieStore.delete(DISCORD_OAUTH_STATE_COOKIE);

  return NextResponse.redirect(new URL(verifiedState.next, url.origin));
}
