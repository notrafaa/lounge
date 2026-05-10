"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";

export function CommandEditor() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [response, setResponse] = useState("");
  const [status, setStatus] = useState("");

  async function submit() {
    setStatus("Création...");
    const res = await fetch("/api/bot/commands", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, description, response_text: response, response_type: "text", cooldown_seconds: 5, enabled: true })
    });
    const data = await res.json().catch(() => ({}));
    setStatus(res.ok ? "Commande enregistrée. Utilise /cmd nom côté Discord." : data.error ?? "Erreur.");
  }

  return (
    <div className="glass rounded-lg p-5">
      <h2 className="mb-4 text-lg font-semibold">Nouvelle commande custom</h2>
      <div className="grid gap-3">
        <Input placeholder="nom-sans-espace" value={name} onChange={(event) => setName(event.target.value)} />
        <Input placeholder="Description courte" value={description} onChange={(event) => setDescription(event.target.value)} />
        <Textarea placeholder="Réponse Discord" value={response} onChange={(event) => setResponse(event.target.value)} rows={5} />
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-white/45">{status || "Les slash commands dynamiques passent par /cmd pour éviter de redéployer à chaque ajout."}</p>
          <Button onClick={submit}>
            <Plus size={16} />
            Créer
          </Button>
        </div>
      </div>
    </div>
  );
}

