import React, { useEffect, useRef } from "react";
import { Sparkles } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

/**
 * AdSlot — flexible ad placeholder.
 * - If REACT_APP_ADSENSE_CLIENT and adSlot are set, renders a real <ins> AdSense block.
 * - Otherwise renders a tasteful placeholder you can swap for any ad network later.
 *
 * Sizes (matches IAB standard):
 *  - "leaderboard" 728x90 (or fluid responsive)
 *  - "rectangle"   300x250
 *  - "banner"      full-width responsive
 *  - "sidebar"     300x600
 */
const AD_SIZES = {
  leaderboard: { className: "h-24 sm:h-28", label: "728 × 90" },
  rectangle:   { className: "h-[250px]",   label: "300 × 250" },
  banner:      { className: "h-32 sm:h-40", label: "Responsive" },
  sidebar:     { className: "h-[600px]",   label: "300 × 600" },
};

const AdSlot = ({ size = "banner", adSlot, className = "", testId = "ad-slot" }) => {
  const adRef = useRef(null);
  const { user } = useAuth() || {};
  const client = process.env.REACT_APP_ADSENSE_CLIENT; // e.g. "ca-pub-1234567890123456"
  const enabled = !!(client && adSlot);
  const isPro = !!user?.is_pro;

  useEffect(() => {
    if (!enabled || isPro) return;
    try {
      // eslint-disable-next-line no-unused-expressions
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      // noop
    }
  }, [enabled, isPro]);

  // Pro users never see ads
  if (isPro) return null;

  const cfg = AD_SIZES[size] || AD_SIZES.banner;

  if (enabled) {
    return (
      <div data-testid={testId} className={`w-full ${cfg.className} ${className}`}>
        <ins
          ref={adRef}
          className="adsbygoogle"
          style={{ display: "block", width: "100%", height: "100%" }}
          data-ad-client={client}
          data-ad-slot={adSlot}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      </div>
    );
  }

  return (
    <div
      data-testid={testId}
      className={`relative w-full ${cfg.className} ${className} border border-dashed border-zinc-300 dark:border-[#27272A] bg-zinc-50 dark:bg-[#0f0f10] flex items-center justify-center overflow-hidden group`}
    >
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "repeating-linear-gradient(45deg, transparent, transparent 8px, rgba(212,255,0,0.08) 8px, rgba(212,255,0,0.08) 16px)",
        }}
      />
      <div className="relative flex items-center gap-3 text-zinc-500 dark:text-zinc-400">
        <Sparkles className="w-4 h-4 text-[#D4FF00]" />
        <div className="text-center">
          <p className="text-xs uppercase tracking-[0.3em] font-bold">Advertisement</p>
          <p className="text-[10px] uppercase tracking-widest opacity-60 mt-0.5">{cfg.label}</p>
          <a href="/pro" className="text-[10px] uppercase tracking-widest text-[#D4FF00] hover:underline mt-1 inline-block">
            Go Pro to hide ads →
          </a>
        </div>
        <Sparkles className="w-4 h-4 text-[#D4FF00]" />
      </div>
    </div>
  );
};

export default AdSlot;
