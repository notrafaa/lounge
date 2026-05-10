import { LoungeCard, type LoungeCardData } from "@/components/lounges/LoungeCard";
import { supabaseServer } from "@/lib/supabaseServer";
import { appConfig } from "@/lib/config";

export default async function LoungesPage() {
  const lounges = await getLounges();

  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm text-white/45">Lounges</p>
        <h1 className="text-2xl font-semibold">Espaces actifs</h1>
      </div>
      {lounges.length === 0 ? (
        <div className="glass rounded-lg p-8 text-white/55">Aucun lounge actif pour l'instant. Le canapé est prêt, il manque juste quelqu'un pour s'asseoir.</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {lounges.map((lounge) => (
            <LoungeCard key={lounge.id} lounge={lounge} />
          ))}
        </div>
      )}
    </div>
  );
}

async function getLounges(): Promise<LoungeCardData[]> {
  try {
    const { data, error } = await supabaseServer()
      .from("lounges")
      .select("id,name,owner_user_id,visibility,activity_score,streak_days,last_activity_at")
      .eq("guild_id", appConfig.guildId)
      .is("deleted_at", null)
      .order("updated_at", { ascending: false });
    if (error) throw error;
    return (data ?? []) as LoungeCardData[];
  } catch {
    return [];
  }
}

