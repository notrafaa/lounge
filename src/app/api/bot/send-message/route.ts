import { NextResponse } from "next/server";
import { ensureApiSession } from "@/lib/apiAuth";
import { botApi } from "@/lib/botApi";
import { appConfig } from "@/lib/config";
import { rateLimit } from "@/lib/rateLimit";

export async function POST(request: Request) {
  const denied = await ensureApiSession();
  if (denied) return denied;
  if (!rateLimit("dashboard-send-message", 1200)) {
    return NextResponse.json({ error: "Trop rapide. Petit ping propre, pas rafale." }, { status: 429 });
  }

  const body = await request.json();
  const result = await botApi(`/guild/${appConfig.guildId}/send-message`, {
    method: "POST",
    body: JSON.stringify(body)
  });
  return NextResponse.json(result);
}

