import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "./AppSidebar"
import { AppHeader } from "./AppHeader"

interface AppLayoutProps {
  children: React.ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <SidebarProvider defaultOpen>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        
        <div className="flex-1 flex flex-col">
          <AppHeader />
          
          <main className="flex-1 p-6">
            {children}
          </main>
          
          <footer className="border-t bg-card px-6 py-4">
            <p className="text-sm text-muted-foreground text-center">
              Powered by KICD IMS • © 2025 Kenya Institute of Curriculum Development
            </p>
          </footer>
        </div>
      </div>
    </SidebarProvider>
  )
}