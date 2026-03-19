import DashboardLayout from '@/layouts/DashboardLayout';
import StatusBadge from '@/components/common/StatusBadge';
import { mockMedecins } from '@/data/mockUsers';

const SecretaireMedecinsPage = () => {
  const medecins = mockMedecins.filter(m => m.specialiteId === 's1' || m.specialiteId === 's2');
  const getInitials = (p: string, n: string) => `${p[0]}${n[0]}`;

  return (
    <DashboardLayout title="Médecins">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {medecins.map(m => (
          <div key={m.id} className="medibook-card">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-lg">{getInitials(m.prenom, m.nom)}</div>
              <div className="min-w-0">
                <p className="font-semibold truncate">{m.prenom} {m.nom}</p>
                <span className="medibook-badge bg-primary/10 text-primary text-xs">{m.specialite}</span>
              </div>
            </div>
            <div className="space-y-1 text-sm text-muted-foreground"><p>{m.email}</p><p>{m.telephone}</p></div>
            <div className="mt-3"><StatusBadge status={m.statut} type="entity" /></div>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
};

export default SecretaireMedecinsPage;
