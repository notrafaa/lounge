import { redirect, notFound } from "next/navigation";
import { appConfig } from "@/lib/config";
import { supabaseServer } from "@/lib/supabaseServer";

export default async function OwnerLoungePage({ params }: { params: Promise<{ ownerUserId: string }> }) {
  const { ownerUserId } = await params;
  const supabase = supabaseServer();
  const { data } = await supabase
    .from("lounges")
    .select("id,studio_token")
    .eq("guild_id", appConfig.guildId)
    .eq("owner_user_id", ownerUserId)
    .is("deleted_at", null)
    .maybeSingle();

  if (!data?.id) notFound();
  redirect(`/studio/${data.studio_token ?? data.id}`);
}
