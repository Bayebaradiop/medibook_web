import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '@/layouts/DashboardLayout';
import StatusBadge from '@/components/common/StatusBadge';
import { mockRendezVous } from '@/data/mockRendezVous';
import { ArrowLeft, User, Phone, Mail, FileText, CheckCircle, Check } from 'lucide-react';
import { toast } from 'sonner';

const RendezVousDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const rv = mockRendezVous.find(r => r.id === id);

  if (!rv) return <DashboardLayout title="RDV"><p>RDV non trouvé</p></DashboardLayout>;

  return (
    <DashboardLayout title="Détails du rendez-vous">
      <div className="space-y-6 max-w-3xl">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"><ArrowLeft size={18} /> Retour</button>

        <div className="medibook-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Informations du rendez-vous</h3>
            <StatusBadge status={rv.statut} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div><p className="text-muted-foreground text-xs">Date</p><p className="font-medium">{rv.date}</p></div>
            <div><p className="text-muted-foreground text-xs">Heure</p><p className="font-medium">{rv.heure}</p></div>
            <div><p className="text-muted-foreground text-xs">Spécialité</p><p className="font-medium">{rv.specialite}</p></div>
            <div className="flex items-start gap-2"><FileText size={16} className="text-primary mt-0.5" /><div><p className="text-muted-foreground text-xs">Motif</p><p className="font-medium">{rv.motif}</p></div></div>
          </div>
        </div>

        <div className="medibook-card">
          <h3 className="font-semibold mb-4">Informations du patient</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            <div className="flex items-start gap-2"><User size={16} className="text-primary mt-0.5" /><div><p className="text-muted-foreground text-xs">Nom</p><p className="font-medium">{rv.patientNom}</p></div></div>
            <div className="flex items-start gap-2"><Phone size={16} className="text-primary mt-0.5" /><div><p className="text-muted-foreground text-xs">Téléphone</p><p className="font-medium">{rv.patientTelephone}</p></div></div>
            <div className="flex items-start gap-2"><Mail size={16} className="text-primary mt-0.5" /><div><p className="text-muted-foreground text-xs">Email</p><p className="font-medium">{rv.patientEmail}</p></div></div>
          </div>
        </div>

        <div className="flex gap-3">
          {rv.statut === 'EN_ATTENTE' && <button onClick={() => toast.success('RDV confirmé')} className="medibook-btn flex items-center gap-2"><CheckCircle size={18} /> Confirmer</button>}
          {rv.statut === 'CONFIRME' && <button onClick={() => toast.success('RDV terminé')} className="medibook-btn flex items-center gap-2 bg-info hover:brightness-90"><Check size={18} /> Terminer</button>}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default RendezVousDetailPage;
