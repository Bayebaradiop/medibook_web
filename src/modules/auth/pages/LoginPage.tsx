import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getRedirectionParRole } from '../logique/auth.regles';
import { validerEmail, validerMotDePasse } from '../logique/auth.validation';
import { AUTH_ERREURS } from '../messages/auth.erreurs';
import { AUTH_SUCCES } from '../messages/auth.succes';
import AuthLayout from '@/layouts/AuthLayout';
import { Hospital, Mail, Lock, Eye, EyeOff, ShieldCheck, Stethoscope, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

type ErreursChamp = Record<string, string>;

const extraireMessageErreur = (error: unknown, fallback: string) => {
  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error &&
    typeof error.response === "object" &&
    error.response !== null &&
    "data" in error.response &&
    typeof error.response.data === "object" &&
    error.response.data !== null &&
    "message" in error.response.data &&
    typeof error.response.data.message === "string"
  ) {
    return error.response.data.message;
  }

  return fallback;
};

const mapperErreurConnexion = (message: string): ErreursChamp => {
  if (message === AUTH_ERREURS.EMAIL_REQUIS || message === AUTH_ERREURS.EMAIL_INVALIDE || message.includes('email')) {
    return { email: message };
  }

  if (message === AUTH_ERREURS.MDP_REQUIS || message === AUTH_ERREURS.MDP_TROP_COURT || message.includes('passe') || message.includes('inactif')) {
    return { motDePasse: message };
  }

  return {};
};

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [erreurs, setErreurs] = useState<Record<string, string>>({});
  const { login } = useAuth();
  const navigate = useNavigate();

  const updateField = (champ: 'email' | 'motDePasse', valeur: string) => {
    if (champ === 'email') setEmail(valeur);
    if (champ === 'motDePasse') setMotDePasse(valeur);

    if (erreurs[champ]) {
      setErreurs(prev => {
        const copy = { ...prev };
        delete copy[champ];
        return copy;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const erreurEmail = validerEmail(email);
    const erreurMdp = validerMotDePasse(motDePasse);
    const fieldErrors: ErreursChamp = {};
    if (erreurEmail) fieldErrors.email = erreurEmail;
    if (erreurMdp) fieldErrors.motDePasse = erreurMdp;

    setErreurs(fieldErrors);
    if (Object.keys(fieldErrors).length > 0) return;

    setIsLoading(true);
    try {
      const user = await login(email, motDePasse);
      toast.success(AUTH_SUCCES.CONNEXION_REUSSIE);
      navigate(getRedirectionParRole(user.role));
    } catch (error: unknown) {
      const message = extraireMessageErreur(error, AUTH_ERREURS.CONNEXION_ECHOUEE);
      const mappedErrors = mapperErreurConnexion(message);
      if (Object.keys(mappedErrors).length > 0) {
        setErreurs(mappedErrors);
        return;
      }
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="w-full max-w-[480px]">
        <div className="rounded-[32px] border border-white/80 bg-white/95 p-6 shadow-[0_24px_60px_rgba(15,23,42,0.10)] backdrop-blur-xl sm:p-8">
          <div className="mb-8 space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/10 bg-primary/5 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">
              <ShieldCheck size={14} />
              Connexion securisee
            </div>

            <div className="flex items-start gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[24px] bg-gradient-to-br from-primary via-primary to-primary-light text-primary-foreground shadow-[0_18px_34px_rgba(46,125,50,0.24)]">
                <Hospital size={30} />
              </div>

              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary/70">MediBook</p>
                <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">Bienvenue</h1>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Connectez-vous pour gerer votre cabinet, vos rendez-vous et votre activite dans un espace plus net et plus lisible.
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-slate-50/90 p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                  <Stethoscope size={16} className="text-primary" />
                  Espace medical
                </div>
                <p className="mt-2 text-xs leading-5 text-slate-500">
                  Admins, medecins et secretaires accedent a leur environnement en quelques secondes.
                </p>
              </div>

              <div className="rounded-2xl border border-primary/10 bg-primary/5 p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                  <ShieldCheck size={16} className="text-primary" />
                  Acces protege
                </div>
                <p className="mt-2 text-xs leading-5 text-slate-500">
                  Utilisez votre adresse professionnelle pour retrouver les donnees de votre cabinet.
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="email"
                  name="email"
                  value={email}
                  onChange={e => updateField('email', e.target.value)}
                  placeholder="votre@email.com"
                  className={`medibook-input w-full bg-slate-50/80 pl-11 shadow-sm ${erreurs.email ? 'border-destructive ring-1 ring-destructive' : ''}`}
                />
              </div>
              {erreurs.email && <p className="mt-1 text-xs text-destructive">{erreurs.email}</p>}
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Mot de passe</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type={showPass ? 'text' : 'password'}
                  name="motDePasse"
                  value={motDePasse}
                  onChange={e => updateField('motDePasse', e.target.value)}
                  placeholder="••••••••"
                  className={`medibook-input w-full bg-slate-50/80 pl-11 pr-11 shadow-sm ${erreurs.motDePasse ? 'border-destructive ring-1 ring-destructive' : ''}`}
                />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-primary">
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {erreurs.motDePasse && <p className="mt-1 text-xs text-destructive">{erreurs.motDePasse}</p>}
            </div>

            <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3">
              <p className="text-xs leading-5 text-slate-500">
                Besoin d&apos;aide pour retrouver votre acces ?
              </p>
              <Link to="/forgot-password" className="shrink-0 text-sm font-semibold text-primary hover:underline">
                Mot de passe oublié ?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="medibook-btn mt-2 flex w-full items-center justify-center gap-2 bg-gradient-to-r from-primary to-primary-dark shadow-[0_18px_34px_rgba(46,125,50,0.24)] hover:brightness-95"
            >
              {isLoading ? 'Connexion...' : 'Se connecter'}
              {!isLoading && <ArrowRight size={18} />}
            </button>
          </form>

          <div className="mt-6 rounded-2xl border border-primary/10 bg-primary/5 px-4 py-4">
            <p className="text-sm font-semibold text-slate-900">Un espace plus equilibre entre confiance et lisibilite.</p>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              Le vert reste present pour guider l&apos;action, mais le blanc reprend la priorite pour une lecture plus confortable.
            </p>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
};

export default LoginPage;
