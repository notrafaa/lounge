import { Badge } from "@/components/ui/Badge";
import { GlassCard } from "@/components/ui/GlassCard";

export function LoungeMembers({ members }: { members: Array<{ user_id: string; status: string; notifications_enabled: boolean }> }) {
  return (
    <GlassCard>
      <h2 className="mb-4 text-lg font-semibold">Membres</h2>
      <div className="space-y-2">
        {members.length === 0 ? (
          <p className="text-sm text-white/45">Aucun invité pour l'instant. La porte est fermée mais accueillante.</p>
        ) : (
          members.map((member) => (
            <div key={member.user_id} className="flex items-center justify-between rounded-md border border-white/10 bg-white/5 px-3 py-2">
              <span className="text-sm">{member.user_id}</span>
              <div className="flex gap-2">
                <Badge tone={member.status === "accepted" ? "good" : "neutral"}>{member.status}</Badge>
                <Badge>{member.notifications_enabled ? "notif on" : "notif off"}</Badge>
              </div>
            </div>
          ))
        )}
      </div>
    </GlassCard>
  );
}

