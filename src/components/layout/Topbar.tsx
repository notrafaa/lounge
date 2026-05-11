import { LogOut, Sparkles } from "lucide-react";

export function Topbar() {
  return (
    <header className="flex items-center justify-between border-b border-lounge-line bg-lounge-panel/55 px-4 py-3 md:px-6">
      <div>
        <p className="text-xs uppercase tracking-[0.18em] text-lounge-champagne">lounge</p>
        <h1 className="text-xl font-semibold">Louna Control Room</h1>
      </div>
      <form action="/api/auth/logout" method="post">
        <button className="inline-flex items-center gap-2 rounded-md border border-white/15 bg-white/10 px-3 py-2 text-sm text-white/70 transition hover:bg-white/15 hover:text-white">
          <Sparkles size={15} />
          Session admin
          <LogOut size={15} />
        </button>
      </form>
    </header>
  );
}
