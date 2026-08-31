import { useNavigate } from 'react-router-dom';
import { Stethoscope, ShieldCheck, Mail, Phone, Lock } from 'lucide-react';

const Footer = () => {
  const navigate = useNavigate();

  return (
    <footer className="bg-slate-950 text-slate-400 text-sm border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          
          {/* Column 1: Brand & Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary text-white flex items-center justify-center font-bold">
                <Stethoscope className="h-5 w-5" />
              </div>
              <span className="text-2xl font-bold text-white tracking-tight">
                Medi<span className="text-emerald-400">Book</span> Pro
              </span>
            </div>

            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed max-w-sm">
              Plateforme SaaS médicale dédiée à la gestion centralisée des cabinets, agendas multi-praticiens et secrétariats au Sénégal.
            </p>

            <div className="pt-2 flex items-center gap-4 text-xs text-slate-300">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-emerald-400">
                <ShieldCheck className="h-3.5 w-3.5" /> Données Santé Sécurisées
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-teal-400">
                <Lock className="h-3.5 w-3.5" /> Chiffrement SSL
              </span>
            </div>
          </div>

          {/* Column 2: Rôles & Accès */}
          <div className="space-y-3">
            <p className="text-white font-bold text-sm tracking-wider uppercase">
              Espace Pro
            </p>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => navigate('/login')} className="hover:text-emerald-400 transition-colors">
                  Connexion Praticien / Admin
                </button>
              </li>
              <li>
                <a href="#roles" className="hover:text-emerald-400 transition-colors">
                  Vue Super Admin
                </a>
              </li>
              <li>
                <a href="#roles" className="hover:text-emerald-400 transition-colors">
                  Vue Admin Cabinet
                </a>
              </li>
              <li>
                <a href="#roles" className="hover:text-emerald-400 transition-colors">
                  Vue Médecin
                </a>
              </li>
              <li>
                <a href="#roles" className="hover:text-emerald-400 transition-colors">
                  Vue Secrétaire
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Solution */}
          <div className="space-y-3">
            <p className="text-white font-bold text-sm tracking-wider uppercase">
              Plateforme
            </p>
            <ul className="space-y-2 text-xs">
              <li>
                <a href="#features" className="hover:text-emerald-400 transition-colors">
                  Agenda Multi-Praticiens
                </a>
              </li>
              <li>
                <a href="#features" className="hover:text-emerald-400 transition-colors">
                  Gestion des Indisponibilités
                </a>
              </li>
              <li>
                <a href="#features" className="hover:text-emerald-400 transition-colors">
                  Sécurité & RGPD
                </a>
              </li>
              <li>
                <a href="#faq" className="hover:text-emerald-400 transition-colors">
                  FAQ Professionnelle
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: Support & Contact */}
          <div className="space-y-3">
            <p className="text-white font-bold text-sm tracking-wider uppercase">
              Support Client
            </p>
            <ul className="space-y-2.5 text-xs">
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>support-pro@medibook.sn</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>+221 33 800 00 00</span>
              </li>
              <li className="text-[11px] text-slate-500 pt-1">
                Dakar, Sénégal • Assistance 7j/7
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} MediBook Sénégal. Tous droits réservés.</p>
          <div className="flex gap-6">
            <span className="hover:text-slate-400 cursor-pointer">Mentions Légales</span>
            <span className="hover:text-slate-400 cursor-pointer">Politique de Confidentialité RGPD</span>
            <span className="hover:text-slate-400 cursor-pointer">CGU Professionnels</span>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
