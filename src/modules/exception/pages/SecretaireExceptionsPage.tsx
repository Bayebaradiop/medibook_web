import { useCallback, useEffect, useState, useMemo } from "react";
import DashboardLayout from "@/layouts/DashboardLayout";
import Modal from "@/components/common/Modal";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import { 
  Plus, 
  Trash2, 
  Pencil,
  CalendarX, 
  Loader2, 
  Stethoscope, 
  Search, 
  Clock, 
  AlertTriangle,
  Umbrella,
  Lock,
  RefreshCw,
  Info,
  Calendar as CalendarIcon
} from "lucide-react";
import { toast } from "sonner";
import { isAxiosError } from "axios";
import { secretaireMedecinsService } from "@/modules/utilisateur/services/utilisateurService";
import type { Medecin } from "@/modules/utilisateur/types/utilisateur.types";
import { exceptionSecretaireService } from "../services/exceptionService";
import type { ExceptionForm, ExceptionPlanning } from "../types/exception.types";
import { EXCEPTION_ERREURS } from "../messages/exception.erreurs";
import { EXCEPTION_SUCCES } from "../messages/exception.succes";
import { validerExceptionForm } from "../logique/exception.validation";

const hasDataProperty = (value: unknown): value is { data: unknown } =>
  typeof value === "object" && value !== null && "data" in value;

const hasMessageProperty = (value: unknown): value is { message: string } =>
  typeof value === "object" &&
  value !== null &&
  "message" in value &&
  typeof (value as { message: unknown }).message === "string";

const hasErrorProperty = (value: unknown): value is { error: string } =>
  typeof value === "object" &&
  value !== null &&
  "error" in value &&
  typeof (value as { error: unknown }).error === "string";

const extraireMessageErreur = (value: unknown): string | undefined => {
  if (hasMessageProperty(value)) return value.message;
  if (hasErrorProperty(value)) return value.error;

  if (typeof value === "object" && value !== null && "error" in value) {
    const errorValue = (value as { error?: unknown }).error;
    if (
      typeof errorValue === "object" &&
      errorValue !== null &&
      "description" in errorValue &&
      typeof (errorValue as { description?: unknown }).description === "string"
    ) {
      return (errorValue as { description: string }).description;
    }
  }

  return undefined;
};

const extraireListe = <T,>(value: unknown): T[] => {
  if (Array.isArray(value)) return value as T[];
  if (hasDataProperty(value)) {
    if (Array.isArray(value.data)) return value.data as T[];
    const inner = value.data as Record<string, unknown>;
    if (inner && typeof inner === 'object' && Array.isArray(inner.content)) return inner.content as T[];
  }
  return [];
};

const extraireErreursChamp = (value: unknown): Record<string, string> => {
  if (!hasDataProperty(value) || typeof value.data !== "object" || value.data === null) {
    return {};
  }

  const payload = value.data as { error?: { details?: unknown } };
  if (typeof payload.error !== "object" || payload.error === null || typeof payload.error.details !== "object" || payload.error.details === null) {
    return {};
  }

  return Object.entries(payload.error.details as Record<string, unknown>).reduce<Record<string, string>>((acc, [champ, message]) => {
    if (typeof message === "string" && message.trim()) {
      acc[champ] = message;
    }
    return acc;
  }, {});
};

const mapperMessageVersErreursChamp = (message?: string): Record<string, string> => {
  if (message === EXCEPTION_ERREURS.HEURE_FIN_AVANT_DEBUT) {
    return { heureFin: message };
  }
  if (message?.includes("dateFin") || message?.includes("date de fin")) {
    return { dateFin: message };
  }
  if (message?.includes("plusieurs jours")) {
    return { heureDebut: message, heureFin: message };
  }

  return {};
};

const initialForm: ExceptionForm = {
  dateDebut: "",
  dateFin: "",
  type: "ABSENT",
  heureDebut: "",
  heureFin: "",
  motif: "",
};

const SecretaireExceptionsPage = () => {
  const [loading, setLoading] = useState(true);
  const [loadingExceptions, setLoadingExceptions] = useState(false);
  const [selectedMedecin, setSelectedMedecin] = useState<number | null>(null);
  const [medecins, setMedecins] = useState<Medecin[]>([]);
  const [exceptions, setExceptions] = useState<ExceptionPlanning[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [form, setForm] = useState<ExceptionForm>(initialForm);
  const [erreurs, setErreurs] = useState<Record<string, string>>({});
  const [filterType, setFilterType] = useState<string>("TOUS");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const chargerExceptions = useCallback(async (medecinId: number) => {
    setLoadingExceptions(true);
    try {
      const res = await exceptionSecretaireService.list(medecinId);
      setExceptions(extraireListe<ExceptionPlanning>(res.data));
    } catch (error) {
      if (isAxiosError(error)) {
        const message = extraireMessageErreur(error.response?.data);
        if (message) {
          toast.error(message);
          setExceptions([]);
          return;
        }
      }

      toast.error(EXCEPTION_ERREURS.CHARGEMENT_ECHOUE);
      setExceptions([]);
    } finally {
      setLoadingExceptions(false);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      try {
        const res = await secretaireMedecinsService.list();
        const liste = extraireListe<Medecin>(res.data);
        setMedecins(liste);

        if (liste.length > 0) {
          const medecinId = Number(liste[0].id);
          setSelectedMedecin(medecinId);
          await chargerExceptions(medecinId);
        }
      } catch {
        toast.error("Erreur lors du chargement des médecins");
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [chargerExceptions]);

  const handleChangeMedecin = async (value: string) => {
    const medecinId = Number(value);
    setSelectedMedecin(medecinId);
    await chargerExceptions(medecinId);
  };

  const updateForm = <K extends keyof ExceptionForm>(champ: K, valeur: ExceptionForm[K]) => {
    setForm((prev) => ({ ...prev, [champ]: valeur }));
    setErreurs((prev) => {
      const copy = { ...prev };
      delete copy[champ];
      return copy;
    });
  };

  const handleOpenCreate = () => {
    setEditingId(null);
    setForm(initialForm);
    setErreurs({});
    setModalOpen(true);
  };

  const handleOpenEdit = (ex: ExceptionPlanning) => {
    setEditingId(ex.id);
    setForm({
      dateDebut: ex.dateDebut,
      dateFin: ex.dateFin || ex.dateDebut,
      type: ex.type,
      heureDebut: ex.heureDebut || "",
      heureFin: ex.heureFin || "",
      motif: ex.motif || "",
    });
    setErreurs({});
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!selectedMedecin) return;

    const payload: ExceptionForm = {
      dateDebut: form.dateDebut,
      dateFin: form.dateFin,
      type: form.type,
      heureDebut: form.heureDebut?.trim() || undefined,
      heureFin: form.heureFin?.trim() || undefined,
      motif: form.motif,
    };

    const fieldErrors = validerExceptionForm(payload);
    setErreurs(fieldErrors);
    if (Object.keys(fieldErrors).length > 0) {
      return;
    }

    setSubmitting(true);
    try {
      if (editingId) {
        await exceptionSecretaireService.update(editingId, payload);
        toast.success("Indisponibilité mise à jour ! Créneaux recalculés.");
      } else {
        await exceptionSecretaireService.create(selectedMedecin, payload);
        toast.success(EXCEPTION_SUCCES.CREATION_REUSSIE);
      }

      setModalOpen(false);
      setForm(initialForm);
      setEditingId(null);
      setErreurs({});
      await chargerExceptions(selectedMedecin);
    } catch (error) {
      if (isAxiosError(error)) {
        const fieldErrorsFromApi = extraireErreursChamp(error.response);
        if (Object.keys(fieldErrorsFromApi).length > 0) {
          setErreurs(fieldErrorsFromApi);
          return;
        }

        const mappedErrors = mapperMessageVersErreursChamp(extraireMessageErreur(error.response?.data));
        if (Object.keys(mappedErrors).length > 0) {
          setErreurs(mappedErrors);
          return;
        }
      }

      if (isAxiosError(error)) {
        const message = extraireMessageErreur(error.response?.data);
        if (message) {
          toast.error(message);
          return;
        }
      }

      if (isAxiosError(error) && hasMessageProperty(error.response?.data)) {
        toast.error(error.response.data.message);
      } else {
        toast.error(editingId ? "Erreur lors de la modification" : EXCEPTION_ERREURS.CREATION_ECHOUEE);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId || !selectedMedecin) return;

    setDeleting(true);
    try {
      await exceptionSecretaireService.delete(selectedMedecin, deleteId);
      toast.success("Indisponibilité supprimée. Créneaux de nouveau disponibles !");
      setDeleteId(null);
      await chargerExceptions(selectedMedecin);
    } catch (error) {
      if (isAxiosError(error)) {
        const message = extraireMessageErreur(error.response?.data);
        if (message) {
          toast.error(message);
          return;
        }
      }

      if (isAxiosError(error) && hasMessageProperty(error.response?.data)) {
        toast.error(error.response.data.message);
      } else {
        toast.error(EXCEPTION_ERREURS.SUPPRESSION_ECHOUEE);
      }
    } finally {
      setDeleting(false);
    }
  };

  const filteredExceptions = useMemo(() => {
    return exceptions.filter((ex) => {
      const matchType = filterType === "TOUS" || ex.type === filterType;
      const matchSearch =
        !searchQuery ||
        (ex.motif && ex.motif.toLowerCase().includes(searchQuery.toLowerCase())) ||
        ex.dateDebut.includes(searchQuery) ||
        ex.dateFin.includes(searchQuery);
      return matchType && matchSearch;
    });
  }, [exceptions, filterType, searchQuery]);

  const selectedMedecinObj = useMemo(() => {
    return medecins.find((m) => m.id === selectedMedecin);
  }, [medecins, selectedMedecin]);

  if (loading) {
    return (
      <DashboardLayout title="Gestion des Absences & Imprévus">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Gestion des Absences & Imprévus">
      <div className="space-y-6">
        
        {/* Bannière Executive Secrétariat */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-rose-950 to-slate-900 text-white p-6 sm:p-7 shadow-xl border border-rose-500/20">
          <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 h-48 w-48 rounded-full bg-rose-500/10 blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div>
              <div className="flex items-center gap-2 text-rose-400 font-extrabold text-xs uppercase tracking-widest mb-1.5">
                <CalendarX size={16} />
                <span>Registre d&apos;Indisponibilité des Praticiens</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                Absences & Congés Praticiens
              </h2>
              <p className="text-sm text-slate-300 max-w-xl mt-1 leading-relaxed">
                Signalez, modifiez ou annulez les fermetures et congés. Les créneaux concernés seront automatiquement bloqués ou réouverts.
              </p>
            </div>

            {/* Sélecteur de Médecin + Action */}
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <div className="relative min-w-[240px]">
                <select
                  value={selectedMedecin?.toString() ?? ""}
                  onChange={(e) => handleChangeMedecin(e.target.value)}
                  className="medibook-input text-sm font-extrabold w-full pl-10 pr-8 bg-slate-900 text-slate-100 border-slate-700 hover:bg-slate-800 focus:bg-slate-900 focus:ring-2 focus:ring-rose-500 transition-all rounded-2xl shadow-md cursor-pointer"
                  disabled={medecins.length === 0}
                >
                  {medecins.length === 0 ? (
                    <option value="" className="bg-slate-900 text-slate-100">Aucun médecin disponible</option>
                  ) : (
                    medecins.map((m) => (
                      <option key={m.id} value={m.id} className="bg-slate-900 text-slate-100 font-semibold py-1">
                        Dr. {m.prenom} {m.nom} {m.specialiteNom ? `(${m.specialiteNom})` : ''}
                      </option>
                    ))
                  )}
                </select>
                <Stethoscope className="h-4 w-4 text-rose-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>

              <button
                onClick={handleOpenCreate}
                disabled={!selectedMedecin}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-extrabold transition-all shadow-lg active:scale-95 disabled:opacity-50"
              >
                <Plus size={16} />
                <span>Déclarer une Absence</span>
              </button>
            </div>
          </div>
        </div>

        {/* Métriques */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="medibook-card bg-card p-4 rounded-3xl border border-border/80 shadow-xs flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-rose-500/10 text-rose-600 flex items-center justify-center font-extrabold text-xl">
              🚫
            </div>
            <div>
              <p className="text-2xl font-black text-foreground">
                {exceptions.filter((e) => e.type === "ABSENT").length}
              </p>
              <p className="text-xs text-muted-foreground font-semibold">Absences Inopinées</p>
            </div>
          </div>

          <div className="medibook-card bg-card p-4 rounded-3xl border border-border/80 shadow-xs flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-sky-500/10 text-sky-600 flex items-center justify-center font-extrabold text-xl">
              🌴
            </div>
            <div>
              <p className="text-2xl font-black text-foreground">
                {exceptions.filter((e) => e.type === "VACANCES").length}
              </p>
              <p className="text-xs text-muted-foreground font-semibold">Congés & Vacances</p>
            </div>
          </div>

          <div className="medibook-card bg-card p-4 rounded-3xl border border-border/80 shadow-xs flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-extrabold text-xl">
              🔒
            </div>
            <div>
              <p className="text-2xl font-black text-foreground">
                {exceptions.filter((e) => e.type === "FERME").length}
              </p>
              <p className="text-xs text-muted-foreground font-semibold">Fermetures / Fériés</p>
            </div>
          </div>
        </div>

        {/* Barre de Recherche et Filtres */}
        <div className="medibook-card bg-card p-4 rounded-3xl border border-border/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-80">
            <input
              type="text"
              placeholder="Rechercher par date ou motif..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="medibook-input w-full pl-9 text-xs"
            />
            <Search className="h-4 w-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto">
            <span className="text-xs font-bold text-muted-foreground whitespace-nowrap">Filtrer par :</span>
            {['TOUS', 'ABSENT', 'VACANCES', 'FERME'].map((t) => (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  filterType === t
                    ? 'bg-rose-500 text-white shadow-xs'
                    : 'bg-muted/50 text-muted-foreground hover:text-foreground'
                }`}
              >
                {t === 'TOUS' ? 'Tous' : t === 'ABSENT' ? '🚫 Absent' : t === 'VACANCES' ? '🌴 Vacances' : '🔒 Fermé'}
              </button>
            ))}

            {selectedMedecin && (
              <button
                onClick={() => chargerExceptions(selectedMedecin)}
                className="p-2 rounded-xl border border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground transition-all ml-auto"
                title="Actualiser"
              >
                <RefreshCw size={15} className={loadingExceptions ? 'animate-spin' : ''} />
              </button>
            )}
          </div>
        </div>

        {/* Grille des Cartes d'Exceptions */}
        <div className="medibook-card bg-card p-6 rounded-3xl border border-border/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-foreground text-base flex items-center gap-2">
              <CalendarX size={18} className="text-rose-500" />
              <span>Registre d&apos;Absences {selectedMedecinObj ? `— Dr. ${selectedMedecinObj.prenom} ${selectedMedecinObj.nom}` : ''}</span>
            </h3>
            <span className="text-xs font-bold text-muted-foreground px-2.5 py-1 rounded-xl bg-muted">
              {filteredExceptions.length} enregistrement(s)
            </span>
          </div>

          {loadingExceptions ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin text-rose-500 mr-2" /> Chargement des données...
            </div>
          ) : filteredExceptions.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-border rounded-3xl space-y-3">
              <div className="h-12 w-12 rounded-2xl bg-muted flex items-center justify-center mx-auto text-2xl">
                🍃
              </div>
              <p className="text-sm font-bold text-foreground">Aucune absence enregistrée</p>
              <p className="text-xs text-muted-foreground">Ce praticien n&apos;a aucune indisponibilité sur la période filtrée.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredExceptions.map((ex) => {
                const isFullDay = !ex.heureDebut || !ex.heureFin;
                const isSingleDay = ex.dateDebut === ex.dateFin;

                return (
                  <div
                    key={ex.id}
                    className="p-5 rounded-2xl bg-card border border-border/80 hover:border-rose-500/40 transition-all shadow-2xs hover:shadow-md space-y-3 flex flex-col justify-between"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className={`h-11 w-11 rounded-2xl flex items-center justify-center font-bold text-lg ${
                          ex.type === 'ABSENT' ? 'bg-rose-500/15 text-rose-600' : ex.type === 'VACANCES' ? 'bg-sky-500/15 text-sky-600' : 'bg-amber-500/15 text-amber-600'
                        }`}>
                          {ex.type === 'ABSENT' ? <AlertTriangle size={20} /> : ex.type === 'VACANCES' ? <Umbrella size={20} /> : <Lock size={20} />}
                        </div>
                        <div>
                          <span className={`text-[10px] uppercase font-extrabold px-2.5 py-0.5 rounded-lg ${
                            ex.type === 'ABSENT' ? 'bg-rose-500/15 text-rose-600 border border-rose-500/30' : ex.type === 'VACANCES' ? 'bg-sky-500/15 text-sky-600 border border-sky-500/30' : 'bg-amber-500/15 text-amber-600 border border-amber-500/30'
                          }`}>
                            {ex.type === 'ABSENT' ? 'Absence' : ex.type === 'VACANCES' ? 'Congés' : 'Fermeture'}
                          </span>

                          {/* Affichage unifié des dates Début et Fin sur le même cadre */}
                          <div className="flex items-center gap-1.5 mt-1.5">
                            <CalendarIcon size={14} className="text-rose-500 shrink-0" />
                            <p className="text-sm font-black text-foreground">
                              {isSingleDay ? (
                                `Le ${ex.dateDebut}`
                              ) : (
                                <span className="bg-rose-500/10 text-rose-700 dark:text-rose-300 px-2 py-0.5 rounded-lg border border-rose-500/20 font-extrabold">
                                  Du {ex.dateDebut} au {ex.dateFin}
                                </span>
                              )}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Actions : Modifier & Supprimer */}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEdit(ex)}
                          className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
                          title="Modifier cette indisponibilité"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => setDeleteId(ex.id)}
                          className="p-2 rounded-xl text-muted-foreground hover:text-rose-600 hover:bg-rose-500/10 transition-all"
                          title="Supprimer cette indisponibilité (réouvre les créneaux)"
                          disabled={deleting}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-border/50 flex flex-wrap items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-1.5 text-muted-foreground font-semibold">
                        <Clock size={14} className="text-primary" />
                        <span>{isFullDay ? 'Journée Complète' : `${ex.heureDebut?.slice(0, 5)} — ${ex.heureFin?.slice(0, 5)}`}</span>
                      </div>

                      {ex.motif && (
                        <p className="text-xs text-foreground/80 font-medium italic bg-muted/40 px-2.5 py-1 rounded-xl truncate max-w-[200px]">
                          « {ex.motif} »
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Modal Création / Edition */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? "Modifier l'Indisponibilité Praticien" : "Déclarer une Indisponibilité Praticien"}>
        <div className="space-y-4 pt-2">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-foreground mb-1.5 block">
                Date début <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                className={`medibook-input w-full text-xs font-semibold ${erreurs.dateDebut ? "border-rose-500" : ""}`}
                value={form.dateDebut}
                onChange={(e) => updateForm("dateDebut", e.target.value)}
              />
              {erreurs.dateDebut && <p className="text-xs text-rose-500 mt-1 font-semibold">{erreurs.dateDebut}</p>}
            </div>

            <div>
              <label className="text-xs font-bold text-foreground mb-1.5 block">
                Date fin <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                className={`medibook-input w-full text-xs font-semibold ${erreurs.dateFin ? "border-rose-500" : ""}`}
                value={form.dateFin}
                onChange={(e) => updateForm("dateFin", e.target.value)}
              />
              {erreurs.dateFin && <p className="text-xs text-rose-500 mt-1 font-semibold">{erreurs.dateFin}</p>}
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-foreground mb-1.5 block">
              Type d&apos;indisponibilité
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { type: 'ABSENT', label: '🚫 Absence', desc: 'Maladie / Imprévu' },
                { type: 'VACANCES', label: '🌴 Congés', desc: 'Vacances prévues' },
                { type: 'FERME', label: '🔒 Fermé', desc: 'Jour Férié / Cabinet' },
              ].map((item) => (
                <button
                  key={item.type}
                  type="button"
                  onClick={() => updateForm('type', item.type as ExceptionForm['type'])}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    form.type === item.type
                      ? 'border-rose-500 bg-rose-500/10 text-rose-600 font-extrabold shadow-2xs'
                      : 'border-border bg-card text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <p className="text-xs font-bold">{item.label}</p>
                  <p className="text-[10px] opacity-75 mt-0.5">{item.desc}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-foreground mb-1.5 block">
                Heure début (Optionnel)
              </label>
              <input
                type="time"
                className={`medibook-input w-full text-xs font-semibold ${erreurs.heureDebut ? "border-rose-500" : ""}`}
                value={form.heureDebut ?? ""}
                onChange={(e) => updateForm("heureDebut", e.target.value)}
              />
              {erreurs.heureDebut && <p className="text-xs text-rose-500 mt-1 font-semibold">{erreurs.heureDebut}</p>}
            </div>

            <div>
              <label className="text-xs font-bold text-foreground mb-1.5 block">
                Heure fin (Optionnel)
              </label>
              <input
                type="time"
                className={`medibook-input w-full text-xs font-semibold ${erreurs.heureFin ? "border-rose-500" : ""}`}
                value={form.heureFin ?? ""}
                onChange={(e) => updateForm("heureFin", e.target.value)}
              />
              {erreurs.heureFin && <p className="text-xs text-rose-500 mt-1 font-semibold">{erreurs.heureFin}</p>}
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-foreground mb-1.5 block">
              Motif / Raison (Interne)
            </label>
            <input
              type="text"
              placeholder="Ex: Formations médicale, Congé annuel, Imprévu personnel..."
              className="medibook-input w-full text-xs font-medium"
              value={form.motif ?? ""}
              onChange={(e) => updateForm("motif", e.target.value)}
            />
          </div>

          <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-900 dark:text-rose-300 flex items-start gap-2.5">
            <Info size={18} className="shrink-0 text-rose-500 mt-0.5" />
            <div>
              <p className="font-extrabold">Gestion Automatique des Créneaux :</p>
              <p className="opacity-90">Les créneaux de consultation sur la période choisie seront automatiquement bloqués. En cas d&apos;annulation ou modification, les créneaux libérés redeviendront réservables.</p>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setModalOpen(false)} className="medibook-btn-outline h-10 px-4 text-xs font-bold">
              Annuler
            </button>
            <button
              onClick={handleSave}
              className="medibook-btn bg-rose-500 hover:bg-rose-600 h-10 px-5 text-xs font-bold text-white shadow-md"
              disabled={submitting}
            >
              {submitting ? "Enregistrement..." : editingId ? "Enregistrer les modifications" : "Confirmer l'Absence"}
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteId}
        title="Supprimer l'indisponibilité"
        message="Êtes-vous sûr de vouloir retirer cette absence ? Les créneaux du médecin qui n'ont pas de RDV confirmé redeviendront disponibles à la réservation."
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        confirmLabel={deleting ? "Suppression..." : "Supprimer & Libérer Créneaux"}
      />
    </DashboardLayout>
  );
};

export default SecretaireExceptionsPage;
