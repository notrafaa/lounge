import { NextResponse } from "next/server";
import { ensureApiSession } from "@/lib/apiAuth";
import { requestBotAction } from "@/lib/botApi";

export async function GET() {
  const denied = await ensureApiSession();
  if (denied) return denied;
  return NextResponse.json(await requestBotAction("list_channels"));
}
