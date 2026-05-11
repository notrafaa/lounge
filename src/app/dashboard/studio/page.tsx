import { StudioClient, type StudioLounge } from "./view";
import { supabaseServer } from "@/lib/supabaseServer";
import { appConfig } from "@/lib/config";

export default async function StudioPage() {
  const lounges = await getLounges();
  return <StudioClient lounges={lounges} />;
}

async function getLounges(): Promise<StudioLounge[]> {
  const supabase = supabaseServer();
  const { data } = await supabase
    .from("lounges")
    .select("id,name,owner_user_id,visibility,theme,notifications_enabled,text_channel_id,control_channel_id,voice_channel_id,studio_token")
    .eq("guild_id", appConfig.guildId)
    .is("deleted_at", null)
    .order("updated_at", { ascending: false });
  return (data ?? []) as StudioLounge[];
}
