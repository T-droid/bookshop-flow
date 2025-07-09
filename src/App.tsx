import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "./components/layout/AppLayout";
import Dashboard from "./pages/Dashboard";
import Publishers from "./pages/Publishers";
import Inventory from "./pages/Inventory";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppLayout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/publishers" element={<Publishers />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/sales" element={<div className="p-8 text-center text-muted-foreground">Sales page coming soon...</div>} />
            <Route path="/tax-settings" element={<div className="p-8 text-center text-muted-foreground">Tax Settings page coming soon...</div>} />
            <Route path="/reports" element={<div className="p-8 text-center text-muted-foreground">Reports page coming soon...</div>} />
            <Route path="/settings" element={<div className="p-8 text-center text-muted-foreground">Settings page coming soon...</div>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AppLayout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
