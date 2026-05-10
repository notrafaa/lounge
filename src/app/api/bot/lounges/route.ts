import { NextResponse } from "next/server";
import { ensureApiSession } from "@/lib/apiAuth";
import { requestBotAction } from "@/lib/botApi";
import { supabaseServer } from "@/lib/supabaseServer";
import { appConfig } from "@/lib/config";

export async function GET() {
  const denied = await ensureApiSession();
  if (denied) return denied;
  const supabase = supabaseServer();
  const { data, error } = await supabase
    .from("lounges")
    .select("*")
    .eq("guild_id", appConfig.guildId)
    .is("deleted_at", null)
    .order("updated_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

export async function POST(request: Request) {
  const denied = await ensureApiSession();
  if (denied) return denied;
  const body = await request.json();
  const result = await requestBotAction(
    "create_lounge",
    {
      ownerUserId: body.ownerUserId,
      name: body.name,
      theme: body.theme
    },
    { timeoutMs: 30_000 }
  );
  return NextResponse.json(result);
}
