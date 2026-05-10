import { Badge } from "@/components/ui/Badge";
import { GlassCard } from "@/components/ui/GlassCard";
import { supabaseServer } from "@/lib/supabaseServer";

export default async function UsersPage() {
  const users = await getUsers();
  return (
    <GlassCard>
      <h1 className="mb-5 text-2xl font-semibold">Membres connus</h1>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="text-white/40">
            <tr>
              <th className="pb-3">Utilisateur</th>
              <th className="pb-3">Discord ID</th>
              <th className="pb-3">Lounges</th>
              <th className="pb-3">Notifications</th>
              <th className="pb-3">Créé</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {users.map((user) => (
              <tr key={user.discord_user_id}>
                <td className="py-3">
                  <div className="flex items-center gap-3">
                    {user.avatar_url ? <img src={user.avatar_url} alt="" className="h-9 w-9 rounded-full" /> : <div className="h-9 w-9 rounded-full bg-white/10" />}
                    <span>{user.username}</span>
                  </div>
                </td>
                <td className="py-3 text-white/55">{user.discord_user_id}</td>
                <td className="py-3">{user.lounge_count}</td>
                <td className="py-3">
                  <Badge>{user.notifications_enabled ? "on" : "variable"}</Badge>
                </td>
                <td className="py-3 text-white/45">{new Date(user.created_at).toLocaleDateString("fr-FR")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </GlassCard>
  );
}

async function getUsers() {
  try {
    const supabase = supabaseServer();
    const { data } = await supabase.from("profiles").select("*").order("updated_at", { ascending: false }).limit(100);
    return (data ?? []).map((profile) => ({
      ...profile,
      lounge_count: 0,
      notifications_enabled: true
    })) as Array<{
      discord_user_id: string;
      username: string;
      avatar_url: string | null;
      created_at: string;
      lounge_count: number;
      notifications_enabled: boolean;
    }>;
  } catch {
    return [];
  }
}

