import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/layouts/DashboardLayout';
import SearchInput from '@/components/common/SearchInput';
import StatusBadge from '@/components/common/StatusBadge';
import { mockSecretaires } from '@/data/mockUsers';
import { Plus, LayoutGrid, List } from 'lucide-react';

const SecretairesPage = () => {
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const navigate = useNavigate();

  const filtered = mockSecretaires.filter(s => `${s.prenom} ${s.nom}`.toLowerCase().includes(search.toLowerCase()));
  const getInitials = (p: string, n: string) => `${p[0]}${n[0]}`;

  return (
    <DashboardLayout title="Secrétaires">
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <SearchInput value={search} onChange={setSearch} placeholder="Rechercher une secrétaire..." />
          <div className="flex items-center gap-2">
            <div className="flex rounded-xl border border-border overflow-hidden">
              <button onClick={() => setViewMode('grid')} className={`p-2 ${viewMode === 'grid' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}><LayoutGrid size={18} /></button>
              <button onClick={() => setViewMode('list')} className={`p-2 ${viewMode === 'list' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}><List size={18} /></button>
            </div>
            <button onClick={() => navigate('/admin/secretaires/nouveau')} className="medibook-btn flex items-center gap-2 whitespace-nowrap"><Plus size={18} /> Nouvelle Secrétaire</button>
          </div>
        </div>

        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map(s => (
              <div key={s.id} onClick={() => navigate(`/admin/secretaires/${s.id}`)} className="medibook-card hover:shadow-md transition-all duration-200 cursor-pointer hover:scale-[1.01]">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-lg">{getInitials(s.prenom, s.nom)}</div>
                  <div className="min-w-0"><p className="font-semibold truncate">{s.prenom} {s.nom}</p><span className="medibook-badge bg-primary/10 text-primary text-xs">{s.specialite}</span></div>
                </div>
                <div className="space-y-1 text-sm text-muted-foreground"><p>{s.email}</p><p>{s.telephone}</p></div>
                <div className="mt-3"><StatusBadge status={s.statut} type="entity" /></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="medibook-card p-0 overflow-hidden"><div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="medibook-table-header"><th className="px-4 py-3 text-left">Secrétaire</th><th className="px-4 py-3 text-left">Spécialité</th><th className="px-4 py-3 text-left">Email</th><th className="px-4 py-3 text-left">Statut</th></tr></thead>
              <tbody>{filtered.map(s => (
                <tr key={s.id} onClick={() => navigate(`/admin/secretaires/${s.id}`)} className="medibook-table-row cursor-pointer">
                  <td className="px-4 py-3"><div className="flex items-center gap-2"><div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-semibold">{getInitials(s.prenom, s.nom)}</div><span className="font-medium">{s.prenom} {s.nom}</span></div></td>
                  <td className="px-4 py-3">{s.specialite}</td><td className="px-4 py-3 text-muted-foreground">{s.email}</td>
                  <td className="px-4 py-3"><StatusBadge status={s.statut} type="entity" /></td>
                </tr>
              ))}</tbody>
            </table>
          </div></div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default SecretairesPage;
