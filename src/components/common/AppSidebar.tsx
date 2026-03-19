import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Building2, Stethoscope, Users, Calendar, ClipboardList, Clock, BarChart3, CalendarX, Menu, X, UserCircle, LogOut } from 'lucide-react';
import { useState } from 'react';
import type { UserRole } from '@/utils/constants';
import { ROLE_LABELS } from '@/utils/constants';

interface NavItem {
  label: string;
  icon: any;
  path: string;
}

const NAV_ITEMS: Record<UserRole, NavItem[]> = {
  SUPER_ADMIN: [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/super-admin' },
    { label: 'Cabinets', icon: Building2, path: '/super-admin/cabinets' },
  ],
  ADMIN: [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/admin' },
    { label: 'Spécialités', icon: Stethoscope, path: '/admin/specialites' },
    { label: 'Médecins', icon: Users, path: '/admin/medecins' },
    { label: 'Secrétaires', icon: Users, path: '/admin/secretaires' },
  ],
  MEDECIN: [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/medecin' },
    { label: 'Mes Plannings', icon: Calendar, path: '/medecin/plannings' },
    { label: 'Mes Rendez-vous', icon: ClipboardList, path: '/medecin/rendez-vous' },
    { label: 'Exceptions', icon: CalendarX, path: '/medecin/exceptions' },
    { label: 'Statistiques', icon: BarChart3, path: '/medecin/statistiques' },
  ],
  SECRETAIRE: [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/secretaire' },
    { label: 'Médecins', icon: Users, path: '/secretaire/medecins' },
    { label: 'Plannings', icon: Calendar, path: '/secretaire/plannings' },
    { label: 'Créneaux', icon: Clock, path: '/secretaire/creneaux' },
    { label: 'Rendez-vous', icon: ClipboardList, path: '/secretaire/rendez-vous' },
    { label: 'RDV en attente', icon: Clock, path: '/secretaire/rdv-en-attente' },
    { label: 'Exceptions', icon: CalendarX, path: '/secretaire/exceptions' },
  ],
};

const AppSidebar = () => {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (!role || !user) return null;
  const items = NAV_ITEMS[role];

  const isActive = (path: string) => {
    if (path === `/${role.toLowerCase().replace('_', '-')}` || path === '/super-admin' || path === '/admin' || path === '/medecin' || path === '/secretaire') {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  const sidebarContent = (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-border">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold text-lg">M</div>
        <span className="text-xl font-bold text-foreground">MediBook</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {items.map(item => (
          <button
            key={item.path}
            onClick={() => { navigate(item.path); setMobileOpen(false); }}
            className={`sidebar-item w-full ${isActive(item.path) ? 'sidebar-item-active' : ''}`}
          >
            <item.icon size={20} />
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      {/* User */}
      <div className="border-t border-border p-4">
        <button onClick={() => { navigate('/profil'); setMobileOpen(false); }} className="sidebar-item w-full mb-1">
          <UserCircle size={20} />
          <div className="text-left min-w-0">
            <p className="text-sm font-medium truncate">{user.prenom} {user.nom}</p>
            <p className="text-xs text-muted-foreground">{ROLE_LABELS[role]}</p>
          </div>
        </button>
        <button onClick={() => { logout(); navigate('/login'); }} className="sidebar-item w-full text-destructive hover:text-destructive hover:bg-destructive/10">
          <LogOut size={20} />
          <span>Déconnexion</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button onClick={() => setMobileOpen(true)} className="fixed top-4 left-4 z-50 lg:hidden p-2 rounded-xl bg-card shadow-md">
        <Menu size={22} />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-foreground/40" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-[272px] bg-card shadow-[var(--shadow-sidebar)] animate-in slide-in-from-left">
            <button onClick={() => setMobileOpen(false)} className="absolute top-4 right-4 text-muted-foreground"><X size={20} /></button>
            {sidebarContent}
          </aside>
        </div>
      )}

      {/* Desktop */}
      <aside className="hidden lg:flex h-screen w-[272px] shrink-0 flex-col bg-card shadow-[var(--shadow-sidebar)] sticky top-0">
        {sidebarContent}
      </aside>
    </>
  );
};

export default AppSidebar;
