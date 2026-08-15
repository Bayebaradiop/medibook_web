import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Shield, Video, Clock, Building2, TrendingUp, Users, CheckCircle, ArrowRight, UserCheck } from 'lucide-react';
import { motion } from 'framer-motion';

const PATIENT_FEATURES = [
  {
    title: 'Réservation 24h/24 & 7j/7',
    description: 'Prenez rendez-vous à tout moment sans dépendre des heures d’ouverture du secrétariat.',
    icon: Calendar,
  },
  {
    title: 'Téléconsultation HD & Ordonnance',
    description: 'Consultez votre médecin depuis chez vous en toute sécurité et recevez vos ordonnances certifiées.',
    icon: Video,
  },
  {
    title: 'Rappels Automatiques SMS / Email',
    description: 'Ne manquez plus aucun rendez-vous grâce aux notifications de rappel personnalisées.',
    icon: Clock,
  },
  {
    title: 'Confidentialité & Données Sécurisées',
    description: 'Vos informations de santé sont chiffrées et stockées conformément aux normes HDS et RGPD.',
    icon: Shield,
  },
];

const PRO_FEATURES = [
  {
    title: 'Agenda Multi-Praticiens & Secrétariat',
    description: 'Optimisez l’agenda de vos médecins et simplifiez le travail de votre équipe de secrétariat.',
    icon: Building2,
  },
  {
    title: 'Réduction des RDV non honorés',
    description: 'Diminuez les absences jusqu’à 75% grâce aux rappels SMS et à la confirmation en direct.',
    icon: TrendingUp,
  },
  {
    title: 'Visibilité & Acquisition Patients',
    description: 'Développez votre patientèle et proposez une expérience moderne à vos patients existants.',
    icon: Users,
  },
  {
    title: 'Conformité & Support 24/7',
    description: 'Bénéficiez d’une infrastructure sécurisée et d’une assistance dédiée pour votre cabinet.',
    icon: Shield,
  },
];

const FeaturesSection = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'patient' | 'pro'>('patient');

  return (
    <section id="features" className="py-20 bg-slate-50 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs uppercase font-bold tracking-widest text-primary bg-primary/10 px-4 py-1.5 rounded-full inline-block mb-3">
            Pourquoi MediBook ?
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Une solution pensée pour les patients et les soignants
          </h2>

          {/* Toggle Switch */}
          <div className="mt-8 inline-flex p-1.5 rounded-2xl bg-slate-200/80 border border-slate-300/60">
            <button
              onClick={() => setActiveTab('patient')}
              className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
                activeTab === 'patient'
                  ? 'bg-white text-primary shadow-md'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Pour les Patients
            </button>
            <button
              onClick={() => setActiveTab('pro')}
              className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
                activeTab === 'pro'
                  ? 'bg-primary text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Pour les Praticiens & Cabinets
            </button>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {(activeTab === 'patient' ? PATIENT_FEATURES : PRO_FEATURES).map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <motion.div
                key={feat.title}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
                className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className={`h-12 w-12 rounded-2xl flex items-center justify-center mb-5 ${
                    activeTab === 'pro' ? 'bg-teal-500/10 text-primary' : 'bg-emerald-500/10 text-emerald-600'
                  }`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">
                    {feat.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                    {feat.description}
                  </p>
                </div>

                <div className="mt-6 flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
                  <CheckCircle className="h-4 w-4" />
                  <span>Inclus avec MediBook</span>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Pro Callout Banner */}
        {activeTab === 'pro' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-12 bg-gradient-to-r from-teal-900 to-slate-900 rounded-3xl p-8 text-white shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6"
          >
            <div>
              <h3 className="text-2xl font-bold">Vous gérez un cabinet ou un établissement de santé ?</h3>
              <p className="text-slate-300 text-sm mt-1 max-w-xl">
                Simplifiez l'organisation de vos rendez-vous, la coordination avec votre secrétariat et l'accueil de vos patients.
              </p>
            </div>
            <button
              onClick={() => navigate('/login')}
              className="px-6 py-3.5 rounded-2xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-extrabold text-sm flex items-center gap-2 shadow-lg shrink-0 transition-transform hover:scale-105 active:scale-95"
            >
              <UserCheck className="h-4 w-4" />
              Rejoindre MediBook Pro
            </button>
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default FeaturesSection;
