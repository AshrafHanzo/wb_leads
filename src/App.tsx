import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import Dashboard from "@/pages/Dashboard";
import Accounts from "@/pages/Accounts";
import Leads from "@/pages/Leads";
import Users from "@/pages/Users";
import Stages from "@/pages/Stages";
import Settings from "@/pages/Settings";
import Sourcing from "@/pages/Sourcing";
import DataEnrichment from "@/pages/DataEnrichment";
import ProductQualification from "@/pages/ProductQualification";
import InitialConnect from "@/pages/InitialConnect";
import Telecalling from "@/pages/Telecalling";
import Demo from "@/pages/Demo";
import Discovery from "@/pages/Discovery";
import POC from "@/pages/POC";
import ProposalCommercials from "@/pages/ProposalCommercials";
import Pilot from "@/pages/Pilot";
import ClosedWon from "@/pages/ClosedWon";
import ClosedLost from "@/pages/ClosedLost";
import Reports from "@/pages/Reports";
import Login from "@/pages/Login";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Protected Route Component
const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { currentUser } = useAuth();
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />

            <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/leads" element={<ProtectedRoute><Leads /></ProtectedRoute>} />
            <Route path="/accounts" element={<ProtectedRoute><Accounts /></ProtectedRoute>} />
            <Route path="/users" element={<ProtectedRoute><Users /></ProtectedRoute>} />
            <Route path="/stages" element={<ProtectedRoute><Stages /></ProtectedRoute>} />
            <Route path="/sourcing" element={<ProtectedRoute><Sourcing /></ProtectedRoute>} />
            <Route path="/data-enrichment" element={<ProtectedRoute><DataEnrichment /></ProtectedRoute>} />
            <Route path="/product-qualification" element={<ProtectedRoute><ProductQualification /></ProtectedRoute>} />
            <Route path="/telecalling" element={<ProtectedRoute><Telecalling /></ProtectedRoute>} />
            <Route path="/initial-connect" element={<ProtectedRoute><InitialConnect /></ProtectedRoute>} />
            <Route path="/demo" element={<ProtectedRoute><Demo /></ProtectedRoute>} />
            <Route path="/discovery" element={<ProtectedRoute><Discovery /></ProtectedRoute>} />
            <Route path="/poc" element={<ProtectedRoute><POC /></ProtectedRoute>} />
            <Route path="/proposal-commercials" element={<ProtectedRoute><ProposalCommercials /></ProtectedRoute>} />
            <Route path="/pilot" element={<ProtectedRoute><Pilot /></ProtectedRoute>} />
            <Route path="/closed-won" element={<ProtectedRoute><ClosedWon /></ProtectedRoute>} />
            <Route path="/closed-lost" element={<ProtectedRoute><ClosedLost /></ProtectedRoute>} />
            <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
