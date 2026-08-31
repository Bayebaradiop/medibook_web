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
  CheckCircle2
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
      toast.success('Planning créé avec succès');
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
      <DashboardLayout title="Nouveau Planning">
        <FormSkeleton />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Nouveau Planning">
      <div className="max-w-5xl mx-auto space-y-4">
        
        {/* Barre de Commandes Supérieure Compacte */}
        <div className="flex items-center justify-between">
          <button 
            onClick={() => navigate(-1)} 
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border bg-card hover:bg-muted text-xs font-bold text-muted-foreground hover:text-foreground transition-all"
          >
            <ArrowLeft size={14} />
            <span>Retour</span>
          </button>

          <div className="flex items-center gap-2">
            <button 
              type="button" 
              onClick={() => navigate(-1)} 
              className="px-3.5 py-1.5 rounded-xl border border-border bg-card hover:bg-muted text-xs font-bold text-muted-foreground transition-all"
            >
              Annuler
            </button>
            <button 
              onClick={handleSubmit}
              disabled={submitting || preview.length === 0} 
              className="medibook-btn px-4 py-1.5 text-xs font-bold flex items-center gap-1.5 disabled:opacity-50"
            >
              {submitting ? <Loader2 className="animate-spin" size={14} /> : <Sparkles size={14} />}
              <span>Générer le Planning</span>
            </button>
          </div>
        </div>

        {/* Grille 2 Colonnes Compacte Sans Scroll */}
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-4">
          
          {/* Colonne Gauche : Paramètres (7 cols) */}
          <div className="md:col-span-7 medibook-card bg-card p-5 rounded-2xl border border-border space-y-4">
            
            {/* Médecin */}
            <div>
              <label className="text-xs font-bold text-foreground mb-1 block flex items-center gap-1.5">
                <Stethoscope size={14} className="text-primary" />
                Médecin Praticien
              </label>
              <select 
                value={medecinId} 
                onChange={e => updateField('medecinId', e.target.value)}
                className="medibook-input w-full text-xs font-bold bg-card text-foreground border-border hover:bg-muted focus:ring-2 focus:ring-primary rounded-xl cursor-pointer"
              >
                {medecins.map(m => (
                  <option key={m.id} value={m.id} className="bg-card text-foreground">
                    Dr. {m.prenom} {m.nom} {m.specialiteNom ? `(${m.specialiteNom})` : ''}
                  </option>
                ))}
              </select>
              {erreurs.medecinId && <p className="text-[11px] text-rose-500 mt-0.5 font-semibold">{erreurs.medecinId}</p>}
            </div>

            {/* Jour de la Semaine */}
            <div>
              <label className="text-xs font-bold text-foreground mb-1.5 block">Jour d&apos;ouverture</label>
              <div className="grid grid-cols-7 gap-1">
                {DAYS_OF_WEEK.map((day) => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => updateField('jourSemaine', day)}
                    className={`py-1.5 text-[11px] font-bold rounded-lg border transition-all ${
                      jourSemaine === day
                        ? 'border-primary bg-primary text-primary-foreground shadow-2xs'
                        : 'border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted'
                    }`}
                  >
                    {day.slice(0, 3)}
                  </button>
                ))}
              </div>
            </div>

            {/* Horaires et Durée */}
            <div className="grid grid-cols-3 gap-3 pt-1">
              <div>
                <label className="text-xs font-bold text-foreground mb-1 block flex items-center gap-1">
                  <Clock size={12} className="text-primary" /> Heure début
                </label>
                <input 
                  type="time" 
                  value={heureDebut} 
                  onChange={e => updateField('heureDebut', e.target.value)} 
                  className="medibook-input w-full text-xs font-bold rounded-xl"
                />
                {erreurs.heureDebut && <p className="text-[10px] text-rose-500 mt-0.5 font-semibold">{erreurs.heureDebut}</p>}
              </div>

              <div>
                <label className="text-xs font-bold text-foreground mb-1 block flex items-center gap-1">
                  <Clock size={12} className="text-primary" /> Heure fin
                </label>
                <input 
                  type="time" 
                  value={heureFin} 
                  onChange={e => updateField('heureFin', e.target.value)} 
                  className="medibook-input w-full text-xs font-bold rounded-xl"
                />
                {erreurs.heureFin && <p className="text-[10px] text-rose-500 mt-0.5 font-semibold">{erreurs.heureFin}</p>}
              </div>

              <div>
                <label className="text-xs font-bold text-foreground mb-1 block">Durée créneau</label>
                <select 
                  value={duree} 
                  onChange={e => updateField('dureeCreneau', e.target.value)} 
                  className="medibook-input w-full text-xs font-bold rounded-xl bg-card text-foreground cursor-pointer"
                >
                  {durations.map(d => <option key={d} value={d} className="bg-card text-foreground">{d} min</option>)}
                </select>
              </div>
            </div>

          </div>

          {/* Colonne Droite : Aperçu Compact (5 cols) */}
          <div className="md:col-span-5 medibook-card bg-card p-5 rounded-2xl border border-border flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-bold text-foreground flex items-center gap-1.5 uppercase tracking-wider">
                  <Sparkles size={14} className="text-amber-500" />
                  <span>Aperçu Généré</span>
                </h3>
                <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-lg border border-primary/20">
                  {preview.length} créneaux
                </span>
              </div>

              <p className="text-[11px] text-muted-foreground font-medium mb-3">
                Chaque <span className="font-bold text-foreground">{jourSemaine}</span> de <span className="font-bold text-foreground">{heureDebut}</span> à <span className="font-bold text-foreground">{heureFin}</span> ({duree} min / RDV).
              </p>

              <div className="grid grid-cols-2 gap-1.5 max-h-56 overflow-y-auto pr-1">
                {preview.map((slot, i) => (
                  <div 
                    key={i} 
                    className="bg-muted/40 text-foreground text-[11px] font-bold rounded-lg py-1 px-2 text-center border border-border/50 flex items-center justify-center gap-1"
                  >
                    <CheckCircle2 size={11} className="text-emerald-500" />
                    <span>{slot}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-border/60 text-[11px] text-muted-foreground italic">
              * Les créneaux générés seront réservables immédiatement.
            </div>
          </div>

        </form>

      </div>
    </DashboardLayout>
  );
};

export default PlanningFormPage;
