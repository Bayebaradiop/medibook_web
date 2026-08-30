import { useNavigate, useParams } from 'react-router-dom';
import DashboardLayout from '@/layouts/DashboardLayout';
import {
  ArrowLeft,
  Upload,
  Loader2,
  Building2,
  MapPin,
  Phone,
  Mail,
  Palette,
  ShieldCheck,
  User,
  Lock,
  Sparkles,
  CheckCircle2,
  X,
  Image as ImageIcon
} from 'lucide-react';
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
  message ? (
    <p id={id} className="mt-1.5 text-xs font-medium text-destructive flex items-center gap-1">
      <span className="inline-block w-1.5 h-1.5 rounded-full bg-destructive" />
      {message}
    </p>
  ) : null;

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
    couleurPrimaire: '#2F7D79', couleurSecondaire: '#4FA7A1',
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
          couleurPrimaire: c.couleurPrimaire || '#2F7D79',
          couleurSecondaire: c.couleurSecondaire || '#4FA7A1',
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

  const removeLogo = () => {
    setLogo(null);
    setLogoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
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
    `medibook-input w-full pl-11 transition-all ${erreurs[champ] ? 'border-destructive ring-2 ring-destructive/20' : ''}`;

  const inputProps = (champ: string) => ({
    name: champ,
    className: inputClass(champ),
    'aria-invalid': Boolean(erreurs[champ]),
    'aria-describedby': erreurs[champ] ? `${champ}-error` : undefined,
  });

  if (loading) return (
    <DashboardLayout title={isEdit ? 'Modifier le cabinet' : 'Nouveau cabinet'}>
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <Loader2 className="animate-spin text-primary" size={36} />
        <p className="text-sm font-medium text-muted-foreground">Chargement des données du cabinet...</p>
      </div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout title={isEdit ? 'Modifier le cabinet' : 'Nouveau cabinet'}>
      <div className="max-w-4xl mx-auto space-y-8 pb-12">
        {/* Navigation retour & En-tête */}
        <div className="space-y-4">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            Retour à la gestion des cabinets
          </button>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-card border border-border/80 shadow-xs">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-primary/15 text-primary flex items-center justify-center shrink-0 border border-primary/20 shadow-inner">
                <Building2 size={28} />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                  {isEdit ? 'Modifier le cabinet médical' : 'Créer un nouveau cabinet'}
                </h1>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {isEdit
                    ? 'Mettez à jour les informations et la charte graphique de ce cabinet.'
                    : 'Renseignez l\'établissement, sa charte visuelle et attribuez son administrateur principal.'}
                </p>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-2 bg-background/80 px-3.5 py-1.5 rounded-full border border-border text-xs font-semibold text-primary">
              <Sparkles size={14} />
              Module Super-Admin
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8" noValidate>
          {/* SECTION 1: INFORMATIONS DU CABINET */}
          <div className="medibook-card overflow-hidden">
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-border/60">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                  1
                </div>
                <div>
                  <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                    Informations Générales
                  </h3>
                  <p className="text-xs text-muted-foreground">Coordonnées et contact de l'établissement</p>
                </div>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-secondary text-secondary-foreground">
                Établissement
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Nom */}
              <div>
                <label className="text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5 block">
                  Nom du Cabinet <span className="text-destructive">*</span>
                </label>
                <div className="relative">
                  <Building2 size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    value={form.nom}
                    onChange={e => update('nom', e.target.value)}
                    placeholder="ex: Cabinet Médical Saint-Michel"
                    {...inputProps('nom')}
                  />
                </div>
                <ErreurChamp id="nom-error" message={erreurs.nom} />
              </div>

              {/* Adresse */}
              <div>
                <label className="text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5 block">
                  Adresse Physique <span className="text-destructive">*</span>
                </label>
                <div className="relative">
                  <MapPin size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    value={form.adresse}
                    onChange={e => update('adresse', e.target.value)}
                    placeholder="ex: 124 Avenue Cheikh Anta Diop, Dakar"
                    {...inputProps('adresse')}
                  />
                </div>
                <ErreurChamp id="adresse-error" message={erreurs.adresse} />
              </div>

              {/* Téléphone */}
              <div>
                <label className="text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5 block">
                  Téléphone Professionnel <span className="text-destructive">*</span>
                </label>
                <div className="relative">
                  <Phone size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    value={form.telephone}
                    onChange={e => update('telephone', e.target.value)}
                    placeholder="+221 33 821 45 67"
                    {...inputProps('telephone')}
                  />
                </div>
                <ErreurChamp id="telephone-error" message={erreurs.telephone} />
              </div>

              {/* Email */}
              <div>
                <label className="text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5 block">
                  Email de Contact <span className="text-destructive">*</span>
                </label>
                <div className="relative">
                  <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="email"
                    value={form.email}
                    onChange={e => update('email', e.target.value)}
                    placeholder="contact@cabinet-saintmichel.sn"
                    {...inputProps('email')}
                  />
                </div>
                <ErreurChamp id="email-error" message={erreurs.email} />
              </div>
            </div>
          </div>

          {/* SECTION 2: BRANDING & IDENTITÉ VISUELLE */}
          <div className="medibook-card overflow-hidden">
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-border/60">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                  2
                </div>
                <div>
                  <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                    Identité Visuelle & Thème
                  </h3>
                  <p className="text-xs text-muted-foreground">Couleurs de marque et logo personnalisé</p>
                </div>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-secondary text-secondary-foreground">
                Personnalisation
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Couleur Primaire */}
              <div className="p-4 rounded-2xl bg-secondary/30 border border-border/60 space-y-2">
                <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
                  Couleur Primaire (Thème principal)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={form.couleurPrimaire}
                    onChange={e => update('couleurPrimaire', e.target.value)}
                    className="h-11 w-14 rounded-xl border-2 border-border cursor-pointer overflow-hidden p-0.5 bg-background shadow-sm"
                    name="couleurPrimaire"
                  />
                  <div className="flex-1">
                    <span className="font-mono text-sm font-bold text-foreground block uppercase">
                      {form.couleurPrimaire}
                    </span>
                    <span className="text-xs text-muted-foreground">Couleur de fond des boutons et en-têtes</span>
                  </div>
                  <div
                    className="w-8 h-8 rounded-xl border border-border shadow-inner"
                    style={{ backgroundColor: form.couleurPrimaire }}
                  />
                </div>
                <ErreurChamp id="couleurPrimaire-error" message={erreurs.couleurPrimaire} />
              </div>

              {/* Couleur Secondaire */}
              <div className="p-4 rounded-2xl bg-secondary/30 border border-border/60 space-y-2">
                <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
                  Couleur Secondaire (Accents)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={form.couleurSecondaire}
                    onChange={e => update('couleurSecondaire', e.target.value)}
                    className="h-11 w-14 rounded-xl border-2 border-border cursor-pointer overflow-hidden p-0.5 bg-background shadow-sm"
                    name="couleurSecondaire"
                  />
                  <div className="flex-1">
                    <span className="font-mono text-sm font-bold text-foreground block uppercase">
                      {form.couleurSecondaire}
                    </span>
                    <span className="text-xs text-muted-foreground">Couleur des badges et états secondaires</span>
                  </div>
                  <div
                    className="w-8 h-8 rounded-xl border border-border shadow-inner"
                    style={{ backgroundColor: form.couleurSecondaire }}
                  />
                </div>
                <ErreurChamp id="couleurSecondaire-error" message={erreurs.couleurSecondaire} />
              </div>

              {/* Logo Upload */}
              <div className="md:col-span-2">
                <label className="text-xs font-semibold text-foreground uppercase tracking-wider mb-2 block">
                  Logo Officiel du Cabinet
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  className="hidden"
                />

                {logoPreview ? (
                  <div className="relative p-6 rounded-2xl border border-primary/30 bg-primary/5 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-20 h-20 rounded-xl bg-white dark:bg-slate-900 border border-border p-2 flex items-center justify-center shadow-sm">
                        <img src={logoPreview} alt="Logo Cabinet" className="max-h-full max-w-full object-contain" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-foreground flex items-center gap-1.5">
                          <CheckCircle2 size={16} className="text-emerald-500" />
                          Logo importé avec succès
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Cliquez ci-dessous pour modifier ou supprimer l'image.
                        </p>
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="mt-2 text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1"
                        >
                          <Upload size={12} />
                          Remplacer le fichier
                        </button>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={removeLogo}
                      className="p-2 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                      title="Supprimer l'image"
                    >
                      <X size={20} />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="group border-2 border-dashed border-border hover:border-primary rounded-2xl p-8 text-center transition-all cursor-pointer bg-background hover:bg-primary/5"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-secondary group-hover:bg-primary/10 text-muted-foreground group-hover:text-primary flex items-center justify-center mx-auto mb-3 transition-colors">
                      <ImageIcon size={24} />
                    </div>
                    <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                      Cliquez pour importer le logo du cabinet
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Formats supportés : PNG, JPG, WEBP, SVG (Max 5 Mo)
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* SECTION 3: ADMINISTRATEUR DU CABINET */}
          <div className="medibook-card overflow-hidden">
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-border/60">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                  3
                </div>
                <div>
                  <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                    Administrateur Référent
                  </h3>
                  <p className="text-xs text-muted-foreground">Compte d'accès principal pour la gestion du cabinet</p>
                </div>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-secondary text-secondary-foreground">
                Accès & Gestion
              </span>
            </div>

            <div className="mb-6 p-4 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-sky-700 dark:text-sky-300 text-xs leading-relaxed flex items-start gap-3">
              <ShieldCheck size={18} className="shrink-0 mt-0.5 text-sky-600 dark:text-sky-400" />
              <div>
                <span className="font-bold">Attribution des privilèges :</span> L'administrateur aura le contrôle total de son cabinet (création  des médecins, gestion des secrétaires et des rendez-vous).
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Prénom Admin */}
              <div>
                <label className="text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5 block">
                  Prénom <span className="text-destructive">*</span>
                </label>
                <div className="relative">
                  <User size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    value={form.adminPrenom}
                    onChange={e => update('adminPrenom', e.target.value)}
                    placeholder="Moussa"
                    {...inputProps('adminPrenom')}
                  />
                </div>
                <ErreurChamp id="adminPrenom-error" message={erreurs.adminPrenom} />
              </div>

              {/* Nom Admin */}
              <div>
                <label className="text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5 block">
                  Nom <span className="text-destructive">*</span>
                </label>
                <div className="relative">
                  <User size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    value={form.adminNom}
                    onChange={e => update('adminNom', e.target.value)}
                    placeholder="Ndiaye"
                    {...inputProps('adminNom')}
                  />
                </div>
                <ErreurChamp id="adminNom-error" message={erreurs.adminNom} />
              </div>

              {/* Email Admin */}
              <div>
                <label className="text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5 block">
                  Email de Connexion <span className="text-destructive">*</span>
                </label>
                <div className="relative">
                  <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="email"
                    value={form.adminEmail}
                    onChange={e => update('adminEmail', e.target.value)}
                    placeholder="admin.saintmichel@medibook.sn"
                    {...inputProps('adminEmail')}
                  />
                </div>
                <ErreurChamp id="adminEmail-error" message={erreurs.adminEmail} />
              </div>

              {/* Téléphone Admin */}
              <div>
                <label className="text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5 block">
                  Téléphone Portable <span className="text-destructive">*</span>
                </label>
                <div className="relative">
                  <Phone size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    value={form.adminTelephone}
                    onChange={e => update('adminTelephone', e.target.value)}
                    placeholder="+221 77 123 45 67"
                    {...inputProps('adminTelephone')}
                  />
                </div>
                <ErreurChamp id="adminTelephone-error" message={erreurs.adminTelephone} />
              </div>

              {/* Password Admin */}
              {!isEdit && (
                <div className="md:col-span-2">
                  <label className="text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5 block">
                    Mot de Passe Initial <span className="text-destructive">*</span>
                  </label>
                  <div className="relative">
                    <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="password"
                      value={form.adminPassword}
                      onChange={e => update('adminPassword', e.target.value)}
                      placeholder="••••••••••••"
                      {...inputProps('adminPassword')}
                    />
                  </div>
                  <ErreurChamp id="adminPassword-error" message={erreurs.adminPassword} />
                  <p className="text-xs text-muted-foreground mt-1.5">
                    Le mot de passe doit contenir au moins 6 caractères. L'administrateur pourra le réinitialiser plus tard.
                  </p>
                </div>
              )}
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
              disabled={submitting}
              className="medibook-btn flex items-center gap-2 px-8 min-w-[180px] justify-center"
            >
              {submitting ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  <span>Enregistrement...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={18} />
                  <span>{isEdit ? 'Enregistrer les modifications' : 'Créer le cabinet'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default CabinetFormPage;
