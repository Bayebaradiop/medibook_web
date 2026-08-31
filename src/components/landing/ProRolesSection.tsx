import { motion } from 'framer-motion';
import { Crown, Building, Stethoscope, UserCheck, CheckCircle2 } from 'lucide-react';

const roles = [
  {
    id: 'super-admin',
    title: 'Super Admin',
    badge: 'Supervision Réseau',
    badgeColor: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    icon: Crown,
    gradient: 'from-amber-500 to-orange-500',
    description: 'Destiné à la direction et la gouvernance globale de la plateforme MediBook.',
    features: [
      'Création & supervision des cabinets médicaux',
      'Attribution et gestion des comptes Administrateurs',
      'Statistiques globales et volumétrie réseau',
      'Audits de sécurité et journalisation système',
    ],
  },
  {
    id: 'admin',
    title: 'Admin Cabinet',
    badge: 'Gestion de Structure',
    badgeColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    icon: Building,
    gradient: 'from-emerald-500 to-teal-600',
    description: 'Pour les responsables opérationnels de cabinets ou cliniques médicales.',
    features: [
      'Gestion des spécialités médicales proposées',
      'Création des comptes Médecins et Secrétaires',
      'Attribution des praticiens aux secrétariats',
      'Vue consolidée du planning et rapports d’activité',
    ],
  },
  {
    id: 'medecin',
    title: 'Médecin Praticien',
    badge: 'Espace Consultations',
    badgeColor: 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20',
    icon: Stethoscope,
    gradient: 'from-teal-500 to-cyan-600',
    description: 'Dédié aux praticiens pour le suivi quotidien de leurs consultations et agendas.',
    features: [
      'Visualisation personnalisée de l’agenda de consultation',
      'Définition des créneaux de présence et plannings',
      'Saisie et gestion des exceptions et congés',
      'Tableau de bord statistique de fréquentation',
    ],
  },
  {
    id: 'secretaire',
    title: 'Secrétaire Médical(e)',
    badge: 'Secrétariat & Accueil',
    badgeColor: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
    icon: UserCheck,
    gradient: 'from-blue-500 to-indigo-600',
    description: 'Optimisé pour la planification rapide et la prise de rendez-vous.',
    features: [
      'Gestion centralisée des rendez-vous multi-praticiens',
      'Validation, annulation et déplacement instantané',
      'Filtrage par médecin, statut et plage horaire',
      'Gestion des imprévus et annulations de dernière minute',
    ],
  },
];

const ProRolesSection = () => {
  return (
    <section id="roles" className="py-24 bg-slate-50 dark:bg-slate-900/60 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span className="px-4 py-1.5 rounded-full bg-primary/10 text-primary font-semibold text-xs uppercase tracking-wider">
            Architecture des Accès
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Une interface sur-mesure pour chaque rôle professionnel
          </h2>
          <p className="text-base text-slate-600 dark:text-slate-300">
            Chaque collaborateur accède uniquement aux fonctionnalités essentielles à sa fonction, garantissant clarté, rapidité et confidentialité des données.
          </p>
        </div>

        {/* Roles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {roles.map((role, idx) => {
            const Icon = role.icon;
            return (
              <motion.div
                key={role.id}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="bg-white dark:bg-slate-800 rounded-3xl p-8 border border-slate-200/80 dark:border-slate-700/70 shadow-lg shadow-slate-200/40 dark:shadow-none hover:shadow-xl transition-all relative overflow-hidden group"
              >
                {/* Accent Top Border Line */}
                <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${role.gradient}`} />

                <div className="flex items-start justify-between mb-6">
                  <div className={`h-14 w-14 rounded-2xl bg-gradient-to-br ${role.gradient} text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform`}>
                    <Icon className="h-7 w-7" />
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${role.badgeColor}`}>
                    {role.badge}
                  </span>
                </div>

                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                  {role.title}
                </h3>
                
                <p className="text-sm text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
                  {role.description}
                </p>

                <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-700/60">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Fonctionnalités clés :
                  </p>
                  {role.features.map((feat) => (
                    <div key={feat} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700 dark:text-slate-200">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{feat}</span>
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

export default ProRolesSection;
