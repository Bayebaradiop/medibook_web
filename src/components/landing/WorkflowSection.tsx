import { useState } from 'react';
import { Smartphone, ClipboardCheck, MessageSquare, Stethoscope, ArrowRight, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import PhoneMockup from '@/components/PhoneMockup';

const WORKFLOW_STEPS = [
  {
    step: '01',
    title: 'Prise de RDV instantanée',
    description: 'Le patient choisit son médecin, sélectionne une date et un créneau en 3 clics sur son mobile ou son navigateur.',
    icon: Smartphone,
    color: 'text-emerald-500 bg-emerald-50 border-emerald-200',
  },
  {
    step: '02',
    title: 'Validation & Secrétariat',
    description: 'La secrétaire du cabinet reçoit la demande, la vérifie et la valide instantanément dans le planning.',
    icon: ClipboardCheck,
    color: 'text-teal-500 bg-teal-50 border-teal-200',
  },
  {
    step: '03',
    title: 'Rappel SMS & Échanges',
    description: 'Rappels automatiques envoyés par SMS/Email au patient avec accès à l’espace de téléconsultation et messagerie.',
    icon: MessageSquare,
    color: 'text-blue-500 bg-blue-50 border-blue-200',
  },
  {
    step: '04',
    title: 'Consultation & Suivi',
    description: 'Le médecin réalise l’examen en cabinet ou en vidéo et transmet le compte-rendu médical en toute sécurité.',
    icon: Stethoscope,
    color: 'text-indigo-500 bg-indigo-50 border-indigo-200',
  },
];

const WorkflowSection = () => {
  const [activeStep, setActiveStep] = useState(0);

  return (
    <section id="how-it-works" className="py-20 bg-slate-900 text-white relative overflow-hidden">
      {/* Glow backgrounds */}
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs uppercase font-bold tracking-widest text-emerald-400 bg-emerald-500/10 px-4 py-1.5 rounded-full inline-block mb-3 border border-emerald-500/20">
            Comment ça marche ?
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Un parcours de soin connecté et simplifié
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-300">
            Découvrez la fluidité du processus MediBook de la réservation jusqu’à la consultation médicale.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Interactive Steps Timeline */}
          <div className="lg:col-span-7 space-y-4">
            {WORKFLOW_STEPS.map((item, idx) => {
              const Icon = item.icon;
              const isActive = idx === activeStep;
              return (
                <div
                  key={item.step}
                  onClick={() => setActiveStep(idx)}
                  className={`p-6 rounded-3xl border transition-all duration-300 cursor-pointer ${
                    isActive
                      ? 'bg-white/10 border-emerald-500/50 shadow-xl backdrop-blur-md translate-x-2'
                      : 'bg-white/5 border-white/10 hover:bg-white/10 text-slate-400'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`h-12 w-12 rounded-2xl flex items-center justify-center font-bold shrink-0 ${
                      isActive ? 'bg-primary text-white shadow-lg shadow-primary/40' : 'bg-white/10 text-slate-300'
                    }`}>
                      <Icon className="h-6 w-6" />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-extrabold text-emerald-400 uppercase tracking-wider">
                          Étape {item.step}
                        </span>
                        {isActive && (
                          <span className="flex items-center gap-1 text-xs font-semibold text-emerald-300 bg-emerald-500/20 px-2.5 py-0.5 rounded-full">
                            <CheckCircle2 className="h-3.5 w-3.5" /> En cours
                          </span>
                        )}
                      </div>
                      <h3 className={`text-lg font-bold ${isActive ? 'text-white' : 'text-slate-200'}`}>
                        {item.title}
                      </h3>
                      <p className={`mt-1 text-sm leading-relaxed ${isActive ? 'text-slate-200' : 'text-slate-400'}`}>
                        {item.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Phone Mockup Simulation */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center">
            <div className="relative">
              <PhoneMockup isVisible={true} />
            </div>
            <p className="mt-6 text-xs text-slate-400 text-center max-w-xs font-medium">
              📱 Application disponible sur iOS & Android pour vos patients et praticiens.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WorkflowSection;
