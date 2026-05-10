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
  if (body.action === "theme") {
    return NextResponse.json(await requestBotAction("set_theme", { loungeId: params.id, theme: body.theme }, { timeoutMs: 20_000 }));
  }
  if (body.action === "rename") {
    return NextResponse.json(await requestBotAction("rename_lounge", { loungeId: params.id, name: body.name }, { timeoutMs: 20_000 }));
  }
  if (body.action === "rename_voice") {
    return NextResponse.json(await requestBotAction("rename_voice", { loungeId: params.id, name: body.name }, { timeoutMs: 20_000 }));
  }
  if (body.action === "toggle_notifications") {
    return NextResponse.json(await requestBotAction("toggle_lounge_notifications", { loungeId: params.id }, { timeoutMs: 20_000 }));
  }
  if (body.action === "invite_member") {
    return NextResponse.json(await requestBotAction("invite_member", { loungeId: params.id, targetUserId: body.targetUserId }, { timeoutMs: 20_000 }));
  }
  if (body.action === "remove_member") {
    return NextResponse.json(await requestBotAction("remove_member", { loungeId: params.id, targetUserId: body.targetUserId }, { timeoutMs: 20_000 }));
  }
  if (body.action === "accept_invitation") {
    return NextResponse.json(await requestBotAction("accept_invitation", { loungeId: params.id, targetUserId: body.targetUserId }, { timeoutMs: 20_000 }));
  }
  if (body.action === "decline_invitation") {
    return NextResponse.json(await requestBotAction("decline_invitation", { loungeId: params.id, targetUserId: body.targetUserId }, { timeoutMs: 20_000 }));
  }
  if (body.action === "notify") {
    return NextResponse.json(await requestBotAction("notify_lounge", { loungeId: params.id, message: body.message }, { timeoutMs: 20_000 }));
  }
  return NextResponse.json({ error: "Action inconnue." }, { status: 400 });
}
