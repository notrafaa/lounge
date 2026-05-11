import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

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

const boardSize = 24;
const tickMs = 650;
const colors = ["#92b4d6", "#e8e1d7", "#c9a5bb", "#4fc878", "#f29b9b", "#4f7f92"];

export async function GET(_request: Request, context: { params: Promise<{ room: string }> }) {
  const { room } = await context.params;
  const resolved = await resolveRoom(room);
  if (!resolved) return NextResponse.json({ error: "Room introuvable." }, { status: 404 });
  const state = await advanceRoom(resolved.room.id, resolved.room.state);
  return NextResponse.json({ lounge: resolved.lounge, room: resolved.room.id, state });
}

export async function POST(request: Request, context: { params: Promise<{ room: string }> }) {
  const { room } = await context.params;
  const body = await request.json().catch(() => ({}));
  const resolved = await resolveRoom(room);
  if (!resolved) return NextResponse.json({ error: "Room introuvable." }, { status: 404 });

  if (body.action === "join") {
    const result = await joinRoom(resolved.room.id, resolved.room.state, body);
    return NextResponse.json({ lounge: resolved.lounge, room: resolved.room.id, ...result });
  }

  if (body.action === "input") {
    const state = stateFrom(resolved.room.state);
    const playerId = typeof body.playerId === "string" ? body.playerId : "";
    const direction = asDirection(body.direction);
    if (!playerId || !direction || !state.snakes[playerId]) return NextResponse.json({ error: "Joueur introuvable." }, { status: 404 });
    if (!isOpposite(state.snakes[playerId].direction, direction)) state.snakes[playerId].nextDirection = direction;
    state.updatedAt = new Date().toISOString();
    await saveState(resolved.room.id, state);
    return NextResponse.json({ state });
  }

  if (body.action === "reset") {
    const state = initialState();
    await saveState(resolved.room.id, state);
    return NextResponse.json({ state });
  }

  return NextResponse.json({ error: "Action inconnue." }, { status: 400 });
}

async function resolveRoom(code: string) {
  const safeCode = code.replace(/[^a-zA-Z0-9-]/g, "");
  if (!safeCode || safeCode !== code) return null;

  const supabase = supabaseServer();
  const { data: lounge } = await supabase
    .from("lounges")
    .select("id,name,owner_user_id,studio_token")
    .or(`studio_token.eq.${safeCode},id.eq.${safeCode}`)
    .is("deleted_at", null)
    .maybeSingle();
  if (!lounge) return null;

  const { data: existing } = await supabase.from("game_rooms").select("*").eq("invite_code", safeCode).maybeSingle();
  if (existing) return { lounge, room: existing };

  const { data: created, error } = await supabase
    .from("game_rooms")
    .insert({ lounge_id: lounge.id, invite_code: safeCode, state: initialState() })
    .select("*")
    .single();
  if (error) throw error;
  return { lounge, room: created };
}

async function joinRoom(roomId: string, rawState: unknown, body: Record<string, unknown>) {
  const supabase = supabaseServer();
  const rawIdentity = typeof body.identity === "string" ? body.identity.trim().replace(/[^a-zA-Z0-9_.-]/g, "") : "";
  const fallbackName = typeof body.name === "string" && body.name.trim() ? body.name.trim() : "Joueur";
  const { data: profile } = rawIdentity
    ? await supabase
        .from("profiles")
        .select("discord_user_id,username,avatar_url")
        .or(`discord_user_id.eq.${rawIdentity},username.ilike.${rawIdentity}`)
        .maybeSingle()
    : { data: null };

  const displayName = String(profile?.username ?? fallbackName).slice(0, 32);
  const discordUserId = typeof profile?.discord_user_id === "string" ? profile.discord_user_id : rawIdentity || null;
  const avatarUrl = typeof profile?.avatar_url === "string" ? profile.avatar_url : null;

  const { data: existingPlayers } = discordUserId
    ? await supabase.from("game_players").select("*").eq("room_id", roomId).eq("discord_user_id", discordUserId).limit(1)
    : { data: [] };

  const existing = existingPlayers?.[0];
  const color = existing?.color ?? colors[Math.floor(Math.random() * colors.length)];
  const player =
    existing ??
    (
      await supabase
        .from("game_players")
        .insert({ room_id: roomId, discord_user_id: discordUserId, display_name: displayName, avatar_url: avatarUrl, color })
        .select("*")
        .single()
    ).data;

  if (!player) throw new Error("Impossible de créer le joueur.");

  const state = stateFrom(rawState);
  if (!state.snakes[player.id]) {
    state.snakes[player.id] = {
      name: displayName,
      avatarUrl,
      color,
      segments: spawnSegments(Object.keys(state.snakes).length),
      direction: "right",
      nextDirection: "right",
      score: 0,
      alive: true
    };
    state.updatedAt = new Date().toISOString();
    await saveState(roomId, state);
  }

  return { player, state };
}

async function advanceRoom(roomId: string, rawState: unknown): Promise<SnakeState> {
  let state = stateFrom(rawState);
  const elapsed = Date.now() - new Date(state.updatedAt).getTime();
  if (elapsed < tickMs) return state;

  const steps = Math.min(3, Math.floor(elapsed / tickMs));
  for (let index = 0; index < steps; index += 1) state = advance(state);
  state.updatedAt = new Date().toISOString();
  await saveState(roomId, state);
  return state;
}

async function saveState(roomId: string, state: SnakeState): Promise<void> {
  const { error } = await supabaseServer().from("game_rooms").update({ state }).eq("id", roomId);
  if (error) throw error;
}

function initialState(): SnakeState {
  return {
    size: boardSize,
    food: { x: 12, y: 12 },
    snakes: {},
    tick: 0,
    updatedAt: new Date().toISOString()
  };
}

function stateFrom(value: unknown): SnakeState {
  const state = value && typeof value === "object" ? (value as Partial<SnakeState>) : {};
  return {
    size: Number(state.size ?? boardSize),
    food: state.food && typeof state.food === "object" ? (state.food as Point) : { x: 12, y: 12 },
    snakes: state.snakes && typeof state.snakes === "object" ? (state.snakes as Record<string, SnakeInfo>) : {},
    tick: Number(state.tick ?? 0),
    updatedAt: typeof state.updatedAt === "string" ? state.updatedAt : new Date().toISOString()
  };
}

function advance(state: SnakeState): SnakeState {
  const occupied = new Set<string>();
  for (const snake of Object.values(state.snakes)) {
    for (const segment of snake.segments) occupied.add(key(segment));
  }

  let food = state.food;
  const nextSnakes: Record<string, SnakeInfo> = {};
  for (const [playerId, snake] of Object.entries(state.snakes)) {
    if (!snake.alive) {
      nextSnakes[playerId] = snake;
      continue;
    }

    const direction = isOpposite(snake.direction, snake.nextDirection) ? snake.direction : snake.nextDirection;
    const head = wrap(move(snake.segments[0], direction), state.size);
    const grows = head.x === food.x && head.y === food.y;
    const segments = [head, ...snake.segments];
    if (!grows) segments.pop();
    const collisionMap = new Set(occupied);
    if (!grows) collisionMap.delete(key(snake.segments[snake.segments.length - 1]));

    const collision = collisionMap.has(key(head));
    nextSnakes[playerId] = {
      ...snake,
      direction,
      nextDirection: direction,
      segments,
      score: grows ? snake.score + 1 : snake.score,
      alive: !collision
    };

    if (grows) food = randomFood(state.size, occupied);
  }

  return { ...state, snakes: nextSnakes, food, tick: state.tick + 1 };
}

function spawnSegments(index: number): Point[] {
  const y = 4 + (index % 8) * 2;
  return [
    { x: 4, y },
    { x: 3, y },
    { x: 2, y }
  ];
}

function move(point: Point, direction: Direction): Point {
  if (direction === "up") return { x: point.x, y: point.y - 1 };
  if (direction === "down") return { x: point.x, y: point.y + 1 };
  if (direction === "left") return { x: point.x - 1, y: point.y };
  return { x: point.x + 1, y: point.y };
}

function wrap(point: Point, size: number): Point {
  return { x: (point.x + size) % size, y: (point.y + size) % size };
}

function randomFood(size: number, occupied: Set<string>): Point {
  for (let tries = 0; tries < 80; tries += 1) {
    const point = { x: Math.floor(Math.random() * size), y: Math.floor(Math.random() * size) };
    if (!occupied.has(key(point))) return point;
  }
  return { x: 12, y: 12 };
}

function key(point: Point): string {
  return `${point.x}:${point.y}`;
}

function asDirection(value: unknown): Direction | null {
  return value === "up" || value === "down" || value === "left" || value === "right" ? value : null;
}

function isOpposite(a: Direction, b: Direction): boolean {
  return (a === "up" && b === "down") || (a === "down" && b === "up") || (a === "left" && b === "right") || (a === "right" && b === "left");
}
