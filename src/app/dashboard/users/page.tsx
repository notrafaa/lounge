import { UsersClient, type DashboardUser } from "./view";
import { supabaseServer } from "@/lib/supabaseServer";

export default async function UsersPage() {
  const users = await getUsers();
  return <UsersClient users={users} />;
}

async function getUsers(): Promise<DashboardUser[]> {
  try {
    const supabase = supabaseServer();
    const [{ data: profiles }, { data: lounges }, { data: memberships }, { data: events }] = await Promise.all([
      supabase.from("profiles").select("*").order("updated_at", { ascending: false }).limit(1000),
      supabase.from("lounges").select("id,owner_user_id,deleted_at"),
      supabase.from("lounge_members").select("user_id,status"),
      supabase.from("lounge_activity_events").select("user_id,event_type,points,created_at").order("created_at", { ascending: false }).limit(10000)
    ]);

    const usernameCounts = new Map<string, number>();
    for (const profile of profiles ?? []) {
      const key = String(profile.username ?? "").toLowerCase();
      usernameCounts.set(key, (usernameCounts.get(key) ?? 0) + 1);
    }

    return (profiles ?? []).map((profile) => {
      const userId = String(profile.discord_user_id);
      const owned = (lounges ?? []).filter((lounge) => lounge.owner_user_id === userId && !lounge.deleted_at).length;
      const memberCount = (memberships ?? []).filter((member) => member.user_id === userId && member.status === "accepted").length;
      const userEvents = (events ?? []).filter((event) => event.user_id === userId);
      const activityPoints = userEvents.reduce((sum, event) => sum + Number(event.points ?? 0), 0);
      const flags = computeFlags(profile, activityPoints, owned, usernameCounts);
      const storedFlags = Array.isArray(profile.suspect_flags) ? profile.suspect_flags.filter((flag: unknown): flag is string => typeof flag === "string") : [];

      return {
        discord_user_id: userId,
        username: String(profile.username ?? "inconnu"),
        avatar_url: typeof profile.avatar_url === "string" ? profile.avatar_url : null,
        created_at: String(profile.created_at ?? new Date().toISOString()),
        updated_at: String(profile.updated_at ?? profile.created_at ?? new Date().toISOString()),
        discord_created_at: typeof profile.discord_created_at === "string" ? profile.discord_created_at : null,
        guild_joined_at: typeof profile.guild_joined_at === "string" ? profile.guild_joined_at : null,
        last_seen_at: typeof profile.last_seen_at === "string" ? profile.last_seen_at : null,
        total_message_count: Number(profile.total_message_count ?? userEvents.filter((event) => event.event_type === "message").length),
        total_voice_joins: Number(profile.total_voice_joins ?? userEvents.filter((event) => event.event_type === "voice_join").length),
        lounge_count: owned,
        member_count: memberCount,
        activity_points: activityPoints,
        activity_events: userEvents.length,
        risk_score: Number(profile.risk_score ?? 0) + flags.length + storedFlags.length,
        suspect_flags: [...new Set([...storedFlags, ...flags])]
      };
    });
  } catch {
    return [];
  }
}

function computeFlags(profile: Record<string, unknown>, activityPoints: number, loungeCount: number, usernameCounts: Map<string, number>): string[] {
  const flags: string[] = [];
  const now = Date.now();
  const username = String(profile.username ?? "").toLowerCase();
  const discordCreatedAt = typeof profile.discord_created_at === "string" ? new Date(profile.discord_created_at).getTime() : 0;
  const profileCreatedAt = typeof profile.created_at === "string" ? new Date(profile.created_at).getTime() : 0;

  if (!profile.avatar_url) flags.push("sans avatar");
  if (discordCreatedAt && now - discordCreatedAt < 7 * 24 * 60 * 60_000) flags.push("discord récent");
  if (profileCreatedAt && now - profileCreatedAt < 24 * 60 * 60_000) flags.push("profil nouveau");
  if ((usernameCounts.get(username) ?? 0) > 1) flags.push("pseudo partagé");
  if (activityPoints === 0 && loungeCount === 0) flags.push("zéro activité");

  return flags;
}
