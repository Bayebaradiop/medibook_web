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
import { exceptionMedecinService } from "../services/exceptionService";
import type { ExceptionForm, ExceptionPlanning } from "../types/exception.types";
import { EXCEPTION_ERREURS } from "../messages/exception.erreurs";
import { EXCEPTION_SUCCES } from "../messages/exception.succes";
import { validerExceptionForm } from "../logique/exception.validation";
import { formatDateFR } from "@/utils/date";
import { CardGridSkeleton } from "@/components/common/SkeletonLoaders";

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

const ExceptionsPage = () => {
  const [loading, setLoading] = useState(true);
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

  const chargerExceptions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await exceptionMedecinService.list();
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
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    chargerExceptions();
  }, [chargerExceptions]);

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
    if (Object.keys(fieldErrors).length > 0) return;

    setSubmitting(true);
    try {
      if (editingId) {
        await exceptionMedecinService.update(editingId, payload);
        toast.success("Indisponibilité mise à jour ! Créneaux recalculés.");
      } else {
        await exceptionMedecinService.create(payload);
        toast.success(EXCEPTION_SUCCES.CREATION_REUSSIE);
      }

      setModalOpen(false);
      setForm(initialForm);
      setEditingId(null);
      setErreurs({});
      await chargerExceptions();
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
    if (!deleteId) return;

    setDeleting(true);
    try {
      await exceptionMedecinService.delete(deleteId);
      toast.success("Absence annulée. Vos créneaux redeviendront réservables !");
      setDeleteId(null);
      await chargerExceptions();
    } catch (error) {
      if (isAxiosError(error)) {
        const message = extraireMessageErreur(error.response?.data);
        if (message) {
          toast.error(message);
          return;
        }
      }
      toast.error(EXCEPTION_ERREURS.SUPPRESSION_ECHOUEE);
    } finally {
      setDeleting(false);
    }
  };

  const filteredExceptions = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return exceptions.filter((ex) => {
      // Exclure les exceptions dont la date de fin est passée
      const dateEnd = new Date(ex.dateFin || ex.dateDebut);
      dateEnd.setHours(23, 59, 59, 999);
      if (dateEnd.getTime() < today.getTime()) {
        return false;
      }

      const matchType = filterType === "TOUS" || ex.type === filterType;
      const matchSearch =
        !searchQuery ||
        (ex.motif && ex.motif.toLowerCase().includes(searchQuery.toLowerCase())) ||
        ex.dateDebut.includes(searchQuery) ||
        ex.dateFin.includes(searchQuery);
      return matchType && matchSearch;
    });
  }, [exceptions, filterType, searchQuery]);

  return (
    <DashboardLayout title="Mes Absences & Congés">
      <div className="space-y-5">
        
        {/* En-tête d'action rapide */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-muted-foreground">
              Déclarez et gérez vos périodes d&apos;indisponibilité.
            </span>
          </div>

          <button
            onClick={handleOpenCreate}
            className="medibook-btn h-10 px-4 text-xs font-bold flex items-center justify-center gap-2 shrink-0"
          >
            <Plus size={16} />
            <span>Signaler une Absence</span>
          </button>
        </div>

        {/* Métriques */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="medibook-card bg-card p-3.5 rounded-2xl border border-border flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-rose-500/10 text-rose-600 flex items-center justify-center font-bold text-base">
              🚫
            </div>
            <div>
              <p className="text-xl font-bold text-foreground">
                {exceptions.filter((e) => e.type === "ABSENT").length}
              </p>
              <p className="text-xs text-muted-foreground font-medium">Absences Inopinées</p>
            </div>
          </div>

          <div className="medibook-card bg-card p-3.5 rounded-2xl border border-border flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-sky-500/10 text-sky-600 flex items-center justify-center font-bold text-base">
              🌴
            </div>
            <div>
              <p className="text-xl font-bold text-foreground">
                {exceptions.filter((e) => e.type === "VACANCES").length}
              </p>
              <p className="text-xs text-muted-foreground font-medium">Congés & Vacances</p>
            </div>
          </div>

          <div className="medibook-card bg-card p-3.5 rounded-2xl border border-border flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold text-base">
              🔒
            </div>
            <div>
              <p className="text-xl font-bold text-foreground">
                {exceptions.filter((e) => e.type === "FERME").length}
              </p>
              <p className="text-xs text-muted-foreground font-medium">Fermetures / Fériés</p>
            </div>
          </div>
        </div>

        {/* Barre de Filtres */}
        <div className="medibook-card bg-card p-4 rounded-2xl border border-border flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="relative w-full md:w-80">
            <input
              type="text"
              placeholder="Rechercher une absence..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="medibook-input w-full pl-9 text-xs font-medium"
            />
            <Search className="h-4 w-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto">
            <span className="text-xs font-semibold text-muted-foreground whitespace-nowrap">Filtrer :</span>
            {['TOUS', 'ABSENT', 'VACANCES', 'FERME'].map((t) => (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  filterType === t
                    ? 'bg-primary text-primary-foreground shadow-2xs'
                    : 'bg-muted/60 text-muted-foreground hover:text-foreground'
                }`}
              >
                {t === 'TOUS' ? 'Tous' : t === 'ABSENT' ? '🚫 Absent' : t === 'VACANCES' ? '🌴 Vacances' : '🔒 Fermé'}
              </button>
            ))}

            <button
              onClick={chargerExceptions}
              className="p-1.5 rounded-xl border border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground transition-all ml-auto"
              title="Actualiser"
            >
              <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
            </button>
          </div>
        </div>

        {/* Grille des Absences */}
        <div className="medibook-card bg-card p-5 rounded-2xl border border-border space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-foreground text-sm flex items-center gap-2">
              <CalendarX size={16} className="text-primary" />
              <span>Historique de mes Indisponibilités</span>
            </h3>
            <span className="text-xs font-semibold text-muted-foreground px-2 py-0.5 rounded-lg bg-muted">
              {filteredExceptions.length} enregistrement(s)
            </span>
          </div>

          {loading ? (
            <CardGridSkeleton count={4} />
          ) : filteredExceptions.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-border rounded-2xl space-y-2">
              <p className="text-xs font-bold text-foreground">Aucune absence enregistrée</p>
              <p className="text-xs text-muted-foreground">Vous n&apos;avez aucune indisponibilité planifiée.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredExceptions.map((ex) => {
                const isFullDay = !ex.heureDebut || !ex.heureFin;
                const isSingleDay = ex.dateDebut === ex.dateFin;

                return (
                  <div
                    key={ex.id}
                    className="p-4 rounded-xl bg-card border border-border hover:border-primary/40 transition-all space-y-3 flex flex-col justify-between"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className={`h-10 w-10 rounded-xl flex items-center justify-center font-bold text-base ${
                          ex.type === 'ABSENT' ? 'bg-rose-500/10 text-rose-600' : ex.type === 'VACANCES' ? 'bg-sky-500/10 text-sky-600' : 'bg-amber-500/10 text-amber-600'
                        }`}>
                          {ex.type === 'ABSENT' ? <AlertTriangle size={18} /> : ex.type === 'VACANCES' ? <Umbrella size={18} /> : <Lock size={18} />}
                        </div>
                        <div>
                          <span className={`text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-md ${
                            ex.type === 'ABSENT' ? 'bg-rose-500/10 text-rose-600' : ex.type === 'VACANCES' ? 'bg-sky-500/10 text-sky-600' : 'bg-amber-500/10 text-amber-600'
                          }`}>
                            {ex.type === 'ABSENT' ? 'Absence' : ex.type === 'VACANCES' ? 'Congés' : 'Fermeture'}
                          </span>

                          <div className="flex items-center gap-1.5 mt-1">
                            <CalendarIcon size={13} className="text-primary shrink-0" />
                            <p className="text-xs font-bold text-foreground">
                              {isSingleDay ? (
                                `Le ${formatDateFR(ex.dateDebut)}`
                              ) : (
                                <span>Du {formatDateFR(ex.dateDebut)} au {formatDateFR(ex.dateFin)}</span>
                              )}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEdit(ex)}
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
                          title="Modifier cette absence"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => setDeleteId(ex.id)}
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-rose-600 hover:bg-rose-500/10 transition-all"
                          title="Annuler cette absence"
                          disabled={deleting}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-border/50 flex flex-wrap items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-1.5 text-muted-foreground font-medium">
                        <Clock size={13} className="text-primary" />
                        <span>{isFullDay ? 'Journée Complète' : `${ex.heureDebut?.slice(0, 5)} — ${ex.heureFin?.slice(0, 5)}`}</span>
                      </div>

                      {ex.motif && (
                        <p className="text-xs text-muted-foreground italic truncate max-w-[180px]">
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
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? "Modifier l'Absence ou Congé" : "Signaler une Absence ou un Congé"}>
        <div className="space-y-4 pt-2">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-foreground mb-1 block">
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
              <label className="text-xs font-bold text-foreground mb-1 block">
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
            <label className="text-xs font-bold text-foreground mb-1 block">
              Type d&apos;indisponibilité
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { type: 'ABSENT', label: '🚫 Absence', desc: 'Imprévu' },
                { type: 'VACANCES', label: '🌴 Congés', desc: 'Vacances' },
                { type: 'FERME', label: '🔒 Fermé', desc: 'Férié' },
              ].map((item) => (
                <button
                  key={item.type}
                  type="button"
                  onClick={() => updateForm('type', item.type as ExceptionForm['type'])}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    form.type === item.type
                      ? 'border-primary bg-primary/10 text-primary font-bold shadow-2xs'
                      : 'border-border bg-card text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <p className="text-xs font-bold">{item.label}</p>
                  <p className="text-[10px] opacity-75">{item.desc}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-foreground mb-1 block">
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
              <label className="text-xs font-bold text-foreground mb-1 block">
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
            <label className="text-xs font-bold text-foreground mb-1 block">
              Motif / Raison (Optionnel)
            </label>
            <input
              type="text"
              placeholder="Ex: Conférence médicale, Raisons personnelles..."
              className="medibook-input w-full text-xs font-medium"
              value={form.motif ?? ""}
              onChange={(e) => updateForm("motif", e.target.value)}
            />
          </div>

          <div className="p-3 rounded-xl bg-muted/50 border border-border text-xs text-muted-foreground flex items-start gap-2">
            <Info size={16} className="shrink-0 text-primary mt-0.5" />
            <p>Vos créneaux de consultation sur cette période seront verrouillés. En cas de modification ou suppression, les créneaux sans RDV redeviendront réservables.</p>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setModalOpen(false)} className="medibook-btn-outline h-9 px-4 text-xs font-bold">
              Annuler
            </button>
            <button
              onClick={handleSave}
              className="medibook-btn h-9 px-4 text-xs font-bold shadow-sm"
              disabled={submitting}
            >
              {submitting ? "Enregistrement..." : editingId ? "Enregistrer" : "Créer l'Absence"}
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteId}
        title="Retirer cette indisponibilité"
        message="Êtes-vous sûr de vouloir supprimer cette absence ? Les créneaux de consultation sans rendez-vous redeviendront réservables."
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        confirmLabel={deleting ? "Suppression..." : "Supprimer & Libérer"}
      />
    </DashboardLayout>
  );
};

export default ExceptionsPage;
