import { appConfig } from "./config";
import { supabaseServer } from "./supabaseServer";

type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type BotBridgeRequestType =
  | "list_channels"
  | "send_message"
  | "create_lounge"
  | "repair_lounge"
  | "delete_lounge"
  | "set_visibility"
  | "set_theme"
  | "rename_lounge"
  | "rename_voice"
  | "toggle_lounge_notifications"
  | "invite_member"
  | "remove_member"
  | "accept_invitation"
  | "decline_invitation"
  | "notify_lounge";

interface BotBridgeRequestRow {
  id: string;
  status: "pending" | "processing" | "completed" | "failed" | "expired";
  result: Json | null;
  error: string | null;
}

interface BotStatusRow {
  bot_name: string | null;
  online: boolean | null;
  guild_count: number | null;
  uptime_seconds: number | null;
  last_seen_at: string | null;
}

const DEFAULT_TIMEOUT_MS = 12_000;
const POLL_INTERVAL_MS = 500;
const ONLINE_GRACE_MS = 45_000;

export async function requestBotAction<T>(
  type: BotBridgeRequestType,
  payload: Json = {},
  options: { timeoutMs?: number } = {}
): Promise<T> {
  const supabase = supabaseServer();
  const now = Date.now();
  const expiresAt = new Date(now + Math.max(options.timeoutMs ?? DEFAULT_TIMEOUT_MS, 30_000)).toISOString();

  const { data: inserted, error: insertError } = await supabase
    .from("bot_bridge_requests")
    .insert({
      guild_id: appConfig.guildId,
      type,
      payload,
      status: "pending",
      expires_at: expiresAt
    })
    .select("id")
    .single();

  if (insertError) throw insertError;
  const id = String(inserted.id);
  const deadline = Date.now() + (options.timeoutMs ?? DEFAULT_TIMEOUT_MS);

  while (Date.now() < deadline) {
    const { data, error } = await supabase
      .from("bot_bridge_requests")
      .select("id,status,result,error")
      .eq("id", id)
      .single<BotBridgeRequestRow>();

    if (error) throw error;
    if (data.status === "completed") return data.result as T;
    if (data.status === "failed" || data.status === "expired") {
      throw new Error(data.error ?? "Le bot n'a pas pu traiter la demande.");
    }

    await sleep(POLL_INTERVAL_MS);
  }

  throw new Error("Le bot n'a pas répondu via Supabase. Vérifie qu'il est lancé et connecté au même projet Supabase.");
}

export async function getBotStatus() {
  try {
    const supabase = supabaseServer();
    const { data, error } = await supabase
      .from("bot_status")
      .select("bot_name,online,guild_count,uptime_seconds,last_seen_at")
      .eq("guild_id", appConfig.guildId)
      .maybeSingle<BotStatusRow>();

    if (error) throw error;
    const lastSeenAt = data?.last_seen_at ? new Date(data.last_seen_at).getTime() : 0;
    const fresh = lastSeenAt > 0 && Date.now() - lastSeenAt < ONLINE_GRACE_MS;

    return {
      online: Boolean(data?.online && fresh),
      guildCount: data?.guild_count ?? 0,
      uptime: data?.uptime_seconds ?? 0,
      bot: data?.bot_name ?? "Louna"
    };
  } catch {
    return {
      online: false,
      guildCount: 0,
      uptime: 0,
      bot: "Louna"
    };
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
