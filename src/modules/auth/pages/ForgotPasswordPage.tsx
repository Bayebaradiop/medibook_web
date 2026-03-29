import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Hospital, KeyRound, Lock, Mail } from "lucide-react";
import { toast } from "sonner";
import AuthLayout from "@/layouts/AuthLayout";
import { authService } from "../services/authService";
import { validerEmail, validerMotDePasse } from "../logique/auth.validation";
import { AUTH_ERREURS } from "../messages/auth.erreurs";
import { AUTH_SUCCES } from "../messages/auth.succes";

type ErreursChamp = Record<string, string>;

const extraireMessageErreur = (error: unknown, fallback: string) => {
  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error &&
    typeof error.response === "object" &&
    error.response !== null &&
    "data" in error.response &&
    typeof error.response.data === "object" &&
    error.response.data !== null &&
    "message" in error.response.data &&
    typeof error.response.data.message === "string"
  ) {
    return error.response.data.message;
  }

  return fallback;
};

const mapperErreurForgotPassword = (message: string): ErreursChamp => {
  if (message.includes("email")) {
    return { email: message };
  }

  if (message.includes("code")) {
    return { code: message };
  }

  if (message.includes("passe")) {
    return { newPassword: message };
  }

  return {};
};

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<"email" | "reset">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [erreurs, setErreurs] = useState<Record<string, string>>({});

  const clearError = (champ: string) => {
    if (erreurs[champ]) {
      setErreurs((prev) => {
        const copy = { ...prev };
        delete copy[champ];
        return copy;
      });
    }
  };

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();

    const erreurEmail = validerEmail(email);
    if (erreurEmail) {
      setErreurs({ email: erreurEmail });
      return;
    }

    setErreurs({});
    setIsLoading(true);
    try {
      await authService.forgotPassword({ email: email.trim() });
      toast.success(AUTH_SUCCES.MDP_REINITIALISE);
      setStep("reset");
    } catch (error: unknown) {
      const message = extraireMessageErreur(error, AUTH_ERREURS.ENVOI_CODE_ECHOUE);
      const mappedErrors = mapperErreurForgotPassword(message);
      if (Object.keys(mappedErrors).length > 0) {
        setErreurs(mappedErrors);
        return;
      }
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    const fieldErrors: ErreursChamp = {};
    if (!code.trim()) {
      fieldErrors.code = AUTH_ERREURS.CODE_REQUIS;
    }

    if (code.trim() && !/^\d{6}$/.test(code.trim())) {
      fieldErrors.code = AUTH_ERREURS.CODE_INVALIDE;
    }

    const erreurMdp = validerMotDePasse(newPassword);
    if (erreurMdp) {
      fieldErrors.newPassword = erreurMdp;
    }

    if (!confirmPassword) {
      fieldErrors.confirmPassword = AUTH_ERREURS.CONFIRMATION_MDP_REQUISE;
    }

    if (confirmPassword && confirmPassword !== newPassword) {
      fieldErrors.confirmPassword = AUTH_ERREURS.MDP_DIFFERENTS;
    }

    setErreurs(fieldErrors);
    if (Object.keys(fieldErrors).length > 0) return;

    setIsLoading(true);
    try {
      await authService.resetPassword({
        email: email.trim(),
        code: code.trim(),
        newPassword,
      });
      toast.success(AUTH_SUCCES.MDP_MODIFIE);
      navigate("/login");
    } catch (error: unknown) {
      const message = extraireMessageErreur(error, AUTH_ERREURS.RESET_ECHOUE);
      const mappedErrors = mapperErreurForgotPassword(message);
      if (Object.keys(mappedErrors).length > 0) {
        setErreurs(mappedErrors);
        return;
      }
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="w-full max-w-md">
        <div className="medibook-card p-8">
          <div className="flex flex-col items-center mb-8">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground mb-4">
              <Hospital size={32} />
            </div>
            <h1 className="text-2xl font-bold text-foreground">
              {step === "email" ? "Mot de passe oublié" : "Réinitialiser le mot de passe"}
            </h1>
            <p className="text-sm text-muted-foreground mt-1 text-center">
              {step === "email"
                ? "Entrez votre email pour recevoir un code de réinitialisation."
                : `Saisissez le code reçu par email pour ${email}.`}
            </p>
          </div>

          {step === "email" ? (
            <form onSubmit={handleSendCode} className="space-y-4" noValidate>
              <div>
                <label className="text-sm font-medium text-secondary-foreground mb-1.5 block">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); clearError("email"); }}
                    placeholder="votre@email.com"
                    className={`medibook-input w-full pl-10 ${erreurs.email ? "border-destructive ring-1 ring-destructive" : ""}`}
                  />
                </div>
                {erreurs.email && <p className="mt-1 text-xs text-destructive">{erreurs.email}</p>}
              </div>
              <button type="submit" disabled={isLoading} className="medibook-btn w-full">
                {isLoading ? "Envoi..." : "Envoyer le code"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-4" noValidate>
              <div>
                <label className="text-sm font-medium text-secondary-foreground mb-1.5 block">Code</label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => { setCode(e.target.value); clearError("code"); }}
                    placeholder="123456"
                    className={`medibook-input w-full pl-10 ${erreurs.code ? "border-destructive ring-1 ring-destructive" : ""}`}
                    maxLength={6}
                  />
                </div>
                {erreurs.code && <p className="mt-1 text-xs text-destructive">{erreurs.code}</p>}
              </div>
              <div>
                <label className="text-sm font-medium text-secondary-foreground mb-1.5 block">Nouveau mot de passe</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                  <input
                    type={showPass ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => { setNewPassword(e.target.value); clearError("newPassword"); }}
                    placeholder="••••••••"
                    className={`medibook-input w-full pl-10 pr-10 ${erreurs.newPassword ? "border-destructive ring-1 ring-destructive" : ""}`}
                  />
                  <button type="button" onClick={() => setShowPass((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {erreurs.newPassword && <p className="mt-1 text-xs text-destructive">{erreurs.newPassword}</p>}
              </div>
              <div>
                <label className="text-sm font-medium text-secondary-foreground mb-1.5 block">Confirmer le mot de passe</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                  <input
                    type={showConfirmPass ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => { setConfirmPassword(e.target.value); clearError("confirmPassword"); }}
                    placeholder="••••••••"
                    className={`medibook-input w-full pl-10 pr-10 ${erreurs.confirmPassword ? "border-destructive ring-1 ring-destructive" : ""}`}
                  />
                  <button type="button" onClick={() => setShowConfirmPass((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    {showConfirmPass ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {erreurs.confirmPassword && <p className="mt-1 text-xs text-destructive">{erreurs.confirmPassword}</p>}
              </div>
              <button type="submit" disabled={isLoading} className="medibook-btn w-full">
                {isLoading ? "Réinitialisation..." : "Réinitialiser le mot de passe"}
              </button>
              <button
                type="button"
                onClick={() => setStep("email")}
                className="medibook-btn-outline w-full"
                disabled={isLoading}
              >
                Modifier l'email
              </button>
            </form>
          )}

          <div className="mt-6 text-center">
            <Link to="/login" className="text-sm font-medium text-primary hover:underline">
              Retour à la connexion
            </Link>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
};

export default ForgotPasswordPage;
