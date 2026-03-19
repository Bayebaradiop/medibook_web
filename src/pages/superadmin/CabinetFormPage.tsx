import { useNavigate, useParams } from 'react-router-dom';
import DashboardLayout from '@/layouts/DashboardLayout';
import { ArrowLeft, Upload } from 'lucide-react';
import { useState } from 'react';
import { mockCabinets } from '@/data/mockCabinets';
import { toast } from 'sonner';

const CabinetFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const cabinet = id ? mockCabinets.find(c => c.id === id) : null;
  const isEdit = !!cabinet;

  const [form, setForm] = useState({
    nom: cabinet?.nom || '', adresse: cabinet?.adresse || '', telephone: cabinet?.telephone || '', email: cabinet?.email || '',
    couleurPrimaire: cabinet?.couleurPrimaire || '#2E7D32', couleurSecondaire: cabinet?.couleurSecondaire || '#66BB6A',
    adminPrenom: cabinet?.admin.prenom || '', adminNom: cabinet?.admin.nom || '', adminEmail: cabinet?.admin.email || '',
    adminTelephone: cabinet?.admin.telephone || '', adminPassword: '',
  });

  const update = (key: string, val: string) => setForm(f => ({ ...f, [key]: val }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success(isEdit ? 'Cabinet modifié avec succès' : 'Cabinet créé avec succès');
    navigate('/super-admin/cabinets');
  };

  return (
    <DashboardLayout title={isEdit ? 'Modifier le cabinet' : 'Nouveau cabinet'}>
      <div className="space-y-6 max-w-4xl">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft size={18} /> Retour
        </button>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="medibook-card">
            <h3 className="font-semibold mb-4">Informations du cabinet</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className="text-sm font-medium text-secondary-foreground mb-1.5 block">Nom</label><input value={form.nom} onChange={e => update('nom', e.target.value)} className="medibook-input w-full" required /></div>
              <div><label className="text-sm font-medium text-secondary-foreground mb-1.5 block">Adresse</label><input value={form.adresse} onChange={e => update('adresse', e.target.value)} className="medibook-input w-full" required /></div>
              <div><label className="text-sm font-medium text-secondary-foreground mb-1.5 block">Téléphone</label><input value={form.telephone} onChange={e => update('telephone', e.target.value)} className="medibook-input w-full" required /></div>
              <div><label className="text-sm font-medium text-secondary-foreground mb-1.5 block">Email</label><input type="email" value={form.email} onChange={e => update('email', e.target.value)} className="medibook-input w-full" required /></div>
              <div><label className="text-sm font-medium text-secondary-foreground mb-1.5 block">Couleur primaire</label><div className="flex items-center gap-2"><input type="color" value={form.couleurPrimaire} onChange={e => update('couleurPrimaire', e.target.value)} className="h-10 w-14 rounded-lg border cursor-pointer" /><span className="text-sm text-muted-foreground">{form.couleurPrimaire}</span></div></div>
              <div><label className="text-sm font-medium text-secondary-foreground mb-1.5 block">Couleur secondaire</label><div className="flex items-center gap-2"><input type="color" value={form.couleurSecondaire} onChange={e => update('couleurSecondaire', e.target.value)} className="h-10 w-14 rounded-lg border cursor-pointer" /><span className="text-sm text-muted-foreground">{form.couleurSecondaire}</span></div></div>
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-secondary-foreground mb-1.5 block">Logo</label>
                <div className="border-2 border-dashed border-input rounded-2xl p-8 text-center hover:border-primary transition-colors cursor-pointer">
                  <Upload size={32} className="mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">Glissez-déposez un logo ou cliquez pour sélectionner</p>
                </div>
              </div>
            </div>
          </div>

          <div className="medibook-card">
            <h3 className="font-semibold mb-4">Administrateur du cabinet</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className="text-sm font-medium text-secondary-foreground mb-1.5 block">Prénom</label><input value={form.adminPrenom} onChange={e => update('adminPrenom', e.target.value)} className="medibook-input w-full" required /></div>
              <div><label className="text-sm font-medium text-secondary-foreground mb-1.5 block">Nom</label><input value={form.adminNom} onChange={e => update('adminNom', e.target.value)} className="medibook-input w-full" required /></div>
              <div><label className="text-sm font-medium text-secondary-foreground mb-1.5 block">Email</label><input type="email" value={form.adminEmail} onChange={e => update('adminEmail', e.target.value)} className="medibook-input w-full" required /></div>
              <div><label className="text-sm font-medium text-secondary-foreground mb-1.5 block">Téléphone</label><input value={form.adminTelephone} onChange={e => update('adminTelephone', e.target.value)} className="medibook-input w-full" required /></div>
              {!isEdit && <div><label className="text-sm font-medium text-secondary-foreground mb-1.5 block">Mot de passe</label><input type="password" value={form.adminPassword} onChange={e => update('adminPassword', e.target.value)} className="medibook-input w-full" required /></div>}
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

export default CabinetFormPage;
