import { DashboardShell } from "@/components/layout/DashboardShell";
import { requireSession } from "@/lib/session";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  await requireSession();
  return <DashboardShell>{children}</DashboardShell>;
}

