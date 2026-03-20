import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '@/layouts/DashboardLayout';
import StatusBadge from '@/components/common/StatusBadge';
import { mockCabinets } from '@/data/mockCabinets';
import { ArrowLeft, MapPin, Phone, Mail, Palette } from 'lucide-react';

const CabinetDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const cabinet = mockCabinets.find(c => c.id === id);

  if (!cabinet) return <DashboardLayout title="Cabinet"><p>Cabinet non trouvé</p></DashboardLayout>;

  return (
    <DashboardLayout title="Détails du cabinet">
      <div className="space-y-6">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft size={18} /> Retour
        </button>

        <div className="medibook-card overflow-hidden">
          <div className="bg-gradient-to-r from-primary-dark to-primary-light p-6 -m-4 mb-4 rounded-t-2xl">
            <h2 className="text-xl font-bold text-primary-foreground">{cabinet.nom}</h2>
            <StatusBadge status={cabinet.statut} type="entity" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <div className="flex items-start gap-3"><MapPin size={18} className="text-primary mt-0.5 shrink-0" /><div><p className="text-xs text-muted-foreground">Adresse</p><p className="text-sm font-medium">{cabinet.adresse}</p></div></div>
            <div className="flex items-start gap-3"><Phone size={18} className="text-primary mt-0.5 shrink-0" /><div><p className="text-xs text-muted-foreground">Téléphone</p><p className="text-sm font-medium">{cabinet.telephone}</p></div></div>
            <div className="flex items-start gap-3"><Mail size={18} className="text-primary mt-0.5 shrink-0" /><div><p className="text-xs text-muted-foreground">Email</p><p className="text-sm font-medium">{cabinet.email}</p></div></div>
            <div className="flex items-start gap-3"><Palette size={18} className="text-primary mt-0.5 shrink-0" /><div><p className="text-xs text-muted-foreground">Couleurs</p><div className="flex gap-2 mt-1"><div className="h-6 w-6 rounded-full border" style={{ backgroundColor: cabinet.couleurPrimaire }} /><div className="h-6 w-6 rounded-full border" style={{ backgroundColor: cabinet.couleurSecondaire }} /></div></div></div>
          </div>
        </div>

        <div className="medibook-card">
          <h3 className="font-semibold mb-4">Administrateur du cabinet</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><p className="text-xs text-muted-foreground">Nom complet</p><p className="text-sm font-medium">{cabinet.admin.prenom} {cabinet.admin.nom}</p></div>
            <div><p className="text-xs text-muted-foreground">Email</p><p className="text-sm font-medium">{cabinet.admin.email}</p></div>
            <div><p className="text-xs text-muted-foreground">Téléphone</p><p className="text-sm font-medium">{cabinet.admin.telephone}</p></div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CabinetDetailPage;
