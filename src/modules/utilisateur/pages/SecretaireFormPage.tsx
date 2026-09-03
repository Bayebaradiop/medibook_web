import { useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect, useCallback, useRef } from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { secretaireService } from '../services/utilisateurService';
import { validerSecretaireForm } from '../logique/utilisateur.validation';
import { UTILISATEUR_ERREURS } from '../messages/utilisateur.erreurs';
import { UTILISATEUR_SUCCES } from '../messages/utilisateur.succes';
import type { Secretaire } from '../types/utilisateur.types';
import {
  ArrowLeft,
  Loader2,
  User,
  Mail,
  Phone,
  UserCheck,
  Camera,
  X,
  CheckCircle2
} from 'lucide-react';
import { FormSkeleton } from '@/components/common/SkeletonLoaders';
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
  message ? (
    <p id={id} className="mt-1.5 text-xs font-medium text-destructive flex items-center gap-1">
      <span className="inline-block w-1.5 h-1.5 rounded-full bg-destructive" />
      {message}
    </p>
  ) : null;

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

  return erreurs;
};

const SecretaireFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id && id !== 'nouveau';
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loadingInit, setLoadingInit] = useState(true);
  const [saving, setSaving] = useState(false);
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [erreurs, setErreurs] = useState<Record<string, string>>({});

  const [form, setForm] = useState({
    prenom: '',
    nom: '',
    email: '',
    telephone: '',
    motDePasse: '',
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
      if (isEdit) {
        const res = await secretaireService.detail(Number(id));
        const s: Secretaire = res.data;
        setForm({
          prenom: s.prenom,
          nom: s.nom,
          email: s.email,
          telephone: s.telephone,
          motDePasse: '',
        });
        if (s.photo) setPhotoPreview(s.photo);
      }
    } catch (error: unknown) {
      const data = estObjet(error) && 'response' in error && estObjet(error.response) && 'data' in error.response && estObjet(error.response.data)
        ? error.response.data
        : undefined;

      const message = typeof data?.message === 'string' ? data.message : undefined;
      toast.error(message || "Erreur de chargement");
      navigate('/admin/secretaires');
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

  const removePhoto = () => {
    setPhoto(null);
    setPhotoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const data = {
      prenom: form.prenom,
      nom: form.nom,
      email: form.email,
      telephone: form.telephone,
      motDePasse: form.motDePasse || 'passer123',
    };

    const validation = validerSecretaireForm(data, !isEdit);
    if (Object.keys(validation).length > 0) {
      afficherErreursChamps(validation);
      return;
    }

    setErreurs({});
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
        || (isEdit ? UTILISATEUR_ERREURS.MODIFICATION_SECRETAIRE_ECHOUEE : UTILISATEUR_ERREURS.CREATION_SECRETAIRE_ECHOUEE));
    } finally {
      setSaving(false);
    }
  };

  const inputClass = (champ: string) =>
    `medibook-input w-full pl-11 transition-all ${erreurs[champ] ? 'border-destructive ring-2 ring-destructive/20' : ''}`;

  const inputProps = (champ: string) => ({
    name: champ,
    className: inputClass(champ),
    'aria-invalid': Boolean(erreurs[champ]),
    'aria-describedby': erreurs[champ] ? `${champ}-error` : undefined,
  });

  if (loadingInit) return (
    <DashboardLayout title="Secrétaire">
      <FormSkeleton />
    </DashboardLayout>
  );

  return (
    <DashboardLayout title={isEdit ? 'Modifier la secrétaire' : 'Nouvelle secrétaire'}>
      <div className="space-y-8 max-w-3xl mx-auto pb-12">
        {/* Navigation retour */}
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Retour
        </button>

        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          {/* SECTION PHOTO DE PROFIL */}
          <div className="medibook-card flex flex-col items-center justify-center py-8 relative">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhoto}
              className="hidden"
            />

            <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              {photoPreview ? (
                <div className="relative">
                  <img
                    src={photoPreview}
                    alt="Aperçu photo"
                    className="w-28 h-28 rounded-full object-cover ring-4 ring-primary/20 shadow-md"
                  />
                  <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                    <Camera size={24} />
                  </div>
                </div>
              ) : (
                <div className="w-28 h-28 rounded-full border-2 border-dashed border-border group-hover:border-primary bg-secondary/30 flex flex-col items-center justify-center text-muted-foreground group-hover:text-primary transition-colors shadow-inner">
                  <Camera size={28} />
                  <span className="text-[10px] font-semibold mt-1">Photo</span>
                </div>
              )}
            </div>

            <div className="text-center mt-3 space-y-1">
              <p className="text-xs font-semibold text-foreground">Photo de profil de la secrétaire</p>
              <p className="text-[11px] text-muted-foreground">Cliquez sur le cercle pour importer une image (PNG, JPG)</p>
              {photoPreview && (
                <button
                  type="button"
                  onClick={removePhoto}
                  className="text-xs font-semibold text-destructive hover:underline inline-flex items-center gap-1 pt-1"
                >
                  <X size={12} /> Supprimer la photo
                </button>
              )}
            </div>
          </div>

          {/* SECTION INFORMATIONS SECRÉTAIRE */}
          <div className="medibook-card space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-border/60">
              <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                <UserCheck size={20} />
              </div>
              <div>
                <h3 className="font-bold text-base text-foreground">Identité & Coordonnées</h3>
                <p className="text-xs text-muted-foreground">Renseignez les informations administratives de la secrétaire</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Prénom */}
              <div>
                <label className="text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5 block">
                  Prénom <span className="text-destructive">*</span>
                </label>
                <div className="relative">
                  <User size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    value={form.prenom}
                    onChange={e => update('prenom', e.target.value)}
                    placeholder="Prénom de la secrétaire"
                    {...inputProps('prenom')}
                  />
                </div>
                <ErreurChamp id="prenom-error" message={erreurs.prenom} />
              </div>

              {/* Nom */}
              <div>
                <label className="text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5 block">
                  Nom <span className="text-destructive">*</span>
                </label>
                <div className="relative">
                  <User size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    value={form.nom}
                    onChange={e => update('nom', e.target.value)}
                    placeholder="Nom de la secrétaire"
                    {...inputProps('nom')}
                  />
                </div>
                <ErreurChamp id="nom-error" message={erreurs.nom} />
              </div>

              {/* Email */}
              <div>
                <label className="text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5 block">
                  Email Professionnel <span className="text-destructive">*</span>
                </label>
                <div className="relative">
                  <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="email"
                    value={form.email}
                    onChange={e => update('email', e.target.value)}
                    placeholder="secretaire@medibook.sn"
                    {...inputProps('email')}
                  />
                </div>
                <ErreurChamp id="email-error" message={erreurs.email} />
              </div>

              {/* Téléphone */}
              <div>
                <label className="text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5 block">
                  Téléphone Portable <span className="text-destructive">*</span>
                </label>
                <div className="relative">
                  <Phone size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    value={form.telephone}
                    onChange={e => update('telephone', e.target.value)}
                    placeholder="+221 77 123 45 67"
                    {...inputProps('telephone')}
                  />
                </div>
                <ErreurChamp id="telephone-error" message={erreurs.telephone} />
              </div>
            </div>
          </div>

          {/* BARRE D'ACTIONS */}
          <div className="flex items-center justify-end gap-4 pt-4 border-t border-border/80">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="medibook-btn-outline px-6"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={saving}
              className="medibook-btn flex items-center gap-2 px-8 min-w-[180px] justify-center"
            >
              {saving ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  <span>Enregistrement...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={18} />
                  <span>{isEdit ? 'Enregistrer les modifications' : 'Créer la secrétaire'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default SecretaireFormPage;
