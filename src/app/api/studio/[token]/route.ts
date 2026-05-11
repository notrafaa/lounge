import { NextResponse } from "next/server";
import { requestBotAction } from "@/lib/botApi";
import { loungeTokenFilter, safeLoungeToken } from "@/lib/loungeTokenFilter";
import { ensureStudioApiAccess } from "@/lib/studioAuth";
import { supabaseServer } from "@/lib/supabaseServer";

export async function POST(request: Request, context: { params: Promise<{ token: string }> }) {
  const { token } = await context.params;
  const body = await request.json().catch(() => ({}));
  const lounge = await getLoungeByToken(token);
  if (!lounge) return NextResponse.json({ error: "Studio introuvable." }, { status: 404 });
  const denied = await ensureStudioApiAccess(lounge.owner_user_id);
  if (denied) return denied;

  const payload = { loungeId: lounge.id };
  if (body.action === "repair") return NextResponse.json(await requestBotAction("repair_lounge", payload, { timeoutMs: 20_000 }));
  if (body.action === "delete") return NextResponse.json(await requestBotAction("delete_lounge", payload, { timeoutMs: 20_000 }));
  if (body.action === "visibility") {
    return NextResponse.json(await requestBotAction("set_visibility", { ...payload, visibility: body.visibility }, { timeoutMs: 20_000 }));
  }
  if (body.action === "theme") {
    return NextResponse.json(await requestBotAction("set_theme", { ...payload, theme: body.theme }, { timeoutMs: 20_000 }));
  }
  if (body.action === "rename") {
    return NextResponse.json(await requestBotAction("rename_lounge", { ...payload, name: body.name }, { timeoutMs: 20_000 }));
  }
  if (body.action === "rename_voice") {
    return NextResponse.json(await requestBotAction("rename_voice", { ...payload, name: body.name }, { timeoutMs: 20_000 }));
  }
  if (body.action === "toggle_notifications") {
    return NextResponse.json(await requestBotAction("toggle_lounge_notifications", payload, { timeoutMs: 20_000 }));
  }
  if (body.action === "invite_member") {
    return NextResponse.json(await requestBotAction("invite_member", { ...payload, targetUserId: body.targetUserId }, { timeoutMs: 20_000 }));
  }
  if (body.action === "remove_member") {
    return NextResponse.json(await requestBotAction("remove_member", { ...payload, targetUserId: body.targetUserId }, { timeoutMs: 20_000 }));
  }
  if (body.action === "notify") {
    return NextResponse.json(await requestBotAction("notify_lounge", { ...payload, message: body.message }, { timeoutMs: 20_000 }));
  }

  return NextResponse.json({ error: "Action inconnue." }, { status: 400 });
}

async function getLoungeByToken(token: string): Promise<{ id: string; owner_user_id: string } | null> {
  const safeToken = safeLoungeToken(token);
  if (!safeToken) return null;
  const supabase = supabaseServer();
  const { data, error } = await supabase
    .from("lounges")
    .select("id,owner_user_id")
    .or(loungeTokenFilter(safeToken))
    .is("deleted_at", null)
    .maybeSingle();
  if (error) return null;
  return data ?? null;
}
