import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route } from "react-router-dom";
import { MotionConfig } from "framer-motion";
import { Layout } from "@/components/Layout";
import Home from "@/pages/Home";
import AdminProductManagement from "@/pages/AdminProductManagement";
import { ROUTE_PATHS } from "@/lib/index";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <MotionConfig reducedMotion="user">
        <Toaster />
        <Sonner />
        <HashRouter>
          <Routes>
            {/* Public routes with layout */}
            <Route path={ROUTE_PATHS.HOME} element={
              <Layout>
                <Home />
              </Layout>
            } />
            {/* Admin routes without layout */}
            <Route path="/admin" element={<AdminProductManagement />} />
            <Route path="/admin/dashboard" element={<AdminProductManagement />} />
            
            {/* Catch all other routes - redirect to home with layout */}
            <Route path="*" element={
              <Layout>
                <Home />
              </Layout>
            } />
          </Routes>
        </HashRouter>
      </MotionConfig>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;