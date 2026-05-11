import { notFound } from "next/navigation";
import { SnakeClient } from "./view";
import { loungeTokenFilter, safeLoungeToken } from "@/lib/loungeTokenFilter";
import { supabaseServer } from "@/lib/supabaseServer";

export default async function SnakePage({ params }: { params: Promise<{ room: string }> }) {
  const { room } = await params;
  const lounge = await getLounge(room);
  if (!lounge) notFound();
  return <SnakeClient room={room} loungeName={lounge.name} />;
}

async function getLounge(room: string): Promise<{ name: string } | null> {
  const safeRoom = safeLoungeToken(room);
  if (!safeRoom) return null;
  const { data, error } = await supabaseServer()
    .from("lounges")
    .select("name")
    .or(loungeTokenFilter(safeRoom))
    .is("deleted_at", null)
    .maybeSingle();
  if (error) return null;
  return data ?? null;
}
