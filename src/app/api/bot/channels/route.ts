import { NextResponse } from "next/server";
import { ensureApiSession } from "@/lib/apiAuth";
import { botApi } from "@/lib/botApi";
import { appConfig } from "@/lib/config";

export async function GET() {
  const denied = await ensureApiSession();
  if (denied) return denied;
  return NextResponse.json(await botApi(`/guild/${appConfig.guildId}/channels`));
}

