import { ReactNode, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Stethoscope, ArrowLeft, Sparkles } from 'lucide-react';
import PhoneMockup from '@/components/PhoneMockup';
import { resetCabinetTheme } from '@/hooks/useCabinetTheme';

interface AuthLayoutProps {
  children: ReactNode;
}

const AuthLayout = ({ children }: AuthLayoutProps) => {
  useEffect(() => {
    resetCabinetTheme();
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-900 via-teal-950 to-slate-900 font-poppins selection:bg-[#2F7D79] selection:text-white">
      {/* Abstract Background Glows */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-teal-500/20 via-transparent to-transparent pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 left-10 w-96 h-96 bg-[#2F7D79]/20 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header Bar */}
      <header className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between">
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 text-white hover:bg-white/20 text-xs sm:text-sm font-semibold backdrop-blur-md transition-all hover:scale-[1.02] border border-white/10"
        >
          <ArrowLeft className="h-4 w-4 text-emerald-400" />
          <span>Retour à l'accueil</span>
        </Link>

        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl bg-[#2F7D79] text-white flex items-center justify-center shadow-lg shadow-[#2F7D79]/40">
            <Stethoscope className="h-5 w-5" />
          </div>
          <span className="text-xl font-bold text-white tracking-tight">
            Medi<span className="text-emerald-400">Book</span>
          </span>
        </div>
      </header>

      {/* Main Auth Container */}
      <main className="relative z-10 mx-auto flex min-h-[calc(100vh-88px)] w-full max-w-7xl items-center px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid w-full gap-8 lg:grid-cols-12 lg:items-center">
          {/* Left Column: Form */}
          <div className="lg:col-span-5 flex justify-center lg:justify-start">
            {children}
          </div>

          {/* Right Column: Interactive Phone Mockup & Platform Showcase */}
          <div className="hidden lg:col-span-7 lg:flex lg:flex-col lg:items-center lg:justify-center pl-8">
            <div className="flex flex-col items-center gap-8 max-w-md text-center">
              {/* Phone Mockup Simulation */}
              <div className="relative">
                <PhoneMockup isVisible />
              </div>

              {/* Platform Highlights */}
              <div className="bg-white/10 backdrop-blur-xl p-6 rounded-3xl border border-white/10 text-white w-full shadow-2xl">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <Sparkles className="h-5 w-5 text-emerald-400" />
                  <h3 className="text-base font-bold">Portail Santé & Secrétariat 24/7</h3>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed mb-4">
                  Simplifiez la prise de rendez-vous pour vos patients, optimisez les agendas médicaux et gérez votre cabinet en toute sécurité.
                </p>

                <div className="grid grid-cols-3 gap-2 pt-3 border-t border-white/10 text-center">
                  <div>
                    <p className="text-lg font-black text-emerald-400">+500</p>
                    <p className="text-[10px] text-slate-300 font-medium">Praticiens</p>
                  </div>
                  <div>
                    <p className="text-lg font-black text-teal-300">100%</p>
                    <p className="text-[10px] text-slate-300 font-medium">Sécurité HDS</p>
                  </div>
                  <div>
                    <p className="text-lg font-black text-amber-300">4.9 / 5</p>
                    <p className="text-[10px] text-slate-300 font-medium">Avis Patients</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AuthLayout;
