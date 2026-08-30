import { useEffect, useState } from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { ROLE_LABELS } from '@/utils/constants';
import { toast } from 'sonner';
import { AUTH_ERREURS } from '@/modules/auth/messages/auth.erreurs';
import { AUTH_SUCCES } from '@/modules/auth/messages/auth.succes';
import { UTILISATEUR_ERREURS } from '@/modules/utilisateur/messages/utilisateur.erreurs';
import {
  User,
  Mail,
  Phone,
  Shield,
  ShieldCheck,
  Edit3,
  Check,
  X,
  Camera,
  Loader2,
  Lock,
  Sparkles,
  Building2,
  BadgeCheck,
  CheckCircle2,
} from 'lucide-react';

const TEL_REGEX = /^[+]?[0-9][0-9\s\-()]{7,19}$/;

const mapperMessageVersErreursChamp = (message?: string): Record<string, string> => {
  if (!message) return {};

  const normalise = message.toLowerCase();
  const erreurs: Record<string, string> = {};

  if (normalise.includes('prénom') || normalise.includes('prenom')) {
    erreurs.prenom = message;
  }

  if (!(normalise.includes('prénom') || normalise.includes('prenom')) && normalise.includes('nom')) {
    erreurs.nom = message;
  }

  if (normalise.includes('téléphone') || normalise.includes('telephone')) {
    erreurs.telephone = message;
  }

  return erreurs;
};

const ProfilePage = () => {
  const { user, updateProfile } = useAuth();
  const role = user?.role;
  const [editing, setEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [erreurs, setErreurs] = useState<Record<string, string>>({});
  const [form, setForm] = useState({
    prenom: user?.prenom || '',
    nom: user?.nom || '',
    telephone: user?.telephone || '',
  });

  useEffect(() => {
    setForm({
      prenom: user?.prenom || '',
      nom: user?.nom || '',
      telephone: user?.telephone || '',
    });
  }, [user]);

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

  const getInitials = () => `${user?.prenom?.[0] || ''}${user?.nom?.[0] || ''}`;

  const handleCancel = () => {
    setForm({
      prenom: user?.prenom || '',
      nom: user?.nom || '',
      telephone: user?.telephone || '',
    });
    setErreurs({});
    setEditing(false);
  };

  const handleSave = async () => {
    const fieldErrors: Record<string, string> = {};
    if (!form.prenom.trim()) fieldErrors.prenom = AUTH_ERREURS.PRENOM_REQUIS;
    if (!form.nom.trim()) fieldErrors.nom = AUTH_ERREURS.NOM_REQUIS;
    if (form.telephone.trim() && !TEL_REGEX.test(form.telephone.trim())) {
      fieldErrors.telephone = UTILISATEUR_ERREURS.TELEPHONE_INVALIDE;
    }
    setErreurs(fieldErrors);
    if (Object.keys(fieldErrors).length > 0) return;

    setIsSaving(true);
    try {
      await updateProfile({
        prenom: form.prenom.trim(),
        nom: form.nom.trim(),
        telephone: form.telephone.trim(),
      });
      toast.success(AUTH_SUCCES.PROFIL_MIS_A_JOUR);
      setEditing(false);
    } catch (error: unknown) {
      const message =
        typeof error === "object" &&
        error !== null &&
        "response" in error &&
        typeof error.response === "object" &&
        error.response !== null &&
        "data" in error.response &&
        typeof error.response.data === "object" &&
        error.response.data !== null &&
        "message" in error.response.data &&
        typeof error.response.data.message === "string"
          ? error.response.data.message
          : AUTH_ERREURS.PROFIL_MAJ_ECHOUEE;
      const mappedErrors = mapperMessageVersErreursChamp(message);
      if (Object.keys(mappedErrors).length > 0) {
        setErreurs(mappedErrors);
        return;
      }
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  const getRoleBadgeStyle = (r?: string) => {
    switch (r) {
      case 'SUPER_ADMIN':
        return 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20';
      case 'ADMIN':
        return 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20';
      case 'MEDECIN':
        return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
      case 'SECRETAIRE':
        return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
      default:
        return 'bg-primary/10 text-primary border-primary/20';
    }
  };

  return (
    <DashboardLayout title="Mon Profil">
      <div className="max-w-4xl mx-auto space-y-8 pb-12">
        {/* BANNIÈRE HÉRO DU PROFIL */}
        <div className="relative overflow-hidden rounded-3xl bg-card border border-border/80 p-6 md:p-8 shadow-xs">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6 relative z-10">
            {/* AVATAR + BADGE STATUS */}
            <div className="relative group shrink-0">
              <div className="p-1 rounded-full bg-background border-2 border-teal-500/30 shadow-xs">
                {user?.photo ? (
                  <img
                    src={user.photo}
                    alt={`${user.prenom} ${user.nom}`}
                    className="h-28 w-28 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-28 w-28 items-center justify-center rounded-full bg-teal-700 text-white font-extrabold text-3xl shadow-xs">
                    {getInitials()}
                  </div>
                )}
              </div>
              <button
                type="button"
                className="absolute bottom-1 right-1 p-2.5 rounded-full bg-primary text-white shadow-lg hover:scale-110 transition-transform cursor-pointer border-2 border-background"
                title="Changer de photo de profil"
                onClick={() => toast.info("La mise à jour de photo sera disponible très prochainement.")}
              >
                <Camera size={14} />
              </button>
            </div>

            {/* INFORMATIONS PRINCIPALES */}
            <div className="flex-1 text-center md:text-left space-y-2">
              <div className="flex flex-col md:flex-row md:items-center gap-2">
                <h1 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight">
                  {user?.prenom} {user?.nom}
                </h1>
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${getRoleBadgeStyle(
                    role
                  )}`}
                >
                  <BadgeCheck size={14} />
                  {role ? ROLE_LABELS[role] : 'Utilisateur'}
                </span>
              </div>

              <p className="text-sm font-medium text-muted-foreground flex items-center justify-center md:justify-start gap-2">
                <Mail size={16} className="text-primary" />
                {user?.email}
              </p>

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-2 text-xs font-medium text-muted-foreground">
                {user?.telephone && (
                  <span className="flex items-center gap-1 bg-background/80 backdrop-blur-sm px-3 py-1.5 rounded-xl border border-border">
                    <Phone size={14} className="text-primary" />
                    {user.telephone}
                  </span>
                )}
              </div>
            </div>

            {/* BOUTON ÉDITION */}
            <div className="shrink-0 pt-2 md:pt-0">
              {!editing ? (
                <button
                  onClick={() => setEditing(true)}
                  className="medibook-btn flex items-center gap-2 px-5 py-2.5 h-11 text-sm shadow-md"
                >
                  <Edit3 size={16} />
                  <span>Modifier le profil</span>
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCancel}
                    disabled={isSaving}
                    className="medibook-btn-outline px-4 h-10 text-sm flex items-center gap-1.5"
                  >
                    <X size={16} />
                    <span>Annuler</span>
                  </button>
                  <button
                    onClick={() => void handleSave()}
                    disabled={isSaving}
                    className="medibook-btn px-5 h-10 text-sm flex items-center gap-1.5"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        <span>Sauvegarde...</span>
                      </>
                    ) : (
                      <>
                        <Check size={16} />
                        <span>Sauvegarder</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* SECTION EDITEUR DE COORDONNÉES */}
        <div className="medibook-card overflow-hidden">
          <div className="flex items-center justify-between pb-4 mb-6 border-b border-border/60">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                <User size={20} />
              </div>
              <div>
                <h3 className="font-bold text-base text-foreground">Coordonnées Personnelles</h3>
                <p className="text-xs text-muted-foreground">Vos informations d'identification sur MediBook</p>
              </div>
            </div>
            {editing && (
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 animate-pulse">
                Mode Édition Actif
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Prénom */}
            <div>
              <label className="text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5 block">
                Prénom
              </label>
              <div className="relative">
                <User size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={form.prenom}
                  onChange={e => update('prenom', e.target.value)}
                  disabled={!editing}
                  placeholder="Votre prénom"
                  className={`medibook-input w-full pl-11 disabled:bg-secondary/40 disabled:opacity-80 transition-all ${
                    erreurs.prenom ? 'border-destructive ring-2 ring-destructive/20' : ''
                  }`}
                />
              </div>
              {erreurs.prenom && <p className="mt-1.5 text-xs font-medium text-destructive">{erreurs.prenom}</p>}
            </div>

            {/* Nom */}
            <div>
              <label className="text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5 block">
                Nom
              </label>
              <div className="relative">
                <User size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={form.nom}
                  onChange={e => update('nom', e.target.value)}
                  disabled={!editing}
                  placeholder="Votre nom"
                  className={`medibook-input w-full pl-11 disabled:bg-secondary/40 disabled:opacity-80 transition-all ${
                    erreurs.nom ? 'border-destructive ring-2 ring-destructive/20' : ''
                  }`}
                />
              </div>
              {erreurs.nom && <p className="mt-1.5 text-xs font-medium text-destructive">{erreurs.nom}</p>}
            </div>

            {/* Email (Lecture seule) */}
            <div>
              <label className="text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5 flex items-center justify-between">
                <span>Adresse Email</span>
                <span className="text-[10px] lowercase text-muted-foreground font-normal">(Non modifiable)</span>
              </label>
              <div className="relative">
                <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={user?.email || ''}
                  disabled
                  className="medibook-input w-full pl-11 bg-secondary/40 opacity-80 cursor-not-allowed"
                />
              </div>
            </div>

            {/* Téléphone */}
            <div>
              <label className="text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5 block">
                Numéro de Téléphone
              </label>
              <div className="relative">
                <Phone size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={form.telephone}
                  onChange={e => update('telephone', e.target.value)}
                  disabled={!editing}
                  placeholder="+221 77 123 45 67"
                  className={`medibook-input w-full pl-11 disabled:bg-secondary/40 disabled:opacity-80 transition-all ${
                    erreurs.telephone ? 'border-destructive ring-2 ring-destructive/20' : ''
                  }`}
                />
              </div>
              {erreurs.telephone && <p className="mt-1.5 text-xs font-medium text-destructive">{erreurs.telephone}</p>}
            </div>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
};

export default ProfilePage;
