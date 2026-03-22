import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import StatusBadge from '@/components/common/StatusBadge';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import { secretaireService } from '../services/utilisateurService';
import { UTILISATEUR_ERREURS } from '../messages/utilisateur.erreurs';
import { UTILISATEUR_SUCCES } from '../messages/utilisateur.succes';
import type { Secretaire } from '../types/utilisateur.types';
import { ArrowLeft, Pencil, Ban, Trash2, Loader2, Mail, Phone, Building2 } from 'lucide-react';
import { toast } from 'sonner';

const SecretaireDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [secretaire, setSecretaire] = useState<Secretaire | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    const charger = async () => {
      try {
        const res = await secretaireService.detail(Number(id));
        setSecretaire(res.data);
      } catch (err: any) {
        toast.error(err.response?.data?.message || "Secrétaire non trouvée");
        navigate('/admin/secretaires');
      } finally {
        setLoading(false);
      }
    };
    charger();
  }, [id, navigate]);

  const handleToggleStatus = async () => {
    if (!secretaire) return;
    try {
      const res = await secretaireService.toggleStatus(secretaire.id);
      setSecretaire(res.data?.data || res.data);
      toast.success(UTILISATEUR_SUCCES.SECRETAIRE_STATUT_MODIFIE);
    } catch (err: any) {
      toast.error(err.response?.data?.message || UTILISATEUR_ERREURS.MODIFICATION_SECRETAIRE_ECHOUEE);
    }
  };

  const handleDelete = async () => {
    if (!secretaire) return;
    try {
      await secretaireService.delete(secretaire.id);
      toast.success(UTILISATEUR_SUCCES.SECRETAIRE_SUPPRIME);
      navigate('/admin/secretaires');
    } catch (err: any) {
      toast.error(err.response?.data?.message || UTILISATEUR_ERREURS.SUPPRESSION_SECRETAIRE_ECHOUEE);
    }
    setConfirmDelete(false);
  };

  if (loading) return <DashboardLayout title="Secrétaire"><div className="flex justify-center py-12"><Loader2 className="animate-spin text-primary" size={32} /></div></DashboardLayout>;
  if (!secretaire) return null;

  const initials = `${secretaire.prenom[0] || ''}${secretaire.nom[0] || ''}`;

  return (
    <DashboardLayout title="Détails de la secrétaire">
      <div className="space-y-6 max-w-4xl">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"><ArrowLeft size={18} /> Retour</button>

        <div className="medibook-card overflow-hidden p-0">
          <div className="h-36 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent relative">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%221.5%22%20fill%3D%22rgba(59%2C130%2C246%2C0.08)%22%2F%3E%3C%2Fsvg%3E')] opacity-60" />
          </div>
          <div className="px-6 pb-6">
            <div className="flex flex-col sm:flex-row gap-5 -mt-16 relative z-10">
              {secretaire.photo ? (
                <img src={secretaire.photo} alt={`${secretaire.prenom} ${secretaire.nom}`} className="h-28 w-28 rounded-2xl object-cover ring-4 ring-background shadow-xl flex-shrink-0" />
              ) : (
                <div className="h-28 w-28 rounded-2xl bg-gradient-to-br from-primary to-primary/60 ring-4 ring-background shadow-xl flex items-center justify-center text-white font-bold text-4xl flex-shrink-0">{initials}</div>
              )}
              <div className="flex-1 pt-2 sm:pt-8">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3 flex-wrap">
                      <h2 className="text-2xl font-bold tracking-tight">{secretaire.prenom} {secretaire.nom}</h2>
                      <StatusBadge status={secretaire.status} type="entity" />
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">Secrétaire médicale</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button onClick={() => navigate(`/admin/secretaires/${id}/modifier`)} className="medibook-btn h-9 px-3.5 text-sm flex items-center gap-1.5"><Pencil size={14} /> Modifier</button>
                    <button onClick={handleToggleStatus} className="medibook-btn-outline h-9 px-3.5 text-sm flex items-center gap-1.5"><Ban size={14} /> {secretaire.status === 'ACTIF' ? 'Bloquer' : 'Débloquer'}</button>
                    <button onClick={() => setConfirmDelete(true)} className="h-9 px-3.5 text-sm font-semibold rounded-2xl bg-destructive text-card transition-all duration-200 active:scale-[0.98] hover:brightness-90 flex items-center gap-1.5"><Trash2 size={14} /> Supprimer</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="medibook-card flex items-center gap-4">
            <div className="flex items-center justify-center h-11 w-11 rounded-xl bg-blue-50 dark:bg-blue-500/10"><Mail size={18} className="text-blue-600 dark:text-blue-400" /></div>
            <div className="min-w-0"><p className="text-xs text-muted-foreground mb-0.5">Email</p><p className="text-sm font-semibold truncate">{secretaire.email}</p></div>
          </div>
          <div className="medibook-card flex items-center gap-4">
            <div className="flex items-center justify-center h-11 w-11 rounded-xl bg-green-50 dark:bg-green-500/10"><Phone size={18} className="text-green-600 dark:text-green-400" /></div>
            <div className="min-w-0"><p className="text-xs text-muted-foreground mb-0.5">Téléphone</p><p className="text-sm font-semibold">{secretaire.telephone}</p></div>
          </div>
          {secretaire.cabinetNom && <div className="medibook-card flex items-center gap-4">
            <div className="flex items-center justify-center h-11 w-11 rounded-xl bg-amber-50 dark:bg-amber-500/10"><Building2 size={18} className="text-amber-600 dark:text-amber-400" /></div>
            <div className="min-w-0"><p className="text-xs text-muted-foreground mb-0.5">Cabinet</p><p className="text-sm font-semibold truncate">{secretaire.cabinetNom}</p></div>
          </div>}
        </div>
      </div>

      <ConfirmDialog open={confirmDelete} title="Supprimer la secrétaire" message="Êtes-vous sûr de vouloir supprimer cette secrétaire ?" onConfirm={handleDelete} onCancel={() => setConfirmDelete(false)} confirmLabel="Supprimer" />
    </DashboardLayout>
  );
};

export default SecretaireDetailPage;
