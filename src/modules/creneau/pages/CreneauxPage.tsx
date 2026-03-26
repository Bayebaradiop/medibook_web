import { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { Calendar, List, Trash2, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { creneauService } from '../services/creneauService';
import { secretaireMedecinsService } from '@/modules/utilisateur/services/utilisateurService';
import { peutSupprimer } from '../logique/creneau.regles';
import { CRENEAU_SUCCES } from '../messages/creneau.succes';
import { CRENEAU_ERREURS } from '../messages/creneau.erreurs';
import type { Creneau } from '../types/creneau.types';
import ConfirmDialog from '@/components/common/ConfirmDialog';

interface Medecin {
  id: number;
  prenom: string;
  nom: string;
}

const CreneauxPage = () => {
  const [medecins, setMedecins] = useState<Medecin[]>([]);
  const [selectedMedecin, setSelectedMedecin] = useState<number | null>(null);
  const [creneaux, setCreneaux] = useState<Creneau[]>([]);
  const [dateFilter, setDateFilter] = useState('');
  const [view, setView] = useState<'list' | 'calendar'>('calendar');
  const [loading, setLoading] = useState(true);
  const [loadingCreneaux, setLoadingCreneaux] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<Creneau | null>(null);

  // Charger les médecins
  useEffect(() => {
    secretaireMedecinsService.list()
      .then(res => {
        const data = (res.data as any)?.data || res.data;
        const list = Array.isArray(data) ? data : [];
        setMedecins(list);
        if (list.length > 0) setSelectedMedecin(list[0].id);
      })
      .catch(() => toast.error('Erreur chargement des médecins'))
      .finally(() => setLoading(false));
  }, []);

  // Charger les créneaux du médecin sélectionné
  const chargerCreneaux = useCallback(() => {
    if (!selectedMedecin) return;
    setLoadingCreneaux(true);
    creneauService.listParMedecin(selectedMedecin)
      .then(res => {
        const data = (res.data as any)?.data || res.data;
        setCreneaux(Array.isArray(data) ? data : []);
      })
      .catch(() => toast.error(CRENEAU_ERREURS.CHARGEMENT_ECHOUE))
      .finally(() => setLoadingCreneaux(false));
  }, [selectedMedecin]);

  useEffect(() => { chargerCreneaux(); }, [chargerCreneaux]);

  // Supprimer un créneau
  const handleDelete = (creneau: Creneau) => {
    creneauService.delete(creneau.id)
      .then(() => {
        toast.success(CRENEAU_SUCCES.SUPPRESSION_REUSSIE);
        chargerCreneaux();
      })
      .catch(() => toast.error(CRENEAU_ERREURS.SUPPRESSION_ECHOUEE))
      .finally(() => setConfirmDelete(null));
  };

  // Normaliser la date (gère les formats "2026-03-24", "2026-03-24T00:00:00", ou [2026,3,24])
  const normalizeDate = (d: any): string => {
    if (Array.isArray(d)) {
      const [y, m, day] = d;
      return `${y}-${String(m).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    }
    if (typeof d === 'string') return d.substring(0, 10);
    return String(d);
  };

  // Normaliser l'heure (gère "09:00", "09:00:00", ou [9,0])
  const normalizeTime = (t: any): string => {
    if (Array.isArray(t)) {
      return `${String(t[0]).padStart(2, '0')}:${String(t[1] ?? 0).padStart(2, '0')}`;
    }
    if (typeof t === 'string') return t.substring(0, 5);
    return String(t);
  };

  // Filtrer par date
  const filtered = dateFilter
    ? creneaux.filter(c => normalizeDate(c.date) === dateFilter)
    : creneaux;

  // Grouper par date pour la vue calendrier (avec normalisation)
  const grouped: Record<string, Creneau[]> = {};
  filtered.forEach(c => {
    const key = normalizeDate(c.date);
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(c);
  });

  if (loading) {
    return (
      <DashboardLayout title="Créneaux">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Créneaux">
      <div className="space-y-4">
        {/* Filtres + toggle vue */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <select
              value={selectedMedecin ?? ''}
              onChange={e => setSelectedMedecin(Number(e.target.value))}
              className="medibook-input text-sm"
            >
              {medecins.map(m => (
                <option key={m.id} value={m.id}>Dr. {m.prenom} {m.nom}</option>
              ))}
            </select>
            <input
              type="date"
              value={dateFilter}
              onChange={e => setDateFilter(e.target.value)}
              className="medibook-input text-sm"
            />
            {dateFilter && (
              <button onClick={() => setDateFilter('')} className="text-xs text-muted-foreground hover:text-foreground">
                Effacer
              </button>
            )}
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">{filtered.length} créneau(x)</span>
            <div className="flex rounded-xl border border-border overflow-hidden">
              <button onClick={() => setView('list')} className={`p-2 px-3 flex items-center gap-1 text-sm ${view === 'list' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}>
                <List size={16} /> Liste
              </button>
              <button onClick={() => setView('calendar')} className={`p-2 px-3 flex items-center gap-1 text-sm ${view === 'calendar' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}>
                <Calendar size={16} /> Calendrier
              </button>
            </div>
          </div>
        </div>

        {/* Contenu */}
        {loadingCreneaux ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="medibook-card flex flex-col items-center justify-center py-12 text-muted-foreground">
            <AlertCircle className="h-10 w-10 mb-3" />
            <p className="text-sm">Aucun créneau trouvé pour ce médecin</p>
          </div>
        ) : view === 'list' ? (
          <div className="medibook-card p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="medibook-table-header">
                    <th className="px-4 py-3 text-left">Date</th>
                    <th className="px-4 py-3 text-left">Début</th>
                    <th className="px-4 py-3 text-left">Fin</th>
                    <th className="px-4 py-3 text-left">Statut</th>
                    <th className="px-4 py-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(c => (
                    <tr key={c.id} className="medibook-table-row">
                      <td className="px-4 py-3">{normalizeDate(c.date)}</td>
                      <td className="px-4 py-3 font-medium">{normalizeTime(c.heureDebut)}</td>
                      <td className="px-4 py-3">{normalizeTime(c.heureFin)}</td>
                      <td className="px-4 py-3">
                        <span className={`medibook-badge ${c.disponible ? 'bg-status-active/15 text-status-active' : 'bg-status-cancelled/15 text-status-cancelled'}`}>
                          {c.disponible ? 'Disponible' : 'Occupé'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {peutSupprimer(c) && (
                          <button
                            onClick={() => setConfirmDelete(c)}
                            className="p-2 rounded-lg hover:bg-destructive/10 text-destructive transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(grouped)
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([date, slots]) => (
                <div key={date} className="medibook-card">
                  <h3 className="text-sm font-semibold mb-3">{date}</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2">
                    {slots.map(c => (
                      <div
                        key={c.id}
                        className={`rounded-xl p-3 text-center text-xs font-medium border cursor-pointer transition-colors ${
                          c.disponible
                            ? 'bg-primary/5 border-primary/20 text-primary hover:bg-primary/10'
                            : 'bg-destructive/5 border-destructive/20 text-destructive'
                        }`}
                        onClick={() => peutSupprimer(c) && setConfirmDelete(c)}
                      >
                        <p className="font-semibold">{normalizeTime(c.heureDebut)}</p>
                        <p className="text-[10px]">{normalizeTime(c.heureFin)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Dialog de confirmation suppression */}
      {confirmDelete && (
        <ConfirmDialog
          title="Supprimer ce créneau ?"
          message={`Voulez-vous supprimer le créneau du ${normalizeDate(confirmDelete.date)} de ${normalizeTime(confirmDelete.heureDebut)} à ${normalizeTime(confirmDelete.heureFin)} ?`}
          onConfirm={() => handleDelete(confirmDelete)}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </DashboardLayout>
  );
};

export default CreneauxPage;
