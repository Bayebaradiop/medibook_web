import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Stethoscope, Menu, X, Calendar, UserCheck, PhoneCall, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Rechercher', href: '#search' },
    { label: 'Spécialités', href: '#specialties' },
    { label: 'Médecins', href: '#doctors' },
    { label: 'Comment ça marche', href: '#how-it-works' },
    { label: 'Espace Pro', href: '#features' },
    { label: 'FAQ', href: '#faq' },
  ];

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/90 backdrop-blur-md shadow-sm border-b border-gray-100 py-3'
          : 'bg-gradient-to-b from-slate-900/60 to-transparent py-4 text-white'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div
            onClick={() => navigate('/')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className={`h-11 w-11 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-105 shadow-md ${
              isScrolled ? 'bg-primary text-white shadow-primary/20' : 'bg-primary text-white shadow-primary/40'
            }`}>
              <Stethoscope className="h-6 w-6" />
            </div>
            <div>
              <span className={`text-2xl font-bold tracking-tight ${isScrolled ? 'text-gray-900' : 'text-white'}`}>
                Medi<span className="text-primary-light">Book</span>
              </span>
              <span className={`block text-[10px] uppercase font-semibold tracking-wider ${isScrolled ? 'text-gray-500' : 'text-emerald-200'}`}>
                Portail de Santé
              </span>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={(e) => scrollToSection(e, link.href)}
                className={`text-sm font-medium transition-colors hover:text-primary-light ${
                  isScrolled ? 'text-gray-700 hover:text-primary' : 'text-white/90'
                }`}
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* CTA Buttons */}
          <div className="hidden lg:flex items-center gap-3">
            <button
              onClick={() => navigate('/login')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                isScrolled
                  ? 'text-primary bg-primary/10 hover:bg-primary/15'
                  : 'text-white bg-white/15 hover:bg-white/25 border border-white/20 backdrop-blur-sm'
              }`}
            >
              <UserCheck className="h-4 w-4" />
              Espace Pro / Connexion
            </button>
            <button
              onClick={() => navigate('/login')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-primary hover:bg-primary-dark shadow-md shadow-primary/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Calendar className="h-4 w-4" />
              Prendre RDV
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => navigate('/login')}
              className="p-2 rounded-xl bg-primary text-white text-xs font-semibold"
            >
              RDV
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`p-2 rounded-xl border ${
                isScrolled
                  ? 'border-gray-200 text-gray-800 bg-gray-50'
                  : 'border-white/20 text-white bg-white/10'
              }`}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-b border-gray-200 px-4 pt-3 pb-6 shadow-xl"
          >
            <div className="flex flex-col gap-3">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={(e) => scrollToSection(e, link.href)}
                  className="px-3 py-2 rounded-lg text-base font-medium text-gray-800 hover:bg-emerald-50 hover:text-primary transition-colors"
                >
                  {link.label}
                </a>
              ))}
              <div className="pt-3 border-t border-gray-100 flex flex-col gap-2">
                <button
                  onClick={() => { setMobileMenuOpen(false); navigate('/login'); }}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-primary text-primary font-semibold text-sm hover:bg-primary/5"
                >
                  <UserCheck className="h-4 w-4" />
                  Espace Pro / Connexion
                </button>
                <button
                  onClick={() => { setMobileMenuOpen(false); navigate('/login'); }}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-white font-semibold text-sm shadow-md shadow-primary/30"
                >
                  <Calendar className="h-4 w-4" />
                  Prendre Rendez-vous
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
