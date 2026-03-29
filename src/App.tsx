import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import RouteProtegee from "@/components/RouteProtegee";

// Pages globales
import LandingPage from "@/pages/LandingPage";
import ProfilePage from "@/pages/profile/ProfilePage";

// Auth
import LoginPage from "@/modules/auth/pages/LoginPage";
import ForgotPasswordPage from "@/modules/auth/pages/ForgotPasswordPage";

// Dashboard
import SuperAdminDashboard from "@/modules/dashboard/pages/SuperAdminDashboardPage";
import AdminDashboard from "@/modules/dashboard/pages/AdminDashboardPage";
import MedecinDashboard from "@/modules/dashboard/pages/MedecinDashboardPage";
import SecretaireDashboard from "@/modules/dashboard/pages/SecretaireDashboardPage";

// Cabinet
import CabinetsPage from "@/modules/cabinet/pages/CabinetsPage";
import CabinetDetailPage from "@/modules/cabinet/pages/CabinetDetailPage";
import CabinetFormPage from "@/modules/cabinet/pages/CabinetFormPage";

// Utilisateur
import MedecinsPage from "@/modules/utilisateur/pages/MedecinsPage";
import MedecinDetailPage from "@/modules/utilisateur/pages/MedecinDetailPage";
import MedecinFormPage from "@/modules/utilisateur/pages/MedecinFormPage";
import SecretairesPage from "@/modules/utilisateur/pages/SecretairesPage";
import SecretaireDetailPage from "@/modules/utilisateur/pages/SecretaireDetailPage";
import SecretaireFormPage from "@/modules/utilisateur/pages/SecretaireFormPage";
import SecretaireMedecinsPage from "@/modules/utilisateur/pages/SecretaireMedecinsPage";

// Spécialité
import SpecialitesPage from "@/modules/specialite/pages/SpecialitesPage";

// Planning
import PlanningsPage from "@/modules/planning/pages/PlanningsPage";
import SecretairePlanningPage from "@/modules/planning/pages/PlanningPage";
import PlanningFormPage from "@/modules/planning/pages/PlanningFormPage";

// Rendez-vous
import RendezVousPage from "@/modules/rdv/pages/RendezVousPage";
import RendezVousDetailPage from "@/modules/rdv/pages/RendezVousDetailPage";
import SecretaireRendezVousPage from "@/modules/rdv/pages/SecretaireRendezVousPage";
import RendezVousEnAttentePage from "@/modules/rdv/pages/RendezVousEnAttentePage";

// Créneaux
import CreneauxPage from "@/modules/creneau/pages/CreneauxPage";

// Exceptions
import ExceptionsPage from "@/modules/exception/pages/ExceptionsPage";
import SecretaireExceptionsPage from "@/modules/exception/pages/SecretaireExceptionsPage";

// Stats
import StatsPage from "@/modules/stats/pages/StatsPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Pages publiques */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />

            {/* Profil — tous les connectés */}
            <Route path="/profil" element={<RouteProtegee rolesAutorises={["SUPER_ADMIN", "ADMIN", "MEDECIN", "SECRETAIRE"]}><ProfilePage /></RouteProtegee>} />

            {/* Super Admin */}
            <Route path="/super-admin" element={<RouteProtegee rolesAutorises={["SUPER_ADMIN"]}><SuperAdminDashboard /></RouteProtegee>} />
            <Route path="/super-admin/cabinets" element={<RouteProtegee rolesAutorises={["SUPER_ADMIN"]}><CabinetsPage /></RouteProtegee>} />
            <Route path="/super-admin/cabinets/nouveau" element={<RouteProtegee rolesAutorises={["SUPER_ADMIN"]}><CabinetFormPage /></RouteProtegee>} />
            <Route path="/super-admin/cabinets/:id" element={<RouteProtegee rolesAutorises={["SUPER_ADMIN"]}><CabinetDetailPage /></RouteProtegee>} />
            <Route path="/super-admin/cabinets/:id/modifier" element={<RouteProtegee rolesAutorises={["SUPER_ADMIN"]}><CabinetFormPage /></RouteProtegee>} />

            {/* Admin */}
            <Route path="/admin" element={<RouteProtegee rolesAutorises={["ADMIN"]}><AdminDashboard /></RouteProtegee>} />
            <Route path="/admin/specialites" element={<RouteProtegee rolesAutorises={["ADMIN"]}><SpecialitesPage /></RouteProtegee>} />
            <Route path="/admin/medecins" element={<RouteProtegee rolesAutorises={["ADMIN"]}><MedecinsPage /></RouteProtegee>} />
            <Route path="/admin/medecins/nouveau" element={<RouteProtegee rolesAutorises={["ADMIN"]}><MedecinFormPage /></RouteProtegee>} />
            <Route path="/admin/medecins/:id" element={<RouteProtegee rolesAutorises={["ADMIN"]}><MedecinDetailPage /></RouteProtegee>} />
            <Route path="/admin/medecins/:id/modifier" element={<RouteProtegee rolesAutorises={["ADMIN"]}><MedecinFormPage /></RouteProtegee>} />
            <Route path="/admin/secretaires" element={<RouteProtegee rolesAutorises={["ADMIN"]}><SecretairesPage /></RouteProtegee>} />
            <Route path="/admin/secretaires/nouveau" element={<RouteProtegee rolesAutorises={["ADMIN"]}><SecretaireFormPage /></RouteProtegee>} />
            <Route path="/admin/secretaires/:id" element={<RouteProtegee rolesAutorises={["ADMIN"]}><SecretaireDetailPage /></RouteProtegee>} />
            <Route path="/admin/secretaires/:id/modifier" element={<RouteProtegee rolesAutorises={["ADMIN"]}><SecretaireFormPage /></RouteProtegee>} />

            {/* Medecin */}
            <Route path="/medecin" element={<RouteProtegee rolesAutorises={["MEDECIN"]}><MedecinDashboard /></RouteProtegee>} />
            <Route path="/medecin/plannings" element={<RouteProtegee rolesAutorises={["MEDECIN"]}><PlanningsPage /></RouteProtegee>} />
            <Route path="/medecin/rendez-vous" element={<RouteProtegee rolesAutorises={["MEDECIN"]}><RendezVousPage /></RouteProtegee>} />
            <Route path="/medecin/rendez-vous/:id" element={<RouteProtegee rolesAutorises={["MEDECIN"]}><RendezVousDetailPage /></RouteProtegee>} />
            <Route path="/medecin/exceptions" element={<RouteProtegee rolesAutorises={["MEDECIN"]}><ExceptionsPage /></RouteProtegee>} />
            <Route path="/medecin/statistiques" element={<RouteProtegee rolesAutorises={["MEDECIN"]}><StatsPage /></RouteProtegee>} />

            {/* Secretaire */}
            <Route path="/secretaire" element={<RouteProtegee rolesAutorises={["SECRETAIRE"]}><SecretaireDashboard /></RouteProtegee>} />
            <Route path="/secretaire/medecins" element={<RouteProtegee rolesAutorises={["SECRETAIRE"]}><SecretaireMedecinsPage /></RouteProtegee>} />
            <Route path="/secretaire/plannings" element={<RouteProtegee rolesAutorises={["SECRETAIRE"]}><SecretairePlanningPage /></RouteProtegee>} />
            <Route path="/secretaire/plannings/nouveau" element={<RouteProtegee rolesAutorises={["SECRETAIRE"]}><PlanningFormPage /></RouteProtegee>} />
            <Route path="/secretaire/creneaux" element={<RouteProtegee rolesAutorises={["SECRETAIRE"]}><CreneauxPage /></RouteProtegee>} />
            <Route path="/secretaire/rendez-vous" element={<RouteProtegee rolesAutorises={["SECRETAIRE"]}><SecretaireRendezVousPage /></RouteProtegee>} />
            <Route path="/secretaire/rdv-en-attente" element={<RouteProtegee rolesAutorises={["SECRETAIRE"]}><RendezVousEnAttentePage /></RouteProtegee>} />
            <Route path="/secretaire/exceptions" element={<RouteProtegee rolesAutorises={["SECRETAIRE"]}><SecretaireExceptionsPage /></RouteProtegee>} />

            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
