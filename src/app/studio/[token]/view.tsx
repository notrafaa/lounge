"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Bell, Copy, DoorOpen, ExternalLink, Eye, EyeOff, Gamepad2, Hammer, RefreshCw, Trash2, UserMinus, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";
import { Input, Textarea } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";

export interface OwnerStudioData {
  lounge: {
    id: string;
    guild_id: string;
    owner_user_id: string;
    name: string;
    visibility: "private" | "public";
    theme: string | null;
    notifications_enabled: boolean;
    text_channel_id: string | null;
    control_channel_id: string | null;
    voice_channel_id: string | null;
    studio_token: string | null;
    activity_score: number;
    weekly_score: number;
    streak_days: number;
  };
  owner: {
    discord_user_id: string;
    username: string;
    avatar_url: string | null;
  } | null;
  members: Array<{
    user_id: string;
    status: string;
    notifications_enabled: boolean;
    invited_at: string;
    accepted_at: string | null;
    profile: {
      username: string;
      avatar_url: string | null;
      last_seen_at: string | null;
      total_message_count: number | null;
      total_voice_joins: number | null;
    } | null;
  }>;
  preferences: {
    favorite_games: string[];
    favorite_topics: string[];
    vibe: string | null;
    bot_style: string | null;
  } | null;
}

const themes = [
  { id: "moon-glass", label: "Moon Glass", swatch: "bg-[#92b4d6]" },
  { id: "champagne", label: "Champagne", swatch: "bg-[#e8e1d7]" },
  { id: "lake-night", label: "Lake Night", swatch: "bg-[#4f7f92]" },
  { id: "velvet", label: "Velvet", swatch: "bg-[#c9a5bb]" }
];

export function OwnerStudioClient({ data, token }: { data: OwnerStudioData; token: string }) {
  const [lounge, setLounge] = useState(data.lounge);
  const [rename, setRename] = useState(data.lounge.name);
  const [voiceName, setVoiceName] = useState("");
  const [targetUserId, setTargetUserId] = useState("");
  const [notifyMessage, setNotifyMessage] = useState("Petit mouvement dans le lounge.");
  const [status, setStatus] = useState("");
  const snakeLink = useMemo(() => `/game/snake/${token}`, [token]);

  async function action(actionName: string, payload: Record<string, unknown> = {}) {
    setStatus("Action en cours...");
    const response = await fetch(`/api/studio/${token}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: actionName, ...payload })
    });
    const result = await response.json().catch(() => ({}));
    setStatus(response.ok ? "Action terminée." : result.error ?? "Erreur.");
    if (response.ok && result?.id) setLounge((current) => ({ ...current, ...result }));
  }

  async function copySnakeLink() {
    await navigator.clipboard.writeText(`${window.location.origin}${snakeLink}`);
    setStatus("Lien Snake copié.");
  }

  return (
    <main className="min-h-screen bg-lounge-radial text-white">
      <div className="mx-auto max-w-7xl px-4 py-5 md:px-6">
        <header className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            {data.owner?.avatar_url ? <img src={data.owner.avatar_url} alt="" className="h-12 w-12 rounded-md object-cover" /> : <div className="h-12 w-12 rounded-md bg-white/10" />}
            <div className="min-w-0">
              <p className="text-sm text-white/45">{data.owner?.username ?? lounge.owner_user_id}</p>
              <h1 className="truncate text-2xl font-semibold">{studioTitle(lounge.name)}</h1>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href={`/lounge/${lounge.id}`} className="inline-flex min-h-10 items-center gap-2 rounded-md border border-white/15 bg-white/10 px-3 text-sm text-white/75 transition hover:bg-white/15">
              <ExternalLink size={16} />
              Page lounge
            </Link>
            <Link href={snakeLink} className="inline-flex min-h-10 items-center gap-2 rounded-md border border-white/15 bg-white/10 px-3 text-sm text-white/75 transition hover:bg-white/15">
              <Gamepad2 size={16} />
              Snake
            </Link>
          </div>
        </header>

        <div className="grid gap-5 xl:grid-cols-[360px_1fr]">
          <aside className="space-y-5">
            <GlassCard>
              <h2 className="mb-4 text-lg font-semibold">État</h2>
              <div className="grid grid-cols-2 gap-3">
                <Metric label="Score" value={lounge.activity_score} />
                <Metric label="Semaine" value={lounge.weekly_score} />
                <Metric label="Streak" value={`${lounge.streak_days}j`} />
                <Metric label="Membres" value={data.members.filter((member) => member.status === "accepted").length} />
              </div>
            </GlassCard>

            <GlassCard>
              <h2 className="mb-4 text-lg font-semibold">Jeux</h2>
              <div className="space-y-3">
                <Link href={snakeLink} className="flex min-h-11 items-center justify-center gap-2 rounded-md border border-white/15 bg-white/10 px-3 text-sm transition hover:bg-white/15">
                  <Gamepad2 size={16} />
                  Snake online
                </Link>
                <Button onClick={copySnakeLink} className="w-full">
                  <Copy size={16} />
                  Copier l'invitation
                </Button>
              </div>
            </GlassCard>

            <GlassCard>
              <h2 className="mb-4 text-lg font-semibold">Membres</h2>
              <div className="space-y-2">
                {data.members.map((member) => (
                  <div key={member.user_id} className="flex items-center justify-between gap-3 rounded-md border border-white/10 bg-white/5 px-3 py-2">
                    <div className="flex min-w-0 items-center gap-2">
                      {member.profile?.avatar_url ? <img src={member.profile.avatar_url} alt="" className="h-8 w-8 rounded-md object-cover" /> : <div className="h-8 w-8 rounded-md bg-white/10" />}
                      <div className="min-w-0">
                        <p className="truncate text-sm">{member.profile?.username ?? member.user_id}</p>
                        <p className="truncate text-xs text-white/40">{member.user_id}</p>
                      </div>
                    </div>
                    <Badge tone={member.status === "accepted" ? "good" : "neutral"}>{member.status}</Badge>
                  </div>
                ))}
              </div>
            </GlassCard>
          </aside>

          <section className="space-y-5">
            <GlassCard>
              <div className="grid gap-4 lg:grid-cols-2">
                <div className="space-y-3">
                  <label className="text-sm text-white/50">Nom catégorie</label>
                  <Input value={rename} onChange={(event) => setRename(event.target.value)} />
                  <Button onClick={() => action("rename", { name: rename })}>
                    <RefreshCw size={16} />
                    Renommer
                  </Button>
                </div>
                <div className="space-y-3">
                  <label className="text-sm text-white/50">Nom vocal</label>
                  <Input value={voiceName} onChange={(event) => setVoiceName(event.target.value)} placeholder="Nouveau nom" />
                  <Button disabled={!voiceName.trim()} onClick={() => action("rename_voice", { name: voiceName })}>
                    <DoorOpen size={16} />
                    Renommer vocal
                  </Button>
                </div>
              </div>
            </GlassCard>

            <GlassCard>
              <h2 className="mb-4 text-lg font-semibold">Thème</h2>
              <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                {themes.map((theme) => (
                  <button
                    key={theme.id}
                    onClick={() => action("theme", { theme: theme.id })}
                    className={`flex min-h-11 items-center gap-2 rounded-md border px-3 text-left text-sm transition ${
                      (lounge.theme ?? "moon-glass") === theme.id ? "border-lounge-mist/70 bg-white/14 text-white" : "border-white/10 bg-white/5 text-white/65 hover:bg-white/10"
                    }`}
                  >
                    <span className={`h-4 w-4 rounded-full ${theme.swatch}`} />
                    {theme.label}
                  </button>
                ))}
              </div>
            </GlassCard>

            <GlassCard>
              <h2 className="mb-4 text-lg font-semibold">Actions</h2>
              <div className="flex flex-wrap gap-3">
                <Button onClick={() => action("repair")}>
                  <Hammer size={16} />
                  Réparer
                </Button>
                <Button onClick={() => action("visibility", { visibility: lounge.visibility === "public" ? "private" : "public" })}>
                  {lounge.visibility === "public" ? <EyeOff size={16} /> : <Eye size={16} />}
                  {lounge.visibility === "public" ? "Privé" : "Public"}
                </Button>
                <Button onClick={() => action("toggle_notifications")}>
                  <Bell size={16} />
                  Notifications
                </Button>
                <Button onClick={() => action("delete")} className="border-rose-300/30 bg-rose-300/10">
                  <Trash2 size={16} />
                  Supprimer
                </Button>
              </div>
            </GlassCard>

            <GlassCard>
              <h2 className="mb-4 text-lg font-semibold">Invitations</h2>
              <div className="grid gap-3 lg:grid-cols-[1fr_auto]">
                <Input value={targetUserId} onChange={(event) => setTargetUserId(event.target.value)} placeholder="Discord user ID" />
                <div className="flex flex-wrap gap-2">
                  <Button disabled={!targetUserId.trim()} onClick={() => action("invite_member", { targetUserId })}>
                    <UserPlus size={16} />
                    Inviter
                  </Button>
                  <Button disabled={!targetUserId.trim()} onClick={() => action("remove_member", { targetUserId })}>
                    <UserMinus size={16} />
                    Retirer
                  </Button>
                </div>
              </div>
            </GlassCard>

            <GlassCard>
              <h2 className="mb-4 text-lg font-semibold">Notification</h2>
              <Textarea value={notifyMessage} onChange={(event) => setNotifyMessage(event.target.value)} rows={3} />
              <Button onClick={() => action("notify", { message: notifyMessage })} className="mt-3">
                <Bell size={16} />
                Envoyer
              </Button>
            </GlassCard>
          </section>
        </div>

        {status ? <p className="mt-4 text-sm text-white/55">{status}</p> : null}
      </div>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-md border border-white/10 bg-black/16 p-3">
      <p className="text-sm text-white/45">{label}</p>
      <p className="mt-1 text-xl font-semibold">{value}</p>
    </div>
  );
}

function studioTitle(name: string): string {
  const trimmed = name.trim();
  if (/^[aeiouyàâäéèêëîïôöùûü]/i.test(trimmed)) return `Bienvenue sur le studio d'« ${trimmed} »`;
  if (/^le\s+/i.test(trimmed)) return `Bienvenue sur le studio du « ${trimmed.replace(/^le\s+/i, "")} »`;
  return `Bienvenue sur le studio de « ${trimmed} »`;
}
