import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Bell, Flame, Lock, MessageCircle, Mic, Sparkles, Unlock, Users } from "lucide-react";
import { supabaseServer } from "@/lib/supabaseServer";

interface LoungePageData {
  lounge: {
    id: string;
    guild_id: string;
    owner_user_id: string;
    category_id: string | null;
    voice_channel_id: string | null;
    text_channel_id: string | null;
    control_channel_id: string | null;
    name: string;
    visibility: "private" | "public";
    theme: string | null;
    notifications_enabled: boolean;
    activity_score: number;
    weekly_score: number;
    streak_days: number;
    last_activity_at: string | null;
  };
  owner: { username: string; avatar_url: string | null } | null;
  members: Array<{ user_id: string; status: string }>;
  preferences: {
    favorite_games: string[];
    favorite_topics: string[];
    vibe: string | null;
    bot_style: string | null;
  } | null;
}

const themeMap = {
  "moon-glass": {
    name: "Moon Glass",
    bg: "from-[#05070b] via-[#101722] to-[#05070b]",
    panel: "border-sky-200/18 bg-sky-100/8",
    accent: "text-sky-100",
    chip: "border-sky-200/20 bg-sky-200/10 text-sky-50"
  },
  champagne: {
    name: "Champagne",
    bg: "from-[#100e0a] via-[#241d13] to-[#080706]",
    panel: "border-amber-100/18 bg-amber-100/9",
    accent: "text-amber-100",
    chip: "border-amber-100/20 bg-amber-100/10 text-amber-50"
  },
  "lake-night": {
    name: "Lake Night",
    bg: "from-[#061013] via-[#0d2630] to-[#05090b]",
    panel: "border-cyan-100/18 bg-cyan-100/8",
    accent: "text-cyan-100",
    chip: "border-cyan-100/20 bg-cyan-100/10 text-cyan-50"
  },
  velvet: {
    name: "Velvet",
    bg: "from-[#100611] via-[#261126] to-[#070407]",
    panel: "border-fuchsia-100/18 bg-fuchsia-100/8",
    accent: "text-fuchsia-100",
    chip: "border-fuchsia-100/20 bg-fuchsia-100/10 text-fuchsia-50"
  }
};

export default async function LoungePublicPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await getLoungePage(id);
  if (!data) notFound();

  const theme = themeMap[(data.lounge.theme ?? "moon-glass") as keyof typeof themeMap] ?? themeMap["moon-glass"];
  const acceptedCount = data.members.filter((member) => member.status === "accepted").length;
  const invitedCount = data.members.filter((member) => member.status === "invited").length;

  return (
    <main className={`min-h-screen bg-gradient-to-br ${theme.bg} text-white`}>
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-4 py-5 md:px-6">
        <Link href="/dashboard/studio" className="mb-5 inline-flex w-fit items-center gap-2 text-sm text-white/55 transition hover:text-white">
          <ArrowLeft size={16} />
          Studio admin
        </Link>

        <section className="grid flex-1 gap-5 lg:grid-cols-[1.15fr_0.85fr]">
          <div className={`flex flex-col justify-between rounded-lg border p-6 shadow-glass ${theme.panel}`}>
            <div>
              <div className="mb-5 flex flex-wrap items-center gap-2">
                <span className={`rounded-md border px-3 py-1 text-sm ${theme.chip}`}>{theme.name}</span>
                <span className="rounded-md border border-white/10 bg-white/7 px-3 py-1 text-sm text-white/65">
                  {data.lounge.visibility === "public" ? "Public" : "Privé"}
                </span>
              </div>
              <h1 className="max-w-3xl text-4xl font-semibold leading-tight md:text-6xl">{data.lounge.name}</h1>
              <p className="mt-5 max-w-2xl text-base text-white/62 md:text-lg">
                Un mini-serveur personnel dans lounge: vocal, texte, invitations, permissions filtrées et ambiance qui suit son owner.
              </p>
            </div>

            <div className="mt-10 grid gap-3 sm:grid-cols-3">
              <Metric icon={<Flame size={18} />} label="Score" value={data.lounge.activity_score} />
              <Metric icon={<Users size={18} />} label="Membres" value={acceptedCount} />
              <Metric icon={<Bell size={18} />} label="Invités" value={invitedCount} />
            </div>
          </div>

          <aside className="space-y-5">
            <section className={`rounded-lg border p-5 shadow-glass ${theme.panel}`}>
              <div className="flex items-center gap-3">
                {data.owner?.avatar_url ? <img src={data.owner.avatar_url} alt="" className="h-12 w-12 rounded-md object-cover" /> : null}
                <div>
                  <p className="text-sm text-white/45">Owner</p>
                  <h2 className="text-xl font-semibold">{data.owner?.username ?? data.lounge.owner_user_id}</h2>
                </div>
              </div>
              <div className="mt-5 grid gap-2">
                <DiscordLink guildId={data.lounge.guild_id} channelId={data.lounge.voice_channel_id} icon={<Mic size={16} />} label="Ouvrir le vocal" />
                <DiscordLink guildId={data.lounge.guild_id} channelId={data.lounge.text_channel_id} icon={<MessageCircle size={16} />} label="Ouvrir le texte" />
              </div>
            </section>

            <section className={`rounded-lg border p-5 shadow-glass ${theme.panel}`}>
              <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                <Sparkles size={18} />
                Préférences
              </h2>
              <TagList items={[...(data.preferences?.favorite_games ?? []), ...(data.preferences?.favorite_topics ?? [])]} theme={theme} />
              <div className="mt-4 grid gap-3 text-sm text-white/62">
                <p>Vibe: <span className={theme.accent}>{data.preferences?.vibe ?? "chill"}</span></p>
                <p>Style de Louna: <span className={theme.accent}>{data.preferences?.bot_style ?? "calme"}</span></p>
              </div>
            </section>

            <section className={`rounded-lg border p-5 shadow-glass ${theme.panel}`}>
              <h2 className="mb-4 text-lg font-semibold">État</h2>
              <div className="grid gap-3">
                <StateLine icon={data.lounge.visibility === "public" ? <Unlock size={16} /> : <Lock size={16} />} label="Accès" value={data.lounge.visibility} />
                <StateLine icon={<Bell size={16} />} label="Notifications" value={data.lounge.notifications_enabled ? "activées" : "coupées"} />
                <StateLine icon={<Flame size={16} />} label="Streak" value={`${data.lounge.streak_days} jour(s)`} />
              </div>
            </section>
          </aside>
        </section>
      </div>
    </main>
  );
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
  return (
    <div className="rounded-md border border-white/10 bg-black/18 p-4">
      <p className="flex items-center gap-2 text-sm text-white/50">{icon}{label}</p>
      <strong className="mt-2 block text-2xl font-semibold">{value}</strong>
    </div>
  );
}

function DiscordLink({ guildId, channelId, icon, label }: { guildId: string; channelId: string | null; icon: React.ReactNode; label: string }) {
  if (!channelId) {
    return <div className="flex min-h-11 items-center gap-2 rounded-md border border-white/10 bg-white/5 px-3 text-sm text-white/35">{icon}{label}</div>;
  }

  return (
    <a href={`https://discord.com/channels/${guildId}/${channelId}`} className="flex min-h-11 items-center gap-2 rounded-md border border-white/12 bg-white/8 px-3 text-sm text-white/78 transition hover:bg-white/14">
      {icon}
      {label}
    </a>
  );
}

function TagList({ items, theme }: { items: string[]; theme: { chip: string } }) {
  if (!items.length) return <p className="text-sm text-white/45">Pas encore de préférences renseignées.</p>;
  return (
    <div className="flex flex-wrap gap-2">
      {items.slice(0, 8).map((item) => (
        <span key={item} className={`rounded-md border px-2.5 py-1 text-sm ${theme.chip}`}>{item}</span>
      ))}
    </div>
  );
}

function StateLine({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-md border border-white/10 bg-black/14 px-3 py-2 text-sm">
      <span className="flex items-center gap-2 text-white/55">{icon}{label}</span>
      <span className="text-white/85">{value}</span>
    </div>
  );
}

async function getLoungePage(id: string): Promise<LoungePageData | null> {
  const supabase = supabaseServer();
  const { data: lounge } = await supabase.from("lounges").select("*").eq("id", id).is("deleted_at", null).maybeSingle();
  if (!lounge) return null;

  const [{ data: owner }, { data: members }, { data: preferences }] = await Promise.all([
    supabase.from("profiles").select("username,avatar_url").eq("discord_user_id", lounge.owner_user_id).maybeSingle(),
    supabase.from("lounge_members").select("user_id,status").eq("lounge_id", lounge.id),
    supabase.from("lounge_preferences").select("favorite_games,favorite_topics,vibe,bot_style").eq("lounge_id", lounge.id).maybeSingle()
  ]);

  return {
    lounge: lounge as LoungePageData["lounge"],
    owner: owner ?? null,
    members: (members ?? []) as LoungePageData["members"],
    preferences: preferences ?? null
  };
}
