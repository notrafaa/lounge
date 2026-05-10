import clsx from "clsx";
import { Bot, CircleAlert, Signal } from "lucide-react";

export function BotStatusCard({ online, bot, guildCount, uptime }: { online: boolean; bot: string; guildCount: number; uptime: number }) {
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
      <Bot className={clsx("absolute -bottom-5 -right-4 h-28 w-28 opacity-10", online ? "text-emerald-100" : "text-rose-100")} />
    </section>
  );
}

function formatUptime(seconds: number): string {
  if (!seconds) return "0 min";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ${minutes % 60}m`;
}
