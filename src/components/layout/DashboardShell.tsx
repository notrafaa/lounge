import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-lounge-radial">
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex min-w-0 flex-1 flex-col">
          <Topbar />
          <div className="lounge-scrollbar flex-1 overflow-y-auto p-4 md:p-6">{children}</div>
        </main>
      </div>
    </div>
  );
}

