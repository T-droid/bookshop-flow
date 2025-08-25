import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Suppliers from "./pages/Suppliers";
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
import AdminDashboard from "./pages/AdminDashboard";
import InventoryManagement from "./pages/InventoryManagement";
import { NotificationProvider } from "./components/NotificationProvider";
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <NotificationProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route path="/" element={
                <ProtectedRoute roles={["admin", "manager", "sales", "finance", "superadmin"]}>
                  <Dashboard />
                </ProtectedRoute>
              } />
              
              <Route path="/dashboard" element={
                <ProtectedRoute roles={["admin", "manager", "sales", "finance", "superadmin"]}>
                  <Dashboard />
                </ProtectedRoute>
              } />

              <Route path="/inventory-management" element={
                <ProtectedRoute roles={["admin", "manager"]}>
                  <InventoryManagement />
                </ProtectedRoute>
              } />

              <Route path="/create-purchase-order" element={
                <ProtectedRoute roles={["admin", "manager"]}>
                  <CreatePurchaseOrder />
                </ProtectedRoute>
              } />

              <Route path="/admin-dashboard" element={
                <ProtectedRoute roles={["admin"]}>
                  <AdminDashboard />
                </ProtectedRoute>
              } />

              <Route path="/suppliers" element={
                <ProtectedRoute roles={["admin", "manager"]}>
                  <Suppliers />
                </ProtectedRoute>
              } />

              <Route path="/sales" element={
                <ProtectedRoute roles={["admin", "manager", "sales"]}>
                  <Sales />
                </ProtectedRoute>
              } />

              <Route path="/reports" element={
                <ProtectedRoute roles={["admin", "manager", "sales"]}>
                  <Reports />
                </ProtectedRoute>
              } />

              <Route path="/tax-settings" element={
                <ProtectedRoute roles={["admin", "manager", "finance"]}>
                  <TaxSettings />
                </ProtectedRoute>
              } />

              <Route path="/settings" element={
                <ProtectedRoute roles={["admin", "manager"]}>
                  <Settings />
                </ProtectedRoute>
              } />

              {/* Routes not in navigation - keeping existing roles */}
              <Route path="/audit-logs" element={
                <ProtectedRoute roles={["superadmin"]}>
                  <AuditLogs />
                </ProtectedRoute>
              } />

              <Route path="/bookshop-admin" element={
                <ProtectedRoute roles={["admin", "superadmin"]}>
                  <BookshopAdmin />
                </ProtectedRoute>
              } />

              <Route path="/dashboard/super-admin" element={
                <ProtectedRoute roles={["superadmin"]}>
                  <SuperAdmin />
                </ProtectedRoute>
              } />

              <Route path="/auth/login" element={<Login />} />
              <Route path="*" element={<NotFound />} />
            </Routes>

          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </NotificationProvider>
  </QueryClientProvider>
);

export default App;
