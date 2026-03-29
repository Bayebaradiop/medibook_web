import { useEffect, useState } from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { ROLE_LABELS } from '@/utils/constants';
import { toast } from 'sonner';
import { AUTH_ERREURS } from '@/modules/auth/messages/auth.erreurs';
import { AUTH_SUCCES } from '@/modules/auth/messages/auth.succes';
import { UTILISATEUR_ERREURS } from '@/modules/utilisateur/messages/utilisateur.erreurs';

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

  return (
    <DashboardLayout title="Mon Profil">
      <div className="max-w-2xl space-y-6">
        <div className="medibook-card flex flex-col items-center">
          {user?.photo ? (
            <img
              src={user.photo}
              alt={`${user.prenom} ${user.nom}`}
              className="h-24 w-24 rounded-full object-cover border border-border"
            />
          ) : (
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-3xl">
              {getInitials()}
            </div>
          )}
          <h2 className="text-xl font-bold mt-3">{user?.prenom} {user?.nom}</h2>
          <span className="medibook-badge bg-primary/10 text-primary mt-1">{role ? ROLE_LABELS[role] : ''}</span>
        </div>

        <div className="medibook-card">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-secondary-foreground mb-1.5 block">Prénom</label>
              <input value={form.prenom} onChange={e => update('prenom', e.target.value)} disabled={!editing} className={`medibook-input w-full disabled:opacity-60 ${erreurs.prenom ? 'border-destructive ring-1 ring-destructive' : ''}`} />
              {erreurs.prenom && <p className="mt-1 text-xs text-destructive">{erreurs.prenom}</p>}
            </div>
            <div>
              <label className="text-sm font-medium text-secondary-foreground mb-1.5 block">Nom</label>
              <input value={form.nom} onChange={e => update('nom', e.target.value)} disabled={!editing} className={`medibook-input w-full disabled:opacity-60 ${erreurs.nom ? 'border-destructive ring-1 ring-destructive' : ''}`} />
              {erreurs.nom && <p className="mt-1 text-xs text-destructive">{erreurs.nom}</p>}
            </div>
            <div><label className="text-sm font-medium text-secondary-foreground mb-1.5 block">Email</label><input value={user?.email || ''} disabled className="medibook-input w-full disabled:opacity-60" /></div>
            <div>
              <label className="text-sm font-medium text-secondary-foreground mb-1.5 block">Téléphone</label>
              <input value={form.telephone} onChange={e => update('telephone', e.target.value)} disabled={!editing} className={`medibook-input w-full disabled:opacity-60 ${erreurs.telephone ? 'border-destructive ring-1 ring-destructive' : ''}`} />
              {erreurs.telephone && <p className="mt-1 text-xs text-destructive">{erreurs.telephone}</p>}
            </div>
          </div>
          <div className="flex justify-end mt-4">
            {editing ? (
              <div className="flex gap-3">
                <button onClick={handleCancel} className="medibook-btn-outline h-10 px-4 text-sm" disabled={isSaving}>Annuler</button>
                <button onClick={() => void handleSave()} className="medibook-btn h-10 px-4 text-sm" disabled={isSaving}>
                  {isSaving ? 'Sauvegarde...' : 'Sauvegarder'}
                </button>
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
