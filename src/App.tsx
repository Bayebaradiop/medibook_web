import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";

import LandingPage from "@/pages/LandingPage";
import LoginPage from "@/pages/auth/LoginPage";
import ProfilePage from "@/pages/profile/ProfilePage";

// Super Admin
import SuperAdminDashboard from "@/pages/superadmin/DashboardPage";
import CabinetsPage from "@/pages/superadmin/CabinetsPage";
import CabinetDetailPage from "@/pages/superadmin/CabinetDetailPage";
import CabinetFormPage from "@/pages/superadmin/CabinetFormPage";

// Admin
import AdminDashboard from "@/pages/admin/DashboardPage";
import SpecialitesPage from "@/pages/admin/SpecialitesPage";
import MedecinsPage from "@/pages/admin/MedecinsPage";
import MedecinDetailPage from "@/pages/admin/MedecinDetailPage";
import MedecinFormPage from "@/pages/admin/MedecinFormPage";
import SecretairesPage from "@/pages/admin/SecretairesPage";
import SecretaireDetailPage from "@/pages/admin/SecretaireDetailPage";
import SecretaireFormPage from "@/pages/admin/SecretaireFormPage";

// Medecin
import MedecinDashboard from "@/pages/medecin/DashboardPage";
import PlanningsPage from "@/pages/medecin/PlanningsPage";
import RendezVousPage from "@/pages/medecin/RendezVousPage";
import RendezVousDetailPage from "@/pages/medecin/RendezVousDetailPage";
import ExceptionsPage from "@/pages/medecin/ExceptionsPage";
import StatsPage from "@/pages/medecin/StatsPage";

// Secretaire
import SecretaireDashboard from "@/pages/secretaire/DashboardPage";
import SecretaireMedecinsPage from "@/pages/secretaire/MedecinsPage";
import SecretairePlanningPage from "@/pages/secretaire/PlanningPage";
import PlanningFormPage from "@/pages/secretaire/PlanningFormPage";
import CreneauxPage from "@/pages/secretaire/CreneauxPage";
import SecretaireRendezVousPage from "@/pages/secretaire/RendezVousPage";
import RendezVousEnAttentePage from "@/pages/secretaire/RendezVousEnAttentePage";
import SecretaireExceptionsPage from "@/pages/secretaire/ExceptionsPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/profil" element={<ProfilePage />} />

            {/* Super Admin */}
            <Route path="/super-admin" element={<SuperAdminDashboard />} />
            <Route path="/super-admin/cabinets" element={<CabinetsPage />} />
            <Route path="/super-admin/cabinets/nouveau" element={<CabinetFormPage />} />
            <Route path="/super-admin/cabinets/:id" element={<CabinetDetailPage />} />
            <Route path="/super-admin/cabinets/:id/modifier" element={<CabinetFormPage />} />

            {/* Admin */}
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/specialites" element={<SpecialitesPage />} />
            <Route path="/admin/medecins" element={<MedecinsPage />} />
            <Route path="/admin/medecins/nouveau" element={<MedecinFormPage />} />
            <Route path="/admin/medecins/:id" element={<MedecinDetailPage />} />
            <Route path="/admin/medecins/:id/modifier" element={<MedecinFormPage />} />
            <Route path="/admin/secretaires" element={<SecretairesPage />} />
            <Route path="/admin/secretaires/nouveau" element={<SecretaireFormPage />} />
            <Route path="/admin/secretaires/:id" element={<SecretaireDetailPage />} />
            <Route path="/admin/secretaires/:id/modifier" element={<SecretaireFormPage />} />

            {/* Medecin */}
            <Route path="/medecin" element={<MedecinDashboard />} />
            <Route path="/medecin/plannings" element={<PlanningsPage />} />
            <Route path="/medecin/rendez-vous" element={<RendezVousPage />} />
            <Route path="/medecin/rendez-vous/:id" element={<RendezVousDetailPage />} />
            <Route path="/medecin/exceptions" element={<ExceptionsPage />} />
            <Route path="/medecin/statistiques" element={<StatsPage />} />

            {/* Secretaire */}
            <Route path="/secretaire" element={<SecretaireDashboard />} />
            <Route path="/secretaire/medecins" element={<SecretaireMedecinsPage />} />
            <Route path="/secretaire/plannings" element={<SecretairePlanningPage />} />
            <Route path="/secretaire/plannings/nouveau" element={<PlanningFormPage />} />
            <Route path="/secretaire/creneaux" element={<CreneauxPage />} />
            <Route path="/secretaire/rendez-vous" element={<SecretaireRendezVousPage />} />
            <Route path="/secretaire/rdv-en-attente" element={<RendezVousEnAttentePage />} />
            <Route path="/secretaire/exceptions" element={<SecretaireExceptionsPage />} />

            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
