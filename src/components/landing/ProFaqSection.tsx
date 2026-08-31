import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, HelpCircle } from 'lucide-react';

const faqs = [
  {
    question: 'Comment inscrire mon cabinet médical ou ma clinique sur MediBook ?',
    answer: 'L’inscription d’une structure médicale est réalisée par l’administrateur du cabinet ou par nos équipes lors du déploiement. Un Super Admin valide l’établissement et attribue un espace dédié sécurisé.',
  },
  {
    question: 'Qui est habilité à créer les accès pour les médecins et les secrétaires ?',
    answer: 'L’Admin du Cabinet dispose des droits nécessaires pour ajouter des médecins, attribuer des spécialités, créer les comptes secrétaires et associer quel secrétaire gère quel praticien.',
  },
  {
    question: 'Comment est garantie la sécurité et la confidentialité des données ?',
    answer: 'MediBook applique un cloisonnement strict par cabinet et par rôle. Les échanges sont chiffrés selon les normes RGPD. Aucun profil non autorisé n’a accès aux rendez-vous d’un autre cabinet.',
  },
  {
    question: 'Que se passe-t-il si un médecin est absent ou en congé imprévu ?',
    answer: 'Le médecin ou sa secrétaire peut ajouter une exception ou une indisponibilité temporaire directement sur le module Planning. Les créneaux concernés sont immédiatement bloqués.',
  },
  {
    question: 'Les patients ont-ils accès à cette plateforme web ?',
    answer: 'Non. Le portail Web MediBook est exclusivement réservé aux professionnels (Super Admin, Admin, Médecin, Secrétaire). Les patients gèrent la prise de rendez-vous depuis l’application mobile Flutter dédiée.',
  },
];

const ProFaqSection = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFaq = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section id="faq" className="py-24 bg-slate-50 dark:bg-slate-900/40 border-t border-slate-200/80 dark:border-slate-800">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-14 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
            <HelpCircle className="h-3.5 w-3.5" />
            Questions Fréquentes Pros
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">
            Tout ce que vous devez savoir sur l’Espace Pro
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Des réponses claires pour l’administration et l’utilisation quotidienne du portail.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <motion.div
                key={faq.question}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
                className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/70 overflow-hidden shadow-sm"
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full p-6 text-left flex items-center justify-between gap-4 font-semibold text-slate-900 dark:text-white hover:text-primary transition-colors"
                >
                  <span className="text-base sm:text-lg">{faq.question}</span>
                  <ChevronDown
                    className={`h-5 w-5 text-slate-400 shrink-0 transition-transform duration-300 ${
                      isOpen ? 'rotate-180 text-primary' : ''
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
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-6 pt-0 text-sm text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-700/50 mt-2">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

export default ProFaqSection;
