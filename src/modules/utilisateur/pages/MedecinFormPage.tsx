import { useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { medecinService } from '../services/utilisateurService';
import { specialiteService } from '@/modules/specialite/services/specialiteService';
import { UTILISATEUR_ERREURS } from '../messages/utilisateur.erreurs';
import { UTILISATEUR_SUCCES } from '../messages/utilisateur.succes';
import type { Medecin } from '../types/utilisateur.types';
import type { Specialite } from '@/modules/specialite/types/specialite.types';
import { ArrowLeft, Upload, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const MedecinFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id && id !== 'nouveau';

  const [specialites, setSpecialites] = useState<Specialite[]>([]);
  const [loadingInit, setLoadingInit] = useState(true);
  const [saving, setSaving] = useState(false);
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [erreurs, setErreurs] = useState<Record<string, string>>({});

  const [form, setForm] = useState({
    prenom: '', nom: '', email: '', telephone: '', specialiteId: '', motDePasse: '',
  });
  const update = (k: string, v: string) => { setForm(f => ({ ...f, [k]: v })); setErreurs(prev => ({ ...prev, [k]: '' })); };

  const charger = useCallback(async () => {
    try {
      const specsRes = await specialiteService.list();
      setSpecialites(specsRes.data);

      if (isEdit) {
        const res = await medecinService.detail(Number(id));
        const m: Medecin = res.data;
        setForm({
          prenom: m.prenom, nom: m.nom, email: m.email,
          telephone: m.telephone, specialiteId: String(m.specialiteId), motDePasse: '',
        });
        if (m.photo) setPhotoPreview(m.photo);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Erreur de chargement");
      navigate('/admin/medecins');
    } finally {
      setLoadingInit(false);
    }
  }, [id, isEdit, navigate]);

  useEffect(() => { charger(); }, [charger]);

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      prenom: form.prenom, nom: form.nom, email: form.email,
      telephone: form.telephone, specialiteId: Number(form.specialiteId),
      ...(form.motDePasse ? { motDePasse: form.motDePasse } : {}),
    };

    setSaving(true);
    try {
      if (isEdit) {
        await medecinService.update(Number(id), data, photo || undefined);
        toast.success(UTILISATEUR_SUCCES.MEDECIN_MODIFIE);
      } else {
        await medecinService.create(data, photo || undefined);
        toast.success(UTILISATEUR_SUCCES.MEDECIN_CREE);
      }
      navigate('/admin/medecins');
    } catch (err: any) {
      const resp = err.response?.data;
      const fieldErrors = resp?.error?.details;
      if (fieldErrors && typeof fieldErrors === 'object') {
        setErreurs(fieldErrors);
        const messages = Object.values(fieldErrors) as string[];
        toast.error(messages.join(' • '));
      } else {
        toast.error(resp?.error?.description || resp?.message
          || (isEdit ? UTILISATEUR_ERREURS.MODIFICATION_MEDECIN_ECHOUEE : UTILISATEUR_ERREURS.CREATION_MEDECIN_ECHOUEE));
      }
    } finally {
      setSaving(false);
    }
  };

  if (loadingInit) return <DashboardLayout title="Médecin"><div className="flex justify-center py-12"><Loader2 className="animate-spin text-primary" size={32} /></div></DashboardLayout>;

  return (
    <DashboardLayout title={isEdit ? 'Modifier le médecin' : 'Nouveau médecin'}>
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
              <div>
                <label className="text-sm font-medium text-secondary-foreground mb-1.5 block">Spécialité</label>
                <select value={form.specialiteId} onChange={e => update('specialiteId', e.target.value)} className={`medibook-input w-full ${erreurs.specialiteId ? 'border-destructive' : ''}`} required>
                  <option value="">Sélectionner</option>
                  {specialites.map(s => <option key={s.id} value={s.id}>{s.nom}</option>)}
                </select>
                {erreurs.specialiteId && <p className="text-xs text-destructive mt-1">{erreurs.specialiteId}</p>}
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

export default MedecinFormPage;
