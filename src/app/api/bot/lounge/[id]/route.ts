import { NextResponse } from "next/server";
import { ensureApiSession } from "@/lib/apiAuth";
import { requestBotAction } from "@/lib/botApi";
import { supabaseServer } from "@/lib/supabaseServer";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const denied = await ensureApiSession();
  if (denied) return denied;
  const params = await context.params;
  const supabase = supabaseServer();
  const { data, error } = await supabase.from("lounges").select("*").eq("id", params.id).maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const denied = await ensureApiSession();
  if (denied) return denied;
  const params = await context.params;
  const body = await request.json();
  if (body.action === "repair") return NextResponse.json(await requestBotAction("repair_lounge", { loungeId: params.id }, { timeoutMs: 20_000 }));
  if (body.action === "delete") return NextResponse.json(await requestBotAction("delete_lounge", { loungeId: params.id }, { timeoutMs: 20_000 }));
  if (body.action === "visibility") {
    return NextResponse.json(await requestBotAction("set_visibility", { loungeId: params.id, visibility: body.visibility }, { timeoutMs: 20_000 }));
  }
  if (body.action === "notify") {
    return NextResponse.json(await requestBotAction("notify_lounge", { loungeId: params.id, message: body.message }, { timeoutMs: 20_000 }));
  }
  return NextResponse.json({ error: "Action inconnue." }, { status: 400 });
}
