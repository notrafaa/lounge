import { Flame, Hash, MessageCircle, Users } from "lucide-react";
import { BotStatusCard } from "@/components/dashboard/BotStatusCard";
import { GlassCard } from "@/components/ui/GlassCard";
import { StatCard } from "@/components/ui/StatCard";
import { getBotStatus } from "@/lib/botApi";
import { supabaseServer } from "@/lib/supabaseServer";
import { appConfig } from "@/lib/config";

export default async function DashboardPage() {
  const [status, counts] = await Promise.all([getBotStatus(), getCounts()]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 xl:grid-cols-[1.3fr_2fr]">
        <BotStatusCard online={status.online} bot={status.bot} guildCount={status.guildCount} uptime={status.uptime} />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Lounges actifs" value={counts.lounges} />
        <StatCard label="Membres acceptés" value={counts.members} />
        <StatCard label="Messages aujourd'hui" value={counts.messagesToday} />
          <StatCard label="Score global" value={counts.globalScore} />
        </div>
      </div>
      <GlassCard className="overflow-hidden p-0">
        <div className="grid gap-0 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="p-6">
            <p className="text-xs uppercase tracking-[0.18em] text-lounge-champagne">Louna</p>
            <h2 className="mt-2 text-3xl font-semibold">Un serveur qui ne tombe pas dans l'oubli.</h2>
            <p className="mt-4 max-w-2xl text-white/58">
              Les salons personnels restent privés, réparables, mesurés et vivants. Louna garde une présence légère: invitations claires,
              notifications sous cooldown, flammes douces et dashboard admin côté serveur.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-4">
              <Pill icon={<Flame size={16} />} label="Flammes" />
              <Pill icon={<Users size={16} />} label="Invitations" />
              <Pill icon={<Hash size={16} />} label="Salons" />
              <Pill icon={<MessageCircle size={16} />} label="Messages" />
            </div>
          </div>
          <div className="min-h-72 bg-[url('/images/banner.png')] bg-cover bg-center" />
        </div>
      </GlassCard>
    </div>
  );
}

function Pill({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2 rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/70">
      {icon}
      {label}
    </div>
  );
}

async function getCounts() {
  try {
    const supabase = supabaseServer();
    const since = new Date();
    since.setHours(0, 0, 0, 0);
    const [{ count: lounges }, { count: members }, { count: messages }, { data: scoreRows }] = await Promise.all([
      supabase.from("lounges").select("*", { count: "exact", head: true }).eq("guild_id", appConfig.guildId).is("deleted_at", null),
      supabase.from("lounge_members").select("*", { count: "exact", head: true }).eq("status", "accepted"),
      supabase
        .from("lounge_activity_events")
        .select("*", { count: "exact", head: true })
        .eq("event_type", "message")
        .gte("created_at", since.toISOString()),
      supabase.from("lounges").select("activity_score").eq("guild_id", appConfig.guildId).is("deleted_at", null)
    ]);
    const globalScore = (scoreRows ?? []).reduce((sum, row) => sum + Number(row.activity_score ?? 0), 0);
    return { lounges: lounges ?? 0, members: members ?? 0, messagesToday: messages ?? 0, globalScore };
  } catch {
    return { lounges: 0, members: 0, messagesToday: 0, globalScore: 0 };
  }
}
