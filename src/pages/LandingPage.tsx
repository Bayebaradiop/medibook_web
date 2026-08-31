import Navbar from '@/components/landing/Navbar';
import ProHero from '@/components/landing/ProHero';
import PatientMobileNotice from '@/components/landing/PatientMobileNotice';
import ProStats from '@/components/landing/ProStats';
import ProRolesSection from '@/components/landing/ProRolesSection';
import ProFeaturesSection from '@/components/landing/ProFeaturesSection';
import ProFaqSection from '@/components/landing/ProFaqSection';
import Footer from '@/components/landing/Footer';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-slate-900 font-poppins selection:bg-emerald-500 selection:text-slate-950">
      {/* Sticky B2B Navigation */}
      <Navbar />

      {/* Hero Section B2B Pro */}
      <ProHero />

      {/* Notification Espace Patient - Application Mobile */}
      <PatientMobileNotice />

      {/* Impact Stats & Metrics */}
      <ProStats />

      {/* 4 Professional Roles Overview */}
      <ProRolesSection />

      {/* Key SaaS Features */}
      <ProFeaturesSection />

      {/* Professional FAQ */}
      <ProFaqSection />

      {/* B2B Footer */}
      <Footer />
    </div>
  );
};

export default LandingPage;
