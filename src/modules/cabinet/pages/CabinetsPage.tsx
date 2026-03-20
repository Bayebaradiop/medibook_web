import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/layouts/DashboardLayout';
import SearchInput from '@/components/common/SearchInput';
import StatusBadge from '@/components/common/StatusBadge';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import { mockCabinets } from '@/data/mockCabinets';
import { Plus, Eye, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const CabinetsPage = () => {
  const [search, setSearch] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const navigate = useNavigate();

  const filtered = mockCabinets.filter(c => c.nom.toLowerCase().includes(search.toLowerCase()) || c.adresse.toLowerCase().includes(search.toLowerCase()));

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
                <th className="px-4 py-3 text-left">Nom</th><th className="px-4 py-3 text-left">Adresse</th><th className="px-4 py-3 text-left">Téléphone</th><th className="px-4 py-3 text-left">Email</th><th className="px-4 py-3 text-left">Statut</th><th className="px-4 py-3 text-left">Actions</th>
              </tr></thead>
              <tbody>
                {filtered.map(c => (
                  <tr key={c.id} className="medibook-table-row">
                    <td className="px-4 py-3 font-medium">{c.nom}</td>
                    <td className="px-4 py-3 text-muted-foreground">{c.adresse}</td>
                    <td className="px-4 py-3 text-muted-foreground">{c.telephone}</td>
                    <td className="px-4 py-3 text-muted-foreground">{c.email}</td>
                    <td className="px-4 py-3"><StatusBadge status={c.statut} type="entity" /></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => navigate(`/super-admin/cabinets/${c.id}`)} className="p-2 rounded-lg hover:bg-muted transition-colors" title="Voir"><Eye size={16} /></button>
                        <button onClick={() => navigate(`/super-admin/cabinets/${c.id}/modifier`)} className="p-2 rounded-lg hover:bg-muted transition-colors" title="Modifier"><Pencil size={16} /></button>
                        <button className="p-2 rounded-lg hover:bg-muted transition-colors" title="Toggle statut">
                          <div className={`w-8 h-4 rounded-full ${c.statut === 'ACTIF' ? 'bg-primary' : 'bg-muted-foreground/30'} relative transition-colors`}>
                            <div className={`absolute top-0.5 h-3 w-3 rounded-full bg-card transition-transform ${c.statut === 'ACTIF' ? 'right-0.5' : 'left-0.5'}`} />
                          </div>
                        </button>
                        <button onClick={() => setConfirmDelete(c.id)} className="p-2 rounded-lg hover:bg-destructive/10 text-destructive transition-colors" title="Supprimer"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={!!confirmDelete}
        title="Supprimer le cabinet"
        message="Êtes-vous sûr de vouloir supprimer ce cabinet ? Cette action est irréversible."
        onConfirm={() => { toast.success('Cabinet supprimé'); setConfirmDelete(null); }}
        onCancel={() => setConfirmDelete(null)}
        confirmLabel="Supprimer"
      />
    </DashboardLayout>
  );
};

export default CabinetsPage;
