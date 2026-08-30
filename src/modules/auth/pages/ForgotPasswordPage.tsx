import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Stethoscope, KeyRound, Lock, Mail, ArrowRight, ArrowLeft, ShieldCheck } from "lucide-react";
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
        <div className="rounded-3xl border border-white/20 bg-white/95 p-6 sm:p-8 shadow-2xl backdrop-blur-2xl">
          <div className="flex flex-col items-center mb-6 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#2F7D79] text-white shadow-lg shadow-[#2F7D79]/30 mb-3">
              <Stethoscope size={28} />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              {step === "email" ? "Mot de passe oublié ?" : "Réinitialiser votre mot de passe"}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
              {step === "email"
                ? "Saisissez votre adresse email pour recevoir un code de réinitialisation."
                : `Saisissez le code à 6 chiffres envoyé à ${email}.`}
            </p>
          </div>

          {step === "email" ? (
            <form onSubmit={handleSendCode} className="space-y-4" noValidate>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); clearError("email"); }}
                    placeholder="votre@email.com"
                    className={`w-full rounded-2xl border bg-slate-50/70 py-3 pl-10 pr-4 text-sm font-medium text-slate-900 placeholder:text-slate-400 transition-all focus:bg-white focus:border-[#2F7D79] focus:outline-none focus:ring-2 focus:ring-[#2F7D79]/20 ${
                      erreurs.email ? "border-red-500 ring-2 ring-red-500/20" : "border-slate-200"
                    }`}
                  />
                </div>
                {erreurs.email && <p className="mt-1 text-xs font-semibold text-red-500">{erreurs.email}</p>}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 px-6 rounded-2xl bg-[#2F7D79] hover:bg-[#256461] text-white text-sm font-bold shadow-lg shadow-[#2F7D79]/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-70"
              >
                {isLoading ? "Envoi du code..." : "Envoyer le code"}
                {!isLoading && <ArrowRight size={18} />}
              </button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-4" noValidate>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Code de confirmation (6 chiffres)
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => { setCode(e.target.value); clearError("code"); }}
                    placeholder="123456"
                    className={`w-full rounded-2xl border bg-slate-50/70 py-3 pl-10 pr-4 text-sm font-medium text-slate-900 tracking-widest placeholder:text-slate-400 transition-all focus:bg-white focus:border-[#2F7D79] focus:outline-none focus:ring-2 focus:ring-[#2F7D79]/20 ${
                      erreurs.code ? "border-red-500 ring-2 ring-red-500/20" : "border-slate-200"
                    }`}
                    maxLength={6}
                  />
                </div>
                {erreurs.code && <p className="mt-1 text-xs font-semibold text-red-500">{erreurs.code}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Nouveau mot de passe
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type={showPass ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => { setNewPassword(e.target.value); clearError("newPassword"); }}
                    placeholder="••••••••"
                    className={`w-full rounded-2xl border bg-slate-50/70 py-3 pl-10 pr-10 text-sm font-medium text-slate-900 placeholder:text-slate-400 transition-all focus:bg-white focus:border-[#2F7D79] focus:outline-none focus:ring-2 focus:ring-[#2F7D79]/20 ${
                      erreurs.newPassword ? "border-red-500 ring-2 ring-red-500/20" : "border-slate-200"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass((v) => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {erreurs.newPassword && <p className="mt-1 text-xs font-semibold text-red-500">{erreurs.newPassword}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Confirmer le mot de passe
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type={showConfirmPass ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => { setConfirmPassword(e.target.value); clearError("confirmPassword"); }}
                    placeholder="••••••••"
                    className={`w-full rounded-2xl border bg-slate-50/70 py-3 pl-10 pr-10 text-sm font-medium text-slate-900 placeholder:text-slate-400 transition-all focus:bg-white focus:border-[#2F7D79] focus:outline-none focus:ring-2 focus:ring-[#2F7D79]/20 ${
                      erreurs.confirmPassword ? "border-red-500 ring-2 ring-red-500/20" : "border-slate-200"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPass((v) => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showConfirmPass ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {erreurs.confirmPassword && <p className="mt-1 text-xs font-semibold text-red-500">{erreurs.confirmPassword}</p>}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 px-6 rounded-2xl bg-[#2F7D79] hover:bg-[#256461] text-white text-sm font-bold shadow-lg shadow-[#2F7D79]/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-70"
              >
                {isLoading ? "Réinitialisation..." : "Réinitialiser le mot de passe"}
              </button>

              <button
                type="button"
                onClick={() => setStep("email")}
                className="w-full py-3 px-6 rounded-2xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition-all"
                disabled={isLoading}
              >
                Modifier l'email
              </button>
            </form>
          )}

          <div className="mt-6 text-center">
            <Link to="/login" className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#2F7D79] hover:underline">
              <ArrowLeft size={14} />
              Retour à la connexion
            </Link>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
};

export default ForgotPasswordPage;
