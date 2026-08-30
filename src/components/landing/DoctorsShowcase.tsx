import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, MapPin, Video, Calendar, ShieldCheck, Clock, ArrowRight, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const DOCTORS_DATA = [
  {
    id: 1,
    name: 'Dr. Fatou Ndiaye',
    specialty: 'Cardiologue',
    cabinet: 'Cabinet Dakar Santé - Point E',
    location: 'Dakar',
    rating: 4.9,
    reviewsCount: 148,
    teleconsult: true,
    sector: 'Secteur 1',
    nextSlots: ['Aujourd\'hui 14:30', 'Aujourd\'hui 16:00', 'Demain 09:15'],
    imageBg: 'bg-emerald-600',
    initials: 'FN',
  },
  {
    id: 2,
    name: 'Dr. Moussa Ba',
    specialty: 'Médecin Généraliste',
    cabinet: 'Clinique Pasteur - Plateau',
    location: 'Dakar',
    rating: 4.8,
    reviewsCount: 210,
    teleconsult: true,
    sector: 'Secteur 1',
    nextSlots: ['Aujourd\'hui 11:00', 'Demain 10:30', 'Demain 15:00'],
    imageBg: 'bg-teal-700',
    initials: 'MB',
  },
  {
    id: 3,
    name: 'Dr. Awa Diallo',
    specialty: 'Dermatologue',
    cabinet: 'Centre Médical Fann Hôk',
    location: 'Dakar',
    rating: 4.95,
    reviewsCount: 94,
    teleconsult: false,
    sector: 'Conventionné',
    nextSlots: ['Demain 14:00', 'Ven 22 Mar 09:30', 'Ven 22 Mar 11:00'],
    imageBg: 'bg-purple-700',
    initials: 'AD',
  },
  {
    id: 4,
    name: 'Dr. Ibrahima Sow',
    specialty: 'Pédiatre',
    cabinet: 'Espace Santé Enfant - Mermoz',
    location: 'Dakar',
    rating: 4.9,
    reviewsCount: 175,
    teleconsult: true,
    sector: 'Secteur 1',
    nextSlots: ['Aujourd\'hui 15:30', 'Aujourd\'hui 17:00', 'Demain 11:30'],
    imageBg: 'bg-blue-600',
    initials: 'IS',
  },
];

const FILTER_TABS = [
  { id: 'all', label: 'Tous les praticiens' },
  { id: 'teleconsult', label: '📹 Téléconsultation' },
  { id: 'today', label: '⚡ Disponible aujourd\'hui' },
];

const DoctorsShowcase = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');

  const filteredDoctors = DOCTORS_DATA.filter((doc) => {
    if (activeTab === 'teleconsult') return doc.teleconsult;
    if (activeTab === 'today') return doc.nextSlots.some((slot) => slot.includes("Aujourd'hui"));
    return true;
  });

  return (
    <section id="doctors" className="py-20 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <span className="text-xs uppercase font-bold tracking-widest text-primary bg-primary/10 px-4 py-1.5 rounded-full inline-block mb-3">
              Praticiens Vérifiés
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Prenez RDV avec nos médecins certifiés
            </h2>
            <p className="mt-2 text-base text-slate-600">
              Des professionnels de santé prêts à vous recevoir en cabinet ou à distance.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="mt-6 md:mt-0 flex flex-wrap gap-2">
            {FILTER_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                  activeTab === tab.id
                    ? 'bg-primary text-white shadow-md shadow-primary/20'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Doctors Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredDoctors.map((doc, idx) => (
            <motion.div
              key={doc.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.05 }}
              className="bg-slate-50/80 rounded-3xl p-5 border border-slate-200 hover:border-primary/40 hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                {/* Doctor Avatar Header */}
                <div className="flex items-start gap-3 mb-4">
                  <div className={`h-14 w-14 rounded-2xl ${doc.imageBg} text-white font-extrabold text-lg flex items-center justify-center shadow-md shrink-0`}>
                    {doc.initials}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 leading-snug">
                      {doc.name}
                    </h3>
                    <p className="text-xs font-semibold text-primary mt-0.5">
                      {doc.specialty}
                    </p>
                    <div className="flex items-center gap-1 mt-1 text-xs text-amber-500 font-bold">
                      <Star className="h-3.5 w-3.5 fill-amber-400" />
                      <span>{doc.rating}</span>
                      <span className="text-slate-400 font-normal">({doc.reviewsCount} avis)</span>
                    </div>
                  </div>
                </div>

                {/* Cabinet & Location */}
                <div className="space-y-1.5 text-xs text-slate-600 border-t border-slate-200/60 pt-3 mb-4">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{doc.cabinet}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-emerald-100/80 text-emerald-800 px-2 py-0.5 rounded-md">
                      <CheckCircle className="h-3 w-3 text-emerald-600" />
                      {doc.sector}
                    </span>
                    {doc.teleconsult && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-blue-100/80 text-blue-800 px-2 py-0.5 rounded-md">
                        <Video className="h-3 w-3 text-blue-600" />
                        Téléconsultation
                      </span>
                    )}
                  </div>
                </div>

                {/* Available Slots Pills */}
                <div className="mb-4">
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                    <Clock className="h-3 w-3 text-primary" />
                    Prochains créneaux
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {doc.nextSlots.map((slot, i) => (
                      <span
                        key={i}
                        className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg ${
                          i === 0
                            ? 'bg-emerald-500 text-white shadow-sm'
                            : 'bg-white text-slate-700 border border-slate-200'
                        }`}
                      >
                        {slot}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => navigate('/login')}
                className="w-full py-2.5 px-4 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs font-bold shadow-md shadow-primary/20 flex items-center justify-center gap-1.5 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <Calendar className="h-3.5 w-3.5" />
                Prendre rendez-vous
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default DoctorsShowcase;
