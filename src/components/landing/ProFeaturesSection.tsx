import { motion } from 'framer-motion';
import { Calendar, ShieldAlert, Zap, Headphones, Check } from 'lucide-react';

const pillars = [
  {
    icon: Calendar,
    title: 'Agenda Multi-Praticiens Synchronisé',
    description: 'Bénéficiez d’une vue consolidée de tous les médecins de votre structure. Ajustez les plannings en temps réel sans risque de doublons ou de conflits.',
    points: ['Vue par médecin ou par salle', 'Gestion des créneaux d’urgence', 'Synchronisation secrétariat'],
  },
  {
    icon: ShieldAlert,
    title: 'Conformité & Sécurité RGPD',
    description: 'Les données de santé de vos patients bénéficient d’une protection maximale avec contrôle d’accès strict par rôle et chiffrement renforcé.',
    points: ['Protection des dossiers', 'Traçabilité des accès', 'Cloisonnement par cabinet'],
  },
  {
    icon: Zap,
    title: 'Diminution des Créneaux Vacants',
    description: 'Chaque annulation est automatiquement signalée pour réattribution rapide par le secrétariat, optimisant le taux d’occupation du cabinet.',
    points: ['Remplissage automatique', 'Historique des absences', 'Rappels de suivi'],
  },
  {
    icon: Headphones,
    title: 'Support & Déploiement Accompagné',
    description: 'Une équipe technique locale dédiée vous assiste pour la configuration initiale, l’importation de vos équipes et l’assistance au quotidien.',
    points: ['Onboarding personnalisé', 'Support 7j/7', 'Mises à jour sans interruption'],
  },
];

const ProFeaturesSection = () => {
  return (
    <section id="features" className="py-24 bg-white dark:bg-slate-900 border-t border-slate-200/80 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span className="px-4 py-1.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold text-xs uppercase tracking-wider">
            Fonctionnalités Métier
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Conçu spécifiquement pour les exigences des cabinets médicaux
          </h2>
          <p className="text-base text-slate-600 dark:text-slate-300">
            Une technologie robuste et épurée pour faire passer la gestion de votre établissement au niveau supérieur.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {pillars.map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <motion.div
                key={pillar.title}
                initial={{ opacity: 0, scale: 0.98 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="bg-slate-50 dark:bg-slate-800/80 p-8 rounded-3xl border border-slate-200/60 dark:border-slate-700/60 hover:border-emerald-500/40 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="h-12 w-12 rounded-2xl bg-primary text-white flex items-center justify-center mb-6 shadow-md shadow-primary/20">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                    {pillar.title}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
                    {pillar.description}
                  </p>
                </div>

                <div className="space-y-2 pt-4 border-t border-slate-200/60 dark:border-slate-700/60">
                  {pillar.points.map((pt) => (
                    <div key={pt} className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-200">
                      <div className="h-4 w-4 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                        <Check className="h-2.5 w-2.5" />
                      </div>
                      <span>{pt}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

export default ProFeaturesSection;
