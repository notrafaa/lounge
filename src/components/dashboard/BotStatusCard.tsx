import clsx from "clsx";
import { Bot, CircleAlert, Cpu, Gamepad2, LayoutGrid, Signal, Sparkles, Users } from "lucide-react";

export function BotStatusCard({
  online,
  bot,
  guildCount,
  uptime,
  services = {},
  metrics = {}
}: {
  online: boolean;
  bot: string;
  guildCount: number;
  uptime: number;
  services?: Record<string, string>;
  metrics?: Record<string, number>;
}) {
  return (
    <section
      className={clsx(
        "relative overflow-hidden rounded-lg border p-5 shadow-glass",
        online ? "border-emerald-300/45 bg-emerald-500/14" : "border-rose-300/50 bg-rose-500/14"
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-white/65">Bot</p>
          <strong className={clsx("mt-2 block text-4xl font-semibold", online ? "text-emerald-100" : "text-rose-100")}>
            {online ? "Online" : "Offline"}
          </strong>
          <p className="mt-2 text-sm text-white/60">
            {bot} · {guildCount} serveur(s) · {formatUptime(uptime)}
          </p>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            <StatusLine icon={<Cpu size={15} />} label="IA" value={services.ia ?? "fallback"} />
            <StatusLine icon={<Sparkles size={15} />} label="Studio" value={services.studio ?? "prêt"} />
            <StatusLine icon={<LayoutGrid size={15} />} label="Catégories" value={String(metrics.activeLounges ?? 0)} />
            <StatusLine icon={<Users size={15} />} label="Actifs 24h" value={String(metrics.activeMembers24h ?? 0)} />
          </div>
        </div>
        <div
          className={clsx(
            "flex h-14 w-14 items-center justify-center rounded-md border",
            online ? "border-emerald-200/45 bg-emerald-300/18 text-emerald-100" : "border-rose-200/45 bg-rose-300/18 text-rose-100"
          )}
        >
          {online ? <Signal size={26} /> : <CircleAlert size={26} />}
        </div>
      </div>
      <Gamepad2 className={clsx("absolute -bottom-5 -right-4 h-28 w-28 opacity-10", online ? "text-emerald-100" : "text-rose-100")} />
      <Bot className={clsx("absolute -bottom-4 right-20 h-16 w-16 opacity-10", online ? "text-emerald-100" : "text-rose-100")} />
    </section>
  );
}

function StatusLine({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-2 rounded-md border border-white/10 bg-black/12 px-2.5 py-2 text-xs text-white/65">
      <span className="flex items-center gap-1.5">{icon}{label}</span>
      <span className="font-medium text-white/85">{value}</span>
    </div>
  );
}

function formatUptime(seconds: number): string {
  if (!seconds) return "0 min";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ${minutes % 60}m`;
}
