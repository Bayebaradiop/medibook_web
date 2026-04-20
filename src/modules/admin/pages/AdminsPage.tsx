import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/layouts/DashboardLayout';
import SearchInput from '@/components/common/SearchInput';
import StatusBadge from '@/components/common/StatusBadge';
import { adminService } from '../services/adminService';
import type { Utilisateur } from '@/modules/auth/types/auth.types';
import { Loader2, Mail, Phone, Building2, Pencil } from 'lucide-react';
import { toast } from 'sonner';

const AdminsPage = () => {
  const [admins, setAdmins] = useState<Utilisateur[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const chargerAdmins = useCallback(async () => {
    try {
      const res = await adminService.list();
      const raw = (res.data as any)?.data;
      setAdmins(Array.isArray(raw) ? raw : Array.isArray(raw?.content) ? raw.content : []);
    } catch {
      toast.error("Erreur lors du chargement des admins");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { chargerAdmins(); }, [chargerAdmins]);

  const handleToggleStatus = async (admin: Utilisateur) => {
    try {
      const res = await adminService.toggleStatus(admin.id);
      const updated = (res.data as any)?.data;
      if (updated) {
        setAdmins(prev => prev.map(a => a.id === admin.id ? { ...a, status: updated.status } : a));
      } else {
        setAdmins(prev => prev.map(a => a.id === admin.id ? { ...a, status: a.status === 'ACTIF' ? 'INACTIF' : 'ACTIF' } : a));
      }
      toast.success(`Admin ${admin.prenom} ${admin.nom} ${admin.status === 'ACTIF' ? 'bloqué' : 'débloqué'} avec succès`);
    } catch {
      toast.error("Erreur lors du changement de statut");
    }
  };

  const filtered = admins.filter(a =>
    `${a.prenom} ${a.nom}`.toLowerCase().includes(search.toLowerCase()) ||
    a.email.toLowerCase().includes(search.toLowerCase()) ||
    (a.cabinetNom || '').toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return (
    <DashboardLayout title="Gestion des Admins">
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout title="Gestion des Admins">
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <SearchInput value={search} onChange={setSearch} placeholder="Rechercher un admin..." />
          <div className="text-sm text-muted-foreground">
            {filtered.length} admin{filtered.length > 1 ? 's' : ''} trouvé{filtered.length > 1 ? 's' : ''}
          </div>
        </div>

        <div className="medibook-card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="medibook-table-header">
                <th className="px-4 py-3 text-left">Nom</th>
                <th className="px-4 py-3 text-left">Email</th>
                <th className="px-4 py-3 text-left">Téléphone</th>
                <th className="px-4 py-3 text-left">Cabinet</th>
                <th className="px-4 py-3 text-left">Statut</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr></thead>
              <tbody>
                {filtered.map(a => (
                  <tr key={a.id} className="medibook-table-row">
                    <td className="px-4 py-3 font-medium">{a.prenom} {a.nom}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Mail size={14} />
                        {a.email}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Phone size={14} />
                        {a.telephone || '—'}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Building2 size={14} />
                        {a.cabinetNom || '—'}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={a.status as any} type="entity" />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {a.cabinetId && (
                          <button onClick={() => navigate(`/super-admin/cabinets/${a.cabinetId}/modifier`)} className="p-2 rounded-lg hover:bg-muted transition-colors" title="Modifier">
                            <Pencil size={16} />
                          </button>
                        )}
                        <button onClick={() => handleToggleStatus(a)} className="p-2 rounded-lg hover:bg-muted transition-colors" title={a.status === 'ACTIF' ? 'Bloquer' : 'Débloquer'}>
                          <div className={`w-8 h-4 rounded-full ${a.status === 'ACTIF' ? 'bg-primary' : 'bg-muted-foreground/30'} relative transition-colors`}>
                            <div className={`absolute top-0.5 h-3 w-3 rounded-full bg-card transition-transform ${a.status === 'ACTIF' ? 'right-0.5' : 'left-0.5'}`} />
                          </div>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">Aucun admin trouvé</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminsPage;
