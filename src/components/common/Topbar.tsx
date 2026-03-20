import { useAuth } from '@/contexts/AuthContext';
import { Bell, ChevronDown, LogOut, Moon, Sun, UserCircle } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROLE_LABELS } from '@/utils/constants';
import { useTheme } from '@/hooks/useTheme';
import { motion, AnimatePresence } from 'framer-motion';

interface TopbarProps {
  title: string;
}

const Topbar = ({ title }: TopbarProps) => {
  const { user, logout } = useAuth();
  const role = user?.role;
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const { isDark, toggle } = useTheme();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-card px-4 lg:px-8">
      <h1 className="text-lg lg:text-xl font-bold text-foreground pl-12 lg:pl-0">{title}</h1>
      <div className="flex items-center gap-2">
        {/* Dark mode toggle */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={toggle}
          className="flex h-10 w-10 items-center justify-center rounded-xl hover:bg-muted transition-colors"
          aria-label="Toggle theme"
        >
          <AnimatePresence mode="wait" initial={false}>
            {isDark ? (
              <motion.div key="sun" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
                <Sun size={20} className="text-warning" />
              </motion.div>
            ) : (
              <motion.div key="moon" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
                <Moon size={20} className="text-muted-foreground" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>

        <button className="relative flex h-10 w-10 items-center justify-center rounded-xl hover:bg-muted transition-colors">
          <Bell size={20} className="text-muted-foreground" />
          <span className="absolute top-1.5 right-1.5 h-2.5 w-2.5 rounded-full bg-destructive ring-2 ring-card" />
        </button>
        <div className="relative">
          <button onClick={() => setDropdownOpen(!dropdownOpen)} className="flex items-center gap-2 rounded-xl p-2 hover:bg-muted transition-colors">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">
              {user?.prenom?.[0]}{user?.nom?.[0]}
            </div>
            <div className="hidden md:block text-left">
              <p className="text-sm font-medium">{user?.prenom} {user?.nom}</p>
              <p className="text-xs text-muted-foreground">{role ? ROLE_LABELS[role] : ''}</p>
            </div>
            <ChevronDown size={16} className="text-muted-foreground hidden md:block" />
          </button>
          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-1 w-48 rounded-2xl bg-card shadow-lg border border-border py-2 animate-in fade-in slide-in-from-top-2">
              <button onClick={() => { setDropdownOpen(false); navigate('/profil'); }} className="flex w-full items-center gap-2 px-4 py-2.5 text-sm hover:bg-muted transition-colors">
                <UserCircle size={18} /> Profil
              </button>
              <button onClick={() => { setDropdownOpen(false); logout(); navigate('/login'); }} className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-destructive hover:bg-destructive/10 transition-colors">
                <LogOut size={18} /> Déconnexion
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Topbar;
