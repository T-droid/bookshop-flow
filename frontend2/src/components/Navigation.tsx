import { Book, BarChart3, Package, Users, Settings, FileText, Calculator, Shield, Receipt, Boxes, Image } from "lucide-react";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import logo from "@/assets/logo.png"

const navItems = [
  { icon: BarChart3, label: "Dashboard", href: "/dashboard", active: true, roles: ["admin", "manager", "sales", "finance", "superadmin"] },
  { icon: Boxes, label: "Stock Management", href: "/inventory-management", roles: ["admin", "manager"] },
  { icon: Receipt, label: "Purchase Orders", href: "/create-purchase-order", roles: ["admin", "manager"] },
  { icon: Shield, label: "Admin", href: "/admin-dashboard", roles: ["admin"] },
  { icon: Users, label: "Suppliers", href: "/suppliers", roles: ["admin", "manager"] },
  { icon: FileText, label: "Sales", href: "/sales", roles: ["admin", "manager", "sales"] },
  { icon: BarChart3, label: "Reports", href: "/reports", roles: ["admin", "manager", "sales"] },
  { icon: Calculator, label: "Tax Settings", href: "/tax-settings", roles: ["admin", "manager", "finance"] },
  { icon: Settings, label: "Settings", href: "/settings", roles: ["admin", "manager"] },
];

export function Navigation() {
  const navigate = useNavigate();
  const { logOut, role } = useAuth();

  const handleNavigate = (href: string) => {
    navigate(href, { replace: true });
  }

  const signOut = async () => {
    await logOut();
    navigate('/auth/login', { replace: true });
  }
  return (
    <nav className="bg-card border-b border-border shadow-card-soft">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <img
              src={logo}
              alt="BookShelf IMS"
              loading="lazy"
              height={24}
              width={24}
              />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">BookShelf IMS</h1>
              <p className="text-xs text-muted-foreground">Cozy Corner Books</p>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => 
            item.roles.includes(role) && (
              <Button
                key={item.label}
                variant={item.active ? "accent" : "ghost"}
                size="sm"
                className="gap-2"
                onClick={() => handleNavigate(item.href)}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Button>
            ))}
          </div>

          {/* User Menu */}
          <div className="flex items-center gap-3">
            <Button
            variant="outline"
            size="sm"
            onClick={signOut}
            >
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}