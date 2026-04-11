import { useState, useEffect } from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import StatusBadge from '@/components/common/StatusBadge';
import { secretaireMedecinsService } from '@/modules/utilisateur/services/utilisateurService';
import type { Medecin } from '@/modules/utilisateur/types/utilisateur.types';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

const SecretaireMedecinsPage = () => {
  const [medecins, setMedecins] = useState<Medecin[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    secretaireMedecinsService.list()
      .then(res => {
        const raw = (res.data as any)?.data;
        const data = Array.isArray(raw) ? raw : Array.isArray(raw?.content) ? raw.content : [];
        setMedecins(data);
      })
      .catch(() => toast.error('Erreur lors du chargement des médecins'))
      .finally(() => setLoading(false));
  }, []);

  const getInitials = (p: string, n: string) => `${p[0]}${n[0]}`;

  if (loading) {
    return (
      <DashboardLayout title="Médecins">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Médecins">
      {medecins.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">Aucun médecin trouvé</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {medecins.map(m => (
            <div key={m.id} className="medibook-card">
              <div className="flex items-center gap-3 mb-3">
                {m.photo ? (
                  <img src={m.photo} alt={`${m.prenom} ${m.nom}`} className="h-12 w-12 rounded-full object-cover" />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-lg">{getInitials(m.prenom, m.nom)}</div>
                )}
                <div className="min-w-0">
                  <p className="font-semibold truncate">{m.prenom} {m.nom}</p>
                  <span className="medibook-badge bg-primary/10 text-primary text-xs">{m.specialiteNom}</span>
                </div>
              </div>
              <div className="space-y-1 text-sm text-muted-foreground"><p>{m.email}</p><p>{m.telephone}</p></div>
              <div className="mt-3"><StatusBadge status={m.status} type="entity" /></div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
};

export default SecretaireMedecinsPage;
