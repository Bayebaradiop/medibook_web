import { useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { secretaireService } from '../services/utilisateurService';
import { UTILISATEUR_ERREURS } from '../messages/utilisateur.erreurs';
import { UTILISATEUR_SUCCES } from '../messages/utilisateur.succes';
import type { Secretaire } from '../types/utilisateur.types';
import { ArrowLeft, Upload, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const SecretaireFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id && id !== 'nouveau';

  const [loadingInit, setLoadingInit] = useState(true);
  const [saving, setSaving] = useState(false);
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [erreurs, setErreurs] = useState<Record<string, string>>({});

  const [form, setForm] = useState({
    prenom: '', nom: '', email: '', telephone: '', motDePasse: '',
  });
  const update = (k: string, v: string) => { setForm(f => ({ ...f, [k]: v })); setErreurs(prev => ({ ...prev, [k]: '' })); };

  const charger = useCallback(async () => {
    try {
      if (isEdit) {
        const res = await secretaireService.detail(Number(id));
        const s: Secretaire = res.data;
        setForm({ prenom: s.prenom, nom: s.nom, email: s.email, telephone: s.telephone, motDePasse: '' });
        if (s.photo) setPhotoPreview(s.photo);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Erreur de chargement");
      navigate('/admin/secretaires');
    } finally {
      setLoadingInit(false);
    }
  }, [id, isEdit, navigate]);

  useEffect(() => { charger(); }, [charger]);

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) { setPhoto(file); setPhotoPreview(URL.createObjectURL(file)); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      prenom: form.prenom, nom: form.nom, email: form.email, telephone: form.telephone,
      ...(form.motDePasse ? { motDePasse: form.motDePasse } : {}),
    };

    setSaving(true);
    try {
      if (isEdit) {
        await secretaireService.update(Number(id), data, photo || undefined);
        toast.success(UTILISATEUR_SUCCES.SECRETAIRE_MODIFIE);
      } else {
        await secretaireService.create(data, photo || undefined);
        toast.success(UTILISATEUR_SUCCES.SECRETAIRE_CREE);
      }
      navigate('/admin/secretaires');
    } catch (err: any) {
      const resp = err.response?.data;
      const fieldErrors = resp?.error?.details;
      if (fieldErrors && typeof fieldErrors === 'object') {
        setErreurs(fieldErrors);
        const messages = Object.values(fieldErrors) as string[];
        toast.error(messages.join(' • '));
      } else {
        toast.error(resp?.error?.description || resp?.message
          || (isEdit ? UTILISATEUR_ERREURS.MODIFICATION_SECRETAIRE_ECHOUEE : UTILISATEUR_ERREURS.CREATION_SECRETAIRE_ECHOUEE));
      }
    } finally {
      setSaving(false);
    }
  };

  if (loadingInit) return <DashboardLayout title="Secrétaire"><div className="flex justify-center py-12"><Loader2 className="animate-spin text-primary" size={32} /></div></DashboardLayout>;

  return (
    <DashboardLayout title={isEdit ? 'Modifier la secrétaire' : 'Nouvelle secrétaire'}>
      <div className="space-y-6 max-w-3xl">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"><ArrowLeft size={18} /> Retour</button>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="medibook-card flex flex-col items-center">
            <label className="w-24 h-24 rounded-full border-2 border-dashed border-input flex items-center justify-center hover:border-primary transition-colors cursor-pointer overflow-hidden">
              {photoPreview ? <img src={photoPreview} alt="Photo" className="w-full h-full object-cover" /> : <Upload size={28} className="text-muted-foreground" />}
              <input type="file" accept="image/*" onChange={handlePhoto} className="hidden" />
            </label>
            <p className="text-xs text-muted-foreground mt-2">Cliquez pour ajouter une photo</p>
          </div>
          <div className="medibook-card">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-secondary-foreground mb-1.5 block">Prénom</label>
                <input value={form.prenom} onChange={e => update('prenom', e.target.value)} className={`medibook-input w-full ${erreurs.prenom ? 'border-destructive' : ''}`} required />
                {erreurs.prenom && <p className="text-xs text-destructive mt-1">{erreurs.prenom}</p>}
              </div>
              <div>
                <label className="text-sm font-medium text-secondary-foreground mb-1.5 block">Nom</label>
                <input value={form.nom} onChange={e => update('nom', e.target.value)} className={`medibook-input w-full ${erreurs.nom ? 'border-destructive' : ''}`} required />
                {erreurs.nom && <p className="text-xs text-destructive mt-1">{erreurs.nom}</p>}
              </div>
              <div>
                <label className="text-sm font-medium text-secondary-foreground mb-1.5 block">Email</label>
                <input type="email" value={form.email} onChange={e => update('email', e.target.value)} className={`medibook-input w-full ${erreurs.email ? 'border-destructive' : ''}`} required />
                {erreurs.email && <p className="text-xs text-destructive mt-1">{erreurs.email}</p>}
              </div>
              <div>
                <label className="text-sm font-medium text-secondary-foreground mb-1.5 block">Téléphone</label>
                <input value={form.telephone} onChange={e => update('telephone', e.target.value)} className={`medibook-input w-full ${erreurs.telephone ? 'border-destructive' : ''}`} required />
                {erreurs.telephone && <p className="text-xs text-destructive mt-1">{erreurs.telephone}</p>}
              </div>
              {!isEdit && <div>
                <label className="text-sm font-medium text-secondary-foreground mb-1.5 block">Mot de passe</label>
                <input type="password" value={form.motDePasse} onChange={e => update('motDePasse', e.target.value)} className={`medibook-input w-full ${erreurs.motDePasse ? 'border-destructive' : ''}`} required />
                {erreurs.motDePasse && <p className="text-xs text-destructive mt-1">{erreurs.motDePasse}</p>}
              </div>}
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => navigate(-1)} className="medibook-btn-outline">Annuler</button>
            <button type="submit" disabled={saving} className="medibook-btn">{saving ? 'Enregistrement...' : 'Enregistrer'}</button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default SecretaireFormPage;
