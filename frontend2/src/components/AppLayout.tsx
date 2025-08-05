import { ReactNode } from "react";
import { Navigation } from "./Navigation";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-page">
      <Navigation />
      <main className="transition-page">
        {children}
      </main>
    </div>
  );
}