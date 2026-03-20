import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/layouts/DashboardLayout';
import SearchInput from '@/components/common/SearchInput';
import StatusBadge from '@/components/common/StatusBadge';
import { mockMedecins } from '@/data/mockUsers';
import { mockSpecialites } from '@/data/mockSpecialites';
import { Plus, LayoutGrid, List } from 'lucide-react';

const MedecinsPage = () => {
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterSpec, setFilterSpec] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const navigate = useNavigate();

  const filtered = mockMedecins.filter(m => {
    const matchSearch = `${m.prenom} ${m.nom}`.toLowerCase().includes(search.toLowerCase());
    const matchSpec = !filterSpec || m.specialiteId === filterSpec;
    const matchStatus = !filterStatus || m.statut === filterStatus;
    return matchSearch && matchSpec && matchStatus;
  });

  const getInitials = (p: string, n: string) => `${p[0]}${n[0]}`;

  return (
    <DashboardLayout title="Médecins">
      <div className="space-y-4">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full lg:w-auto">
            <SearchInput value={search} onChange={setSearch} placeholder="Rechercher un médecin..." />
            <select value={filterSpec} onChange={e => setFilterSpec(e.target.value)} className="medibook-input text-sm">
              <option value="">Toutes les spécialités</option>
              {mockSpecialites.map(s => <option key={s.id} value={s.id}>{s.nom}</option>)}
            </select>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="medibook-input text-sm">
              <option value="">Tous les statuts</option>
              <option value="ACTIF">Actif</option>
              <option value="INACTIF">Inactif</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex rounded-xl border border-border overflow-hidden">
              <button onClick={() => setViewMode('grid')} className={`p-2 ${viewMode === 'grid' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}><LayoutGrid size={18} /></button>
              <button onClick={() => setViewMode('list')} className={`p-2 ${viewMode === 'list' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}><List size={18} /></button>
            </div>
            <button onClick={() => navigate('/admin/medecins/nouveau')} className="medibook-btn flex items-center gap-2 whitespace-nowrap"><Plus size={18} /> Nouveau Médecin</button>
          </div>
        </div>

        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map(m => (
              <div key={m.id} onClick={() => navigate(`/admin/medecins/${m.id}`)} className="medibook-card hover:shadow-md transition-all duration-200 cursor-pointer hover:scale-[1.01]">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-lg">{getInitials(m.prenom, m.nom)}</div>
                  <div className="min-w-0"><p className="font-semibold truncate">{m.prenom} {m.nom}</p><span className="medibook-badge bg-primary/10 text-primary text-xs">{m.specialite}</span></div>
                </div>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <p>{m.email}</p><p>{m.telephone}</p>
                </div>
                <div className="mt-3"><StatusBadge status={m.statut} type="entity" /></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="medibook-card p-0 overflow-hidden"><div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="medibook-table-header"><th className="px-4 py-3 text-left">Médecin</th><th className="px-4 py-3 text-left">Spécialité</th><th className="px-4 py-3 text-left">Email</th><th className="px-4 py-3 text-left">Téléphone</th><th className="px-4 py-3 text-left">Statut</th></tr></thead>
              <tbody>{filtered.map(m => (
                <tr key={m.id} onClick={() => navigate(`/admin/medecins/${m.id}`)} className="medibook-table-row cursor-pointer">
                  <td className="px-4 py-3"><div className="flex items-center gap-2"><div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-semibold">{getInitials(m.prenom, m.nom)}</div><span className="font-medium">{m.prenom} {m.nom}</span></div></td>
                  <td className="px-4 py-3">{m.specialite}</td><td className="px-4 py-3 text-muted-foreground">{m.email}</td><td className="px-4 py-3 text-muted-foreground">{m.telephone}</td>
                  <td className="px-4 py-3"><StatusBadge status={m.statut} type="entity" /></td>
                </tr>
              ))}</tbody>
            </table>
          </div></div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default MedecinsPage;
