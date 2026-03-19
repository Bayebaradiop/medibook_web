import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Hospital, Search, Calendar, User, Bell, Star, Clock, MapPin, ChevronRight, Check } from 'lucide-react';

// Écrans de l'application mobile MediBook simulés
const SCREENS = [
  'home',       // Accueil de l'app
  'doctors',    // Liste des médecins
  'booking',    // Choix date et créneau
  'confirmed',  // RDV confirmé
] as const;

const SCREEN_DURATION = 2500;

// Écran d'accueil de l'app mobile
const HomeScreen = () => (
  <div className="flex h-full flex-col bg-[#F5F5F5]">
    {/* Header gradient */}
    <div className="rounded-b-3xl bg-gradient-to-br from-[#1B5E20] to-[#2E7D32] px-3 pb-4 pt-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-[8px] font-bold text-white">
            AD
          </div>
          <div>
            <p className="text-[7px] text-white/70">Bonjour 👋</p>
            <p className="text-[9px] font-semibold text-white">Amadou Diop</p>
          </div>
        </div>
        <Bell size={14} className="text-white" />
      </div>
      <div className="mt-3 flex items-center gap-2 rounded-xl bg-white/15 px-3 py-1.5">
        <Search size={10} className="text-white/60" />
        <span className="text-[7px] text-white/50">Rechercher un médecin...</span>
      </div>
    </div>

    {/* Prochain RDV */}
    <div className="px-3 pt-3">
      <p className="text-[8px] font-semibold text-gray-800">Prochain rendez-vous</p>
      <div className="mt-1.5 rounded-2xl bg-gradient-to-r from-[#2E7D32] to-[#66BB6A] p-2.5">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20 text-[7px] font-bold text-white">
            Dr
          </div>
          <div>
            <p className="text-[8px] font-semibold text-white">Dr. Fatou Ndiaye</p>
            <p className="text-[6px] text-white/80">Cardiologie</p>
          </div>
        </div>
        <div className="mt-1.5 flex items-center gap-3">
          <div className="flex items-center gap-1">
            <Calendar size={8} className="text-white/80" />
            <span className="text-[6px] text-white/90">20 Mar 2026</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock size={8} className="text-white/80" />
            <span className="text-[6px] text-white/90">09:00 - 09:30</span>
          </div>
        </div>
      </div>
    </div>

    {/* Spécialités */}
    <div className="px-3 pt-3">
      <p className="text-[8px] font-semibold text-gray-800">Spécialités</p>
      <div className="mt-1.5 grid grid-cols-3 gap-1.5">
        {['Cardiologie', 'Dentaire', 'Général'].map((spec) => (
          <div key={spec} className="flex flex-col items-center rounded-xl bg-white p-2 shadow-sm">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#2E7D32]/10">
              <Hospital size={10} className="text-[#2E7D32]" />
            </div>
            <span className="mt-1 text-[6px] text-gray-600">{spec}</span>
          </div>
        ))}
      </div>
    </div>

    {/* Bottom nav */}
    <div className="mt-auto flex items-center justify-around border-t border-gray-200 bg-white px-2 py-1.5">
      {[
        { icon: Hospital, label: 'Accueil', active: true },
        { icon: Calendar, label: 'RDV', active: false },
        { icon: Search, label: 'Recherche', active: false },
        { icon: User, label: 'Profil', active: false },
      ].map((item) => (
        <div key={item.label} className="flex flex-col items-center gap-0.5">
          <item.icon size={12} className={item.active ? 'text-[#2E7D32]' : 'text-gray-400'} />
          <span className={`text-[5px] ${item.active ? 'font-semibold text-[#2E7D32]' : 'text-gray-400'}`}>
            {item.label}
          </span>
        </div>
      ))}
    </div>
  </div>
);

// Liste des médecins
const DoctorsScreen = () => (
  <div className="flex h-full flex-col bg-[#F5F5F5]">
    {/* Header */}
    <div className="bg-white px-3 pb-2 pt-6">
      <p className="text-center text-[10px] font-semibold text-gray-800">Médecins</p>
      {/* Chips spécialités */}
      <div className="mt-2 flex gap-1 overflow-hidden">
        <span className="whitespace-nowrap rounded-full bg-[#2E7D32] px-2 py-0.5 text-[6px] font-medium text-white">
          Tous
        </span>
        <span className="whitespace-nowrap rounded-full border border-gray-200 px-2 py-0.5 text-[6px] text-gray-500">
          Cardiologie
        </span>
        <span className="whitespace-nowrap rounded-full border border-gray-200 px-2 py-0.5 text-[6px] text-gray-500">
          Dentaire
        </span>
      </div>
    </div>

    {/* Doctors list */}
    <div className="flex-1 space-y-1.5 overflow-hidden px-3 pt-2">
      {[
        { name: 'Dr. Fatou Ndiaye', spec: 'Cardiologie', cabinet: 'Cabinet Dakar Santé', rating: '4.8' },
        { name: 'Dr. Moussa Ba', spec: 'Médecine Générale', cabinet: 'Clinique Pasteur', rating: '4.9' },
        { name: 'Dr. Awa Diallo', spec: 'Dermatologie', cabinet: 'Centre Médical Fann', rating: '4.7' },
      ].map((doc) => (
        <div key={doc.name} className="flex items-center gap-2 rounded-2xl bg-white p-2 shadow-sm">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#2E7D32]/10 text-[7px] font-bold text-[#2E7D32]">
            {doc.name.split(' ').slice(1).map(n => n[0]).join('')}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[8px] font-semibold text-gray-800">{doc.name}</p>
            <div className="flex items-center gap-1">
              <Hospital size={7} className="text-[#2E7D32]" />
              <span className="text-[6px] text-[#2E7D32]">{doc.spec}</span>
            </div>
            <div className="flex items-center gap-1">
              <MapPin size={7} className="text-gray-400" />
              <span className="truncate text-[6px] text-gray-400">{doc.cabinet}</span>
            </div>
          </div>
          <div className="flex flex-col items-center gap-1">
            <div className="flex items-center gap-0.5">
              <Star size={7} className="fill-amber-400 text-amber-400" />
              <span className="text-[6px] font-medium">{doc.rating}</span>
            </div>
            <ChevronRight size={10} className="text-gray-300" />
          </div>
        </div>
      ))}
    </div>

    {/* Bottom nav */}
    <div className="flex items-center justify-around border-t border-gray-200 bg-white px-2 py-1.5">
      {[
        { icon: Hospital, label: 'Accueil', active: false },
        { icon: Calendar, label: 'RDV', active: false },
        { icon: Search, label: 'Recherche', active: true },
        { icon: User, label: 'Profil', active: false },
      ].map((item) => (
        <div key={item.label} className="flex flex-col items-center gap-0.5">
          <item.icon size={12} className={item.active ? 'text-[#2E7D32]' : 'text-gray-400'} />
          <span className={`text-[5px] ${item.active ? 'font-semibold text-[#2E7D32]' : 'text-gray-400'}`}>
            {item.label}
          </span>
        </div>
      ))}
    </div>
  </div>
);

// Écran de réservation
const BookingScreen = () => (
  <div className="flex h-full flex-col bg-[#F5F5F5]">
    {/* Doctor header */}
    <div className="rounded-b-3xl bg-gradient-to-br from-[#1B5E20] to-[#2E7D32] px-3 pb-4 pt-6">
      <p className="text-center text-[8px] text-white/70">Prendre rendez-vous</p>
      <div className="mt-2 flex flex-col items-center">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-[10px] font-bold text-white">
          FN
        </div>
        <p className="mt-1 text-[9px] font-semibold text-white">Dr. Fatou Ndiaye</p>
        <span className="rounded-full bg-white/15 px-2 py-0.5 text-[6px] text-white/90">Cardiologie</span>
      </div>
    </div>

    {/* Date selection */}
    <div className="px-3 pt-3">
      <p className="text-[8px] font-semibold text-gray-800">Choisir une date</p>
      <div className="mt-1.5 flex gap-1">
        {[
          { day: 'LUN', num: '20', month: 'MAR' },
          { day: 'MAR', num: '21', month: 'MAR' },
          { day: 'MER', num: '22', month: 'MAR' },
          { day: 'JEU', num: '23', month: 'MAR' },
          { day: 'VEN', num: '24', month: 'MAR' },
        ].map((d, i) => (
          <div
            key={d.num}
            className={`flex flex-1 flex-col items-center rounded-xl py-1.5 ${
              i === 0
                ? 'bg-[#2E7D32] text-white shadow-md shadow-[#2E7D32]/30'
                : 'border border-gray-200 bg-white'
            }`}
          >
            <span className={`text-[5px] ${i === 0 ? 'text-white/70' : 'text-gray-400'}`}>{d.day}</span>
            <span className={`text-[10px] font-bold ${i === 0 ? '' : 'text-gray-800'}`}>{d.num}</span>
            <span className={`text-[5px] ${i === 0 ? 'text-white/70' : 'text-gray-400'}`}>{d.month}</span>
          </div>
        ))}
      </div>
    </div>

    {/* Créneaux */}
    <div className="px-3 pt-3">
      <p className="text-[8px] font-semibold text-gray-800">Créneaux disponibles</p>
      <div className="mt-1.5 flex flex-wrap gap-1">
        {['09:00', '09:30', '10:00', '10:30', '14:00', '14:30'].map((t, i) => (
          <span
            key={t}
            className={`rounded-lg px-2 py-1 text-[6px] font-medium ${
              i === 0
                ? 'bg-[#2E7D32] text-white shadow-sm shadow-[#2E7D32]/30'
                : i === 3
                  ? 'bg-gray-100 text-gray-300 line-through'
                  : 'border border-gray-200 bg-white text-gray-600'
            }`}
          >
            {t}
          </span>
        ))}
      </div>
    </div>

    {/* Motif */}
    <div className="px-3 pt-3">
      <p className="text-[8px] font-semibold text-gray-800">Motif</p>
      <div className="mt-1 rounded-xl border border-gray-200 bg-white px-2 py-1.5">
        <span className="text-[6px] text-gray-400">Consultation de routine...</span>
      </div>
    </div>

    {/* Confirm button */}
    <div className="mt-auto px-3 pb-3">
      <div className="flex items-center justify-center gap-1 rounded-2xl bg-[#2E7D32] py-2 shadow-lg shadow-[#2E7D32]/30">
        <Calendar size={10} className="text-white" />
        <span className="text-[8px] font-semibold text-white">Confirmer le rendez-vous</span>
      </div>
    </div>
  </div>
);

// Écran de confirmation
const ConfirmedScreen = () => (
  <div className="flex h-full flex-col items-center justify-center bg-[#F5F5F5] px-4">
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
      className="flex h-14 w-14 items-center justify-center rounded-full bg-[#2E7D32]/10"
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#2E7D32]">
        <Check size={18} className="text-white" />
      </div>
    </motion.div>
    <p className="mt-3 text-[10px] font-bold text-gray-800">Rendez-vous confirmé !</p>
    <p className="mt-1 text-center text-[7px] text-gray-500">
      Votre rendez-vous a été envoyé.
      <br />
      En attente de validation par la secrétaire.
    </p>

    <div className="mt-3 w-full rounded-2xl bg-white p-3 shadow-sm">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#2E7D32]/10 text-[7px] font-bold text-[#2E7D32]">
          FN
        </div>
        <div>
          <p className="text-[8px] font-semibold text-gray-800">Dr. Fatou Ndiaye</p>
          <p className="text-[6px] text-[#2E7D32]">Cardiologie</p>
        </div>
      </div>
      <div className="mt-2 space-y-1 border-t border-gray-100 pt-2">
        <div className="flex items-center gap-1.5">
          <Calendar size={8} className="text-[#2E7D32]" />
          <span className="text-[7px] text-gray-600">Lundi 20 Mars 2026</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Clock size={8} className="text-[#2E7D32]" />
          <span className="text-[7px] text-gray-600">09:00 - 09:30</span>
        </div>
        <div className="flex items-center gap-1.5">
          <MapPin size={8} className="text-[#2E7D32]" />
          <span className="text-[7px] text-gray-600">Cabinet Dakar Santé</span>
        </div>
      </div>
    </div>

    <div className="mt-2 flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1">
      <Clock size={8} className="text-amber-500" />
      <span className="text-[6px] font-medium text-amber-600">En attente de validation</span>
    </div>
  </div>
);

const screens: Record<typeof SCREENS[number], () => JSX.Element> = {
  home: HomeScreen,
  doctors: DoctorsScreen,
  booking: BookingScreen,
  confirmed: ConfirmedScreen,
};

interface PhoneMockupProps {
  isVisible: boolean;
}

const PhoneMockup = ({ isVisible }: PhoneMockupProps) => {
  const [screenIndex, setScreenIndex] = useState(0);

  useEffect(() => {
    if (!isVisible) {
      setScreenIndex(0);
      return;
    }
    const interval = setInterval(() => {
      setScreenIndex((prev) => (prev + 1) % SCREENS.length);
    }, SCREEN_DURATION);
    return () => clearInterval(interval);
  }, [isVisible]);

  const currentScreen = SCREENS[screenIndex];
  const ScreenComponent = screens[currentScreen];

  return (
    <motion.div
      initial={{ opacity: 0, x: 60, rotateY: -15 }}
      animate={isVisible ? { opacity: 1, x: 0, rotateY: 0 } : { opacity: 0, x: 60, rotateY: -15 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
      className="relative"
      style={{ perspective: 1000 }}
    >
      {/* Phone frame */}
      <div className="relative h-[320px] w-[160px] overflow-hidden rounded-[24px] border-[3px] border-gray-700 bg-black shadow-2xl shadow-black/50 sm:h-[380px] sm:w-[185px]">
        {/* Notch */}
        <div className="absolute left-1/2 top-0 z-20 h-4 w-14 -translate-x-1/2 rounded-b-xl bg-black" />

        {/* Screen content */}
        <div className="h-full w-full overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentScreen}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.3 }}
              className="h-full w-full"
            >
              <ScreenComponent />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Screen indicators */}
        <div className="absolute bottom-1 left-1/2 z-20 flex -translate-x-1/2 gap-1">
          {SCREENS.map((_, i) => (
            <div
              key={i}
              className={`h-1 rounded-full transition-all duration-300 ${
                i === screenIndex ? 'w-4 bg-[#2E7D32]' : 'w-1 bg-white/40'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Glow effect */}
      <div className="absolute -inset-4 -z-10 rounded-[32px] bg-primary/20 blur-xl" />
    </motion.div>
  );
};

export default PhoneMockup;
