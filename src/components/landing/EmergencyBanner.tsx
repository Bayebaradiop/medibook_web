import { PhoneCall, AlertTriangle, HeartPulse } from 'lucide-react';

const EmergencyBanner = () => {
  return (
    <section className="bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white py-8 relative overflow-hidden shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4 text-center md:text-left">
          <div className="h-14 w-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0 text-white shadow-inner">
            <HeartPulse className="h-8 w-8 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
              <AlertTriangle className="h-4 w-4 text-amber-300" />
              <span className="text-xs uppercase font-extrabold tracking-widest text-rose-100">
                Urgence Médicale Vitales
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight">
              En cas d’urgence médicale immédiate, contactez les secours
            </h3>
            <p className="text-xs sm:text-sm text-rose-100 mt-0.5">
              Ne prenez pas rendez-vous en ligne si votre état nécessite une prise en charge d’urgence.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <a
            href="tel:15"
            className="px-5 py-3 rounded-2xl bg-white text-rose-700 hover:bg-rose-50 font-black text-sm flex items-center gap-2 shadow-md transition-transform hover:scale-105"
          >
            <PhoneCall className="h-4 w-4" />
            SAMU (15)
          </a>
          <a
            href="tel:112"
            className="px-5 py-3 rounded-2xl bg-rose-900/60 border border-white/30 text-white hover:bg-rose-900 font-black text-sm flex items-center gap-2 backdrop-blur-md transition-transform hover:scale-105"
          >
            <PhoneCall className="h-4 w-4" />
            Urgence 112
          </a>
        </div>
      </div>
    </section>
  );
};

export default EmergencyBanner;
