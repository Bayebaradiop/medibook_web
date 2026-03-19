import { useState } from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { ROLE_LABELS } from '@/utils/constants';
import { Upload } from 'lucide-react';
import { toast } from 'sonner';

const ProfilePage = () => {
  const { user, role } = useAuth();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ prenom: user?.prenom || '', nom: user?.nom || '', telephone: user?.telephone || '' });
  const update = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));
  const getInitials = () => `${user?.prenom?.[0] || ''}${user?.nom?.[0] || ''}`;

  return (
    <DashboardLayout title="Mon Profil">
      <div className="max-w-2xl space-y-6">
        <div className="medibook-card flex flex-col items-center">
          <div className="relative">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-3xl">{getInitials()}</div>
            {editing && <button className="absolute bottom-0 right-0 p-1.5 rounded-full bg-primary text-primary-foreground"><Upload size={14} /></button>}
          </div>
          <h2 className="text-xl font-bold mt-3">{user?.prenom} {user?.nom}</h2>
          <span className="medibook-badge bg-primary/10 text-primary mt-1">{role ? ROLE_LABELS[role] : ''}</span>
        </div>

        <div className="medibook-card">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="text-sm font-medium text-secondary-foreground mb-1.5 block">Prénom</label><input value={form.prenom} onChange={e => update('prenom', e.target.value)} disabled={!editing} className="medibook-input w-full disabled:opacity-60" /></div>
            <div><label className="text-sm font-medium text-secondary-foreground mb-1.5 block">Nom</label><input value={form.nom} onChange={e => update('nom', e.target.value)} disabled={!editing} className="medibook-input w-full disabled:opacity-60" /></div>
            <div><label className="text-sm font-medium text-secondary-foreground mb-1.5 block">Email</label><input value={user?.email || ''} disabled className="medibook-input w-full disabled:opacity-60" /></div>
            <div><label className="text-sm font-medium text-secondary-foreground mb-1.5 block">Téléphone</label><input value={form.telephone} onChange={e => update('telephone', e.target.value)} disabled={!editing} className="medibook-input w-full disabled:opacity-60" /></div>
          </div>
          <div className="flex justify-end mt-4">
            {editing ? (
              <div className="flex gap-3">
                <button onClick={() => setEditing(false)} className="medibook-btn-outline h-10 px-4 text-sm">Annuler</button>
                <button onClick={() => { toast.success('Profil mis à jour'); setEditing(false); }} className="medibook-btn h-10 px-4 text-sm">Sauvegarder</button>
              </div>
            ) : (
              <button onClick={() => setEditing(true)} className="medibook-btn h-10 px-4 text-sm">Modifier</button>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ProfilePage;
