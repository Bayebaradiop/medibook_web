import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Stethoscope, Calendar, Video, CheckCircle2, ShieldCheck, Star, Users, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const SPECIALTY_SUGGESTIONS = [
  'Médecine Générale',
  'Cardiologie',
  'Pédiatrie',
  'Dentiste',
  'Dermatologie',
  'Ophtalmologie',
  'Gynécologie',
];

const HeroSearch = () => {
  const navigate = useNavigate();
  const [specialtyQuery, setSpecialtyQuery] = useState('');
  const [locationQuery, setLocationQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [todayOnly, setTodayOnly] = useState(false);
  const [teleconsultOnly, setTeleconsultOnly] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/login');
  };

  return (
    <section id="search" className="relative min-h-[90vh] pt-28 pb-16 flex items-center bg-gradient-to-b from-slate-900 via-teal-950 to-slate-900 overflow-hidden">
      {/* Abstract Medical Mesh Grid & Glows */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-teal-500/20 via-transparent to-transparent pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-emerald-500/15 via-transparent to-transparent pointer-events-none" />
      
      {/* Decorative blurred circles */}
      <div className="absolute top-1/4 left-10 w-96 h-96 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-emerald-400/15 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full z-10">
        <div className="text-center max-w-3xl mx-auto mb-10">
          {/* Trust badge */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-teal-500/30 bg-teal-500/10 text-emerald-300 text-xs sm:text-sm font-semibold backdrop-blur-md mb-6 shadow-inner"
          >
            <ShieldCheck className="h-4 w-4 text-emerald-400 animate-pulse" />
            <span>Plateforme Médicale Certifiée • Données de santé sécurisées (HDS)</span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-tight"
          >
            Prenez rendez-vous en ligne avec{' '}
            <span className="bg-gradient-to-r from-emerald-300 via-teal-200 to-cyan-300 bg-clip-text text-transparent">
              un médecin certifié
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-5 text-lg sm:text-xl text-slate-300 leading-relaxed max-w-2xl mx-auto"
          >
            Simple, rapide et gratuit pour les patients. Trouvez le bon praticien, consultez ses créneaux en direct et réservez en 3 clics.
          </motion.p>
        </div>

        {/* Interactive Search Console */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="max-w-4xl mx-auto"
        >
          <form
            onSubmit={handleSearch}
            className="bg-white/95 backdrop-blur-xl p-3 sm:p-4 rounded-3xl shadow-2xl border border-white/20 ring-1 ring-black/5"
          >
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
              {/* Field 1: Specialty / Doctor */}
              <div className="relative md:col-span-5 bg-slate-50 rounded-2xl p-3 border border-slate-200 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <Stethoscope className="h-3.5 w-3.5 text-primary" />
                  Spécialité, médecin ou examen
                </label>
                <input
                  type="text"
                  placeholder="Ex: Cardiologue, Pédiatre, Dentiste..."
                  value={specialtyQuery}
                  onChange={(e) => setSpecialtyQuery(e.target.value)}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  className="w-full bg-transparent text-slate-900 font-semibold placeholder:text-slate-400 focus:outline-none text-sm"
                />
                
                {/* Suggestions Dropdown */}
                {showSuggestions && (
                  <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 z-30">
                    <p className="text-[10px] font-bold text-slate-400 uppercase px-3 py-1">Spécialités populaires</p>
                    {SPECIALTY_SUGGESTIONS.map((item) => (
                      <div
                        key={item}
                        onClick={() => {
                          setSpecialtyQuery(item);
                          setShowSuggestions(false);
                        }}
                        className="px-3 py-2 text-sm text-slate-700 hover:bg-teal-50 hover:text-primary rounded-xl cursor-pointer font-medium transition-colors flex items-center justify-between"
                      >
                        <span>{item}</span>
                        <ArrowRight className="h-3.5 w-3.5 opacity-50" />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Field 2: Location */}
              <div className="md:col-span-4 bg-slate-50 rounded-2xl p-3 border border-slate-200 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-primary" />
                  Lieu / Ville
                </label>
                <input
                  type="text"
                  placeholder="Ex: Dakar, Thiès, En ligne..."
                  value={locationQuery}
                  onChange={(e) => setLocationQuery(e.target.value)}
                  className="w-full bg-transparent text-slate-900 font-semibold placeholder:text-slate-400 focus:outline-none text-sm"
                />
              </div>

              {/* Search Button */}
              <div className="md:col-span-3">
                <button
                  type="submit"
                  className="w-full h-full py-4 px-6 rounded-2xl bg-primary hover:bg-primary-dark text-white font-bold text-base shadow-lg shadow-primary/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Search className="h-5 w-5" />
                  Rechercher
                </button>
              </div>
            </div>

            {/* Quick Filters */}
            <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setTodayOnly(!todayOnly)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-medium transition-colors ${
                    todayOnly
                      ? 'bg-primary text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <Calendar className="h-3.5 w-3.5" />
                  Créneau aujourd'hui
                </button>

                <button
                  type="button"
                  onClick={() => setTeleconsultOnly(!teleconsultOnly)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-medium transition-colors ${
                    teleconsultOnly
                      ? 'bg-primary text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <Video className="h-3.5 w-3.5" />
                  Téléconsultation
                </button>
              </div>

              <div className="text-slate-500 font-medium flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <span>Prise de RDV instantanée sans attente</span>
              </div>
            </div>
          </form>
        </motion.div>

        {/* Floating Stat Badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto"
        >
          {[
            { label: 'Médecins certifiés', value: '500+', icon: Users, color: 'text-emerald-400' },
            { label: 'Consultations gérées', value: '50 000+', icon: Calendar, color: 'text-teal-300' },
            { label: 'Patients satisfaits', value: '98%', icon: Star, color: 'text-amber-400' },
            { label: 'Protection HDS', value: '100%', icon: ShieldCheck, color: 'text-cyan-300' },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 text-center hover:bg-white/15 transition-all"
            >
              <stat.icon className={`h-6 w-6 mx-auto mb-2 ${stat.color}`} />
              <p className="text-2xl sm:text-3xl font-extrabold text-white">{stat.value}</p>
              <p className="text-xs text-slate-300 font-medium mt-0.5">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSearch;
