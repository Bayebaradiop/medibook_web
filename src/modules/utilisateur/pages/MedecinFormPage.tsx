import { useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { medecinService } from '../services/utilisateurService';
import { specialiteService } from '@/modules/specialite/services/specialiteService';
import { validerMedecinForm } from '../logique/utilisateur.validation';
import { UTILISATEUR_ERREURS } from '../messages/utilisateur.erreurs';
import { UTILISATEUR_SUCCES } from '../messages/utilisateur.succes';
import type { Medecin } from '../types/utilisateur.types';
import type { Specialite } from '@/modules/specialite/types/specialite.types';
import { ArrowLeft, Upload, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

type ErreursChamp = Record<string, string>;

interface BackendErrorPayload {
  message?: string;
  error?: {
    description?: string;
    details?: unknown;
  };
}

const ErreurChamp = ({ id, message }: { id: string; message?: string }) =>
  message ? <p id={id} className="mt-1 text-xs text-destructive">{message}</p> : null;

const estObjet = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const extraireErreursChamp = (payload?: BackendErrorPayload): ErreursChamp => {
  const details = payload?.error?.details;
  if (!estObjet(details)) return {};

  return Object.entries(details).reduce<ErreursChamp>((acc, [champ, message]) => {
    if (typeof message === 'string' && message.trim()) {
      acc[champ] = message;
    }
    return acc;
  }, {});
};

const mapperMessageVersErreursChamp = (message?: string): ErreursChamp => {
  if (!message) return {};

  const normalise = message.toLowerCase();
  const erreurs: ErreursChamp = {};

  if (normalise.includes('email')) {
    erreurs.email = message;
  }

  if (normalise.includes('téléphone') || normalise.includes('telephone')) {
    erreurs.telephone = message;
  }

  if (normalise.includes('spécialité') || normalise.includes('specialite')) {
    erreurs.specialiteId = message;
  }

  if (normalise.includes('mot de passe') || normalise.includes('passe')) {
    erreurs.motDePasse = message;
  }

  return erreurs;
};

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

  const afficherErreursChamps = (nouvellesErreurs: ErreursChamp) => {
    setErreurs(nouvellesErreurs);

    const premierChamp = Object.keys(nouvellesErreurs)[0];
    if (!premierChamp) return;

    requestAnimationFrame(() => {
      const champ = document.querySelector<HTMLElement>(`[name="${premierChamp}"]`);
      champ?.focus();
    });
  };

  const update = (k: string, v: string) => {
    setForm(f => ({ ...f, [k]: v }));
    if (erreurs[k]) {
      setErreurs(prev => {
        const copy = { ...prev };
        delete copy[k];
        return copy;
      });
    }
  };

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
    } catch (error: unknown) {
      const data = estObjet(error) && 'response' in error && estObjet(error.response) && 'data' in error.response && estObjet(error.response.data)
        ? error.response.data
        : undefined;

      const message = typeof data?.message === 'string' ? data.message : undefined;
      toast.error(message || "Erreur de chargement");
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

    const validation = validerMedecinForm(data, !isEdit);
    if (Object.keys(validation).length > 0) {
      afficherErreursChamps(validation);
      return;
    }

    setErreurs({});
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
    } catch (error: unknown) {
      const resp = estObjet(error) && 'response' in error && estObjet(error.response) && 'data' in error.response
        ? error.response.data as BackendErrorPayload
        : undefined;

      const fieldErrors = extraireErreursChamp(resp);
      if (Object.keys(fieldErrors).length > 0) {
        afficherErreursChamps(fieldErrors);
        return;
      }

      const messageErreur = resp?.error?.description || resp?.message;
      const mappedErrors = mapperMessageVersErreursChamp(messageErreur);
      if (Object.keys(mappedErrors).length > 0) {
        afficherErreursChamps(mappedErrors);
        return;
      }

      toast.error(messageErreur
        || (isEdit ? UTILISATEUR_ERREURS.MODIFICATION_MEDECIN_ECHOUEE : UTILISATEUR_ERREURS.CREATION_MEDECIN_ECHOUEE));
    } finally {
      setSaving(false);
    }
  };

  const inputClass = (champ: string) =>
    `medibook-input w-full ${erreurs[champ] ? 'border-destructive ring-1 ring-destructive' : ''}`;

  const inputProps = (champ: string) => ({
    name: champ,
    className: inputClass(champ),
    'aria-invalid': Boolean(erreurs[champ]),
    'aria-describedby': erreurs[champ] ? `${champ}-error` : undefined,
  });

  if (loadingInit) return <DashboardLayout title="Médecin"><div className="flex justify-center py-12"><Loader2 className="animate-spin text-primary" size={32} /></div></DashboardLayout>;

  return (
    <DashboardLayout title={isEdit ? 'Modifier le médecin' : 'Nouveau médecin'}>
      <div className="space-y-6 max-w-3xl">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"><ArrowLeft size={18} /> Retour</button>
        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
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
                <input value={form.prenom} onChange={e => update('prenom', e.target.value)} {...inputProps('prenom')} />
                <ErreurChamp id="prenom-error" message={erreurs.prenom} />
              </div>
              <div>
                <label className="text-sm font-medium text-secondary-foreground mb-1.5 block">Nom</label>
                <input value={form.nom} onChange={e => update('nom', e.target.value)} {...inputProps('nom')} />
                <ErreurChamp id="nom-error" message={erreurs.nom} />
              </div>
              <div>
                <label className="text-sm font-medium text-secondary-foreground mb-1.5 block">Email</label>
                <input type="email" value={form.email} onChange={e => update('email', e.target.value)} {...inputProps('email')} />
                <ErreurChamp id="email-error" message={erreurs.email} />
              </div>
              <div>
                <label className="text-sm font-medium text-secondary-foreground mb-1.5 block">Téléphone</label>
                <input value={form.telephone} onChange={e => update('telephone', e.target.value)} {...inputProps('telephone')} />
                <ErreurChamp id="telephone-error" message={erreurs.telephone} />
              </div>
              <div>
                <label className="text-sm font-medium text-secondary-foreground mb-1.5 block">Spécialité</label>
                <select value={form.specialiteId} onChange={e => update('specialiteId', e.target.value)} {...inputProps('specialiteId')}>
                  <option value="">Sélectionner</option>
                  {specialites.map(s => <option key={s.id} value={s.id}>{s.nom}</option>)}
                </select>
                <ErreurChamp id="specialiteId-error" message={erreurs.specialiteId} />
              </div>
              {!isEdit && <div>
                <label className="text-sm font-medium text-secondary-foreground mb-1.5 block">Mot de passe</label>
                <input type="password" value={form.motDePasse} onChange={e => update('motDePasse', e.target.value)} {...inputProps('motDePasse')} />
                <ErreurChamp id="motDePasse-error" message={erreurs.motDePasse} />
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
