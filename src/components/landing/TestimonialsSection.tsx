import { Star, ShieldCheck, Quote, Building } from 'lucide-react';
import { motion } from 'framer-motion';

const REVIEWS = [
  {
    quote: "Grâce à MediBook, la prise de rendez-vous avec mon médecin généraliste s'est faite en moins de 2 minutes. Les rappels par SMS sont un vrai plus !",
    author: "Aminata Seck",
    role: "Patiente à Dakar",
    rating: 5,
    initials: "AS",
  },
  {
    quote: "La coordination entre mon secrétariat et mon agenda médical est devenue d'une simplicité remarquable. Moins de retards et zéro doublon !",
    author: "Dr. Ousmane Kane",
    role: "Médecin Généraliste - Clinique Fann",
    rating: 5,
    initials: "OK",
  },
  {
    quote: "En tant que secrétaire médicale, cet outil me permet de gérer plusieurs plannings de médecins simultanément avec une clarté optimale.",
    author: "Fatoumata Diop",
    role: "Secrétaire Médicale",
    rating: 5,
    initials: "FD",
  },
];

const TRUST_BADGES = [
  { name: 'Données HDS Certifiées', desc: 'Hébergement Données de Santé' },
  { name: 'Conformité RGPD', desc: 'Protection de la vie privée' },
  { name: 'Sécurité 256-bit', desc: 'Chiffrement de bout en bout' },
  { name: 'Disponibilité 99.9%', desc: 'Infrastructure haute disponibilité' },
];

const TestimonialsSection = () => {
  return (
    <section className="py-20 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1 text-amber-500 mb-2">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-5 w-5 fill-amber-400" />
            ))}
            <span className="ml-2 text-sm font-extrabold text-slate-800">4.9 / 5 sur +10 000 avis</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Ils nous font confiance au quotidien
          </h2>
          <p className="mt-3 text-base text-slate-600">
            Découvrez l’expérience de nos patients, médecins et secrétaires médicales.
          </p>
        </div>

        {/* Reviews Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {REVIEWS.map((review, idx) => (
            <motion.div
              key={review.author}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.1 }}
              className="bg-slate-50 rounded-3xl p-6 border border-slate-200 shadow-sm relative flex flex-col justify-between"
            >
              <div>
                <Quote className="h-8 w-8 text-primary/20 mb-4" />
                <p className="text-sm text-slate-700 leading-relaxed italic">
                  "{review.quote}"
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-200/60 flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary text-white font-bold text-sm flex items-center justify-center shadow-md">
                  {review.initials}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{review.author}</h4>
                  <p className="text-xs text-slate-500 font-medium">{review.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Security & Compliance Badges Banner */}
        <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 text-white">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {TRUST_BADGES.map((badge) => (
              <div key={badge.name} className="flex flex-col items-center">
                <ShieldCheck className="h-7 w-7 text-emerald-400 mb-2" />
                <p className="text-sm font-bold">{badge.name}</p>
                <p className="text-xs text-slate-400 mt-0.5">{badge.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
