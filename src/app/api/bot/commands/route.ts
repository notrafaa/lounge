import { NextResponse } from "next/server";
import { ensureApiSession } from "@/lib/apiAuth";
import { appConfig } from "@/lib/config";
import { supabaseServer } from "@/lib/supabaseServer";

export async function GET() {
  const denied = await ensureApiSession();
  if (denied) return denied;
  const supabase = supabaseServer();
  const { data, error } = await supabase.from("custom_commands").select("*").eq("guild_id", appConfig.guildId).order("created_at");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

export async function POST(request: Request) {
  const denied = await ensureApiSession();
  if (denied) return denied;
  const body = await request.json();
  const supabase = supabaseServer();
  const { data, error } = await supabase
    .from("custom_commands")
    .insert({
      guild_id: appConfig.guildId,
      name: String(body.name ?? "").toLowerCase().replace(/[^a-z0-9_-]/g, ""),
      description: body.description ?? "",
      response_type: body.response_type ?? "text",
      response_text: body.response_text ?? "",
      embed_json: body.embed_json ?? null,
      cooldown_seconds: body.cooldown_seconds ?? 5,
      enabled: body.enabled ?? true
    })
    .select("*")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

