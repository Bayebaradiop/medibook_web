import Navbar from '@/components/landing/Navbar';
import HeroSearch from '@/components/landing/HeroSearch';
import SpecialtiesGrid from '@/components/landing/SpecialtiesGrid';
import DoctorsShowcase from '@/components/landing/DoctorsShowcase';
import WorkflowSection from '@/components/landing/WorkflowSection';
import FeaturesSection from '@/components/landing/FeaturesSection';
import TestimonialsSection from '@/components/landing/TestimonialsSection';
import FaqSection from '@/components/landing/FaqSection';
import EmergencyBanner from '@/components/landing/EmergencyBanner';
import Footer from '@/components/landing/Footer';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-slate-50 font-poppins selection:bg-primary selection:text-white">
      {/* Sticky Top Navigation */}
      <Navbar />

      {/* Hero Section with Interactive Doctor Search */}
      <HeroSearch />

      {/* Popular Medical Specialties Grid */}
      <SpecialtiesGrid />

      {/* Verified Doctors & Time Slots Showcase */}
      <DoctorsShowcase />

      {/* Interactive Workflow & Mobile App Simulation */}
      <WorkflowSection />

      {/* Key Platform Features (Patients vs Practitioners) */}
      <FeaturesSection />

      {/* Patient Testimonials & HDS Security Badges */}
      <TestimonialsSection />

      {/* Frequently Asked Questions */}
      <FaqSection />

      {/* Emergency Medical Callout Banner */}
      <EmergencyBanner />

      {/* Professional Footer */}
      <Footer />
    </div>
  );
};

export default LandingPage;
