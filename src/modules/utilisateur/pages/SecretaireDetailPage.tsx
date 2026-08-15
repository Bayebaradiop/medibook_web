import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import StatusBadge from '@/components/common/StatusBadge';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import { secretaireService } from '../services/utilisateurService';
import type { Secretaire } from '../types/utilisateur.types';
import {
  ArrowLeft,
  Pencil,
  Ban,
  Trash2,
  Loader2,
  Mail,
  Phone,
  Building2,
  UserCheck,
  ShieldCheck
} from 'lucide-react';
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

  if (loading) {
    return (
      <DashboardLayout title="Secrétaire">
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <Loader2 className="animate-spin text-teal-600" size={32} />
          <p className="text-xs font-semibold text-muted-foreground">Chargement des détails de la secrétaire...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!secretaire) return null;

  const initials = `${secretaire.prenom[0] || ''}${secretaire.nom[0] || ''}`.toUpperCase();

  return (
    <DashboardLayout title="Fiche Secrétaire">
      <div className="space-y-6 max-w-4xl mx-auto pb-12">
        {/* Navigation retour */}
        <button
          onClick={() => navigate('/admin/secretaires')}
          className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Retour aux secrétaires
        </button>

        {/* CARTE DE PROFIL NETTE ET ÉPURÉE (AUCUN DÉGRADÉ) */}
        <div className="bg-card rounded-2xl border border-border/80 shadow-xs p-6 md:p-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-border/60">
            <div className="flex items-center gap-5">
              {/* Avatar solide */}
              {secretaire.photo ? (
                <img
                  src={secretaire.photo}
                  alt={`${secretaire.prenom} ${secretaire.nom}`}
                  className="h-20 w-20 rounded-2xl object-cover ring-2 ring-teal-500/20 shadow-xs shrink-0"
                />
              ) : (
                <div className="h-20 w-20 rounded-2xl bg-teal-700 text-white font-extrabold text-2xl flex items-center justify-center shadow-xs shrink-0">
                  {initials}
                </div>
              )}

              {/* Titre & Statuts */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-2xl font-bold text-foreground tracking-tight">
                    {secretaire.prenom} {secretaire.nom}
                  </h1>
                  <StatusBadge status={secretaire.status} type="entity" />
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-teal-500/10 text-teal-700 dark:text-teal-300 text-xs font-semibold border border-teal-500/20">
                    <UserCheck size={13} />
                    Secrétaire Médicale
                  </span>
                  {secretaire.cabinetNom && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-secondary text-secondary-foreground text-xs font-semibold border border-border">
                      <Building2 size={13} className="text-muted-foreground" />
                      {secretaire.cabinetNom}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Actions Rapides */}
            <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto pt-2 md:pt-0">
              <button
                onClick={() => navigate(`/admin/secretaires/${id}/modifier`)}
                className="medibook-btn h-9 px-4 text-xs font-semibold inline-flex items-center gap-1.5"
              >
                <Pencil size={14} />
                Modifier
              </button>

              <button
                onClick={handleToggleStatus}
                className="medibook-btn-outline h-9 px-3.5 text-xs font-semibold inline-flex items-center gap-1.5"
              >
                <Ban size={14} />
                {secretaire.status === 'ACTIF' ? 'Désactiver' : 'Activer'}
              </button>

              <button
                onClick={() => setConfirmDelete(true)}
                className="h-9 px-3.5 text-xs font-semibold rounded-xl bg-destructive/10 text-destructive hover:bg-destructive hover:text-white transition-colors inline-flex items-center gap-1.5"
              >
                <Trash2 size={14} />
                Supprimer
              </button>
            </div>
          </div>

          {/* GRID D'INFORMATIONS SOLIDE & ÉPURÉ */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6">
            {/* Email */}
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/50 text-teal-700 dark:text-teal-300 border border-teal-200/50 dark:border-teal-800/50 flex items-center justify-center shrink-0">
                <Mail size={18} />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Email Professionnel</p>
                <p className="text-sm font-semibold text-foreground truncate mt-0.5">{secretaire.email}</p>
              </div>
            </div>

            {/* Téléphone */}
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/50 text-teal-700 dark:text-teal-300 border border-teal-200/50 dark:border-teal-800/50 flex items-center justify-center shrink-0">
                <Phone size={18} />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Téléphone Portable</p>
                <p className="text-sm font-semibold text-foreground mt-0.5">{secretaire.telephone || 'Non renseigné'}</p>
              </div>
            </div>

            {/* Cabinet */}
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/50 text-teal-700 dark:text-teal-300 border border-teal-200/50 dark:border-teal-800/50 flex items-center justify-center shrink-0">
                <Building2 size={18} />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Cabinet Rattaché</p>
                <p className="text-sm font-semibold text-foreground truncate mt-0.5">{secretaire.cabinetNom || 'Non assigné'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        title="Supprimer la secrétaire"
        message={`Êtes-vous sûr de vouloir supprimer la secrétaire ${secretaire.prenom} ${secretaire.nom} ? Cette action est irréversible.`}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
        confirmLabel="Supprimer définitivement"
      />
    </DashboardLayout>
  );
};

export default SecretaireDetailPage;
