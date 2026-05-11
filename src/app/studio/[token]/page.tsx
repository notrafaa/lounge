import { notFound } from "next/navigation";
import { OwnerStudioClient, type OwnerStudioData } from "./view";
import { supabaseServer } from "@/lib/supabaseServer";

export default async function OwnerStudioPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const data = await getStudio(token);
  if (!data) notFound();
  return <OwnerStudioClient data={data} token={token} />;
}

async function getStudio(token: string): Promise<OwnerStudioData | null> {
  const safeToken = token.replace(/[^a-zA-Z0-9-]/g, "");
  if (!safeToken || safeToken !== token) return null;
  const supabase = supabaseServer();
  const { data: lounge } = await supabase
    .from("lounges")
    .select("*")
    .or(`studio_token.eq.${safeToken},id.eq.${safeToken}`)
    .is("deleted_at", null)
    .maybeSingle();
  if (!lounge) return null;

  const [{ data: owner }, { data: members }, { data: preferences }] = await Promise.all([
    supabase.from("profiles").select("*").eq("discord_user_id", lounge.owner_user_id).maybeSingle(),
    supabase.from("lounge_members").select("*").eq("lounge_id", lounge.id).order("invited_at", { ascending: false }),
    supabase.from("lounge_preferences").select("*").eq("lounge_id", lounge.id).maybeSingle()
  ]);

  const memberIds = [...new Set((members ?? []).map((member) => String(member.user_id)))];
  const { data: profiles } = memberIds.length
    ? await supabase.from("profiles").select("discord_user_id,username,avatar_url,last_seen_at,total_message_count,total_voice_joins").in("discord_user_id", memberIds)
    : { data: [] };

  return {
    lounge: lounge as OwnerStudioData["lounge"],
    owner: (owner as OwnerStudioData["owner"]) ?? null,
    members: (members ?? []).map((member) => ({
      ...member,
      profile: profiles?.find((profile) => profile.discord_user_id === member.user_id) ?? null
    })) as OwnerStudioData["members"],
    preferences: (preferences as OwnerStudioData["preferences"]) ?? null
  };
}
