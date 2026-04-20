import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Hospital, ArrowRight, Shield, Calendar, Users, Heart, Stethoscope, Smartphone, ClipboardCheck, MessageSquare } from 'lucide-react';
import { useState, useEffect, useRef, useCallback } from 'react';
import PhoneMockup from '@/components/PhoneMockup';

// Phases du processus de prise de rendez-vous - workflow réel de l'application
// Cohérence visuelle : même médecin + même patient (série Tima Miroshnichenko 5453xxx)
const VIDEO_PHASES = [
  {
    id: 1,
    label: 'Prise de RDV',
    description: 'Le patient prend rendez-vous depuis son téléphone',
    icon: Smartphone,
    src: 'https://videos.pexels.com/video-files/7447931/7447931-uhd_2560_1440_25fps.mp4',
  },
  {
    id: 2,
    label: 'Validation secrétaire',
    description: 'La secrétaire valide et confirme le rendez-vous',
    icon: ClipboardCheck,
    src: 'https://videos.pexels.com/video-files/4444268/4444268-uhd_2560_1440_30fps.mp4',
  },
  {
    id: 3,
    label: 'Discussion médecin',
    description: 'Le médecin échange avec le patient',
    icon: MessageSquare,
    src: 'https://videos.pexels.com/video-files/4769486/4769486-uhd_2560_1440_25fps.mp4',
  },
  {
    id: 4,
    label: 'Consultation',
    description: 'Le médecin examine et conseille le patient',
    icon: Stethoscope,
    src: 'https://videos.pexels.com/video-files/5453380/5453380-uhd_2560_1440_25fps.mp4',
  },
];

const PHASE_DURATION = 8000; // 8 secondes par phase

const LandingPage = () => {
  const navigate = useNavigate();
  const [currentPhase, setCurrentPhase] = useState(0);
  const [progress, setProgress] = useState(0);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const goToPhase = useCallback((index: number) => {
    setCurrentPhase(index);
    setProgress(0);
    videoRefs.current.forEach((video, i) => {
      if (video) {
        if (i === index) {
          video.currentTime = 0;
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      }
    });
  }, []);

  useEffect(() => {
    // Progress bar update
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) return 100;
        return prev + (100 / (PHASE_DURATION / 50));
      });
    }, 50);

    // Phase transition
    intervalRef.current = setInterval(() => {
      setCurrentPhase((prev) => {
        const next = (prev + 1) % VIDEO_PHASES.length;
        setProgress(0);
        videoRefs.current.forEach((video, i) => {
          if (video) {
            if (i === next) {
              video.currentTime = 0;
              video.play().catch(() => {});
            } else {
              video.pause();
            }
          }
        });
        return next;
      });
    }, PHASE_DURATION);

    return () => {
      clearInterval(progressInterval);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  // Reset timer when clicking a phase manually
  const handlePhaseClick = (index: number) => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    goToPhase(index);
    intervalRef.current = setInterval(() => {
      setCurrentPhase((prev) => {
        const next = (prev + 1) % VIDEO_PHASES.length;
        setProgress(0);
        videoRefs.current.forEach((video, i) => {
          if (video) {
            if (i === next) {
              video.currentTime = 0;
              video.play().catch(() => {});
            } else {
              video.pause();
            }
          }
        });
        return next;
      });
    }, PHASE_DURATION);
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Video Backgrounds - Multiple phases */}
      {VIDEO_PHASES.map((phase, index) => (
        <video
          key={phase.id}
          ref={(el) => { videoRefs.current[index] = el; }}
          autoPlay={index === 0}
          loop
          muted
          playsInline
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${
            index === currentPhase ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <source src={phase.src} type="video/mp4" />
        </video>
      ))}

      {/* Dark overlay with gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />
      <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-primary/10" />

      {/* Content */}
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 text-center">
        {/* Main content area - flex row on desktop for phase 1 */}
        <div className={`flex w-full max-w-6xl items-center gap-8 ${currentPhase === 0 ? 'flex-col lg:flex-row lg:justify-center lg:text-left' : 'flex-col'}`}>
          
          {/* Left side: Text content */}
          <div className={`flex flex-col ${currentPhase === 0 ? 'items-center lg:items-start lg:flex-1' : 'items-center'}`}>
            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="mb-6"
            >
              <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-3xl bg-primary/90 text-primary-foreground shadow-2xl shadow-primary/40 backdrop-blur-md ring-2 ring-white/20">
                <Stethoscope size={44} />
              </div>
            </motion.div>

            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="mb-4"
            >
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/15 px-4 py-1.5 text-sm font-medium text-primary-light backdrop-blur-sm">
                <Heart size={14} className="animate-pulse" />
                Votre santé, notre priorité
              </span>
            </motion.div>

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-4xl font-bold text-white sm:text-5xl md:text-7xl"
            >
              Medi<span className="bg-gradient-to-r from-primary-light to-emerald-300 bg-clip-text text-transparent">Book</span>
            </motion.h1>

            {/* Current phase description */}
            <AnimatePresence mode="wait">
              <motion.p
                key={currentPhase}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4 }}
                className="mt-5 max-w-2xl text-lg leading-relaxed text-white/85 sm:text-xl"
              >
                {VIDEO_PHASES[currentPhase].description}
              </motion.p>
            </AnimatePresence>

            {/* Extra text for phase 1 - App mobile */}
            <AnimatePresence>
              {currentPhase === 0 && (
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4, delay: 0.2 }}
                  className="mt-2 max-w-md text-sm text-white/60"
                >
                  Choisissez votre médecin, sélectionnez un créneau et confirmez en quelques clics depuis notre application mobile.
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          {/* Right side: Phone mockup (visible only in phase 1) */}
          <div className={`${currentPhase === 0 ? 'block' : 'hidden'} mt-4 lg:mt-0`}>
            <PhoneMockup isVisible={currentPhase === 0} />
          </div>
        </div>

        {/* Phase indicators - Timeline du processus */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-8 flex items-center gap-2 sm:gap-4"
        >
          {VIDEO_PHASES.map((phase, index) => {
            const Icon = phase.icon;
            const isActive = index === currentPhase;
            const isPast = index < currentPhase;
            return (
              <div key={phase.id} className="flex items-center gap-2 sm:gap-4">
                <button
                  onClick={() => handlePhaseClick(index)}
                  className={`group relative flex flex-col items-center gap-2 transition-all ${
                    isActive ? 'scale-110' : 'scale-100 hover:scale-105'
                  }`}
                >
                  {/* Icon circle */}
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-full border-2 transition-all sm:h-14 sm:w-14 ${
                      isActive
                        ? 'border-primary bg-primary/90 text-white shadow-lg shadow-primary/40'
                        : isPast
                          ? 'border-primary/60 bg-primary/30 text-white/90'
                          : 'border-white/20 bg-white/10 text-white/60 hover:border-white/40'
                    }`}
                  >
                    <Icon size={20} />
                  </div>
                  {/* Label */}
                  <span
                    className={`max-w-[80px] text-center text-xs font-medium leading-tight sm:max-w-[100px] sm:text-sm ${
                      isActive ? 'text-white' : 'text-white/60'
                    }`}
                  >
                    {phase.label}
                  </span>
                  {/* Progress bar under active phase */}
                  {isActive && (
                    <div className="absolute -bottom-3 left-1/2 h-1 w-12 -translate-x-1/2 overflow-hidden rounded-full bg-white/20">
                      <div
                        className="h-full rounded-full bg-primary transition-all duration-100 ease-linear"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  )}
                </button>
                {/* Connector line between phases */}
                {index < VIDEO_PHASES.length - 1 && (
                  <div
                    className={`hidden h-0.5 w-6 sm:block sm:w-10 ${
                      isPast ? 'bg-primary/60' : 'bg-white/20'
                    }`}
                  />
                )}
              </div>
            );
          })}
        </motion.div>

        {/* Feature pills */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.65 }}
          className="mt-10 flex flex-wrap items-center justify-center gap-3"
        >
          {[
            { icon: Calendar, text: 'Prise de RDV simplifiée' },
            { icon: Users, text: 'Suivi patient personnalisé' },
            { icon: Shield, text: 'Données sécurisées' },
            { icon: Hospital, text: 'Multi-cabinets' },
          ].map(({ icon: Icon, text }) => (
            <span
              key={text}
              className="flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2.5 text-sm font-medium text-white backdrop-blur-md transition-all hover:border-primary/40 hover:bg-primary/15"
            >
              <Icon size={16} className="text-primary-light" />
              {text}
            </span>
          ))}
        </motion.div>

        {/* CTA Button */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate('/login')}
          className="mt-8 flex items-center gap-2 rounded-2xl bg-primary px-10 py-4 text-lg font-semibold text-primary-foreground shadow-2xl shadow-primary/40 transition-all hover:brightness-110"
        >
          Commencer maintenant
          <ArrowRight size={20} />
        </motion.button>

        {/* Bottom text */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.9 }}
          className="mt-6 text-sm text-white/50"
        >
          © {new Date().getFullYear()} MediBook — Tous droits réservés
        </motion.p>
      </div>
    </div>
  );
};

export default LandingPage;
