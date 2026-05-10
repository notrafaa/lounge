"use client";

import { useMemo, useState } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Input";
import { DiscordPreview } from "./DiscordPreview";

export function MessageComposer({ channelId }: { channelId?: string }) {
  const [content, setContent] = useState("");
  const [status, setStatus] = useState("");
  const containsEveryone = useMemo(() => /@(everyone|here)/.test(content), [content]);

  async function submit() {
    if (!channelId) return setStatus("Choisis un salon texte.");
    if (containsEveryone && !confirm("Le message contient @everyone ou @here. Confirmer l'envoi contrôlé?")) return;
    setStatus("Envoi...");
    const response = await fetch("/api/bot/send-message", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        channelId,
        content,
        allowedMentions: { parse: containsEveryone ? ["everyone"] : [] }
      })
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) return setStatus(data.error ?? "Erreur d'envoi.");
    setContent("");
    setStatus("Message envoyé par Louna.");
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[1fr_360px]">
      <div className="space-y-3">
        <Textarea
          value={content}
          onChange={(event) => setContent(event.target.value)}
          rows={8}
          placeholder="Écris le message Discord avec markdown, emojis et mentions contrôlées."
        />
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-white/45">{status || "Les mentions massives sont bloquées côté bot sauf config explicite."}</p>
          <Button onClick={submit}>
            <Send size={16} />
            Envoyer
          </Button>
        </div>
      </div>
      <DiscordPreview content={content} />
    </div>
  );
}

