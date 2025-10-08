import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { DashboardLayout } from "./components/DashboardLayout";
import Dashboard from "./pages/Dashboard";
import Publications from "./pages/Publications";
import Projects from "./pages/Projects";
import FYP from "./pages/FYP";
import Faculty from "./pages/Faculty";
import TravelGrants from "./pages/TravelGrants";
import Thesis from "./pages/Thesis";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import Events from "./pages/Events";
import Reports from "./pages/Reports";
import Contacts from "./pages/Contacts";

const queryClient = new QueryClient();

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login />;
  }

  return <>{children}</>;
};

// Role-based Protected Route Component
const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login />;
  }

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">Access Denied</h1>
          <p className="text-muted-foreground">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Dashboard />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/publications" element={
              <AdminRoute>
                <DashboardLayout>
                  <Publications />
                </DashboardLayout>
              </AdminRoute>
            } />
            <Route path="/projects" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Projects />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/fyps" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <FYP />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/theses" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Thesis />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/workshops" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Events />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/travel-grants" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <TravelGrants />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/faculty" element={
              <AdminRoute>
                <DashboardLayout>
                  <Faculty />
                </DashboardLayout>
              </AdminRoute>
            } />
            <Route path="/master-data" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <div className="p-8 text-center">
                    <h1 className="text-2xl font-heading font-bold">Master Data</h1>
                    <p className="text-muted-foreground mt-2">Coming soon...</p>
                  </div>
                </DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/reports" element={
              <AdminRoute>
                <DashboardLayout>
                  <Reports />
                </DashboardLayout>
              </AdminRoute>
            } />
            <Route path="/contacts" element={
              <AdminRoute>
                <DashboardLayout>
                  <Contacts />
                </DashboardLayout>
              </AdminRoute>
            } />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
