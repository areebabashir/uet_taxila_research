import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Publications from "./pages/Publications";
import Theses from "./pages/Theses";
import TravelGrants from "./pages/TravelGrants";
import FYPProjects from "./pages/FYPProjects";
import EventsPage from "./pages/EventsPage";
import ResearchProjects from "./pages/ResearchProjects";
import Register from "./pages/Register";
import Research from "./pages/Research";
import Faculty from "./pages/Faculty";
import FacultyProfile from "./pages/FacultyProfile";
import Projects from "./pages/Projects";
import Funding from "./pages/Funding";
import ContactPage from "./pages/ContactPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/publications" element={<Publications />} />
          <Route path="/theses" element={<Theses />} />
          <Route path="/travel-grants" element={<TravelGrants />} />
          <Route path="/fyp-projects" element={<FYPProjects />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/research-projects" element={<ResearchProjects />} />
          <Route path="/register" element={<Register />} />
          <Route path="/research" element={<Research />} />
          <Route path="/faculty" element={<Faculty />} />
          <Route path="/faculty/:id" element={<FacultyProfile />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/funding" element={<Funding />} />
          <Route path="/contact" element={<ContactPage />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
