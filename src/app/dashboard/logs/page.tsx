import { GlassCard } from "@/components/ui/GlassCard";
import { supabaseServer } from "@/lib/supabaseServer";

export default async function LogsPage() {
  const logs = await getLogs();
  return (
    <GlassCard>
      <h1 className="mb-5 text-2xl font-semibold">Logs d'activité</h1>
      <div className="space-y-2">
        {logs.length === 0 ? (
          <p className="text-sm text-white/45">Rien à signaler. Même les erreurs dorment.</p>
        ) : (
          logs.map((log) => (
            <div key={log.id} className="rounded-md border border-white/10 bg-white/5 p-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="font-medium">{log.action}</p>
                <p className="text-xs text-white/40">{new Date(log.created_at).toLocaleString("fr-FR")}</p>
              </div>
              <p className="mt-1 text-sm text-white/45">
                {log.actor} · {log.target_type} · {log.target_id}
              </p>
            </div>
          ))
        )}
      </div>
    </GlassCard>
  );
}

async function getLogs(): Promise<Array<{ id: string; actor: string; action: string; target_type: string; target_id: string; created_at: string }>> {
  try {
    const { data, error } = await supabaseServer().from("dashboard_logs").select("*").order("created_at", { ascending: false }).limit(100);
    if (error) throw error;
    return (data ?? []) as Array<{ id: string; actor: string; action: string; target_type: string; target_id: string; created_at: string }>;
  } catch {
    return [];
  }
}

