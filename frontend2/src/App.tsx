import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Inventory from "./pages/Inventory";
import Publishers from "./pages/Publishers";
import Sales from "./pages/Sales";
import Reports from "./pages/Reports";
import TaxSettings from "./pages/TaxSettings";
import Settings from "./pages/Settings";
import AuditLogs from "./pages/AuditLogs";
import BookshopAdmin from "./pages/BookshopAdmin";
import SuperAdmin from "./pages/SuperAdmin";
import NotFound from "./pages/NotFound";
import { AuthProvider } from "./context/AuthProvider";
import CreatePurchaseOrder from "./pages/CreatePurchaseOrder";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/inventory" element={<Inventory />} />
              <Route path="/publishers" element={<Publishers />} />
              <Route path="/sales" element={<Sales />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/tax-settings" element={<TaxSettings />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/audit-logs" element={<AuditLogs />} />
              <Route path="/bookshop-admin" element={<BookshopAdmin />} />
              <Route path="/dashboard/super-admin" element={<SuperAdmin />} />
              <Route path="/auth/login" element={<Login />} />
              <Route path="/create-purchase-order" element={<CreatePurchaseOrder />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
  </QueryClientProvider>
);

export default App;
