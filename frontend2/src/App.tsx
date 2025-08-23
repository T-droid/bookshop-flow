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
              <Route path="/" element={<Dashboard />} />
              <Route path="/dashboard" element={<Dashboard />} />

              <Route path="/suppliers" element={
                <ProtectedRoute roles={["admin", "manager"]}>
                  <Suppliers />
                </ProtectedRoute>
              } />

              <Route path="/sales" element={
                <ProtectedRoute roles={["sales", "admin"]}>
                  <Sales />
                </ProtectedRoute>
              } />

              <Route path="/reports" element={
                <ProtectedRoute roles={["admin"]}>
                  <Reports />
                </ProtectedRoute>
              } />

              <Route path="/tax-settings" element={
                <ProtectedRoute roles={["finance", "admin"]}>
                  <TaxSettings />
                </ProtectedRoute>
              } />

              <Route path="/settings" element={
                <ProtectedRoute roles={["admin"]}>
                  <Settings />
                </ProtectedRoute>
              } />

              <Route path="/audit-logs" element={
                <ProtectedRoute roles={["super-admin"]}>
                  <AuditLogs />
                </ProtectedRoute>
              } />

              <Route path="/bookshop-admin" element={
                <ProtectedRoute roles={["bookshop-admin", "super-admin"]}>
                  <BookshopAdmin />
                </ProtectedRoute>
              } />

              <Route path="/dashboard/super-admin" element={
                <ProtectedRoute roles={["super-admin"]}>
                  <SuperAdmin />
                </ProtectedRoute>
              } />

              <Route path="/create-purchase-order" element={
                <ProtectedRoute roles={["purchaser", "admin"]}>
                  <CreatePurchaseOrder />
                </ProtectedRoute>
              } />

              <Route path="/admin-dashboard" element={
                <ProtectedRoute roles={["admin"]}>
                  <AdminDashboard />
                </ProtectedRoute>
              } />

              <Route path="/inventory-management" element={
                <ProtectedRoute roles={["inventory-manager", "admin"]}>
                  <InventoryManagement />
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
