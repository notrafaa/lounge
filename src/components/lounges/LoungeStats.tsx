import { Flame } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";

export function LoungeStats({ lounge }: { lounge: { activity_score: number; weekly_score: number; streak_days: number; decay_progress: number } }) {
  return (
    <GlassCard>
      <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
        <Flame size={18} />
        Flammes
      </h2>
      <div className="grid grid-cols-2 gap-3">
        <Metric label="Score" value={lounge.activity_score} />
        <Metric label="Semaine" value={lounge.weekly_score} />
        <Metric label="Streak" value={`${lounge.streak_days}j`} />
        <Metric label="Décroissance" value={`${lounge.decay_progress}%`} />
      </div>
    </GlassCard>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-md border border-white/10 bg-white/5 p-3">
      <p className="text-sm text-white/45">{label}</p>
      <p className="mt-1 text-2xl font-semibold">{value}</p>
    </div>
  );
}

