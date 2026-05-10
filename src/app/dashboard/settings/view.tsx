"use client";

import { useEffect, useState } from "react";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Input";
import { GlassCard } from "@/components/ui/GlassCard";

const defaultConfig = {
  triggerVoiceChannelId: "",
  adminUserIds: [],
  protectedUserIds: [],
  blockedInviteUserIds: [],
  cooldowns: {
    loungeCreateMs: 10000,
    inviteMs: 10000,
    notificationDmMs: 600000
  },
  aiProvider: "fallback",
  allowEveryoneMentions: false
};

export function SettingsEditor() {
  const [value, setValue] = useState(JSON.stringify(defaultConfig, null, 2));
  const [status, setStatus] = useState("");

  useEffect(() => {
    fetch("/api/bot/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data?.config) setValue(JSON.stringify(data.config, null, 2));
      })
      .catch(() => undefined);
  }, []);

  async function save() {
    setStatus("Sauvegarde...");
    try {
      const config = JSON.parse(value);
      const response = await fetch("/api/bot/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ config })
      });
      const data = await response.json().catch(() => ({}));
      setStatus(response.ok ? "Réglages sauvegardés." : data.error ?? "Erreur.");
    } catch {
      setStatus("JSON invalide.");
    }
  }

  return (
    <GlassCard>
      <h1 className="mb-2 text-2xl font-semibold">Réglages</h1>
      <p className="mb-5 max-w-3xl text-sm text-white/50">
        Ces réglages sont stockés côté serveur dans Supabase. Les secrets Discord et la service role Supabase ne doivent jamais être exposés au frontend.
      </p>
      <Textarea value={value} onChange={(event) => setValue(event.target.value)} rows={18} spellCheck={false} />
      <div className="mt-4 flex items-center justify-between">
        <p className="text-sm text-white/45">{status}</p>
        <Button onClick={save}>
          <Save size={16} />
          Sauvegarder
        </Button>
      </div>
    </GlassCard>
  );
}

