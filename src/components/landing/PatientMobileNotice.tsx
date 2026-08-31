import { motion } from 'framer-motion';
import { Smartphone, Calendar, Bell, Download, CheckCircle2 } from 'lucide-react';

const PatientMobileNotice = () => {
  return (
    <section className="py-16 bg-gradient-to-r from-emerald-900/40 via-slate-900 to-slate-900 border-y border-emerald-500/20 text-white relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-10 -translate-y-1/2 w-72 h-72 bg-emerald-500/10 blur-[90px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="bg-slate-800/60 rounded-3xl p-8 sm:p-10 border border-emerald-500/30 backdrop-blur-xl shadow-2xl flex flex-col lg:flex-row items-center justify-between gap-8">
          
          {/* Left Text Content */}
          <div className="space-y-4 text-center lg:text-left max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-xs font-bold uppercase tracking-wider">
              <Smartphone className="h-4 w-4" />
              Espace Patient Sur Mobile
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Vous êtes patient ? Une application mobile est à votre disposition
            </h2>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Pour rechercher un médecin, réserver une consultation ou recevoir vos rappels de rendez-vous, 
              utilisez l'application mobile <strong>MediBook</strong> disponible sur votre smartphone.
            </p>

            <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm text-slate-200">
              <div className="flex items-center justify-center lg:justify-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>Prise de RDV 24h/24 & 7j/7</span>
              </div>
              <div className="flex items-center justify-center lg:justify-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>Rappels de consultation automatiques</span>
              </div>
            </div>
          </div>

          {/* Right Action / Mobile App Cards */}
          <div className="flex flex-col sm:flex-row items-center gap-4 shrink-0 w-full lg:w-auto">
            <div className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-2">
              <div className="flex items-center justify-center gap-2 text-emerald-400 font-bold text-sm">
                <Download className="h-4 w-4" />
                Application MediBook Mobile
              </div>
              <p className="text-xs text-slate-400">
                Disponible sur Google Play & App Store
              </p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default PatientMobileNotice;
