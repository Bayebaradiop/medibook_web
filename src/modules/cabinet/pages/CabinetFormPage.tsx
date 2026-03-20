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

const ErreurChamp = ({ message }: { message?: string }) =>
  message ? <p className="text-xs text-destructive mt-1">{message}</p> : null;

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
      setErreurs(validation);
      const premiere = Object.values(validation)[0];
      toast.error(premiere);
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
    } catch (err: any) {
      const data = err.response?.data;
      // Le backend peut renvoyer des erreurs de validation par champ
      if (data?.errors && typeof data.errors === 'object') {
        setErreurs(data.errors);
        const premiere = Object.values(data.errors)[0] as string;
        toast.error(premiere);
      } else {
        const msg = data?.message
          || (isEdit ? CABINET_ERREURS.MODIFICATION_ECHOUEE : CABINET_ERREURS.CREATION_ECHOUEE);
        toast.error(msg);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = (champ: string) =>
    `medibook-input w-full ${erreurs[champ] ? 'border-destructive ring-1 ring-destructive' : ''}`;

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

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="medibook-card">
            <h3 className="font-semibold mb-4">Informations du cabinet</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-secondary-foreground mb-1.5 block">Nom</label>
                <input value={form.nom} onChange={e => update('nom', e.target.value)} className={inputClass('nom')} />
                <ErreurChamp message={erreurs.nom} />
              </div>
              <div>
                <label className="text-sm font-medium text-secondary-foreground mb-1.5 block">Adresse</label>
                <input value={form.adresse} onChange={e => update('adresse', e.target.value)} className={inputClass('adresse')} />
                <ErreurChamp message={erreurs.adresse} />
              </div>
              <div>
                <label className="text-sm font-medium text-secondary-foreground mb-1.5 block">Téléphone</label>
                <input value={form.telephone} onChange={e => update('telephone', e.target.value)} className={inputClass('telephone')} placeholder="+221 33 123 45 67" />
                <ErreurChamp message={erreurs.telephone} />
              </div>
              <div>
                <label className="text-sm font-medium text-secondary-foreground mb-1.5 block">Email</label>
                <input type="email" value={form.email} onChange={e => update('email', e.target.value)} className={inputClass('email')} />
                <ErreurChamp message={erreurs.email} />
              </div>
              <div>
                <label className="text-sm font-medium text-secondary-foreground mb-1.5 block">Couleur primaire</label>
                <div className="flex items-center gap-2"><input type="color" value={form.couleurPrimaire} onChange={e => update('couleurPrimaire', e.target.value)} className="h-10 w-14 rounded-lg border cursor-pointer" /><span className="text-sm text-muted-foreground">{form.couleurPrimaire}</span></div>
                <ErreurChamp message={erreurs.couleurPrimaire} />
              </div>
              <div>
                <label className="text-sm font-medium text-secondary-foreground mb-1.5 block">Couleur secondaire</label>
                <div className="flex items-center gap-2"><input type="color" value={form.couleurSecondaire} onChange={e => update('couleurSecondaire', e.target.value)} className="h-10 w-14 rounded-lg border cursor-pointer" /><span className="text-sm text-muted-foreground">{form.couleurSecondaire}</span></div>
                <ErreurChamp message={erreurs.couleurSecondaire} />
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
                <input value={form.adminPrenom} onChange={e => update('adminPrenom', e.target.value)} className={inputClass('adminPrenom')} />
                <ErreurChamp message={erreurs.adminPrenom} />
              </div>
              <div>
                <label className="text-sm font-medium text-secondary-foreground mb-1.5 block">Nom</label>
                <input value={form.adminNom} onChange={e => update('adminNom', e.target.value)} className={inputClass('adminNom')} />
                <ErreurChamp message={erreurs.adminNom} />
              </div>
              <div>
                <label className="text-sm font-medium text-secondary-foreground mb-1.5 block">Email</label>
                <input type="email" value={form.adminEmail} onChange={e => update('adminEmail', e.target.value)} className={inputClass('adminEmail')} />
                <ErreurChamp message={erreurs.adminEmail} />
              </div>
              <div>
                <label className="text-sm font-medium text-secondary-foreground mb-1.5 block">Téléphone</label>
                <input value={form.adminTelephone} onChange={e => update('adminTelephone', e.target.value)} className={inputClass('adminTelephone')} placeholder="+221 77 123 45 67" />
                <ErreurChamp message={erreurs.adminTelephone} />
              </div>
              {!isEdit && (
                <div>
                  <label className="text-sm font-medium text-secondary-foreground mb-1.5 block">Mot de passe</label>
                  <input type="password" value={form.adminPassword} onChange={e => update('adminPassword', e.target.value)} className={inputClass('adminPassword')} />
                  <ErreurChamp message={erreurs.adminPassword} />
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
