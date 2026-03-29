import { ReactNode } from 'react';
import { Activity, CalendarClock, ShieldCheck } from 'lucide-react';
import PhoneMockup from '@/components/PhoneMockup';

const AuthLayout = ({ children }: { children: ReactNode }) => (
  <div className="relative min-h-screen overflow-hidden bg-[#f7faf7]">
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(46,125,50,0.14),_transparent_34%),radial-gradient(circle_at_bottom_right,_rgba(102,187,106,0.12),_transparent_32%),linear-gradient(180deg,_#ffffff_0%,_#f7faf7_100%)]" />
    <div className="absolute left-[-5rem] top-20 h-56 w-56 rounded-full bg-primary/10 blur-3xl" />
    <div className="absolute bottom-[-6rem] right-[-2rem] h-72 w-72 rounded-full bg-primary-light/20 blur-3xl" />

    <div className="relative mx-auto flex min-h-screen w-full max-w-7xl items-center px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid w-full gap-8 lg:grid-cols-[minmax(0,460px)_1fr] lg:items-center lg:gap-12">
        <div className="relative z-10">{children}</div>

        <div className="hidden lg:block">
          <div className="rounded-[36px] border border-white/80 bg-white/85 p-8 shadow-[0_30px_80px_rgba(46,125,50,0.12)] backdrop-blur-xl xl:p-10">
            <div className="grid items-center gap-10 xl:grid-cols-[minmax(0,1fr)_220px]">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 rounded-full border border-primary/10 bg-primary/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-primary">
                  <ShieldCheck size={14} />
                  Espace securise
                </div>

                <div className="space-y-3">
                  <h2 className="max-w-lg text-4xl font-semibold leading-tight text-slate-900">
                    Une connexion plus claire, plus legere, plus medicale.
                  </h2>
                  <p className="max-w-xl text-base leading-7 text-slate-600">
                    MediBook centralise la gestion du cabinet, des plannings et des rendez-vous dans une interface
                    plus calme, ou le blanc reprend sa place et le vert reste un accent de confiance.
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
                    <Activity size={18} className="text-primary" />
                    <p className="mt-3 text-sm font-semibold text-slate-900">Suivi du cabinet</p>
                    <p className="mt-1 text-xs leading-5 text-slate-500">Identite visuelle, activite et acces au meme endroit.</p>
                  </div>
                  <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
                    <CalendarClock size={18} className="text-primary" />
                    <p className="mt-3 text-sm font-semibold text-slate-900">Rendez-vous fluides</p>
                    <p className="mt-1 text-xs leading-5 text-slate-500">Plannings, confirmations et disponibilites toujours lisibles.</p>
                  </div>
                  <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
                    <ShieldCheck size={18} className="text-primary" />
                    <p className="mt-3 text-sm font-semibold text-slate-900">Acces protege</p>
                    <p className="mt-1 text-xs leading-5 text-slate-500">Admins, medecins et secretaires retrouvent leur espace en securite.</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-center xl:justify-end">
                <PhoneMockup isVisible />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default AuthLayout;
