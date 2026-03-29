import { useNavigate, useParams } from 'react-router-dom';
import DashboardLayout from '@/layouts/DashboardLayout';
import { ArrowLeft, Upload, Loader2 } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { cabinetService } from '../services/cabinetService';
import { CABINET_ERREURS } from '../messages/cabinet.erreurs';
import { CABINET_SUCCES } from '../messages/cabinet.succes';
import { validerCabinetForm } from '../logique/cabinet.validation';
import type { CabinetCreateDTO } from '../types/cabinet.types';
import { toast } from 'sonner';

type ErreursChamp = Record<string, string>;

interface BackendErrorPayload {
  message?: string;
  errors?: unknown;
  error?: {
    code?: string;
    description?: string;
    details?: unknown;
  };
}

const ErreurChamp = ({ id, message }: { id: string; message?: string }) =>
  message ? <p id={id} className="mt-1 text-xs text-destructive">{message}</p> : null;

const estObjet = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const extraireErreursChamp = (payload?: BackendErrorPayload): ErreursChamp => {
  const sources = [payload?.errors, payload?.error?.details];

  for (const source of sources) {
    if (!estObjet(source)) continue;

    const erreurs = Object.entries(source).reduce<ErreursChamp>((acc, [champ, message]) => {
      if (typeof message === 'string' && message.trim()) {
        acc[champ] = message;
      }
      return acc;
    }, {});

    if (Object.keys(erreurs).length > 0) {
      return erreurs;
    }
  }

  return {};
};

const mapperMessageVersErreursChamp = (message?: string): ErreursChamp => {
  if (!message) return {};

  if (message === CABINET_ERREURS.NOM_DEJA_EXISTANT) {
    return { nom: message };
  }

  if (message === CABINET_ERREURS.EMAIL_DEJA_UTILISE) {
    return { email: message };
  }

  if (message === CABINET_ERREURS.ADMIN_EMAIL_DEJA_UTILISE) {
    return { adminEmail: message };
  }

  if (message === CABINET_ERREURS.ADMIN_TELEPHONE_DEJA_UTILISE) {
    return { adminTelephone: message };
  }

  if (message.includes("téléphone") && !message.includes("administrateur")) {
    return { telephone: message };
  }

  return {};
};

const CabinetFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(!!id);
  const [submitting, setSubmitting] = useState(false);
  const [logo, setLogo] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [erreurs, setErreurs] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isEdit = !!id;

  const [form, setForm] = useState({
    nom: '', adresse: '', telephone: '', email: '',
    couleurPrimaire: '#2E7D32', couleurSecondaire: '#66BB6A',
    adminPrenom: '', adminNom: '', adminEmail: '',
    adminTelephone: '', adminPassword: '',
  });

  useEffect(() => {
    if (!id) return;
    const charger = async () => {
      try {
        const res = await cabinetService.detail(Number(id));
        const c = res.data;
        setForm({
          nom: c.nom, adresse: c.adresse, telephone: c.telephone, email: c.email,
          couleurPrimaire: c.couleurPrimaire || '#2E7D32',
          couleurSecondaire: c.couleurSecondaire || '#66BB6A',
          adminPrenom: c.admin?.prenom || '', adminNom: c.admin?.nom || '',
          adminEmail: c.admin?.email || '', adminTelephone: c.admin?.telephone || '',
          adminPassword: '',
        });
        if (c.logo) setLogoPreview(c.logo);
      } catch {
        toast.error(CABINET_ERREURS.CABINET_NON_TROUVE);
        navigate('/super-admin/cabinets');
      } finally {
        setLoading(false);
      }
    };
    charger();
  }, [id, navigate]);

  const afficherErreursChamps = (nouvellesErreurs: ErreursChamp) => {
    setErreurs(nouvellesErreurs);

    const premierChamp = Object.keys(nouvellesErreurs)[0];
    if (!premierChamp) return;

    requestAnimationFrame(() => {
      const champ = document.querySelector<HTMLElement>(`[name="${premierChamp}"]`);
      champ?.focus();
    });
  };

  const update = (key: string, val: string) => {
    setForm(f => ({ ...f, [key]: val }));
    if (erreurs[key]) setErreurs(e => { const copy = { ...e }; delete copy[key]; return copy; });
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogo(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const dto: CabinetCreateDTO = {
      nom: form.nom, adresse: form.adresse, telephone: form.telephone, email: form.email,
      couleurPrimaire: form.couleurPrimaire, couleurSecondaire: form.couleurSecondaire,
      adminNom: form.adminNom, adminPrenom: form.adminPrenom,
      adminEmail: form.adminEmail, adminTelephone: form.adminTelephone,
      adminPassword: form.adminPassword,
    };

    // Validation côté client
    const validation = validerCabinetForm(dto, isEdit);
    if (Object.keys(validation).length > 0) {
      afficherErreursChamps(validation);
      return;
    }

    setErreurs({});
    setSubmitting(true);
    try {
      if (isEdit) {
        await cabinetService.update(Number(id), dto, logo || undefined);
        toast.success(CABINET_SUCCES.MODIFICATION_REUSSIE);
      } else {
        await cabinetService.create(dto, logo || undefined);
        toast.success(CABINET_SUCCES.CREATION_REUSSIE);
      }
      navigate('/super-admin/cabinets');
    } catch (error: unknown) {
      const data = estObjet(error) && 'response' in error && estObjet(error.response) && 'data' in error.response
        ? error.response.data as BackendErrorPayload
        : undefined;

      const erreursChamps = extraireErreursChamp(data);
      if (Object.keys(erreursChamps).length > 0) {
        afficherErreursChamps(erreursChamps);
        return;
      }

      const messageErreur = data?.message || data?.error?.description;
      const erreursMetier = mapperMessageVersErreursChamp(messageErreur);
      if (Object.keys(erreursMetier).length > 0) {
        afficherErreursChamps(erreursMetier);
        return;
      }

      const msg = messageErreur
        || (isEdit ? CABINET_ERREURS.MODIFICATION_ECHOUEE : CABINET_ERREURS.CREATION_ECHOUEE);
      toast.error(msg);
    } finally {
      setSubmitting(false);
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

  if (loading) return (
    <DashboardLayout title={isEdit ? 'Modifier le cabinet' : 'Nouveau cabinet'}>
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout title={isEdit ? 'Modifier le cabinet' : 'Nouveau cabinet'}>
      <div className="space-y-6 max-w-4xl">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft size={18} /> Retour
        </button>

        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          <div className="medibook-card">
            <h3 className="font-semibold mb-4">Informations du cabinet</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-secondary-foreground mb-1.5 block">Nom</label>
                <input value={form.nom} onChange={e => update('nom', e.target.value)} {...inputProps('nom')} />
                <ErreurChamp id="nom-error" message={erreurs.nom} />
              </div>
              <div>
                <label className="text-sm font-medium text-secondary-foreground mb-1.5 block">Adresse</label>
                <input value={form.adresse} onChange={e => update('adresse', e.target.value)} {...inputProps('adresse')} />
                <ErreurChamp id="adresse-error" message={erreurs.adresse} />
              </div>
              <div>
                <label className="text-sm font-medium text-secondary-foreground mb-1.5 block">Téléphone</label>
                <input value={form.telephone} onChange={e => update('telephone', e.target.value)} placeholder="+221 33 123 45 67" {...inputProps('telephone')} />
                <ErreurChamp id="telephone-error" message={erreurs.telephone} />
              </div>
              <div>
                <label className="text-sm font-medium text-secondary-foreground mb-1.5 block">Email</label>
                <input type="email" value={form.email} onChange={e => update('email', e.target.value)} {...inputProps('email')} />
                <ErreurChamp id="email-error" message={erreurs.email} />
              </div>
              <div>
                <label className="text-sm font-medium text-secondary-foreground mb-1.5 block">Couleur primaire</label>
                <div className="flex items-center gap-2"><input type="color" value={form.couleurPrimaire} onChange={e => update('couleurPrimaire', e.target.value)} className="h-10 w-14 rounded-lg border cursor-pointer" name="couleurPrimaire" aria-invalid={Boolean(erreurs.couleurPrimaire)} aria-describedby={erreurs.couleurPrimaire ? 'couleurPrimaire-error' : undefined} /><span className="text-sm text-muted-foreground">{form.couleurPrimaire}</span></div>
                <ErreurChamp id="couleurPrimaire-error" message={erreurs.couleurPrimaire} />
              </div>
              <div>
                <label className="text-sm font-medium text-secondary-foreground mb-1.5 block">Couleur secondaire</label>
                <div className="flex items-center gap-2"><input type="color" value={form.couleurSecondaire} onChange={e => update('couleurSecondaire', e.target.value)} className="h-10 w-14 rounded-lg border cursor-pointer" name="couleurSecondaire" aria-invalid={Boolean(erreurs.couleurSecondaire)} aria-describedby={erreurs.couleurSecondaire ? 'couleurSecondaire-error' : undefined} /><span className="text-sm text-muted-foreground">{form.couleurSecondaire}</span></div>
                <ErreurChamp id="couleurSecondaire-error" message={erreurs.couleurSecondaire} />
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-secondary-foreground mb-1.5 block">Logo</label>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleLogoChange} className="hidden" />
                <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-input rounded-2xl p-8 text-center hover:border-primary transition-colors cursor-pointer">
                  {logoPreview ? (
                    <img src={logoPreview} alt="Logo" className="mx-auto h-20 object-contain" />
                  ) : (
                    <>
                      <Upload size={32} className="mx-auto text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">Cliquez pour sélectionner un logo</p>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="medibook-card">
            <h3 className="font-semibold mb-4">Administrateur du cabinet</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-secondary-foreground mb-1.5 block">Prénom</label>
                <input value={form.adminPrenom} onChange={e => update('adminPrenom', e.target.value)} {...inputProps('adminPrenom')} />
                <ErreurChamp id="adminPrenom-error" message={erreurs.adminPrenom} />
              </div>
              <div>
                <label className="text-sm font-medium text-secondary-foreground mb-1.5 block">Nom</label>
                <input value={form.adminNom} onChange={e => update('adminNom', e.target.value)} {...inputProps('adminNom')} />
                <ErreurChamp id="adminNom-error" message={erreurs.adminNom} />
              </div>
              <div>
                <label className="text-sm font-medium text-secondary-foreground mb-1.5 block">Email</label>
                <input type="email" value={form.adminEmail} onChange={e => update('adminEmail', e.target.value)} {...inputProps('adminEmail')} />
                <ErreurChamp id="adminEmail-error" message={erreurs.adminEmail} />
              </div>
              <div>
                <label className="text-sm font-medium text-secondary-foreground mb-1.5 block">Téléphone</label>
                <input value={form.adminTelephone} onChange={e => update('adminTelephone', e.target.value)} placeholder="+221 77 123 45 67" {...inputProps('adminTelephone')} />
                <ErreurChamp id="adminTelephone-error" message={erreurs.adminTelephone} />
              </div>
              {!isEdit && (
                <div>
                  <label className="text-sm font-medium text-secondary-foreground mb-1.5 block">Mot de passe</label>
                  <input type="password" value={form.adminPassword} onChange={e => update('adminPassword', e.target.value)} {...inputProps('adminPassword')} />
                  <ErreurChamp id="adminPassword-error" message={erreurs.adminPassword} />
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => navigate(-1)} className="medibook-btn-outline">Annuler</button>
            <button type="submit" disabled={submitting} className="medibook-btn">
              {submitting ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default CabinetFormPage;
