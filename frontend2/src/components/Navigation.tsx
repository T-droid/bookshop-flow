import { BarChart3, Users, Settings, FileText, Calculator, Shield, Receipt, Boxes } from "lucide-react";
import { Button } from "./ui/button";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import logo from "@/assets/logo.png";

const navItems = [
  { icon: BarChart3, label: "Dashboard", href: "/dashboard", roles: ["admin", "manager", "sales", "finance", "superadmin"] },
  { icon: Boxes, label: "Stock Management", href: "/inventory-management", roles: ["admin", "manager"] },
  { icon: Receipt, label: "Purchase Orders", href: "/create-purchase-order", roles: ["admin", "manager"] },
  { icon: Shield, label: "Admin", href: "/admin-dashboard", roles: ["admin"] },
  { icon: Users, label: "Suppliers", href: "/suppliers", roles: ["admin", "manager"] },
  { icon: FileText, label: "Sales", href: "/sales", roles: ["admin", "manager", "sales"] },
  { icon: BarChart3, label: "Reports", href: "/reports", roles: ["admin", "manager", "sales"] },
  { icon: Calculator, label: "Tax Settings", href: "/tax-settings", roles: ["admin", "manager", "finance"] },
  { icon: Settings, label: "Settings", href: "/settings", roles: ["admin", "manager"] },
  { icon: FileText, label: "Help", href: "/help", roles: ["admin", "manager", "sales", "finance", "superadmin"] },
  { icon: FileText, label: "FAQ", href: "/faq", roles: ["admin", "manager", "sales", "finance", "superadmin"] },
];

export function Navigation() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logOut, role } = useAuth();

  const isActiveRoute = (href: string) => {
    return location.pathname === href || location.pathname.startsWith(`${href}/`);
  };

  const handleNavigate = (href: string) => {
    navigate(href, { replace: true });
  }

  const signOut = async () => {
    await logOut();
    navigate('/auth/login', { replace: true });
  }
  return (
    <nav className="border-b border-border/70 bg-muted/70 backdrop-blur supports-[backdrop-filter]:bg-muted/55 shadow-card-soft">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex items-center">
            <div className="h-12 w-12 rounded-xl bg-card ring-1 ring-border shadow-sm p-1.5 flex items-center justify-center">
              <img
                src={logo}
                alt="Bookshop logo"
                loading="lazy"
                height={40}
                width={40}
                className="h-full w-full object-contain"
              />
            </div>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center h-full ml-8">
            {navItems.map((item) =>
              item.roles.includes(role) && (
                <button
                  key={item.label}
                  type="button"
                  aria-current={isActiveRoute(item.href) ? "page" : undefined}
                  className={`inline-flex h-full items-center gap-2 px-4 text-sm font-medium transition-colors ${
                    isActiveRoute(item.href)
                      ? "bg-primary/18 text-primary border-l border-r border-primary/40"
                      : "text-foreground/75 hover:bg-card/60 hover:text-foreground"
                  }`}
                  onClick={() => handleNavigate(item.href)}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </button>
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
