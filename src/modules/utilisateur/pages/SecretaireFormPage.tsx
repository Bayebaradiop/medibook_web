import { useNavigate, useParams } from 'react-router-dom';
import DashboardLayout from '@/layouts/DashboardLayout';
import { mockSecretaires } from '@/data/mockUsers';
import { mockSpecialites } from '@/data/mockSpecialites';
import { ArrowLeft, Upload } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

const SecretaireFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const sec = id && id !== 'nouveau' ? mockSecretaires.find(s => s.id === id) : null;
  const isEdit = !!sec;

  const [form, setForm] = useState({
    prenom: sec?.prenom || '', nom: sec?.nom || '', email: sec?.email || '',
    telephone: sec?.telephone || '', specialiteId: sec?.specialiteId || '', password: '',
  });
  const update = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  return (
    <DashboardLayout title={isEdit ? 'Modifier la secrétaire' : 'Nouvelle secrétaire'}>
      <div className="space-y-6 max-w-3xl">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"><ArrowLeft size={18} /> Retour</button>
        <form onSubmit={e => { e.preventDefault(); toast.success(isEdit ? 'Modifiée' : 'Créée'); navigate('/admin/secretaires'); }} className="space-y-6">
          <div className="medibook-card flex flex-col items-center">
            <div className="w-24 h-24 rounded-full border-2 border-dashed border-input flex items-center justify-center hover:border-primary transition-colors cursor-pointer"><Upload size={28} className="text-muted-foreground" /></div>
          </div>
          <div className="medibook-card">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className="text-sm font-medium text-secondary-foreground mb-1.5 block">Prénom</label><input value={form.prenom} onChange={e => update('prenom', e.target.value)} className="medibook-input w-full" required /></div>
              <div><label className="text-sm font-medium text-secondary-foreground mb-1.5 block">Nom</label><input value={form.nom} onChange={e => update('nom', e.target.value)} className="medibook-input w-full" required /></div>
              <div><label className="text-sm font-medium text-secondary-foreground mb-1.5 block">Email</label><input type="email" value={form.email} onChange={e => update('email', e.target.value)} className="medibook-input w-full" required /></div>
              <div><label className="text-sm font-medium text-secondary-foreground mb-1.5 block">Téléphone</label><input value={form.telephone} onChange={e => update('telephone', e.target.value)} className="medibook-input w-full" required /></div>
              <div><label className="text-sm font-medium text-secondary-foreground mb-1.5 block">Spécialité</label><select value={form.specialiteId} onChange={e => update('specialiteId', e.target.value)} className="medibook-input w-full" required><option value="">Sélectionner</option>{mockSpecialites.map(s => <option key={s.id} value={s.id}>{s.nom}</option>)}</select></div>
              {!isEdit && <div><label className="text-sm font-medium text-secondary-foreground mb-1.5 block">Mot de passe</label><input type="password" value={form.password} onChange={e => update('password', e.target.value)} className="medibook-input w-full" required /></div>}
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => navigate(-1)} className="medibook-btn-outline">Annuler</button>
            <button type="submit" className="medibook-btn">Enregistrer</button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default SecretaireFormPage;
