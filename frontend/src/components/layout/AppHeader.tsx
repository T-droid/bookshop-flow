import { SidebarTrigger } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { User, LogOut } from "lucide-react"

export function AppHeader() {
  return (
    <header className="h-16 border-b bg-card flex items-center justify-between px-6 shadow-card">
      <div className="flex items-center space-x-4">
        <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
        
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-accent rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">K</span>
          </div>
          <div>
            <h1 className="font-semibold text-lg text-foreground">KICD Bookshop IMS</h1>
            <p className="text-xs text-muted-foreground">Inventory Management System</p>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-3">
        <div className="text-right">
          <p className="text-sm font-medium text-foreground">Manager</p>
          <p className="text-xs text-muted-foreground">bookshop@kicd.ac.ke</p>
        </div>
        
        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
          <User className="h-4 w-4 mr-2" />
          Profile
        </Button>
        
        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-destructive">
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </div>
    </header>
  )
}