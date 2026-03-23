import { useState, useEffect } from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import StatsCard from '@/components/common/StatsCard';
import { Users, UserCheck, CalendarDays, Stethoscope, Loader2, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { statsService } from '@/modules/stats/services/statsService';
import type { StatsAdmin as StatsAdminType } from '@/modules/stats/types/stats.types';
import { toast } from 'sonner';

const AdminDashboard = () => {
  const [stats, setStats] = useState<StatsAdminType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const charger = async () => {
      try {
        const res = await statsService.admin();
        setStats((res.data as any)?.data || res.data);
      } catch {
        toast.error('Erreur lors du chargement des statistiques');
      } finally {
        setLoading(false);
      }
    };
    charger();
  }, []);

  if (loading) return <DashboardLayout title="Dashboard"><div className="flex justify-center py-12"><Loader2 className="animate-spin text-primary" size={32} /></div></DashboardLayout>;

  if (!stats) return <DashboardLayout title="Dashboard"><p className="text-center text-muted-foreground py-12">Impossible de charger les statistiques</p></DashboardLayout>;

  const statusData = [
    { name: 'En attente', value: stats.rdvEnAttente, fill: 'hsl(33, 100%, 58%)' },
    { name: 'Confirmés', value: stats.rdvConfirmes, fill: 'hsl(142, 71%, 45%)' },
    { name: 'Terminés', value: stats.rdvTermines, fill: 'hsl(200, 10%, 55%)' },
    { name: 'Annulés', value: stats.rdvAnnules, fill: 'hsl(1, 84%, 63%)' },
  ];

  const pieData = statusData.filter(d => d.value > 0);

  return (
    <DashboardLayout title={stats.cabinetNom ? `Dashboard — ${stats.cabinetNom}` : 'Dashboard'}>
      <div className="space-y-6">
        {/* Cartes de stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatsCard icon={Stethoscope} value={stats.totalMedecins} label="Médecins" color="green" />
          <StatsCard icon={Users} value={stats.totalSecretaires} label="Secrétaires" color="blue" />
          <StatsCard icon={UserCheck} value={stats.totalPatients} label="Patients" color="orange" />
          <StatsCard icon={CalendarDays} value={stats.totalRdv} label="Rendez-vous" color="red" />
        </div>

        {/* Cartes RDV par statut */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="medibook-card flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-500"><Clock size={20} /></div>
            <div><p className="text-xl font-bold">{stats.rdvEnAttente}</p><p className="text-xs text-muted-foreground">En attente</p></div>
          </div>
          <div className="medibook-card flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-green-50 text-green-500"><CheckCircle2 size={20} /></div>
            <div><p className="text-xl font-bold">{stats.rdvConfirmes}</p><p className="text-xs text-muted-foreground">Confirmés</p></div>
          </div>
          <div className="medibook-card flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-500"><CalendarDays size={20} /></div>
            <div><p className="text-xl font-bold">{stats.rdvTermines}</p><p className="text-xs text-muted-foreground">Terminés</p></div>
          </div>
          <div className="medibook-card flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-500"><XCircle size={20} /></div>
            <div><p className="text-xl font-bold">{stats.rdvAnnules}</p><p className="text-xs text-muted-foreground">Annulés</p></div>
          </div>
        </div>

        {/* Graphiques */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="medibook-card">
            <h3 className="font-semibold mb-4">RDV par statut</h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={statusData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(0,0%,88%)" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  {statusData.map((e, i) => <Cell key={i} fill={e.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="medibook-card">
            <h3 className="font-semibold mb-4">Répartition des RDV</h3>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={4} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {pieData.map((e, i) => <Cell key={i} fill={e.fill} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[280px] text-muted-foreground text-sm">Aucun rendez-vous pour le moment</div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
