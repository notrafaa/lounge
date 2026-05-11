import { NextResponse } from "next/server";
import { ensureApiSession } from "@/lib/apiAuth";
import { requestBotAction } from "@/lib/botApi";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const denied = await ensureApiSession();
  if (denied) return denied;

  const { id } = await context.params;
  const body = await request.json().catch(() => ({}));

  if (body.action === "fetch_dm") {
    return NextResponse.json(await requestBotAction("fetch_user_dm", { userId: id, limit: body.limit ?? 50 }, { timeoutMs: 20_000 }));
  }
  if (body.action === "send_dm") {
    return NextResponse.json(
      await requestBotAction("send_user_dm", { userId: id, content: body.content, cleanupPrevious: body.cleanupPrevious ?? true }, { timeoutMs: 20_000 })
    );
  }
  if (body.action === "delete_bot_dms") {
    return NextResponse.json(await requestBotAction("delete_user_bot_dms", { userId: id, limit: body.limit ?? 100 }, { timeoutMs: 20_000 }));
  }
  if (body.action === "kick" || body.action === "ban") {
    return NextResponse.json(
      await requestBotAction("guild_member_action", { userId: id, action: body.action, reason: body.reason }, { timeoutMs: 20_000 })
    );
  }

  return NextResponse.json({ error: "Action inconnue." }, { status: 400 });
}
