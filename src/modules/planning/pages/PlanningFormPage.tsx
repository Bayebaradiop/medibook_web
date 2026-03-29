import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/layouts/DashboardLayout';
import { DAYS_OF_WEEK } from '@/utils/constants';
import { ArrowLeft, Loader2 } from 'lucide-react';
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

  if (normalise.includes('heure de fin') || normalise.includes('heure fin')) {
    return { heureFin: message };
  }

  if (normalise.includes('heure de début') || normalise.includes('heure debut')) {
    return { heureDebut: message };
  }

  if (normalise.includes('médecin') || normalise.includes('medecin')) {
    return { medecinId: message };
  }

  if (normalise.includes('planning') || normalise.includes('créneau') || normalise.includes('creneau')) {
    return { heureDebut: message, heureFin: message };
  }

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
        const data = estObjet(res.data) && 'data' in res.data ? res.data.data : res.data;
        const liste = Array.isArray(data) ? data : [];
        setMedecins(liste);
        if (liste.length > 0) setMedecinId(liste[0].id);
      } catch {
        toast.error(PLANNING_ERREURS.CHARGEMENT_ECHOUE);
      } finally {
        setLoading(false);
      }
    };
    charger();
  }, []);

  const preview = useMemo(() => {
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

  const afficherErreursChamps = (nouvellesErreurs: ErreursChamp) => {
    setErreurs(nouvellesErreurs);

    const premierChamp = Object.keys(nouvellesErreurs)[0];
    if (!premierChamp) return;

    requestAnimationFrame(() => {
      const champ = document.querySelector<HTMLElement>(`[name="${premierChamp}"]`);
      champ?.focus();
    });
  };

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

    const payload = {
      medecinId,
      jourSemaine,
      heureDebut,
      heureFin,
      dureeCreneau: duree,
    };

    const validation = validerPlanningForm(payload);
    if (Object.keys(validation).length > 0) {
      afficherErreursChamps(validation);
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

      if (Object.keys(fieldErrors).length > 0) {
        afficherErreursChamps(fieldErrors);
        return;
      }

      const messageErreur = resp?.message || resp?.error?.description;
      const mappedErrors = mapperMessageVersErreursChamp(messageErreur);
      if (Object.keys(mappedErrors).length > 0) {
        afficherErreursChamps(mappedErrors);
        return;
      }

      const msg = messageErreur || PLANNING_ERREURS.CREATION_ECHOUEE;
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = (champ: string) =>
    `medibook-input w-full ${erreurs[champ] ? 'border-destructive ring-1 ring-destructive' : ''}`;

  if (loading) return (
    <DashboardLayout title="Nouveau Planning">
      <div className="flex justify-center py-12"><Loader2 className="animate-spin text-primary" size={32} /></div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout title="Nouveau Planning">
      <div className="space-y-6 max-w-3xl">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"><ArrowLeft size={18} /> Retour</button>

        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          <div className="medibook-card">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-secondary-foreground mb-1.5 block">Médecin</label>
                <select name="medecinId" value={medecinId} onChange={e => updateField('medecinId', e.target.value)} className={inputClass('medecinId')}>
                  {medecins.map(m => <option key={m.id} value={m.id}>Dr. {m.prenom} {m.nom}</option>)}
                </select>
                {erreurs.medecinId && <p className="mt-1 text-xs text-destructive">{erreurs.medecinId}</p>}
              </div>
              <div>
                <label className="text-sm font-medium text-secondary-foreground mb-1.5 block">Jour</label>
                <select name="jourSemaine" value={jourSemaine} onChange={e => updateField('jourSemaine', e.target.value)} className={inputClass('jourSemaine')}>
                  {DAYS_OF_WEEK.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
                {erreurs.jourSemaine && <p className="mt-1 text-xs text-destructive">{erreurs.jourSemaine}</p>}
              </div>
              <div>
                <label className="text-sm font-medium text-secondary-foreground mb-1.5 block">Heure début</label>
                <input name="heureDebut" type="time" value={heureDebut} onChange={e => updateField('heureDebut', e.target.value)} className={inputClass('heureDebut')} />
                {erreurs.heureDebut && <p className="mt-1 text-xs text-destructive">{erreurs.heureDebut}</p>}
              </div>
              <div>
                <label className="text-sm font-medium text-secondary-foreground mb-1.5 block">Heure fin</label>
                <input name="heureFin" type="time" value={heureFin} onChange={e => updateField('heureFin', e.target.value)} className={inputClass('heureFin')} />
                {erreurs.heureFin && <p className="mt-1 text-xs text-destructive">{erreurs.heureFin}</p>}
              </div>
              <div>
                <label className="text-sm font-medium text-secondary-foreground mb-1.5 block">Durée créneau (min)</label>
                <select name="dureeCreneau" value={duree} onChange={e => updateField('dureeCreneau', e.target.value)} className={inputClass('dureeCreneau')}>
                  {durations.map(d => <option key={d} value={d}>{d} minutes</option>)}
                </select>
                {erreurs.dureeCreneau && <p className="mt-1 text-xs text-destructive">{erreurs.dureeCreneau}</p>}
              </div>
            </div>
          </div>

          {preview.length > 0 && (
            <div className="medibook-card">
              <h3 className="font-semibold mb-3">Aperçu des créneaux ({preview.length})</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {preview.map((slot, i) => (
                  <div key={i} className="bg-primary/5 text-primary text-xs font-medium rounded-lg p-2 text-center border border-primary/10">{slot}</div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => navigate(-1)} className="medibook-btn-outline">Annuler</button>
            <button type="submit" disabled={submitting} className="medibook-btn flex items-center gap-2">
              {submitting && <Loader2 className="animate-spin" size={16} />}
              Créer le planning
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default PlanningFormPage;
