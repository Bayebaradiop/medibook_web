import { useNavigate } from 'react-router-dom';
import { Heart, Stethoscope, Baby, Eye, Brain, Smile, Activity, Sparkles, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const SPECIALTIES = [
  {
    id: 'general',
    title: 'Médecine Générale',
    description: 'Bilan de santé, suivi général, traitement des affections courantes et ordonnances.',
    doctorsCount: 142,
    icon: Stethoscope,
    badgeColor: 'bg-emerald-500/10 text-emerald-600 border-emerald-200',
    iconBg: 'bg-emerald-100 text-emerald-700',
  },
  {
    id: 'cardio',
    title: 'Cardiologie',
    description: 'Prévention et traitement des maladies du cœur, hypertension et bilan cardiovasculaire.',
    doctorsCount: 48,
    icon: Heart,
    badgeColor: 'bg-red-500/10 text-red-600 border-red-200',
    iconBg: 'bg-red-100 text-red-700',
  },
  {
    id: 'pediatrie',
    title: 'Pédiatrie',
    description: 'Suivi de la croissance du nouveau-né et de l’enfant, vaccins et conseils pédiatriques.',
    doctorsCount: 65,
    icon: Baby,
    badgeColor: 'bg-blue-500/10 text-blue-600 border-blue-200',
    iconBg: 'bg-blue-100 text-blue-700',
  },
  {
    id: 'dentaire',
    title: 'Chirurgie Dentaire',
    description: 'Soins dentaires, détartrage, blanchiment, prothèses et chirurgie buccale.',
    doctorsCount: 89,
    icon: Smile,
    badgeColor: 'bg-teal-500/10 text-teal-600 border-teal-200',
    iconBg: 'bg-teal-100 text-teal-700',
  },
  {
    id: 'dermato',
    title: 'Dermatologie',
    description: 'Traitement des affections cutanées, acné, eczéma, contrôle des grains de beauté.',
    doctorsCount: 52,
    icon: Sparkles,
    badgeColor: 'bg-purple-500/10 text-purple-600 border-purple-200',
    iconBg: 'bg-purple-100 text-purple-700',
  },
  {
    id: 'ophtalmo',
    title: 'Ophtalmologie',
    description: 'Bilan de la vue, renouvellement de lunettes, lentilles et soins oculaires.',
    doctorsCount: 41,
    icon: Eye,
    badgeColor: 'bg-amber-500/10 text-amber-600 border-amber-200',
    iconBg: 'bg-amber-100 text-amber-700',
  },
  {
    id: 'neurologie',
    title: 'Neurologie & Psychiatrie',
    description: 'Prise en charge du stress, migraines, troubles du sommeil et suivi neurologique.',
    doctorsCount: 38,
    icon: Brain,
    badgeColor: 'bg-indigo-500/10 text-indigo-600 border-indigo-200',
    iconBg: 'bg-indigo-100 text-indigo-700',
  },
  {
    id: 'biologie',
    title: 'Analyses & Bilan',
    description: 'Prélèvements sanguins, bilans complets et examens de contrôle réguliers.',
    doctorsCount: 57,
    icon: Activity,
    badgeColor: 'bg-cyan-500/10 text-cyan-600 border-cyan-200',
    iconBg: 'bg-cyan-100 text-cyan-700',
  },
];

const SpecialtiesGrid = () => {
  const navigate = useNavigate();

  return (
    <section id="specialties" className="py-20 bg-slate-50 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-xs uppercase font-bold tracking-widest text-primary bg-primary/10 px-4 py-1.5 rounded-full inline-block mb-3">
            Spécialités Populaires
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Trouvez le praticien adapté à votre santé
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-600">
            Sélectionnez une spécialité pour afficher la liste des médecins disponibles et réserver votre créneau.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {SPECIALTIES.map((specialty, index) => {
            const Icon = specialty.icon;
            return (
              <motion.div
                key={specialty.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                onClick={() => navigate('/login')}
                className="group relative bg-white rounded-3xl p-6 shadow-sm hover:shadow-xl border border-slate-200/80 hover:border-primary/40 transition-all duration-300 cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`h-12 w-12 rounded-2xl flex items-center justify-center ${specialty.iconBg} transition-transform group-hover:scale-110`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${specialty.badgeColor}`}>
                      {specialty.doctorsCount} praticiens
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-primary transition-colors">
                    {specialty.title}
                  </h3>
                  <p className="mt-2 text-xs sm:text-sm text-slate-500 leading-relaxed line-clamp-3">
                    {specialty.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-primary group-hover:text-primary-dark">
                  <span>Prendre RDV</span>
                  <ArrowRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default SpecialtiesGrid;
