import { NextResponse } from "next/server";
import { ensureApiSession } from "@/lib/apiAuth";
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

