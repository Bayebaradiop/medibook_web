import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getRedirectionParRole } from '../logique/auth.regles';
import { validerEmail, validerMotDePasse } from '../logique/auth.validation';
import { AUTH_ERREURS } from '../messages/auth.erreurs';
import { AUTH_SUCCES } from '../messages/auth.succes';
import AuthLayout from '@/layouts/AuthLayout';
import { Hospital, Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
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
      <div className="w-full max-w-[420px]">
        <div className="rounded-3xl border border-white/80 bg-white/95 p-6 shadow-[0_24px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:p-8">
          <div className="mb-8 flex flex-col items-center text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary-light text-primary-foreground shadow-lg">
              <Hospital size={28} />
            </div>
            <h1 className="mt-4 text-2xl font-bold tracking-tight text-slate-900">Bienvenue sur MediBook</h1>
            <p className="mt-1.5 text-sm text-slate-500">Connectez-vous a votre espace</p>
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

            <div className="flex justify-end">
              <Link to="/forgot-password" className="text-sm font-medium text-primary hover:underline">
                Mot de passe oublié ?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="medibook-btn mt-2 flex w-full items-center justify-center gap-2 bg-gradient-to-r from-primary to-primary-dark shadow-[0_14px_28px_rgba(46,125,50,0.2)] hover:brightness-95"
            >
              {isLoading ? 'Connexion...' : 'Se connecter'}
              {!isLoading && <ArrowRight size={18} />}
            </button>
          </form>
        </div>
      </div>
    </AuthLayout>
  );
};

export default LoginPage;
