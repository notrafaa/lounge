import { GlassCard } from "./GlassCard";

export function StatCard({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <GlassCard>
      <p className="text-sm text-white/55">{label}</p>
      <strong className="mt-3 block text-3xl font-semibold text-white">{value}</strong>
      {hint ? <p className="mt-2 text-sm text-white/45">{hint}</p> : null}
    </GlassCard>
  );
}

