import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getRedirectionParRole } from '../logique/auth.regles';
import { validerEmail, validerMotDePasse } from '../logique/auth.validation';
import { AUTH_ERREURS } from '../messages/auth.erreurs';
import { AUTH_SUCCES } from '../messages/auth.succes';
import AuthLayout from '@/layouts/AuthLayout';
import { Hospital, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const erreurEmail = validerEmail(email);
    if (erreurEmail) { toast.error(erreurEmail); return; }
    const erreurMdp = validerMotDePasse(motDePasse);
    if (erreurMdp) { toast.error(erreurMdp); return; }

    setIsLoading(true);
    try {
      const user = await login(email, motDePasse);
      toast.success(AUTH_SUCCES.CONNEXION_REUSSIE);
      navigate(getRedirectionParRole(user.role));
    } catch (error: any) {
      const message = error.response?.data?.message || AUTH_ERREURS.CONNEXION_ECHOUEE;
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="w-full max-w-md">
        <div className="medibook-card p-8">
          <div className="flex flex-col items-center mb-8">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground mb-4">
              <Hospital size={32} />
            </div>
            <h1 className="text-2xl font-bold text-foreground">MediBook</h1>
            <p className="text-sm text-muted-foreground mt-1">Plateforme de gestion médicale</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-secondary-foreground mb-1.5 block">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="votre@email.com" className="medibook-input w-full pl-10" required />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-secondary-foreground mb-1.5 block">Mot de passe</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <input type={showPass ? 'text' : 'password'} value={motDePasse} onChange={e => setMotDePasse(e.target.value)} placeholder="••••••••" className="medibook-input w-full pl-10 pr-10" required />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={isLoading} className="medibook-btn w-full mt-2">
              {isLoading ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>
        </div>
      </div>
    </AuthLayout>
  );
};

export default LoginPage;
