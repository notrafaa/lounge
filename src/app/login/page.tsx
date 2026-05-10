"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LockKeyhole } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function LoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password })
    });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      setError(data.error ?? "Connexion refusée.");
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main className="grid min-h-screen place-items-center bg-lounge-radial p-4">
      <form onSubmit={submit} className="glass w-full max-w-md rounded-lg p-6">
        <img src="/images/lounge-wordmark.png" alt="lounge" className="mb-8 h-10 w-auto" />
        <div className="mb-6">
          <p className="text-xs uppercase tracking-[0.18em] text-lounge-champagne">admin</p>
          <h1 className="mt-2 text-2xl font-semibold">Entrer dans le salon de contrôle</h1>
        </div>
        <label className="mb-2 block text-sm text-white/55">Mot de passe admin</label>
        <Input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoFocus />
        {error ? <p className="mt-3 text-sm text-rose-200">{error}</p> : null}
        <Button className="mt-5 w-full" type="submit">
          <LockKeyhole size={16} />
          Connexion
        </Button>
      </form>
    </main>
  );
}

