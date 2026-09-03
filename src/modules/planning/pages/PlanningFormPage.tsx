import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/layouts/DashboardLayout';
import { FormSkeleton } from '@/components/common/SkeletonLoaders';
import { DAYS_OF_WEEK } from '@/utils/constants';
import { 
  ArrowLeft, 
  Loader2, 
  Clock, 
  Stethoscope, 
  Sparkles, 
  CheckCircle2,
  CalendarDays
} from 'lucide-react';
import { toast } from 'sonner';
import { planningService } from '@/modules/planning/services/planningService';
import { secretaireMedecinsService } from '@/modules/utilisateur/services/utilisateurService';
import type { Medecin } from '@/modules/utilisateur/types/utilisateur.types';
import { validerPlanningForm } from '@/modules/planning/logique/planning.validation';
import { PLANNING_ERREURS } from '@/modules/planning/messages/planning.erreurs';

const durations = [15, 20, 30, 45, 60];

type ErreursChamp = Record<string, string>;

interface BackendErrorPayload {
  message?: string;
  error?: {
    description?: string;
    details?: unknown;
  };
}

const estObjet = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const extraireErreursChamp = (payload?: BackendErrorPayload): ErreursChamp => {
  const details = payload?.error?.details;
  if (!estObjet(details)) return {};

  return Object.entries(details).reduce<ErreursChamp>((acc, [champ, message]) => {
    if (typeof message === 'string' && message.trim()) {
      acc[champ] = message;
    }
    return acc;
  }, {});
};

const mapperMessageVersErreursChamp = (message?: string): ErreursChamp => {
  if (!message) return {};
  const normalise = message.toLowerCase();
  if (normalise.includes('heure de fin') || normalise.includes('heure fin')) return { heureFin: message };
  if (normalise.includes('heure de début') || normalise.includes('heure debut')) return { heureDebut: message };
  if (normalise.includes('médecin') || normalise.includes('medecin')) return { medecinId: message };
  if (normalise.includes('planning') || normalise.includes('créneau')) return { heureDebut: message, heureFin: message };
  return {};
};

const PlanningFormPage = () => {
  const navigate = useNavigate();
  const [medecins, setMedecins] = useState<Medecin[]>([]);
  const [medecinId, setMedecinId] = useState<number>(0);
  const [jourSemaine, setJourSemaine] = useState('LUNDI');
  const [heureDebut, setHeureDebut] = useState('08:00');
  const [heureFin, setHeureFin] = useState('12:00');
  const [duree, setDuree] = useState(30);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [erreurs, setErreurs] = useState<Record<string, string>>({});

  useEffect(() => {
    const charger = async () => {
      try {
        const res = await secretaireMedecinsService.list();
        const raw = estObjet(res.data) && 'data' in res.data ? (res.data as any).data : res.data;
        const liste = Array.isArray(raw) ? raw : Array.isArray(raw?.content) ? raw.content : [];
        setMedecins(liste);
        if (liste.length > 0) setMedecinId(Number(liste[0].id));
      } catch {
        toast.error(PLANNING_ERREURS.CHARGEMENT_ECHOUE);
      } finally {
        setLoading(false);
      }
    };
    charger();
  }, []);

  const preview = useMemo(() => {
    if (!heureDebut || !heureFin) return [];
    const slots: string[] = [];
    const [sh, sm] = heureDebut.split(':').map(Number);
    const [eh, em] = heureFin.split(':').map(Number);
    let current = sh * 60 + sm;
    const end = eh * 60 + em;
    while (current + duree <= end) {
      const h = Math.floor(current / 60).toString().padStart(2, '0');
      const m = (current % 60).toString().padStart(2, '0');
      const h2 = Math.floor((current + duree) / 60).toString().padStart(2, '0');
      const m2 = ((current + duree) % 60).toString().padStart(2, '0');
      slots.push(`${h}:${m} - ${h2}:${m2}`);
      current += duree;
    }
    return slots;
  }, [heureDebut, heureFin, duree]);

  const updateField = (champ: string, valeur: string | number) => {
    if (champ === 'medecinId') setMedecinId(Number(valeur));
    if (champ === 'jourSemaine') setJourSemaine(String(valeur));
    if (champ === 'heureDebut') setHeureDebut(String(valeur));
    if (champ === 'heureFin') setHeureFin(String(valeur));
    if (champ === 'dureeCreneau') setDuree(Number(valeur));

    if (erreurs[champ]) {
      setErreurs(prev => {
        const copy = { ...prev };
        delete copy[champ];
        return copy;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = { medecinId, jourSemaine, heureDebut, heureFin, dureeCreneau: duree };
    const validation = validerPlanningForm(payload);
    if (Object.keys(validation).length > 0) {
      setErreurs(validation);
      return;
    }

    setErreurs({});
    setSubmitting(true);
    try {
      await planningService.create(payload);
      toast.success('Template de semaine créé avec succès');
      navigate('/secretaire/plannings');
    } catch (error: unknown) {
      const resp = estObjet(error) && 'response' in error && estObjet(error.response) && 'data' in error.response
        ? error.response.data as BackendErrorPayload
        : undefined;
      const fieldErrors = extraireErreursChamp(resp);
      if (Object.keys(fieldErrors).length > 0) { setErreurs(fieldErrors); return; }
      const msg = resp?.message || resp?.error?.description || PLANNING_ERREURS.CREATION_ECHOUEE;
      setErreurs(mapperMessageVersErreursChamp(msg));
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Template Semaine Médecin">
        <FormSkeleton />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Template Semaine Médecin">
      <div className="max-w-5xl mx-auto space-y-6 pb-12">
        
        {/* En-tête et navigation retour */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <button 
            onClick={() => navigate(-1)} 
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border bg-card hover:bg-muted text-sm font-semibold text-muted-foreground hover:text-foreground transition-all shadow-xs"
          >
            <ArrowLeft size={18} />
            <span>Retour</span>
          </button>

          <div className="flex items-center gap-3">
            <button 
              type="button" 
              onClick={() => navigate(-1)} 
              className="px-5 py-2.5 rounded-xl border border-border bg-card hover:bg-muted text-sm font-bold text-muted-foreground transition-all"
            >
              Annuler
            </button>
            <button 
              onClick={handleSubmit}
              disabled={submitting || preview.length === 0} 
              className="medibook-btn px-6 py-2.5 text-sm font-bold flex items-center gap-2 shadow-md disabled:opacity-50"
            >
              {submitting ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle2 size={18} />}
              <span>Enregistrer le Template</span>
            </button>
          </div>
        </div>

        {/* Grille Principale Formulaire + Aperçu */}
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Colonne Gauche : Configuration (7 cols) */}
          <div className="lg:col-span-7 medibook-card bg-card p-6 md:p-8 rounded-2xl border border-border space-y-6 shadow-sm">
            
            <div className="flex items-center gap-3 pb-4 border-b border-border/60">
              <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                <CalendarDays size={20} />
              </div>
              <div>
                <h3 className="font-bold text-base md:text-lg text-foreground">Horaires Hebdomadaires</h3>
                <p className="text-xs md:text-sm text-muted-foreground">Définissez les créneaux récurrents de consultation</p>
              </div>
            </div>

            {/* Médecin Praticien */}
            <div>
              <label className="text-sm font-bold text-foreground mb-2 block flex items-center gap-2">
                <Stethoscope size={18} className="text-primary" />
                Médecin Praticien <span className="text-destructive">*</span>
              </label>
              <select 
                value={medecinId} 
                onChange={e => updateField('medecinId', e.target.value)}
                className="medibook-input w-full text-sm md:text-base py-3 px-4 font-semibold bg-card text-foreground border-border hover:bg-muted/50 focus:ring-2 focus:ring-primary rounded-xl cursor-pointer"
              >
                {medecins.map(m => (
                  <option key={m.id} value={m.id} className="bg-card text-foreground py-1">
                    Dr. {m.prenom} {m.nom} {m.specialiteNom ? `(${m.specialiteNom})` : ''}
                  </option>
                ))}
              </select>
              {erreurs.medecinId && <p className="text-xs text-destructive mt-1 font-semibold">{erreurs.medecinId}</p>}
            </div>

            {/* Jour de la Semaine */}
            <div>
              <label className="text-sm font-bold text-foreground mb-2 block">
                Jour de la semaine <span className="text-destructive">*</span>
              </label>
              <div className="grid grid-cols-7 gap-1.5">
                {DAYS_OF_WEEK.map((day) => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => updateField('jourSemaine', day)}
                    className={`py-2.5 text-xs md:text-sm font-bold rounded-xl border transition-all ${
                      jourSemaine === day
                        ? 'border-primary bg-primary text-primary-foreground shadow-sm scale-[1.02]'
                        : 'border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted'
                    }`}
                  >
                    {day.slice(0, 3)}
                  </button>
                ))}
              </div>
            </div>

            {/* Horaires et Durée */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div>
                <label className="text-sm font-bold text-foreground mb-2 block flex items-center gap-1.5">
                  <Clock size={16} className="text-primary" /> Heure Début
                </label>
                <input 
                  type="time" 
                  value={heureDebut} 
                  onChange={e => updateField('heureDebut', e.target.value)} 
                  className="medibook-input w-full text-sm md:text-base py-2.5 px-3.5 font-semibold rounded-xl"
                />
                {erreurs.heureDebut && <p className="text-xs text-destructive mt-1 font-semibold">{erreurs.heureDebut}</p>}
              </div>

              <div>
                <label className="text-sm font-bold text-foreground mb-2 block flex items-center gap-1.5">
                  <Clock size={16} className="text-primary" /> Heure Fin
                </label>
                <input 
                  type="time" 
                  value={heureFin} 
                  onChange={e => updateField('heureFin', e.target.value)} 
                  className="medibook-input w-full text-sm md:text-base py-2.5 px-3.5 font-semibold rounded-xl"
                />
                {erreurs.heureFin && <p className="text-xs text-destructive mt-1 font-semibold">{erreurs.heureFin}</p>}
              </div>

              <div>
                <label className="text-sm font-bold text-foreground mb-2 block">Durée Consultation</label>
                <select 
                  value={duree} 
                  onChange={e => updateField('dureeCreneau', e.target.value)} 
                  className="medibook-input w-full text-sm md:text-base py-2.5 px-3.5 font-semibold rounded-xl bg-card text-foreground cursor-pointer"
                >
                  {durations.map(d => <option key={d} value={d} className="bg-card text-foreground">{d} minutes</option>)}
                </select>
              </div>
            </div>

          </div>

          {/* Colonne Droite : Aperçu des Créneaux Générés (5 cols) */}
          <div className="lg:col-span-5 medibook-card bg-card p-6 md:p-8 rounded-2xl border border-border flex flex-col justify-between space-y-5 shadow-sm">
            <div>
              <div className="flex items-center justify-between mb-3 border-b border-border/60 pb-3">
                <h3 className="text-sm md:text-base font-bold text-foreground flex items-center gap-2 uppercase tracking-wider">
                  <Sparkles size={18} className="text-amber-500" />
                  <span>Aperçu des Créneaux</span>
                </h3>
                <span className="text-xs md:text-sm font-bold text-primary bg-primary/10 px-3 py-1 rounded-xl border border-primary/20">
                  {preview.length} créneaux
                </span>
              </div>

              <p className="text-xs md:text-sm text-muted-foreground font-medium mb-4 leading-relaxed">
                Plage horaire configurée pour chaque <span className="font-bold text-foreground uppercase">{jourSemaine}</span> de <span className="font-bold text-foreground">{heureDebut}</span> à <span className="font-bold text-foreground">{heureFin}</span> ({duree} min par RDV).
              </p>

              <div className="grid grid-cols-2 gap-2 max-h-72 overflow-y-auto pr-1">
                {preview.map((slot, i) => (
                  <div 
                    key={i} 
                    className="bg-muted/50 text-foreground text-xs md:text-sm font-bold rounded-xl py-2 px-3 text-center border border-border/60 flex items-center justify-center gap-1.5 shadow-2xs hover:border-primary/40 transition-colors"
                  >
                    <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                    <span>{slot}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-border/60 text-xs md:text-sm text-muted-foreground italic">
              * Les créneaux générés à partir de ce template seront automatiquement mis à disposition des patients pour la prise de rendez-vous.
            </div>
          </div>

        </form>

      </div>
    </DashboardLayout>
  );
};

export default PlanningFormPage;
