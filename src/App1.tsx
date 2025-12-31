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
const ProtectedRoute = ({ children, allowedRoles }: { children: JSX.Element, allowedRoles?: string[] }) => {
  const { currentUser } = useAuth();

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // Admin always has access
  if (currentUser.role === 'Admin') {
    return children;
  }

  // Check role permission if allowedRoles is specified
  if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
    return <Navigate to="/" replace />;
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
            <Route path="/accounts" element={<ProtectedRoute allowedRoles={['Admin', 'BD', 'Sales']}><Accounts /></ProtectedRoute>} />
            <Route path="/users" element={<ProtectedRoute allowedRoles={['Admin']}><Users /></ProtectedRoute>} />
            <Route path="/stages" element={<ProtectedRoute allowedRoles={['Admin']}><Stages /></ProtectedRoute>} />

            {/* Sourcing - BD & Admin */}
            <Route path="/sourcing" element={<ProtectedRoute allowedRoles={['Admin', 'BD']}><Sourcing /></ProtectedRoute>} />
            <Route path="/data-enrichment" element={<ProtectedRoute allowedRoles={['Admin', 'BD']}><DataEnrichment /></ProtectedRoute>} />
            <Route path="/product-qualification" element={<ProtectedRoute allowedRoles={['Admin', 'BD']}><ProductQualification /></ProtectedRoute>} />

            {/* Outreach - Telecaller & Admin */}
            <Route path="/telecalling" element={<ProtectedRoute allowedRoles={['Admin', 'Telecaller']}><Telecalling /></ProtectedRoute>} />
            <Route path="/initial-connect" element={<ProtectedRoute allowedRoles={['Admin', 'Telecaller']}><InitialConnect /></ProtectedRoute>} />
            <Route path="/demo" element={<ProtectedRoute allowedRoles={['Admin', 'Telecaller']}><Demo /></ProtectedRoute>} />

            {/* Discovery - Telecaller & Admin */}
            <Route path="/discovery" element={<ProtectedRoute allowedRoles={['Admin', 'Telecaller']}><Discovery /></ProtectedRoute>} />
            <Route path="/poc" element={<ProtectedRoute allowedRoles={['Admin', 'Telecaller']}><POC /></ProtectedRoute>} />

            {/* Proposal - Sales & Admin */}
            <Route path="/proposal-commercials" element={<ProtectedRoute allowedRoles={['Admin', 'Sales']}><ProposalCommercials /></ProtectedRoute>} />
            <Route path="/pilot" element={<ProtectedRoute allowedRoles={['Admin', 'Sales']}><Pilot /></ProtectedRoute>} />
            <Route path="/closed-won" element={<ProtectedRoute allowedRoles={['Admin', 'Sales']}><ClosedWon /></ProtectedRoute>} />
            <Route path="/closed-lost" element={<ProtectedRoute allowedRoles={['Admin', 'Sales']}><ClosedLost /></ProtectedRoute>} />

            <Route path="/reports" element={<ProtectedRoute allowedRoles={['Admin']}><Reports /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute allowedRoles={['Admin']}><Settings /></ProtectedRoute>} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
