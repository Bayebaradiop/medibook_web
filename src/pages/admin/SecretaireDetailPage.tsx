import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '@/layouts/DashboardLayout';
import StatusBadge from '@/components/common/StatusBadge';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import { mockSecretaires } from '@/data/mockUsers';
import { ArrowLeft, Pencil, Ban, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

const SecretaireDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const secretaire = mockSecretaires.find(s => s.id === id);
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (!secretaire) return <DashboardLayout title="Secrétaire"><p>Secrétaire non trouvée</p></DashboardLayout>;
  const getInitials = (p: string, n: string) => `${p[0]}${n[0]}`;

  return (
    <DashboardLayout title="Détails de la secrétaire">
      <div className="space-y-6">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"><ArrowLeft size={18} /> Retour</button>
        <div className="medibook-card">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-2xl">{getInitials(secretaire.prenom, secretaire.nom)}</div>
            <div className="flex-1">
              <h2 className="text-xl font-bold">{secretaire.prenom} {secretaire.nom}</h2>
              <span className="medibook-badge bg-primary/10 text-primary mt-1">{secretaire.specialite}</span>
              <div className="mt-2 text-sm text-muted-foreground space-y-1"><p>{secretaire.email}</p><p>{secretaire.telephone}</p><p>{secretaire.cabinet}</p></div>
              <div className="mt-2"><StatusBadge status={secretaire.statut} type="entity" /></div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => navigate(`/admin/secretaires/${id}/modifier`)} className="medibook-btn h-10 px-4 text-sm flex items-center gap-1"><Pencil size={16} /> Modifier</button>
              <button className="medibook-btn-outline h-10 px-4 text-sm flex items-center gap-1"><Ban size={16} /> {secretaire.statut === 'ACTIF' ? 'Bloquer' : 'Débloquer'}</button>
              <button onClick={() => setConfirmDelete(true)} className="h-10 px-4 text-sm font-semibold rounded-2xl bg-destructive text-card transition-all duration-200 active:scale-[0.98] hover:brightness-90 flex items-center gap-1"><Trash2 size={16} /> Supprimer</button>
            </div>
          </div>
        </div>
      </div>
      <ConfirmDialog open={confirmDelete} title="Supprimer la secrétaire" message="Êtes-vous sûr ?" onConfirm={() => { toast.success('Supprimée'); setConfirmDelete(false); navigate('/admin/secretaires'); }} onCancel={() => setConfirmDelete(false)} confirmLabel="Supprimer" />
    </DashboardLayout>
  );
};

export default SecretaireDetailPage;
