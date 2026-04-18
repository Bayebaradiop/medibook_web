import { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import SearchInput from '@/components/common/SearchInput';
import StatusBadge from '@/components/common/StatusBadge';
import { adminService } from '../services/adminService';
import type { Utilisateur } from '@/modules/auth/types/auth.types';
import { Loader2, Mail, Phone, Building2 } from 'lucide-react';
import { toast } from 'sonner';

const AdminsPage = () => {
  const [admins, setAdmins] = useState<Utilisateur[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

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
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">Aucun admin trouvé</td></tr>
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
