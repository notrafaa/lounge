import { NextResponse } from "next/server";
import { ensureApiSession } from "@/lib/apiAuth";
import { getBotStatus } from "@/lib/botApi";

export async function GET() {
  const denied = await ensureApiSession();
  if (denied) return denied;
  return NextResponse.json(await getBotStatus());
}

