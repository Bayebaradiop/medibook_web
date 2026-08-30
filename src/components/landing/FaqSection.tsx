import { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const FAQS = [
  {
    question: "La prise de rendez-vous sur MediBook est-elle gratuite pour le patient ?",
    answer: "Oui, l’utilisation de MediBook pour rechercher un praticien et prendre rendez-vous en ligne est 100% gratuite pour les patients. Vous ne payez que les honoraires de votre consultation médicale auprès du médecin.",
  },
  {
    question: "Comment annuler ou modifier mon rendez-vous ?",
    answer: "Vous pouvez annuler ou modifier votre rendez-vous à tout moment depuis votre espace patient sur le site ou via l’application mobile, en respectant un préavis raisonnable avant le début du créneau.",
  },
  {
    question: "Comment fonctionnent les téléconsultations sur MediBook ?",
    answer: "Après avoir réservé un créneau en téléconsultation, vous recevez un lien sécurisé par SMS et email. À l’heure convenue, cliquez sur le lien pour démarrer la consultation en vidéo HD avec votre médecin.",
  },
  {
    question: "Mes données médicales sont-elles sécurisées ?",
    answer: "Absolument. MediBook est hébergé sur des serveurs certifiés Données de Santé (HDS) avec un chiffrement AES 256 bits et une stricte conformité aux réglementations de confidentialité RGPD.",
  },
  {
    question: "Comment rejoindre MediBook en tant que médecin ou cabinet ?",
    answer: "Il vous suffit d'accéder à l'Espace Praticien en vous connectant ou en faisant une demande d'adhésion. Notre équipe vous accompagne pour configurer l'agenda de vos praticiens et de votre secrétariat.",
  },
];

const FaqSection = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-20 bg-slate-50 relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <span className="text-xs uppercase font-bold tracking-widest text-primary bg-primary/10 px-4 py-1.5 rounded-full inline-block mb-3">
            Foire Aux Questions
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Des réponses à vos questions
          </h2>
          <p className="mt-3 text-base text-slate-600">
            Retrouvez ici les réponses aux interrogations les plus fréquentes des patients et des praticiens.
          </p>
        </div>

        <div className="space-y-4">
          {FAQS.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={faq.question}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm transition-all duration-200"
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-slate-900 text-base sm:text-lg hover:text-primary transition-colors"
                >
                  <span className="flex items-center gap-3">
                    <HelpCircle className="h-5 w-5 text-primary shrink-0" />
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`h-5 w-5 text-slate-400 shrink-0 transition-transform duration-300 ${
                      isOpen ? 'transform rotate-180 text-primary' : ''
                    }`}
                  />
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="px-5 pb-5 pt-1 text-sm text-slate-600 leading-relaxed border-t border-slate-100"
                    >
                      {faq.answer}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FaqSection;
