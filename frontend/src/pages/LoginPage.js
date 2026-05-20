import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { useAuth } from "../contexts/AuthContext";
import { Gamepad2, LogIn } from "lucide-react";
import { toast } from "sonner";

const LoginPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { loginLocal, registerLocal, loginWithGoogle } = useAuth();
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "login") {
        await loginLocal(email, password);
      } else {
        await registerLocal(email, password, name);
      }
      toast.success("Welcome!");
      navigate("/");
    } catch (err) {
      toast.error(err?.response?.data?.detail || t("common.error"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-10">
      <div data-testid="auth-card" className="w-full max-w-md bg-white dark:bg-[#18181B] border border-zinc-200 dark:border-[#27272A] p-8 sm:p-10 space-y-6">
        <div className="flex items-center gap-3">
          <span className="w-10 h-10 bg-[#D4FF00] flex items-center justify-center">
            <Gamepad2 className="w-5 h-5 text-black" strokeWidth={2.5}/>
          </span>
          <div>
            <h1 className="font-heading text-2xl font-black tracking-tight">{mode === "login" ? t("auth.sign_in") : t("auth.sign_up")}</h1>
            <p className="text-xs uppercase tracking-widest text-zinc-500">GameDeals</p>
          </div>
        </div>

        <Button
          onClick={loginWithGoogle}
          data-testid="google-login-btn"
          variant="outline"
          className="w-full rounded-none border-zinc-300 dark:border-[#27272A] py-6 font-bold"
        >
          <svg className="w-5 h-5 me-2" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.26 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
          {t("auth.google_login")}
        </Button>

        <div className="flex items-center gap-3 text-xs uppercase tracking-widest text-zinc-500">
          <div className="flex-1 h-px bg-zinc-200 dark:bg-[#27272A]"/>
          {t("auth.or")}
          <div className="flex-1 h-px bg-zinc-200 dark:bg-[#27272A]"/>
        </div>

        <form onSubmit={submit} className="space-y-4">
          {mode === "register" && (
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-zinc-500">{t("auth.name")}</label>
              <Input data-testid="auth-name" value={name} onChange={e=>setName(e.target.value)} className="rounded-none"/>
            </div>
          )}
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-widest text-zinc-500">{t("auth.email")}</label>
            <Input data-testid="auth-email" type="email" required value={email} onChange={e=>setEmail(e.target.value)} className="rounded-none"/>
          </div>
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-widest text-zinc-500">{t("auth.password")}</label>
            <Input data-testid="auth-password" type="password" required minLength={6} value={password} onChange={e=>setPassword(e.target.value)} className="rounded-none"/>
          </div>
          <Button
            type="submit"
            disabled={busy}
            data-testid="auth-submit-btn"
            className="w-full rounded-none bg-[#D4FF00] hover:bg-[#bce600] text-black font-black tracking-widest uppercase py-6"
          >
            {busy ? t("auth.signing_in") : (<>{mode === "login" ? t("auth.sign_in") : t("auth.sign_up")} <LogIn className="w-4 h-4 ms-2"/></>)}
          </Button>
        </form>

        <div className="text-center text-sm text-zinc-500">
          {mode === "login" ? (
            <>{t("auth.no_account")} <button data-testid="switch-to-register" onClick={()=>setMode("register")} className="text-[#FF2A4D] font-bold ms-1">{t("auth.sign_up")}</button></>
          ) : (
            <>{t("auth.have_account")} <button data-testid="switch-to-login" onClick={()=>setMode("login")} className="text-[#FF2A4D] font-bold ms-1">{t("auth.sign_in")}</button></>
          )}
        </div>
        <Link to="/" className="block text-center text-xs uppercase tracking-widest text-zinc-400 hover:text-zinc-600">← Back</Link>
      </div>
    </div>
  );
};

export default LoginPage;
