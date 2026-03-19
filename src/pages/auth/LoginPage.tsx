import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import AuthLayout from '@/layouts/AuthLayout';
import { Hospital, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (login(email)) {
      const e2 = email.toLowerCase();
      if (e2.includes('superadmin')) navigate('/super-admin');
      else if (e2.includes('admin')) navigate('/admin');
      else if (e2.includes('medecin')) navigate('/medecin');
      else if (e2.includes('secretaire')) navigate('/secretaire');
    } else {
      toast.error('Email non reconnu. Essayez : superadmin@, admin@, medecin@ ou secretaire@');
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
                <input type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" className="medibook-input w-full pl-10 pr-10" required />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <button type="submit" className="medibook-btn w-full mt-2">Se connecter</button>
          </form>

          <div className="mt-6 p-3 rounded-xl bg-muted">
            <p className="text-xs text-muted-foreground text-center font-medium mb-2">Comptes de test :</p>
            <div className="grid grid-cols-2 gap-1 text-xs text-muted-foreground">
              <span>superadmin@medibook.sn</span><span>Super Admin</span>
              <span>admin@medibook.sn</span><span>Admin</span>
              <span>medecin@medibook.sn</span><span>Médecin</span>
              <span>secretaire@medibook.sn</span><span>Secrétaire</span>
            </div>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
};

export default LoginPage;
