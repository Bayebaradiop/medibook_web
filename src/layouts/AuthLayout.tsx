import { ReactNode } from 'react';
import { Hospital } from 'lucide-react';
import PhoneMockup from '@/components/PhoneMockup';

const AuthLayout = ({ children }: { children: ReactNode }) => (
  <div className="relative min-h-screen overflow-hidden bg-[#f7faf7]">
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(46,125,50,0.10),_transparent_34%),radial-gradient(circle_at_bottom_right,_rgba(102,187,106,0.08),_transparent_32%),linear-gradient(180deg,_#ffffff_0%,_#f7faf7_100%)]" />
    <div className="absolute left-[-5rem] top-20 h-56 w-56 rounded-full bg-primary/8 blur-3xl" />
    <div className="absolute bottom-[-6rem] right-[-2rem] h-72 w-72 rounded-full bg-primary-light/15 blur-3xl" />

    <div className="relative mx-auto flex min-h-screen w-full max-w-7xl items-center px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid w-full gap-8 lg:grid-cols-[minmax(0,420px)_1fr] lg:items-center lg:gap-16">
        <div className="relative z-10">{children}</div>

        <div className="hidden lg:flex lg:flex-col lg:items-center lg:justify-center">
          <div className="flex flex-col items-center gap-8">
            <PhoneMockup isVisible />
            <div className="text-center">
              <div className="inline-flex items-center gap-2 text-primary/60">
                <Hospital size={16} />
                <span className="text-sm font-medium tracking-wide">MediBook</span>
              </div>
              <p className="mt-2 max-w-xs text-sm text-slate-400">
                Votre cabinet medical, accessible partout.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default AuthLayout;
