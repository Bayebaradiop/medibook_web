import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/layouts/DashboardLayout';
import SearchInput from '@/components/common/SearchInput';
import StatusBadge from '@/components/common/StatusBadge';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import { cabinetService } from '../services/cabinetService';
import { CABINET_ERREURS } from '../messages/cabinet.erreurs';
import { CABINET_SUCCES } from '../messages/cabinet.succes';
import type { Cabinet } from '../types/cabinet.types';
import { Plus, Eye, Pencil, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const CabinetsPage = () => {
  const [cabinets, setCabinets] = useState<Cabinet[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const navigate = useNavigate();

  const chargerCabinets = useCallback(async () => {
    try {
      const res = await cabinetService.list();
      setCabinets(res.data);
    } catch {
      toast.error(CABINET_ERREURS.CHARGEMENT_ECHOUE);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { chargerCabinets(); }, [chargerCabinets]);

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      await cabinetService.delete(confirmDelete);
      toast.success(CABINET_SUCCES.SUPPRESSION_REUSSIE);
      setCabinets(prev => prev.filter(c => c.id !== confirmDelete));
    } catch (err: any) {
      toast.error(err.response?.data?.message || CABINET_ERREURS.SUPPRESSION_ECHOUEE);
    }
    setConfirmDelete(null);
  };

  const handleToggleStatus = async (id: number) => {
    try {
      const res = await cabinetService.toggleStatus(id);
      setCabinets(prev => prev.map(c => c.id === id ? res.data : c));
      toast.success(CABINET_SUCCES.STATUT_MODIFIE);
    } catch (err: any) {
      toast.error(err.response?.data?.message || CABINET_ERREURS.MODIFICATION_ECHOUEE);
    }
  };

  const filtered = cabinets.filter(c =>
    c.nom.toLowerCase().includes(search.toLowerCase()) ||
    c.adresse.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return (
    <DashboardLayout title="Gestion des Cabinets">
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout title="Gestion des Cabinets">
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <SearchInput value={search} onChange={setSearch} placeholder="Rechercher un cabinet..." />
          <button onClick={() => navigate('/super-admin/cabinets/nouveau')} className="medibook-btn flex items-center gap-2 whitespace-nowrap">
            <Plus size={18} /> Nouveau Cabinet
          </button>
        </div>

        <div className="medibook-card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="medibook-table-header">
                <th className="px-4 py-3 text-left">Nom</th>
                <th className="px-4 py-3 text-left">Adresse</th>
                <th className="px-4 py-3 text-left">Téléphone</th>
                <th className="px-4 py-3 text-left">Email</th>
                <th className="px-4 py-3 text-left">Statut</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr></thead>
              <tbody>
                {filtered.map(c => (
                  <tr key={c.id} className="medibook-table-row">
                    <td className="px-4 py-3 font-medium">{c.nom}</td>
                    <td className="px-4 py-3 text-muted-foreground">{c.adresse}</td>
                    <td className="px-4 py-3 text-muted-foreground">{c.telephone}</td>
                    <td className="px-4 py-3 text-muted-foreground">{c.email}</td>
                    <td className="px-4 py-3"><StatusBadge status={c.status as any} type="entity" /></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => navigate(`/super-admin/cabinets/${c.id}`)} className="p-2 rounded-lg hover:bg-muted transition-colors" title="Voir"><Eye size={16} /></button>
                        <button onClick={() => navigate(`/super-admin/cabinets/${c.id}/modifier`)} className="p-2 rounded-lg hover:bg-muted transition-colors" title="Modifier"><Pencil size={16} /></button>
                        <button onClick={() => handleToggleStatus(c.id)} className="p-2 rounded-lg hover:bg-muted transition-colors" title="Toggle statut">
                          <div className={`w-8 h-4 rounded-full ${c.status === 'ACTIF' ? 'bg-primary' : 'bg-muted-foreground/30'} relative transition-colors`}>
                            <div className={`absolute top-0.5 h-3 w-3 rounded-full bg-card transition-transform ${c.status === 'ACTIF' ? 'right-0.5' : 'left-0.5'}`} />
                          </div>
                        </button>
                        <button onClick={() => setConfirmDelete(c.id)} className="p-2 rounded-lg hover:bg-destructive/10 text-destructive transition-colors" title="Supprimer"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">Aucun cabinet trouvé</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={!!confirmDelete}
        title="Supprimer le cabinet"
        message="Êtes-vous sûr de vouloir supprimer ce cabinet ? Cette action est irréversible."
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(null)}
        confirmLabel="Supprimer"
      />
    </DashboardLayout>
  );
};

export default CabinetsPage;
