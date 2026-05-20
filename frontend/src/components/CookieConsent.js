import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Cookie, X } from "lucide-react";
import { Button } from "./ui/button";
import { useTranslation } from "react-i18next";

const STORAGE_KEY = "cookie_consent_v1";

/**
 * Cookie Consent Banner.
 * - Shows on first visit only (or until user clicks Accept/Reject).
 * - "Accept" stores {essential, functional, analytics} = all true.
 * - "Reject" stores only essential = true (others false).
 * - Choice persists in localStorage so the banner never reappears.
 */
const CookieConsent = () => {
  const { i18n } = useTranslation();
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) setShow(true);
    } catch {
      setShow(true);
    }
  }, []);

  const persist = (consent) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...consent, ts: Date.now() }));
    } catch {}
    setShow(false);
    // Expose for ad/analytics scripts to read later
    window.__cookieConsent = consent;
  };

  if (!show) return null;

  const lng = i18n.language?.slice(0, 2) || "en";
  const copy = {
    en: {
      title: "We use cookies",
      body: "GamingDeals uses essential cookies to keep you signed in and remember your preferences. We may also use analytics and ad cookies if you accept.",
      accept: "Accept all",
      reject: "Essential only",
      learn: "Learn more",
    },
    ar: {
      title: "نستخدم ملفات تعريف الارتباط",
      body: "نستخدم كوكيز أساسية لإبقاء تسجيل دخولك وحفظ تفضيلاتك. قد نستخدم أيضاً كوكيز التحليلات والإعلانات إذا قبلت.",
      accept: "قبول الكل",
      reject: "الأساسية فقط",
      learn: "اعرف المزيد",
    },
    es: {
      title: "Usamos cookies",
      body: "Usamos cookies esenciales para mantener tu sesión y preferencias. También podemos usar cookies de analítica y anuncios si aceptas.",
      accept: "Aceptar todo",
      reject: "Solo esenciales",
      learn: "Saber más",
    },
  };
  const c = copy[lng] || copy.en;

  return (
    <div
      data-testid="cookie-consent"
      className="fixed bottom-4 start-4 end-4 sm:bottom-6 sm:start-6 sm:end-auto sm:max-w-md z-50 bg-zinc-900 dark:bg-[#0a0a0c] text-white border border-[#D4FF00] shadow-2xl"
    >
      <div className="p-5 space-y-3">
        <div className="flex items-start gap-3">
          <Cookie className="w-5 h-5 text-[#D4FF00] mt-0.5 shrink-0"/>
          <div className="flex-1">
            <h3 className="font-heading text-sm font-black uppercase tracking-widest text-[#D4FF00]">{c.title}</h3>
            <p className="text-xs text-zinc-300 mt-2 leading-relaxed">{c.body}</p>
            <Link
              to="/privacy"
              className="text-[10px] uppercase tracking-widest text-[#D4FF00] hover:underline mt-2 inline-block"
              data-testid="cookie-learn-more"
            >
              {c.learn} →
            </Link>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => persist({ essential: true, functional: false, analytics: false, ads: false })}
            variant="outline"
            data-testid="cookie-reject-btn"
            className="flex-1 rounded-none border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-800 text-xs font-bold uppercase tracking-widest"
          >
            {c.reject}
          </Button>
          <Button
            onClick={() => persist({ essential: true, functional: true, analytics: true, ads: true })}
            data-testid="cookie-accept-btn"
            className="flex-1 rounded-none bg-[#D4FF00] hover:bg-[#bce600] text-black text-xs font-black uppercase tracking-widest"
          >
            {c.accept}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;
