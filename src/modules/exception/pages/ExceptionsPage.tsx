import { useCallback, useEffect, useState } from "react";
import DashboardLayout from "@/layouts/DashboardLayout";
import Modal from "@/components/common/Modal";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import { Plus, Trash2, CalendarX, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { isAxiosError } from "axios";
import { exceptionMedecinService } from "../services/exceptionService";
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

const extraireListe = <T,>(value: unknown): T[] => {
  if (Array.isArray(value)) return value as T[];
  if (hasDataProperty(value) && Array.isArray(value.data)) return value.data as T[];
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

  return {};
};

const initialForm: ExceptionForm = {
  date: "",
  type: "ABSENT",
  heureDebut: "",
  heureFin: "",
  motif: "",
};

const ExceptionsPage = () => {
  const [loading, setLoading] = useState(true);
  const [exceptions, setExceptions] = useState<ExceptionPlanning[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [form, setForm] = useState<ExceptionForm>(initialForm);
  const [erreurs, setErreurs] = useState<Record<string, string>>({});

  const chargerExceptions = useCallback(async () => {
    try {
      const res = await exceptionMedecinService.list();
      setExceptions(extraireListe<ExceptionPlanning>(res.data));
    } catch {
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

  const handleCreate = async () => {
    const payload: ExceptionForm = {
      date: form.date,
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

    setCreating(true);
    try {
      await exceptionMedecinService.create(payload);
      toast.success(EXCEPTION_SUCCES.CREATION_REUSSIE);
      setModalOpen(false);
      setForm(initialForm);
      setErreurs({});
      await chargerExceptions();
    } catch (error) {
      if (isAxiosError(error)) {
        const fieldErrorsFromApi = extraireErreursChamp(error.response);
        if (Object.keys(fieldErrorsFromApi).length > 0) {
          setErreurs(fieldErrorsFromApi);
          return;
        }

        const mappedErrors = mapperMessageVersErreursChamp(hasMessageProperty(error.response?.data) ? error.response.data.message : undefined);
        if (Object.keys(mappedErrors).length > 0) {
          setErreurs(mappedErrors);
          return;
        }
      }

      if (isAxiosError(error) && hasMessageProperty(error.response?.data)) {
        toast.error(error.response.data.message);
      } else {
        toast.error(EXCEPTION_ERREURS.CREATION_ECHOUEE);
      }
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    setDeleting(true);
    try {
      await exceptionMedecinService.delete(deleteId);
      toast.success(EXCEPTION_SUCCES.SUPPRESSION_REUSSIE);
      setDeleteId(null);
      await chargerExceptions();
    } catch (error) {
      if (isAxiosError(error) && hasMessageProperty(error.response?.data)) {
        toast.error(error.response.data.message);
      } else {
        toast.error(EXCEPTION_ERREURS.SUPPRESSION_ECHOUEE);
      }
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Exceptions Planning">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Exceptions Planning">
      <div className="space-y-6">
        <div className="flex justify-end">
          <button
            onClick={() => {
              setModalOpen(true);
              setErreurs({});
            }}
            className="medibook-btn flex items-center gap-2"
          >
            <Plus size={18} /> Nouvelle Exception
          </button>
        </div>

        <div className="medibook-card">
          <h3 className="font-semibold mb-4">Liste des exceptions</h3>
          <div className="space-y-3">
            {exceptions.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Aucune exception enregistrée
              </p>
            ) : (
              exceptions.map((ex) => (
                <div
                  key={ex.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-destructive/5 border border-destructive/10"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <CalendarX size={16} className="text-destructive" />
                      <p className="text-sm font-medium">{ex.date}</p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {ex.heureDebut && ex.heureFin
                        ? `${ex.heureDebut.slice(0, 5)} - ${ex.heureFin.slice(0, 5)}`
                        : "Journée complète"}
                      {ex.motif ? ` · ${ex.motif}` : ""}
                    </p>
                  </div>
                  <button
                    onClick={() => setDeleteId(ex.id)}
                    className="p-2 rounded-lg hover:bg-destructive/10 text-destructive transition-colors"
                    disabled={deleting}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Nouvelle exception">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-secondary-foreground mb-1.5 block">
              Date
            </label>
            <input
              type="date"
              className={`medibook-input w-full ${erreurs.date ? "border-destructive" : ""}`}
              value={form.date}
              onChange={(e) => updateForm("date", e.target.value)}
            />
            {erreurs.date && <p className="text-xs text-destructive mt-1">{erreurs.date}</p>}
          </div>
          <div>
            <label className="text-sm font-medium text-secondary-foreground mb-1.5 block">
              Type
            </label>
            <select
              className="medibook-input w-full"
              value={form.type}
              onChange={(e) => updateForm("type", e.target.value as ExceptionForm["type"])}
            >
              <option value="ABSENT">Absent</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-secondary-foreground mb-1.5 block">
                Heure début (optionnel)
              </label>
              <input
                type="time"
                className="medibook-input w-full"
                value={form.heureDebut ?? ""}
                onChange={(e) => updateForm("heureDebut", e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-secondary-foreground mb-1.5 block">
                Heure fin (optionnel)
              </label>
              <input
                type="time"
                className={`medibook-input w-full ${erreurs.heureFin ? "border-destructive" : ""}`}
                value={form.heureFin ?? ""}
                onChange={(e) => updateForm("heureFin", e.target.value)}
              />
              {erreurs.heureFin && <p className="text-xs text-destructive mt-1">{erreurs.heureFin}</p>}
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-secondary-foreground mb-1.5 block">
              Motif
            </label>
            <textarea
              className={`medibook-input w-full min-h-[80px] resize-none ${erreurs.motif ? "border-destructive" : ""}`}
              value={form.motif}
              onChange={(e) => updateForm("motif", e.target.value)}
            />
            {erreurs.motif && <p className="text-xs text-destructive mt-1">{erreurs.motif}</p>}
          </div>
          <div className="flex justify-end gap-3">
            <button onClick={() => setModalOpen(false)} className="medibook-btn-outline h-10 px-4 text-sm">
              Annuler
            </button>
            <button
              onClick={handleCreate}
              className="medibook-btn h-10 px-4 text-sm"
              disabled={creating}
            >
              {creating ? "Création..." : "Créer"}
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteId}
        title="Supprimer l'exception"
        message="Êtes-vous sûr ?"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        confirmLabel={deleting ? "Suppression..." : "Supprimer"}
      />
    </DashboardLayout>
  );
};

export default ExceptionsPage;
