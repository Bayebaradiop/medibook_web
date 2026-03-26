import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DashboardLayout from "@/layouts/DashboardLayout";
import StatusBadge from "@/components/common/StatusBadge";
import { ArrowLeft, User, Phone, FileText, CheckCircle, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { rdvMedecinService } from "../services/rdvService";
import type { RendezVous } from "../types/rdv.types";
import { RDV_ERREURS } from "../messages/rdv.erreurs";
import { RDV_SUCCES } from "../messages/rdv.succes";
import { peutConfirmer, peutTerminer } from "../logique/rdv.regles";

const hasDataProperty = (value: unknown): value is { data: unknown } =>
  typeof value === "object" && value !== null && "data" in value;

const extraireListe = <T,>(value: unknown): T[] => {
  if (Array.isArray(value)) return value as T[];
  if (hasDataProperty(value) && Array.isArray(value.data)) return value.data as T[];
  return [];
};

const RendezVousDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [rv, setRv] = useState<RendezVous | null>(null);

  useEffect(() => {
    const charger = async () => {
      try {
        const res = await rdvMedecinService.list();
        const data = extraireListe<RendezVous>(res.data);
        const rdv = data.find((item) => item.id === Number(id)) || null;
        setRv(rdv);
      } catch {
        toast.error(RDV_ERREURS.CHARGEMENT_ECHOUE);
      } finally {
        setLoading(false);
      }
    };

    charger();
  }, [id]);

  const refreshDetail = async () => {
    const res = await rdvMedecinService.list();
    const data = extraireListe<RendezVous>(res.data);
    setRv(data.find((item) => item.id === Number(id)) || null);
  };

  const handleConfirmer = async () => {
    if (!rv) return;
    setActionLoading(true);
    try {
      await rdvMedecinService.confirmer(rv.id);
      toast.success(RDV_SUCCES.CONFIRME);
      await refreshDetail();
    } catch {
      toast.error(RDV_ERREURS.CONFIRMATION_ECHOUEE);
    } finally {
      setActionLoading(false);
    }
  };

  const handleTerminer = async () => {
    if (!rv) return;
    setActionLoading(true);
    try {
      await rdvMedecinService.terminer(rv.id);
      toast.success(RDV_SUCCES.TERMINE);
      await refreshDetail();
    } catch {
      toast.error(RDV_ERREURS.CLOTURE_ECHOUEE);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="RDV">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (!rv) {
    return (
      <DashboardLayout title="RDV">
        <p className="text-center text-muted-foreground py-12">{RDV_ERREURS.RDV_NON_TROUVE}</p>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Détails du rendez-vous">
      <div className="space-y-6 max-w-3xl">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft size={18} /> Retour
        </button>

        <div className="medibook-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Informations du rendez-vous</h3>
            <StatusBadge status={rv.statut} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground text-xs">Date</p>
              <p className="font-medium">{rv.date}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Heure</p>
              <p className="font-medium">
                {rv.heureDebut?.slice(0, 5)} - {rv.heureFin?.slice(0, 5)}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Spécialité</p>
              <p className="font-medium">{rv.medecinSpecialite || "—"}</p>
            </div>
            <div className="flex items-start gap-2">
              <FileText size={16} className="text-primary mt-0.5" />
              <div>
                <p className="text-muted-foreground text-xs">Motif</p>
                <p className="font-medium">{rv.motif || "—"}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="medibook-card">
          <h3 className="font-semibold mb-4">Informations du patient</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="flex items-start gap-2">
              <User size={16} className="text-primary mt-0.5" />
              <div>
                <p className="text-muted-foreground text-xs">Nom</p>
                <p className="font-medium">
                  {[rv.patientPrenom, rv.patientNom].filter(Boolean).join(" ") || "—"}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Phone size={16} className="text-primary mt-0.5" />
              <div>
                <p className="text-muted-foreground text-xs">Téléphone</p>
                <p className="font-medium">{rv.patientTelephone || "—"}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          {peutConfirmer(rv) && (
            <button
              onClick={handleConfirmer}
              disabled={actionLoading}
              className="medibook-btn flex items-center gap-2 disabled:opacity-50"
            >
              <CheckCircle size={18} /> Confirmer
            </button>
          )}
          {peutTerminer(rv) && (
            <button
              onClick={handleTerminer}
              disabled={actionLoading}
              className="medibook-btn flex items-center gap-2 bg-info hover:brightness-90 disabled:opacity-50"
            >
              <Check size={18} /> Terminer
            </button>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default RendezVousDetailPage;
