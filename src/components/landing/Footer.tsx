import { useNavigate } from 'react-router-dom';
import { Stethoscope, ShieldCheck, Heart, Smartphone, ArrowRight, Lock } from 'lucide-react';

const Footer = () => {
  const navigate = useNavigate();

  return (
    <footer className="bg-slate-950 text-slate-400 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800">
          {/* Col 1: Brand & Mission */}
          <div className="lg:col-span-2 space-y-4">
            <div
              onClick={() => navigate('/')}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <div className="h-10 w-10 rounded-2xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/30">
                <Stethoscope className="h-5 w-5" />
              </div>
              <span className="text-2xl font-bold text-white tracking-tight">
                Medi<span className="text-primary-light">Book</span>
              </span>
            </div>

            <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
              MediBook est la plateforme médicale connectée de référence pour la recherche de praticiens, la prise de rendez-vous en ligne et la gestion de cabinet médical.
            </p>

            <div className="flex items-center gap-4 pt-2 text-xs font-semibold text-emerald-400">
              <span className="flex items-center gap-1.5 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20">
                <ShieldCheck className="h-4 w-4" /> Données HDS Certifiées
              </span>
              <span className="flex items-center gap-1.5 bg-slate-800 px-3 py-1.5 rounded-full text-slate-300">
                <Lock className="h-3.5 w-3.5 text-slate-400" /> RGPD Conforme
              </span>
            </div>
          </div>

          {/* Col 2: Pour les Patients */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              Pour les Patients
            </h4>
            <ul className="space-y-2.5 text-xs font-medium">
              <li>
                <a href="#search" className="hover:text-primary-light transition-colors">Rechercher un médecin</a>
              </li>
              <li>
                <a href="#specialties" className="hover:text-primary-light transition-colors">Spécialités médicales</a>
              </li>
              <li>
                <a href="#doctors" className="hover:text-primary-light transition-colors">Médecins disponibles</a>
              </li>
              <li>
                <a href="#how-it-works" className="hover:text-primary-light transition-colors">Téléconsultation</a>
              </li>
              <li>
                <button onClick={() => navigate('/login')} className="hover:text-primary-light transition-colors text-left">
                  Espace Patient / Connexion
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Pour les Praticiens */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              Praticiens & Cabinets
            </h4>
            <ul className="space-y-2.5 text-xs font-medium">
              <li>
                <button onClick={() => navigate('/login')} className="hover:text-primary-light transition-colors text-left">
                  Espace Médecin & Secrétariat
                </button>
              </li>
              <li>
                <a href="#features" className="hover:text-primary-light transition-colors">Gestion du planning multi-cabinets</a>
              </li>
              <li>
                <a href="#features" className="hover:text-primary-light transition-colors">Réduction des absences RDV</a>
              </li>
              <li>
                <button onClick={() => navigate('/login')} className="hover:text-primary-light transition-colors text-left">
                  S'inscrire comme praticien
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Téléchargement App */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              Application Mobile
            </h4>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              Prenez vos rendez-vous et accédez à vos téléconsultations partout avec l'application MediBook.
            </p>

            <div className="space-y-2">
              <button
                onClick={() => navigate('/login')}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all"
              >
                <Smartphone className="h-4 w-4 text-emerald-400" />
                App Store & Google Play
              </button>
            </div>
          </div>
        </div>

        {/* Bottom copyright & legal */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500 font-medium">
          <p>© {new Date().getFullYear()} MediBook — Tous droits réservés. Plateforme Médicale Sécurisée.</p>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-slate-300 transition-colors">Politique de confidentialité</a>
            <a href="#" className="hover:text-slate-300 transition-colors">Conditions Générales d'Utilisation</a>
            <a href="#" className="hover:text-slate-300 transition-colors">Mentions Légales</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
