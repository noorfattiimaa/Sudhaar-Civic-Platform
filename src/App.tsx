import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// --- Layouts ---
import DashboardLayout from "./components/layout/DashboardLayout";
import ProtectedRoute from "./components/layout/ProtectedRoute";

// --- Auth Pages ---
import LandingPage from "./features/auth/pages/LandingPage";
import LoginPage from "./features/auth/pages/LoginPage";
import RegisterPage from "./features/auth/pages/RegisterPage";

// --- Public Pages ---
import PrivacyPage from "./features/public/pages/PrivacyPage";
import TermsPage from "./features/public/pages/TermsPage";
import ContactPage from "./features/public/pages/ContactPage";

// --- Feature Pages ---
import Dashboard from "./features/dashboard/pages/Dashboard";
import NGODashboard from "./features/dashboard/pages/NGODashboard";
import MyReports from "./features/issues/pages/MyReports";
import DonationPage from "./features/donations/pages/DonationPage";
import TransparencyPage from "./features/transparency/pages/TransparencyPage";
import ResolvedArchivePage from "./features/transparency/pages/ResolvedArchivePage";
import CampaignManagement from "./features/dashboard/pages/CampaignManagement";
import CampaignDetails from "./features/dashboard/pages/CampaignDetails";
import TransparencyHub from "./features/dashboard/pages/TransparencyHub";

const MapView = () => (
  <div className="p-8 max-w-7xl mx-auto">Map Coming Soon</div>
);

function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>
        {/* ---------- PUBLIC ROUTES ---------- */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/contact" element={<ContactPage />} />

        {/* ---------- PROTECTED ROUTES ---------- */}
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>

            {/* Role-based dashboard redirect (Generic /dashboard) */}
            <Route
              path="/dashboard"
              element={<RoleBasedDashboard />}
            />

            {/* Explicit NGO Dashboard Route (Required for Login Redirect) */}
            <Route 
              path="/dashboard/ngo" 
              element={
                <ProtectedRoute allowedRole="ngo">
                  <NGODashboard />
                </ProtectedRoute>
              } 
            />

            {/* NGO routes (always defined) */}
            <Route
              path="/dashboard/manage"
              element={
                <ProtectedRoute allowedRole="ngo">
                  <CampaignManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/manage/:id"
              element={
                <ProtectedRoute allowedRole="ngo">
                  <CampaignDetails />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/transparency"
              element={
                <ProtectedRoute allowedRole="ngo">
                  <TransparencyHub />
                </ProtectedRoute>
              }
            />

            {/* Citizen routes */}
            <Route path="/reports" element={<MyReports />} />
            <Route path="/donate" element={<DonationPage />} />
            <Route path="/transparency" element={<TransparencyPage />} />
            <Route path="/archive" element={<ResolvedArchivePage />} />
            <Route path="/map" element={<MapView />} />

          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

/* ---------- ROLE SWITCH ---------- */
const RoleBasedDashboard = () => {
  // Check 'sudhaar_role' OR parse 'sudhaar_user' to get the role
  let role = localStorage.getItem("sudhaar_role");
  
  if (!role) {
    try {
      const userStr = localStorage.getItem("sudhaar_user");
      if (userStr) {
        const user = JSON.parse(userStr);
        role = user.role?.toLowerCase();
      }
    } catch (e) {
      console.error("Error parsing user role", e);
    }
  }

  if (role === "ngo") return <NGODashboard />;
  return <Dashboard />;
};

export default App;