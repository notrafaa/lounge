import { CommandEditor } from "@/components/commands/CommandEditor";
import { Badge } from "@/components/ui/Badge";
import { GlassCard } from "@/components/ui/GlassCard";
import { appConfig } from "@/lib/config";
import { supabaseServer } from "@/lib/supabaseServer";

export default async function CommandsPage() {
  const commands = await getCommands();
  return (
    <div className="grid gap-5 xl:grid-cols-[1fr_420px]">
      <GlassCard>
        <h1 className="mb-4 text-2xl font-semibold">Commandes custom</h1>
        <div className="space-y-2">
          {commands.length === 0 ? (
            <p className="text-sm text-white/45">Aucune commande custom. Louna attend son petit script.</p>
          ) : (
            commands.map((command) => (
              <div key={command.id} className="rounded-md border border-white/10 bg-white/5 p-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold">/cmd {command.name}</p>
                    <p className="text-sm text-white/45">{command.description}</p>
                  </div>
                  <Badge tone={command.enabled ? "good" : "neutral"}>{command.enabled ? "active" : "off"}</Badge>
                </div>
              </div>
            ))
          )}
        </div>
      </GlassCard>
      <CommandEditor />
    </div>
  );
}

async function getCommands(): Promise<Array<{ id: string; name: string; description: string; enabled: boolean }>> {
  try {
    const { data, error } = await supabaseServer().from("custom_commands").select("*").eq("guild_id", appConfig.guildId).order("created_at");
    if (error) throw error;
    return (data ?? []) as Array<{ id: string; name: string; description: string; enabled: boolean }>;
  } catch {
    return [];
  }
}

