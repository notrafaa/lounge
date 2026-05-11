import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { DISCORD_OAUTH_STATE_COOKIE, signDiscordOAuthState } from "@/lib/auth";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const clientId = process.env.DISCORD_CLIENT_ID;
  if (!clientId) return NextResponse.json({ error: "DISCORD_CLIENT_ID manquant côté web." }, { status: 500 });

  const next = url.searchParams.get("next") ?? "/";
  const state = await signDiscordOAuthState(next);
  const redirectUri = `${url.origin}/api/auth/discord/callback`;
  const discordUrl = new URL("https://discord.com/api/oauth2/authorize");
  discordUrl.searchParams.set("client_id", clientId);
  discordUrl.searchParams.set("redirect_uri", redirectUri);
  discordUrl.searchParams.set("response_type", "code");
  discordUrl.searchParams.set("scope", "identify");
  discordUrl.searchParams.set("state", state);

  const cookieStore = await cookies();
  cookieStore.set(DISCORD_OAUTH_STATE_COOKIE, state, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 10 * 60
  });

  return NextResponse.redirect(discordUrl);
}
