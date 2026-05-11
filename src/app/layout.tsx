import type { Metadata } from "next";
import { ActionToasts } from "@/components/ui/ActionToasts";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "Lounge Dashboard",
  description: "Dashboard admin pour Louna et lounge🥂"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>
        {children}
        <ActionToasts />
      </body>
    </html>
  );
}
