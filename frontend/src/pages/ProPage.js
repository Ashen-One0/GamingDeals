import React, { useEffect, useState } from "react";
import axios from "axios";
import { useTranslation } from "react-i18next";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Check, Crown, X, Zap } from "lucide-react";
import { Button } from "../components/ui/button";
import { API, useAuth } from "../contexts/AuthContext";
import { toast } from "sonner";

const ProPage = () => {
  const { t } = useTranslation();
  const { user, authHeaders, refresh } = useAuth();
  const navigate = useNavigate();
  const [packages, setPackages] = useState([]);
  const [busy, setBusy] = useState(null);

  useEffect(() => {
    axios.get(`${API}/pro/packages`).then(r => setPackages(r.data || []));
  }, []);

  const subscribe = async (pkgId) => {
    if (!user) {
      toast.error(t("common.login_required"));
      navigate("/login");
      return;
    }
    setBusy(pkgId);
    try {
      const r = await axios.post(`${API}/pro/checkout`, {
        package_id: pkgId,
        origin_url: window.location.origin,
      }, { withCredentials: true, headers: authHeaders() });
      window.location.href = r.data.url;
    } catch (err) {
      toast.error(err?.response?.data?.detail || t("common.error"));
      setBusy(null);
    }
  };

  const features = [
    { text: "Zero ads, anywhere", included: true, pro: true },
    { text: "Unlimited price alerts", included: true, pro: true },
    { text: "Browse all deals", included: true, pro: false },
    { text: "Wishlist & basic alerts", included: true, pro: false },
    { text: "Multi-language UI", included: true, pro: false },
  ];

  return (
    <div data-testid="pro-page" className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
      <div className="text-center space-y-4 mb-12">
        <div className="inline-flex items-center gap-2 border border-[#D4FF00]/40 bg-[#D4FF00]/10 px-3 py-1 text-xs font-bold tracking-[0.2em] text-[#D4FF00]">
          <Crown className="w-3 h-3"/> GAMEDEALS PRO
        </div>
        <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight">
          Hunt deals. Skip the ads.
        </h1>
        <p className="text-zinc-500 dark:text-zinc-300 max-w-2xl mx-auto">
          Support the platform and get an ad-free, focused experience. Cancel anytime.
        </p>
        {user?.is_pro && (
          <div className="inline-flex items-center gap-2 bg-[#D4FF00] text-black px-4 py-2 font-black uppercase tracking-widest text-xs">
            <Crown className="w-4 h-4"/> You're Pro until {user.pro_until?.slice(0, 10)}
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-5 mb-12">
        {packages.map((pkg, idx) => {
          const isYear = pkg.id === "yearly";
          return (
            <div
              key={pkg.id}
              data-testid={`pro-plan-${pkg.id}`}
              className={`relative bg-white dark:bg-[#18181B] border p-8 flex flex-col ${
                isYear
                  ? "border-[#D4FF00] ring-2 ring-[#D4FF00]/30"
                  : "border-zinc-200 dark:border-[#27272A]"
              }`}
            >
              {isYear && (
                <div className="absolute -top-3 start-6 bg-[#D4FF00] text-black px-3 py-1 text-[10px] font-black uppercase tracking-widest">
                  Best value · Save 33%
                </div>
              )}
              <h3 className="font-heading text-xl font-black uppercase tracking-widest">
                {pkg.id}
              </h3>
              <div className="my-6 flex items-end gap-2">
                <span className="text-5xl font-black">${pkg.amount.toFixed(2)}</span>
                <span className="text-zinc-500 mb-1">/{pkg.id === "yearly" ? "year" : "month"}</span>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                {features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <Check className="w-4 h-4 text-[#D4FF00] mt-0.5 shrink-0"/>
                    <span>{f.text}</span>
                  </li>
                ))}
              </ul>
              <Button
                data-testid={`subscribe-${pkg.id}`}
                onClick={() => subscribe(pkg.id)}
                disabled={busy === pkg.id || user?.is_pro}
                className={`w-full rounded-none py-6 font-black tracking-widest uppercase ${
                  isYear
                    ? "bg-[#D4FF00] hover:bg-[#bce600] text-black"
                    : "bg-zinc-900 dark:bg-white dark:text-black text-white hover:opacity-90"
                }`}
              >
                {busy === pkg.id ? "Loading..." : user?.is_pro ? "Already Pro" : "Subscribe"}
              </Button>
            </div>
          );
        })}
      </div>

      <div className="bg-zinc-50 dark:bg-[#0f0f10] border border-zinc-200 dark:border-[#27272A] p-8">
        <h3 className="font-heading text-lg font-black uppercase tracking-widest mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-[#D4FF00]"/> What you get
        </h3>
        <ul className="grid sm:grid-cols-2 gap-3 text-sm">
          {[
            "Completely ad-free experience",
            "Faster page loads",
            "Priority support",
            "Future Pro-only features",
            "Support indie game discounting",
            "Cancel anytime",
          ].map((f, i) => (
            <li key={i} className="flex items-center gap-2">
              <Check className="w-4 h-4 text-[#D4FF00]"/> {f}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export const ProSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const { refresh } = useAuth();
  const navigate = useNavigate();
  const [state, setState] = useState({ status: "checking", message: "Verifying payment..." });

  useEffect(() => {
    if (!sessionId) {
      setState({ status: "error", message: "No session ID found" });
      return;
    }
    let cancelled = false;
    let attempts = 0;
    const poll = async () => {
      try {
        const r = await axios.get(`${API}/pro/status/${sessionId}`);
        if (cancelled) return;
        if (r.data.payment_status === "paid") {
          setState({ status: "success", message: "Welcome to Pro!" });
          await refresh();
          setTimeout(() => navigate("/"), 2500);
          return;
        }
        if (r.data.status === "expired") {
          setState({ status: "error", message: "Payment session expired." });
          return;
        }
        if (attempts < 10) {
          attempts++;
          setTimeout(poll, 2000);
        } else {
          setState({ status: "timeout", message: "Still processing. Check back later." });
        }
      } catch (e) {
        setState({ status: "error", message: "Could not verify payment." });
      }
    };
    poll();
    return () => { cancelled = true; };
    // eslint-disable-next-line
  }, [sessionId]);

  return (
    <div data-testid="pro-success-page" className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white dark:bg-[#18181B] border border-zinc-200 dark:border-[#27272A] p-10 text-center space-y-4">
        {state.status === "success" ? (
          <>
            <div className="w-16 h-16 bg-[#D4FF00] mx-auto flex items-center justify-center">
              <Crown className="w-8 h-8 text-black"/>
            </div>
            <h1 className="font-heading text-3xl font-black tracking-tight">You're Pro!</h1>
            <p className="text-zinc-500">{state.message}</p>
            <Button onClick={() => navigate("/")} className="rounded-none bg-[#D4FF00] hover:bg-[#bce600] text-black font-black uppercase tracking-widest">
              Start hunting deals
            </Button>
          </>
        ) : state.status === "error" || state.status === "timeout" ? (
          <>
            <div className="w-16 h-16 bg-[#FF2A4D] mx-auto flex items-center justify-center">
              <X className="w-8 h-8 text-white"/>
            </div>
            <h1 className="font-heading text-2xl font-black">{state.message}</h1>
            <Button variant="outline" onClick={() => navigate("/pro")} className="rounded-none">Try again</Button>
          </>
        ) : (
          <>
            <div className="w-16 h-16 border-4 border-[#D4FF00] border-t-transparent rounded-full animate-spin mx-auto"/>
            <p className="text-zinc-500 uppercase tracking-widest text-sm">{state.message}</p>
          </>
        )}
      </div>
    </div>
  );
};

export default ProPage;
