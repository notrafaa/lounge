import { NextResponse } from "next/server";
import { ensureApiSession } from "@/lib/apiAuth";
import { appConfig } from "@/lib/config";
import { supabaseServer } from "@/lib/supabaseServer";

export async function GET() {
  const denied = await ensureApiSession();
  if (denied) return denied;
  const supabase = supabaseServer();
  const { data, error } = await supabase.from("bot_settings").select("*").eq("guild_id", appConfig.guildId).maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const denied = await ensureApiSession();
  if (denied) return denied;
  const body = await request.json();
  const supabase = supabaseServer();
  const { data, error } = await supabase
    .from("bot_settings")
    .upsert({ guild_id: appConfig.guildId, config: body.config ?? body, updated_at: new Date().toISOString() }, { onConflict: "guild_id" })
    .select("*")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

