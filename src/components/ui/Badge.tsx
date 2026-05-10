import clsx from "clsx";

export function Badge({ children, tone = "neutral" }: { children: React.ReactNode; tone?: "neutral" | "good" | "warn" | "danger" }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium",
        tone === "neutral" && "border-white/15 bg-white/10 text-white/70",
        tone === "good" && "border-emerald-300/30 bg-emerald-300/10 text-emerald-100",
        tone === "warn" && "border-lounge-champagne/40 bg-lounge-champagne/10 text-lounge-champagne",
        tone === "danger" && "border-rose-300/35 bg-rose-300/10 text-rose-100"
      )}
    >
      {children}
    </span>
  );
}

