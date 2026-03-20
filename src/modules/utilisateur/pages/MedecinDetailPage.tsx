import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '@/layouts/DashboardLayout';
import StatusBadge from '@/components/common/StatusBadge';
import StatsCard from '@/components/common/StatsCard';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import { mockMedecins } from '@/data/mockUsers';
import { mockRendezVous } from '@/data/mockRendezVous';
import { ArrowLeft, CalendarDays, Clock, CheckCircle, XCircle, Pencil, Ban, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

const MedecinDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const medecin = mockMedecins.find(m => m.id === id);
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (!medecin) return <DashboardLayout title="Médecin"><p>Médecin non trouvé</p></DashboardLayout>;

  const rdvs = mockRendezVous.filter(r => r.medecinId === id);
  const getInitials = (p: string, n: string) => `${p[0]}${n[0]}`;

  return (
    <DashboardLayout title="Détails du médecin">
      <div className="space-y-6">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"><ArrowLeft size={18} /> Retour</button>

        <div className="medibook-card">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-2xl">{getInitials(medecin.prenom, medecin.nom)}</div>
            <div className="flex-1">
              <h2 className="text-xl font-bold">{medecin.prenom} {medecin.nom}</h2>
              <span className="medibook-badge bg-primary/10 text-primary mt-1">{medecin.specialite}</span>
              <div className="mt-2 text-sm text-muted-foreground space-y-1">
                <p>{medecin.email}</p><p>{medecin.telephone}</p><p>{medecin.cabinet}</p>
              </div>
              <div className="mt-2"><StatusBadge status={medecin.statut} type="entity" /></div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => navigate(`/admin/medecins/${id}/modifier`)} className="medibook-btn h-10 px-4 text-sm flex items-center gap-1"><Pencil size={16} /> Modifier</button>
              <button className="medibook-btn-outline h-10 px-4 text-sm flex items-center gap-1"><Ban size={16} /> {medecin.statut === 'ACTIF' ? 'Bloquer' : 'Débloquer'}</button>
              <button onClick={() => setConfirmDelete(true)} className="h-10 px-4 text-sm font-semibold rounded-2xl bg-destructive text-card transition-all duration-200 active:scale-[0.98] hover:brightness-90 flex items-center gap-1"><Trash2 size={16} /> Supprimer</button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatsCard icon={CalendarDays} value={rdvs.length} label="Total RDV" color="green" />
          <StatsCard icon={Clock} value={rdvs.filter(r => r.statut === 'EN_ATTENTE').length} label="En attente" color="orange" />
          <StatsCard icon={CheckCircle} value={rdvs.filter(r => r.statut === 'CONFIRME').length} label="Confirmés" color="blue" />
          <StatsCard icon={XCircle} value={rdvs.filter(r => r.statut === 'TERMINE').length} label="Terminés" color="grey" />
        </div>
      </div>

      <ConfirmDialog open={confirmDelete} title="Supprimer le médecin" message="Êtes-vous sûr de vouloir supprimer ce médecin ?" onConfirm={() => { toast.success('Médecin supprimé'); setConfirmDelete(false); navigate('/admin/medecins'); }} onCancel={() => setConfirmDelete(false)} confirmLabel="Supprimer" />
    </DashboardLayout>
  );
};

export default MedecinDetailPage;
