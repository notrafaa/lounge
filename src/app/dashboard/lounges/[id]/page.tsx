import { notFound } from "next/navigation";
import { MessageComposer } from "@/components/discord/MessageComposer";
import { LoungeMembers } from "@/components/lounges/LoungeMembers";
import { LoungeSettings } from "@/components/lounges/LoungeSettings";
import { LoungeStats } from "@/components/lounges/LoungeStats";
import { GlassCard } from "@/components/ui/GlassCard";
import { supabaseServer } from "@/lib/supabaseServer";

export default async function LoungeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await getLounge(id);
  if (!data?.lounge) notFound();

  const lounge = data.lounge;
  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm text-white/45">Détail lounge</p>
        <h1 className="text-2xl font-semibold">{lounge.name}</h1>
      </div>
      <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
        <div className="space-y-5">
          <GlassCard>
            <h2 className="mb-4 text-lg font-semibold">Envoyer dans le lounge</h2>
            <MessageComposer channelId={lounge.text_channel_id ?? lounge.control_channel_id ?? undefined} />
          </GlassCard>
          <LoungeMembers members={data.members} />
        </div>
        <div className="space-y-5">
          <LoungeStats lounge={lounge} />
          <LoungeSettings loungeId={lounge.id} visibility={lounge.visibility} />
        </div>
      </div>
    </div>
  );
}

async function getLounge(id: string) {
  const supabase = supabaseServer();
  const [{ data: lounge }, { data: members }] = await Promise.all([
    supabase.from("lounges").select("*").eq("id", id).is("deleted_at", null).maybeSingle(),
    supabase.from("lounge_members").select("*").eq("lounge_id", id).order("invited_at")
  ]);
  return { lounge, members: members ?? [] };
}
