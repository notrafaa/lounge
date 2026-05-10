"use client";

import { useMemo, useState } from "react";
import { Bell, Check, DoorOpen, Eye, EyeOff, Hammer, Plus, RefreshCw, Trash2, UserMinus, UserPlus, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";
import { Input, Textarea } from "@/components/ui/Input";

export interface StudioLounge {
  id: string;
  name: string;
  owner_user_id: string;
  visibility: "private" | "public";
  theme: string | null;
  notifications_enabled: boolean;
  text_channel_id: string | null;
  control_channel_id: string | null;
  voice_channel_id: string | null;
}

const themes = [
  { id: "moon-glass", label: "Moon Glass", swatch: "bg-[#d8ecfb]" },
  { id: "champagne", label: "Champagne", swatch: "bg-[#e8d6b5]" },
  { id: "lake-night", label: "Lake Night", swatch: "bg-[#7fb7d7]" },
  { id: "velvet", label: "Velvet", swatch: "bg-[#b56aa4]" }
];

export function StudioClient({ lounges }: { lounges: StudioLounge[] }) {
  const [items, setItems] = useState(lounges);
  const [selectedId, setSelectedId] = useState(lounges[0]?.id ?? "");
  const selected = useMemo(() => items.find((item) => item.id === selectedId) ?? items[0] ?? null, [items, selectedId]);
  const [ownerUserId, setOwnerUserId] = useState("");
  const [newName, setNewName] = useState("");
  const [newTheme, setNewTheme] = useState("moon-glass");
  const [rename, setRename] = useState(selected?.name ?? "");
  const [voiceName, setVoiceName] = useState("");
  const [testUserId, setTestUserId] = useState("");
  const [notifyMessage, setNotifyMessage] = useState("Petit mouvement dans le lounge.");
  const [status, setStatus] = useState("");

  async function createLounge() {
    setStatus("Création...");
    const result = await post("/api/bot/lounges", { ownerUserId, name: newName, theme: newTheme });
    if (result?.id) {
      setItems((current) => [result as StudioLounge, ...current.filter((item) => item.id !== result.id)]);
      setSelectedId(String(result.id));
    }
  }

  async function loungeAction(action: string, payload: Record<string, unknown> = {}) {
    if (!selected) return;
    const result = await post(`/api/bot/lounge/${selected.id}`, { action, ...payload });
    if (result?.id) {
      setItems((current) => current.map((item) => (item.id === result.id ? ({ ...item, ...(result as StudioLounge) } as StudioLounge) : item)));
    }
    if (action === "delete") {
      setItems((current) => current.filter((item) => item.id !== selected.id));
      setSelectedId("");
    }
  }

  async function post(url: string, body: Record<string, unknown>) {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    const data = await response.json().catch(() => ({}));
    setStatus(response.ok ? "Action terminée." : data.error ?? "Erreur.");
    return response.ok ? data : null;
  }

  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm text-white/45">Studio Lounge</p>
        <h1 className="text-2xl font-semibold">Créer et tester un mini-serveur</h1>
      </div>

      <div className="grid gap-5 xl:grid-cols-[360px_1fr]">
        <div className="space-y-5">
          <GlassCard>
            <h2 className="mb-4 text-lg font-semibold">Nouveau lounge</h2>
            <div className="space-y-3">
              <Input value={ownerUserId} onChange={(event) => setOwnerUserId(event.target.value)} placeholder="Discord user ID owner" />
              <Input value={newName} onChange={(event) => setNewName(event.target.value)} placeholder="Nom de la catégorie" />
              <ThemePicker value={newTheme} onChange={setNewTheme} />
              <Button disabled={!ownerUserId.trim()} onClick={createLounge} className="w-full">
                <Plus size={16} />
                Créer
              </Button>
            </div>
          </GlassCard>

          <GlassCard>
            <h2 className="mb-4 text-lg font-semibold">Lounges</h2>
            <div className="space-y-2">
              {items.map((lounge) => (
                <button
                  key={lounge.id}
                  onClick={() => {
                    setSelectedId(lounge.id);
                    setRename(lounge.name);
                  }}
                  className={`w-full rounded-md border px-3 py-3 text-left text-sm transition ${
                    selected?.id === lounge.id ? "border-lounge-mist/55 bg-white/12" : "border-white/10 bg-white/5 hover:bg-white/10"
                  }`}
                >
                  <span className="block font-medium">{lounge.name}</span>
                  <span className="text-white/45">{lounge.owner_user_id}</span>
                </button>
              ))}
            </div>
          </GlassCard>
        </div>

        <div className="space-y-5">
          <GlassCard>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-sm text-white/45">Sélection</p>
                <h2 className="text-2xl font-semibold">{selected?.name ?? "Aucun lounge"}</h2>
              </div>
              {selected ? (
                <div className={`rounded-md px-3 py-2 text-sm ${selected.visibility === "public" ? "bg-emerald-400/15 text-emerald-100" : "bg-white/10 text-white/70"}`}>
                  {selected.visibility}
                </div>
              ) : null}
            </div>

            {selected ? (
              <div className="mt-5 grid gap-4 lg:grid-cols-2">
                <div className="space-y-3">
                  <Input value={rename} onChange={(event) => setRename(event.target.value)} />
                  <Button onClick={() => loungeAction("rename", { name: rename })}>
                    <RefreshCw size={16} />
                    Renommer catégorie
                  </Button>
                </div>
                <div className="space-y-3">
                  <Input value={voiceName} onChange={(event) => setVoiceName(event.target.value)} placeholder="Nom du vocal" />
                  <Button disabled={!voiceName.trim()} onClick={() => loungeAction("rename_voice", { name: voiceName })}>
                    <DoorOpen size={16} />
                    Renommer vocal
                  </Button>
                </div>
              </div>
            ) : null}
          </GlassCard>

          {selected ? (
            <>
              <GlassCard>
                <h2 className="mb-4 text-lg font-semibold">Thème</h2>
                <ThemePicker value={selected.theme ?? "moon-glass"} onChange={(theme) => loungeAction("theme", { theme })} />
              </GlassCard>

              <GlassCard>
                <h2 className="mb-4 text-lg font-semibold">Actions</h2>
                <div className="flex flex-wrap gap-3">
                  <Button onClick={() => loungeAction("repair")}>
                    <Hammer size={16} />
                    Réparer
                  </Button>
                  <Button onClick={() => loungeAction("visibility", { visibility: selected.visibility === "public" ? "private" : "public" })}>
                    {selected.visibility === "public" ? <EyeOff size={16} /> : <Eye size={16} />}
                    {selected.visibility === "public" ? "Privé" : "Public"}
                  </Button>
                  <Button onClick={() => loungeAction("toggle_notifications")}>
                    <Bell size={16} />
                    Notifications
                  </Button>
                  <Button onClick={() => loungeAction("delete")} className="border-rose-300/30 bg-rose-300/10">
                    <Trash2 size={16} />
                    Supprimer
                  </Button>
                </div>
              </GlassCard>

              <GlassCard>
                <h2 className="mb-4 text-lg font-semibold">Test utilisateur</h2>
                <div className="grid gap-3 lg:grid-cols-[1fr_1fr]">
                  <Input value={testUserId} onChange={(event) => setTestUserId(event.target.value)} placeholder="Discord user ID test" />
                  <div className="flex flex-wrap gap-2">
                    <Button disabled={!testUserId.trim()} onClick={() => loungeAction("invite_member", { targetUserId: testUserId })}>
                      <UserPlus size={16} />
                      Inviter
                    </Button>
                    <Button disabled={!testUserId.trim()} onClick={() => loungeAction("accept_invitation", { targetUserId: testUserId })}>
                      <Check size={16} />
                      Accepter
                    </Button>
                    <Button disabled={!testUserId.trim()} onClick={() => loungeAction("decline_invitation", { targetUserId: testUserId })}>
                      <X size={16} />
                      Refuser
                    </Button>
                    <Button disabled={!testUserId.trim()} onClick={() => loungeAction("remove_member", { targetUserId: testUserId })}>
                      <UserMinus size={16} />
                      Retirer
                    </Button>
                  </div>
                </div>
                <div className="mt-4 space-y-3">
                  <Textarea value={notifyMessage} onChange={(event) => setNotifyMessage(event.target.value)} rows={3} />
                  <Button onClick={() => loungeAction("notify", { message: notifyMessage })}>
                    <Bell size={16} />
                    Notification test
                  </Button>
                </div>
              </GlassCard>
            </>
          ) : null}
        </div>
      </div>

      {status ? <p className="text-sm text-white/55">{status}</p> : null}
    </div>
  );
}

function ThemePicker({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {themes.map((theme) => (
        <button
          key={theme.id}
          onClick={() => onChange(theme.id)}
          className={`flex min-h-11 items-center gap-2 rounded-md border px-3 text-left text-sm transition ${
            value === theme.id ? "border-lounge-mist/70 bg-white/14 text-white" : "border-white/10 bg-white/5 text-white/65 hover:bg-white/10"
          }`}
        >
          <span className={`h-4 w-4 rounded-full ${theme.swatch}`} />
          {theme.label}
        </button>
      ))}
    </div>
  );
}
