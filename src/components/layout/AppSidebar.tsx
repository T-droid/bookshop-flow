import { NavLink, useLocation } from "react-router-dom"
import {
  LayoutDashboard,
  Building2,
  Package,
  ShoppingCart,
  Calculator,
  FileText,
  Settings
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

const navigation = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Publishers", url: "/publishers", icon: Building2 },
  { title: "Inventory", url: "/inventory", icon: Package },
  { title: "Sales", url: "/sales", icon: ShoppingCart },
  { title: "Tax Settings", url: "/tax-settings", icon: Calculator },
  { title: "Reports", url: "/reports", icon: FileText },
  { title: "Settings", url: "/settings", icon: Settings },
]

export function AppSidebar() {
  const { state } = useSidebar()
  const location = useLocation()
  const currentPath = location.pathname
  const collapsed = state === "collapsed"

  const isActive = (path: string) => {
    if (path === "/") return currentPath === "/"
    return currentPath.startsWith(path)
  }

  const getNavClass = (active: boolean) =>
    active 
      ? "bg-gradient-primary text-white font-medium shadow-sm" 
      : "text-muted-foreground hover:bg-secondary hover:text-foreground transition-smooth"

  return (
    <Sidebar
      className={`${collapsed ? "w-16" : "w-64"} border-r bg-card transition-smooth`}
      collapsible="icon"
    >
      <SidebarContent className="px-3 py-4">
        {/* Logo Section */}
        <div className="mb-6 px-3">
          {!collapsed ? (
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-accent rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">K</span>
              </div>
              <div>
                <h2 className="font-semibold text-sm text-foreground">KICD</h2>
                <p className="text-xs text-muted-foreground">Bookshop IMS</p>
              </div>
            </div>
          ) : (
            <div className="w-8 h-8 bg-gradient-accent rounded-lg flex items-center justify-center mx-auto">
              <span className="text-white font-bold text-sm">K</span>
            </div>
          )}
        </div>

        <SidebarGroup>
          <SidebarGroupLabel className={collapsed ? "sr-only" : ""}>
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {navigation.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      end={item.url === "/"}
                      className={`${getNavClass(isActive(item.url))} rounded-lg px-3 py-2.5`}
                    >
                      <item.icon className={`${collapsed ? "mx-auto" : "mr-3"} h-4 w-4 flex-shrink-0`} />
                      {!collapsed && <span className="text-sm">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}