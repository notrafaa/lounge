import { notFound } from "next/navigation";
import { SnakeClient } from "./view";
import { supabaseServer } from "@/lib/supabaseServer";

export default async function SnakePage({ params }: { params: Promise<{ room: string }> }) {
  const { room } = await params;
  const lounge = await getLounge(room);
  if (!lounge) notFound();
  return <SnakeClient room={room} loungeName={lounge.name} />;
}

async function getLounge(room: string): Promise<{ name: string } | null> {
  const safeRoom = room.replace(/[^a-zA-Z0-9-]/g, "");
  if (!safeRoom || safeRoom !== room) return null;
  const { data } = await supabaseServer()
    .from("lounges")
    .select("name")
    .or(`studio_token.eq.${safeRoom},id.eq.${safeRoom}`)
    .is("deleted_at", null)
    .maybeSingle();
  return data ?? null;
}
