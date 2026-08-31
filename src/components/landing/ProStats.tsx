import { motion } from 'framer-motion';
import { TrendingUp, Clock, ShieldCheck, UserCheck } from 'lucide-react';

const stats = [
  {
    icon: TrendingUp,
    value: '98.5%',
    label: 'Taux de présence aux RDV',
    description: 'Baisse drastique du taux de non-honnorage grâce au suivi d’agenda.',
  },
  {
    icon: Clock,
    value: '-65%',
    label: 'Temps secrétariat réduit',
    description: 'Moins d’appels téléphoniques pour la planification et l’annulation.',
  },
  {
    icon: UserCheck,
    value: '4 Rôles',
    label: 'Permissions sur-mesure',
    description: 'Accès cloisonnés pour Super Admin, Admin, Praticien & Secrétaire.',
  },
  {
    icon: ShieldCheck,
    value: '100%',
    label: 'Conformité RGPD',
    description: 'Chiffrement de bout en bout et hébergement sécurisé des données.',
  },
];

const ProStats = () => {
  return (
    <section className="py-16 bg-slate-900 border-y border-slate-800 text-white relative z-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50 hover:border-emerald-500/40 transition-all hover:bg-slate-800/80"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="h-12 w-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                    <Icon className="h-6 w-6" />
                  </div>
                  <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-teal-200">
                    {stat.value}
                  </span>
                </div>
                <h3 className="text-base font-bold text-white mb-1">
                  {stat.label}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {stat.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ProStats;
