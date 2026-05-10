import Link from "next/link";
import { Flame, Lock, Unlock } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { GlassCard } from "@/components/ui/GlassCard";

export interface LoungeCardData {
  id: string;
  name: string;
  owner_user_id: string;
  visibility: "private" | "public";
  activity_score: number;
  streak_days: number;
  last_activity_at: string | null;
}

export function LoungeCard({ lounge }: { lounge: LoungeCardData }) {
  const VisibilityIcon = lounge.visibility === "public" ? Unlock : Lock;
  return (
    <GlassCard className="transition hover:border-lounge-mist/35">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold">{lounge.name}</h3>
          <p className="mt-1 text-sm text-white/45">Owner: {lounge.owner_user_id}</p>
        </div>
        <Badge tone={lounge.visibility === "public" ? "good" : "neutral"}>
          <VisibilityIcon size={13} />
          <span className="ml-1">{lounge.visibility}</span>
        </Badge>
      </div>
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-md border border-white/10 bg-white/5 p-3">
          <p className="text-white/45">Score</p>
          <p className="mt-1 flex items-center gap-2 text-xl font-semibold">
            <Flame size={17} />
            {lounge.activity_score}
          </p>
        </div>
        <div className="rounded-md border border-white/10 bg-white/5 p-3">
          <p className="text-white/45">Streak</p>
          <p className="mt-1 text-xl font-semibold">{lounge.streak_days}j</p>
        </div>
      </div>
      <Link href={`/dashboard/lounges/${lounge.id}`} className="mt-4 block rounded-md bg-white/10 px-3 py-2 text-center text-sm transition hover:bg-white/15">
        Ouvrir
      </Link>
    </GlassCard>
  );
}

