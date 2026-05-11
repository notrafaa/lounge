"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Copy, LogIn, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";
import { Input } from "@/components/ui/Input";

type Direction = "up" | "down" | "left" | "right";

interface Point {
  x: number;
  y: number;
}

interface SnakeInfo {
  name: string;
  avatarUrl: string | null;
  color: string;
  segments: Point[];
  direction: Direction;
  nextDirection: Direction;
  score: number;
  alive: boolean;
}

interface SnakeState {
  size: number;
  food: Point;
  snakes: Record<string, SnakeInfo>;
  tick: number;
  updatedAt: string;
}

interface Player {
  id: string;
  display_name: string;
  avatar_url: string | null;
  color: string;
}

export function SnakeClient({ room, loungeName }: { room: string; loungeName: string }) {
  const [identity, setIdentity] = useState("");
  const [name, setName] = useState("");
  const [player, setPlayer] = useState<Player | null>(null);
  const [state, setState] = useState<SnakeState | null>(null);
  const [status, setStatus] = useState("");
  const storageKey = `lounge-snake:${room}:player`;

  useEffect(() => {
    const saved = window.localStorage.getItem(storageKey);
    if (saved) setPlayer(JSON.parse(saved));
  }, [storageKey]);

  useEffect(() => {
    let alive = true;
    async function poll() {
      const response = await fetch(`/api/game/snake/${room}`, { cache: "no-store" });
      const data = await response.json().catch(() => ({}));
      if (alive && response.ok) setState(data.state);
    }
    void poll();
    const timer = setInterval(() => void poll(), 700);
    return () => {
      alive = false;
      clearInterval(timer);
    };
  }, [room]);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      const direction = keyDirection(event.key);
      if (!direction) return;
      event.preventDefault();
      void sendDirection(direction);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const cells = useMemo(() => buildCells(state), [state]);
  const snakes = state ? Object.entries(state.snakes).map(([id, snake]) => ({ id, ...snake })).sort((a, b) => b.score - a.score) : [];

  async function join() {
    setStatus("Connexion...");
    const response = await fetch(`/api/game/snake/${room}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "join", identity, name })
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      setStatus(data.error ?? "Connexion impossible.");
      return;
    }
    setPlayer(data.player);
    setState(data.state);
    window.localStorage.setItem(storageKey, JSON.stringify(data.player));
    setStatus("Connecté.");
  }

  async function sendDirection(direction: Direction) {
    if (!player) return;
    await fetch(`/api/game/snake/${room}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "input", playerId: player.id, direction })
    }).catch(() => undefined);
  }

  async function reset() {
    const response = await fetch(`/api/game/snake/${room}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "reset" })
    });
    const data = await response.json().catch(() => ({}));
    if (response.ok) setState(data.state);
  }

  async function copyInvite() {
    await navigator.clipboard.writeText(window.location.href);
    setStatus("Invitation copiée.");
  }

  return (
    <main className="min-h-screen bg-lounge-radial text-white">
      <div className="mx-auto max-w-7xl px-4 py-5 md:px-6">
        <header className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm text-white/45">Snake online</p>
            <h1 className="text-2xl font-semibold">{loungeName}</h1>
          </div>
          <div className="flex gap-2">
            <Button onClick={copyInvite}>
              <Copy size={16} />
              Inviter
            </Button>
            <Link href={`/studio/${room}`} className="inline-flex min-h-10 items-center justify-center rounded-md border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/15">
              Studio
            </Link>
          </div>
        </header>

        <div className="grid gap-5 xl:grid-cols-[320px_1fr]">
          <aside className="space-y-5">
            <GlassCard>
              <h2 className="mb-4 text-lg font-semibold">Connexion</h2>
              {player ? (
                <div className="flex items-center gap-3">
                  {player.avatar_url ? <img src={player.avatar_url} alt="" className="h-12 w-12 rounded-md object-cover" /> : <div className="h-12 w-12 rounded-md" style={{ backgroundColor: player.color }} />}
                  <div>
                    <p className="font-medium">{player.display_name}</p>
                    <p className="text-sm text-white/45">Joueur connecté</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <Input value={identity} onChange={(event) => setIdentity(event.target.value)} placeholder="Discord ID ou pseudo connu" />
                  <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Pseudo invité" />
                  <Button disabled={!identity.trim() && !name.trim()} onClick={join} className="w-full">
                    <LogIn size={16} />
                    Rejoindre
                  </Button>
                </div>
              )}
            </GlassCard>

            <GlassCard>
              <h2 className="mb-4 text-lg font-semibold">Classement</h2>
              <div className="space-y-2">
                {snakes.map((snake) => (
                  <div key={snake.id} className="flex items-center justify-between gap-3 rounded-md border border-white/10 bg-white/5 px-3 py-2">
                    <div className="flex min-w-0 items-center gap-2">
                      {snake.avatarUrl ? <img src={snake.avatarUrl} alt="" className="h-8 w-8 rounded-md object-cover" /> : <span className="h-8 w-8 rounded-md" style={{ backgroundColor: snake.color }} />}
                      <span className="truncate text-sm">{snake.name}</span>
                    </div>
                    <span className={snake.alive ? "text-white/80" : "text-rose-200"}>{snake.score}</span>
                  </div>
                ))}
              </div>
            </GlassCard>

            <GlassCard>
              <div className="grid grid-cols-3 gap-2">
                <span />
                <Button onClick={() => sendDirection("up")}><ArrowUp size={17} /></Button>
                <span />
                <Button onClick={() => sendDirection("left")}><ArrowLeft size={17} /></Button>
                <Button onClick={() => sendDirection("down")}><ArrowDown size={17} /></Button>
                <Button onClick={() => sendDirection("right")}><ArrowRight size={17} /></Button>
              </div>
              <Button onClick={reset} className="mt-3 w-full">
                <RotateCcw size={16} />
                Relancer
              </Button>
            </GlassCard>
          </aside>

          <section className="min-w-0">
            <div className="mx-auto aspect-square w-full max-w-[760px] rounded-lg border border-white/12 bg-black/28 p-2 shadow-glass">
              <div className="grid h-full w-full gap-px" style={{ gridTemplateColumns: `repeat(${state?.size ?? 24}, minmax(0, 1fr))` }}>
                {cells.map((cell) => (
                  <span key={`${cell.x}:${cell.y}`} className="rounded-[2px]" style={{ backgroundColor: cell.color }} />
                ))}
              </div>
            </div>
          </section>
        </div>

        {status ? <p className="mt-4 text-sm text-white/55">{status}</p> : null}
      </div>
    </main>
  );
}

function buildCells(state: SnakeState | null): Array<Point & { color: string }> {
  const size = state?.size ?? 24;
  const cells: Array<Point & { color: string }> = [];
  const colorsByCell = new Map<string, string>();
  if (state) {
      colorsByCell.set(`${state.food.x}:${state.food.y}`, "#4fc878");
    for (const snake of Object.values(state.snakes)) {
      for (const [index, segment] of snake.segments.entries()) {
        colorsByCell.set(`${segment.x}:${segment.y}`, snake.alive ? (index === 0 ? "#ffffff" : snake.color) : "#73363f");
      }
    }
  }
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      cells.push({ x, y, color: colorsByCell.get(`${x}:${y}`) ?? "rgba(255,255,255,0.055)" });
    }
  }
  return cells;
}

function keyDirection(key: string): Direction | null {
  if (key === "ArrowUp" || key.toLowerCase() === "w") return "up";
  if (key === "ArrowDown" || key.toLowerCase() === "s") return "down";
  if (key === "ArrowLeft" || key.toLowerCase() === "a") return "left";
  if (key === "ArrowRight" || key.toLowerCase() === "d") return "right";
  return null;
}
