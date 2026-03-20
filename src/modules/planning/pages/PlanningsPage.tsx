import DashboardLayout from '@/layouts/DashboardLayout';
import { mockPlannings } from '@/data/mockPlannings';
import { DAYS_OF_WEEK } from '@/utils/constants';
import { useState } from 'react';
import { Calendar, List } from 'lucide-react';

const HOURS = Array.from({ length: 12 }, (_, i) => `${(i + 7).toString().padStart(2, '0')}:00`);

const PlanningsPage = () => {
  const [view, setView] = useState<'week' | 'list'>('week');
  const myPlannings = mockPlannings.filter(p => p.medecinId === 'm1');

  return (
    <DashboardLayout title="Mes Plannings">
      <div className="space-y-4">
        <div className="flex justify-end">
          <div className="flex rounded-xl border border-border overflow-hidden">
            <button onClick={() => setView('week')} className={`p-2 px-3 flex items-center gap-1 text-sm ${view === 'week' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}><Calendar size={16} /> Semaine</button>
            <button onClick={() => setView('list')} className={`p-2 px-3 flex items-center gap-1 text-sm ${view === 'list' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}><List size={16} /> Liste</button>
          </div>
        </div>

        {view === 'week' ? (
          <div className="medibook-card p-0 overflow-x-auto">
            <table className="w-full text-sm min-w-[800px]">
              <thead><tr className="medibook-table-header"><th className="px-2 py-3 w-16"></th>{DAYS_OF_WEEK.map(d => <th key={d} className="px-2 py-3 text-center">{d.slice(0, 3)}</th>)}</tr></thead>
              <tbody>
                {HOURS.map(hour => (
                  <tr key={hour} className="border-b border-border">
                    <td className="px-2 py-3 text-xs text-muted-foreground">{hour}</td>
                    {DAYS_OF_WEEK.map(day => {
                      const planning = myPlannings.find(p => p.jour === day && p.heureDebut <= hour && p.heureFin > hour);
                      return (
                        <td key={day} className="px-1 py-1">
                          {planning && planning.heureDebut === hour && (
                            <div className="bg-primary/10 text-primary rounded-lg p-2 text-xs font-medium border-l-2 border-primary">
                              <p>{planning.heureDebut}-{planning.heureFin}</p>
                              <p className="text-[10px] text-muted-foreground">{planning.dureeCreneau}min</p>
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {DAYS_OF_WEEK.map(day => {
              const dayPlannings = myPlannings.filter(p => p.jour === day);
              if (dayPlannings.length === 0) return null;
              return (
                <div key={day} className="medibook-card">
                  <h3 className="font-semibold text-sm mb-3">{day}</h3>
                  <div className="space-y-2">
                    {dayPlannings.map(p => (
                      <div key={p.id} className="bg-primary/5 rounded-xl p-3 border-l-2 border-primary">
                        <p className="text-sm font-medium">{p.heureDebut} - {p.heureFin}</p>
                        <p className="text-xs text-muted-foreground">Créneaux de {p.dureeCreneau} min</p>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default PlanningsPage;
