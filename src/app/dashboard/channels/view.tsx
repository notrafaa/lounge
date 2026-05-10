"use client";

import { useEffect, useState } from "react";
import { ChannelList, type DashboardChannel } from "@/components/discord/ChannelList";
import { MessageComposer } from "@/components/discord/MessageComposer";
import { GlassCard } from "@/components/ui/GlassCard";

export function ChannelsClient() {
  const [channels, setChannels] = useState<DashboardChannel[]>([]);
  const [selected, setSelected] = useState<DashboardChannel | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/bot/channels")
      .then((res) => res.json())
      .then((data) => setChannels(Array.isArray(data) ? data : []))
      .catch((err) => setError(err.message));
  }, []);

  return (
    <div className="grid gap-5 lg:grid-cols-[320px_1fr]">
      <GlassCard>
        <h1 className="mb-4 text-xl font-semibold">Salons Discord</h1>
        {error ? <p className="text-sm text-rose-200">{error}</p> : <ChannelList channels={channels} selectedId={selected?.id} onSelect={setSelected} />}
      </GlassCard>
      <GlassCard>
        <div className="mb-4">
          <p className="text-sm text-white/45">Salon sélectionné</p>
          <h2 className="text-2xl font-semibold">{selected?.name ?? "Choisis un salon texte"}</h2>
        </div>
        <MessageComposer channelId={selected?.id} />
      </GlassCard>
    </div>
  );
}

