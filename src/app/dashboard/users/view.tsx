"use client";

import { useMemo, useState } from "react";
import { Ban, ChevronLeft, ChevronRight, Eraser, MessageCircle, Search, Send, ShieldAlert, UserX, X } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";
import { Input, Textarea } from "@/components/ui/Input";

export interface DashboardUser {
  discord_user_id: string;
  username: string;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
  discord_created_at: string | null;
  guild_joined_at: string | null;
  last_seen_at: string | null;
  total_message_count: number;
  total_voice_joins: number;
  lounge_count: number;
  member_count: number;
  activity_points: number;
  activity_events: number;
  risk_score: number;
  suspect_flags: string[];
}

interface DmMessage {
  id: string;
  authorId: string;
  authorName: string;
  bot: boolean;
  content: string;
  createdAt: string;
}

const pageSize = 25;

export function UsersClient({ users }: { users: DashboardUser[] }) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("active_desc");
  const [riskOnly, setRiskOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");
  const [dmUser, setDmUser] = useState<DashboardUser | null>(null);
  const [messages, setMessages] = useState<DmMessage[]>([]);
  const [dmText, setDmText] = useState("");

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const result = users.filter((user) => {
      const matchesSearch = !normalized || user.username.toLowerCase().includes(normalized) || user.discord_user_id.includes(normalized);
      const matchesRisk = !riskOnly || user.risk_score > 0 || user.suspect_flags.length > 0;
      return matchesSearch && matchesRisk;
    });

    result.sort((a, b) => {
      if (sort === "active_desc") return b.activity_points - a.activity_points || b.total_message_count - a.total_message_count;
      if (sort === "active_asc") return a.activity_points - b.activity_points || a.total_message_count - b.total_message_count;
      if (sort === "created_desc") return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      if (sort === "created_asc") return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      if (sort === "risk_desc") return b.risk_score - a.risk_score;
      return a.username.localeCompare(b.username);
    });

    return result;
  }, [query, riskOnly, sort, users]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const visible = filtered.slice((Math.min(page, pageCount) - 1) * pageSize, Math.min(page, pageCount) * pageSize);

  async function memberAction(user: DashboardUser, action: "kick" | "ban") {
    const reason = `Action dashboard Lounge: ${action}`;
    if (!confirm(`${action === "ban" ? "Bannir" : "Kick"} ${user.username} ?`)) return;
    const response = await fetch(`/api/bot/users/${user.discord_user_id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, reason })
    });
    const data = await response.json().catch(() => ({}));
    setStatus(response.ok ? "Action envoyée au bot." : data.error ?? "Erreur.");
  }

  async function openDm(user: DashboardUser) {
    setDmUser(user);
    setMessages([]);
    setStatus("Chargement des MP...");
    const response = await fetch(`/api/bot/users/${user.discord_user_id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "fetch_dm", limit: 50 })
    });
    const data = await response.json().catch(() => []);
    setStatus(response.ok ? "" : data.error ?? "Erreur MP.");
    if (response.ok) setMessages(Array.isArray(data) ? data : []);
  }

  async function sendDm() {
    if (!dmUser || !dmText.trim()) return;
    const response = await fetch(`/api/bot/users/${dmUser.discord_user_id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "send_dm", content: dmText, cleanupPrevious: false })
    });
    const data = await response.json().catch(() => ({}));
    setStatus(response.ok ? "MP envoyé." : data.error ?? "Erreur MP.");
    setDmText("");
    if (response.ok) await openDm(dmUser);
  }

  async function deleteBotDms() {
    if (!dmUser) return;
    const response = await fetch(`/api/bot/users/${dmUser.discord_user_id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete_bot_dms", limit: 100 })
    });
    const data = await response.json().catch(() => ({}));
    setStatus(response.ok ? `${data.deleted ?? 0} MP supprimé(s).` : data.error ?? "Erreur suppression.");
    if (response.ok) await openDm(dmUser);
  }

  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm text-white/45">Membres</p>
        <h1 className="text-2xl font-semibold">Activité, risques et actions</h1>
      </div>

      <GlassCard>
        <div className="grid gap-3 lg:grid-cols-[1fr_220px_auto]">
          <label className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/35" size={16} />
            <Input value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} placeholder="Pseudo ou Discord ID" className="pl-9" />
          </label>
          <select value={sort} onChange={(event) => setSort(event.target.value)} className="min-h-10 rounded-md border border-white/15 bg-black/30 px-3 text-sm text-white outline-none">
            <option value="active_desc">Plus actifs</option>
            <option value="active_asc">Moins actifs</option>
            <option value="risk_desc">Suspects</option>
            <option value="created_desc">Comptes récents</option>
            <option value="created_asc">Comptes anciens</option>
            <option value="name">Nom</option>
          </select>
          <label className="flex min-h-10 items-center gap-2 rounded-md border border-white/15 bg-white/5 px-3 text-sm text-white/70">
            <input type="checkbox" checked={riskOnly} onChange={(event) => { setRiskOnly(event.target.checked); setPage(1); }} />
            Suspects
          </label>
        </div>
      </GlassCard>

      <GlassCard className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1120px] text-left text-sm">
            <thead className="border-b border-white/10 text-white/40">
              <tr>
                <th className="px-4 py-3">Utilisateur</th>
                <th className="px-4 py-3">Activité</th>
                <th className="px-4 py-3">Lounges</th>
                <th className="px-4 py-3">Dates</th>
                <th className="px-4 py-3">Risque</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {visible.map((user) => (
                <tr key={user.discord_user_id} className="align-top">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {user.avatar_url ? <img src={user.avatar_url} alt="" className="h-10 w-10 rounded-md object-cover" /> : <div className="h-10 w-10 rounded-md bg-white/10" />}
                      <div>
                        <p className="font-medium">{user.username}</p>
                        <p className="text-xs text-white/40">{user.discord_user_id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-white/65">
                    <p>{user.activity_points} pts · {user.activity_events} évènements</p>
                    <p>{user.total_message_count} messages · {user.total_voice_joins} vocaux</p>
                  </td>
                  <td className="px-4 py-3 text-white/65">
                    <p>{user.lounge_count} créé(s)</p>
                    <p>{user.member_count} rejoint(s)</p>
                  </td>
                  <td className="px-4 py-3 text-white/55">
                    <p>Profil: {formatDate(user.created_at)}</p>
                    <p>Discord: {formatDate(user.discord_created_at)}</p>
                    <p>Actif: {formatDate(user.last_seen_at)}</p>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1.5">
                      {user.risk_score > 0 ? <Badge tone="danger">score {user.risk_score}</Badge> : <Badge tone="good">ok</Badge>}
                      {user.suspect_flags.map((flag) => <Badge key={flag}>{flag}</Badge>)}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <Button onClick={() => openDm(user)} className="px-3">
                        <MessageCircle size={15} />
                        MP
                      </Button>
                      <Button onClick={() => memberAction(user, "kick")} className="px-3">
                        <UserX size={15} />
                        Kick
                      </Button>
                      <Button onClick={() => memberAction(user, "ban")} className="border-rose-300/30 bg-rose-300/10 px-3">
                        <Ban size={15} />
                        Ban
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>

      <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-white/55">
        <span>{filtered.length} membre(s) · page {Math.min(page, pageCount)} / {pageCount}</span>
        <div className="flex gap-2">
          <Button disabled={page <= 1} onClick={() => setPage((current) => Math.max(1, current - 1))}>
            <ChevronLeft size={16} />
          </Button>
          <Button disabled={page >= pageCount} onClick={() => setPage((current) => Math.min(pageCount, current + 1))}>
            <ChevronRight size={16} />
          </Button>
        </div>
      </div>

      {status ? <p className="text-sm text-white/55">{status}</p> : null}

      {dmUser ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4">
          <div className="glass flex max-h-[86vh] w-full max-w-3xl flex-col rounded-lg">
            <div className="flex items-center justify-between gap-3 border-b border-white/10 p-4">
              <div className="flex items-center gap-3">
                <ShieldAlert size={18} className="text-lounge-champagne" />
                <div>
                  <h2 className="font-semibold">MP avec {dmUser.username}</h2>
                  <p className="text-xs text-white/45">{dmUser.discord_user_id}</p>
                </div>
              </div>
              <button onClick={() => setDmUser(null)} className="rounded-md p-2 text-white/55 hover:bg-white/10 hover:text-white" aria-label="Fermer">
                <X size={18} />
              </button>
            </div>
            <div className="lounge-scrollbar flex-1 space-y-2 overflow-y-auto p-4">
              {messages.length === 0 ? <p className="text-sm text-white/45">Aucun MP récupéré.</p> : null}
              {messages.map((message) => (
                <div key={message.id} className={`max-w-[82%] rounded-md border px-3 py-2 text-sm ${message.bot ? "ml-auto border-lounge-mist/20 bg-lounge-mist/10" : "border-white/10 bg-white/7"}`}>
                  <p className="mb-1 text-xs text-white/40">{message.authorName} · {formatDate(message.createdAt)}</p>
                  <p className="whitespace-pre-wrap text-white/82">{message.content || "(message sans texte)"}</p>
                </div>
              ))}
            </div>
            <div className="space-y-3 border-t border-white/10 p-4">
              <Textarea value={dmText} onChange={(event) => setDmText(event.target.value)} rows={3} placeholder="Message à envoyer en MP" />
              <div className="flex flex-wrap justify-between gap-2">
                <Button onClick={deleteBotDms} className="border-rose-300/30 bg-rose-300/10">
                  <Eraser size={16} />
                  Supprimer anciens MP bot
                </Button>
                <Button disabled={!dmText.trim()} onClick={sendDm}>
                  <Send size={16} />
                  Envoyer
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function formatDate(value: string | null): string {
  if (!value) return "inconnu";
  return new Date(value).toLocaleDateString("fr-FR");
}
