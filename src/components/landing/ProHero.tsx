import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ShieldCheck,
  ArrowRight,
  LayoutDashboard,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const getDashboardRoute = (role?: string) => {
  switch (role) {
    case 'SUPER_ADMIN':
      return '/super-admin';
    case 'ADMIN':
      return '/admin';
    case 'MEDECIN':
      return '/medecin';
    case 'SECRETAIRE':
      return '/secretaire';
    default:
      return '/login';
  }
};

const ProHero = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const dashboardRoute = user ? getDashboardRoute(user.role) : '/login';

  return (
    <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-28 overflow-hidden bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white">
      {/* Background Decorative Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-primary/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-[350px] h-[350px] bg-teal-500/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        
        {/* Top Security Pill */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs sm:text-sm font-medium text-emerald-300 mb-6"
        >
          <ShieldCheck className="h-4 w-4 text-emerald-400" />
          <span>Plateforme Médicale Sécurisée • Conformité RGPD</span>
        </motion.div>

        {/* Main Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.15] mb-6"
        >
          Votre cabinet médical <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-teal-300 via-emerald-400 to-teal-200 bg-clip-text text-transparent">
            connecté & simplifié
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed mb-8"
        >
          Plateforme SaaS intégrée de gestion pour structures de santé au Sénégal. 
          Centralisez vos agendas multi-praticiens, votre secrétariat et vos dossiers patients en toute sécurité.
        </motion.p>

        {/* Call To Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10"
        >
          {user ? (
            <button
              onClick={() => navigate(dashboardRoute)}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-primary-light to-primary hover:from-primary hover:to-primary-dark text-white font-bold text-base shadow-lg shadow-primary/30 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3"
            >
              <LayoutDashboard className="h-5 w-5" />
              Accéder à mon Dashboard ({user.role.replace('_', ' ')})
              <ArrowRight className="h-5 w-5" />
            </button>
          ) : (
            <>
              <button
                onClick={() => navigate('/login')}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-primary-light to-primary hover:from-primary hover:to-primary-dark text-white font-bold text-base shadow-xl shadow-primary/30 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3"
              >
                <span>Connexion Espace Pro</span>
                <ArrowRight className="h-5 w-5" />
              </button>
              <a
                href="#roles"
                className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/20 text-white font-semibold text-base backdrop-blur-sm transition-all text-center"
              >
                Découvrir les 4 Rôles
              </a>
            </>
          )}
        </motion.div>

        {/* Bullet Highlights */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="flex flex-wrap items-center justify-center gap-6 text-xs sm:text-sm text-slate-300"
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>Multi-praticiens</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>Protection RGPD</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>Rappels RDV SMS</span>
          </div>
        </motion.div>

      </div>
    </section>
  );
};

export default ProHero;
