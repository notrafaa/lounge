import Link from "next/link";
import { Bot, Flame, Hash, LayoutDashboard, MessageSquareText, Settings, Sparkles, Users } from "lucide-react";

const items = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/studio", label: "Studio", icon: Sparkles },
  { href: "/dashboard/lounges", label: "Lounges", icon: Flame },
  { href: "/dashboard/channels", label: "Salons", icon: Hash },
  { href: "/dashboard/commands", label: "Commandes", icon: MessageSquareText },
  { href: "/dashboard/users", label: "Membres", icon: Users },
  { href: "/dashboard/settings", label: "Réglages", icon: Settings },
  { href: "/dashboard/logs", label: "Logs", icon: Bot }
];

export function Sidebar() {
  return (
    <aside className="hidden w-64 shrink-0 border-r border-lounge-line bg-[#151b24]/92 p-4 md:block">
      <div className="mb-8 flex items-center gap-3">
        <img src="/images/lounge.png" alt="lounge" className="h-8 w-auto object-contain" />
      </div>
      <nav className="space-y-1">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-white/65 transition hover:bg-white/10 hover:text-white"
            >
              <Icon size={17} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
