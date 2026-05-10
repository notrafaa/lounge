"use client";

import { useState } from "react";
import { Bell, RefreshCw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Input";

export function LoungeSettings({ loungeId, visibility }: { loungeId: string; visibility: "private" | "public" }) {
  const [status, setStatus] = useState("");
  const [message, setMessage] = useState("Petit mouvement dans le lounge 🥂");

  async function action(payload: Record<string, unknown>) {
    setStatus("Action en cours...");
    const response = await fetch(`/api/bot/lounge/${loungeId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await response.json().catch(() => ({}));
    setStatus(response.ok ? "Action envoyée à Louna." : data.error ?? "Erreur.");
  }

  async function deleteLounge() {
    if (!confirm("Supprimer ce lounge va détruire la catégorie, les salons et les flammes associées. Confirmer?")) return;
    await action({ action: "delete" });
  }

  return (
    <div className="glass rounded-lg p-5">
      <h2 className="mb-4 text-lg font-semibold">Actions</h2>
      <div className="flex flex-wrap gap-3">
        <Button onClick={() => action({ action: "repair" })}>
          <RefreshCw size={16} />
          Réparer
        </Button>
        <Button onClick={() => action({ action: "visibility", visibility: visibility === "public" ? "private" : "public" })}>
          Passer {visibility === "public" ? "privé" : "public"}
        </Button>
        <Button onClick={deleteLounge} className="border-rose-300/30 bg-rose-300/10">
          <Trash2 size={16} />
          Supprimer
        </Button>
      </div>
      <div className="mt-5 space-y-3">
        <Textarea value={message} onChange={(event) => setMessage(event.target.value)} rows={3} />
        <Button onClick={() => action({ action: "notify", message })}>
          <Bell size={16} />
          Forcer notification soft
        </Button>
      </div>
      <p className="mt-3 text-sm text-white/45">{status}</p>
    </div>
  );
}

