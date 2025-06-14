import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import ArtistProfile from "./pages/ArtistProfile";
import Auth from "./pages/Auth";
import Booking from "./pages/Booking";
import Search from "./pages/Search";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import Profile from "./pages/Profile";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/artist/:id" element={<ArtistProfile />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/profile" element={<ProtectedRoute requireAuth={true}><Profile /></ProtectedRoute>} />
            <Route 
              path="/booking/:id" 
              element={
                <ProtectedRoute requireAuth={true}>
                  <Booking />
                </ProtectedRoute>
              } 
            />
            <Route path="/search" element={<Search />} />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute requireAuth={true} userType="artist">
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
