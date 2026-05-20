import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Gamepad2, Heart, Mail } from "lucide-react";
import AdSlot from "./AdSlot";

const Footer = () => {
  const { t } = useTranslation();
  return (
    <footer
      data-testid="site-footer"
      className="mt-10 border-t border-zinc-200 dark:border-[#27272A] bg-zinc-50 dark:bg-[#0a0a0c]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <AdSlot size="banner" testId="footer-ad" />
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
        <div className="space-y-3">
          <Link to="/" className="inline-flex items-center gap-2">
            <span className="w-8 h-8 bg-[#D4FF00] flex items-center justify-center">
              <Gamepad2 className="w-4 h-4 text-black" strokeWidth={2.5}/>
            </span>
            <span className="font-heading text-lg font-black tracking-tight">{t("app_name")}</span>
          </Link>
          <p className="text-xs text-zinc-500 leading-relaxed max-w-xs">{t("tagline")}</p>
        </div>
        <div>
          <h4 className="text-xs uppercase tracking-widest font-black mb-3">Navigate</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/" className="text-zinc-600 dark:text-zinc-300 hover:text-[#D4FF00]">{t("nav.home")}</Link></li>
            <li><Link to="/deals" className="text-zinc-600 dark:text-zinc-300 hover:text-[#D4FF00]">{t("nav.deals")}</Link></li>
            <li><Link to="/wishlist" className="text-zinc-600 dark:text-zinc-300 hover:text-[#D4FF00]">{t("nav.wishlist")}</Link></li>
            <li><Link to="/alerts" className="text-zinc-600 dark:text-zinc-300 hover:text-[#D4FF00]">{t("nav.alerts")}</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-xs uppercase tracking-widest font-black mb-3">Stores</h4>
          <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-300">
            <li>Steam</li><li>Epic Games</li><li>GOG</li><li>Humble Store</li><li>Fanatical</li>
          </ul>
        </div>
        <div>
          <h4 className="text-xs uppercase tracking-widest font-black mb-3">Contact</h4>
          <p className="text-sm text-zinc-600 dark:text-zinc-300 flex items-center gap-2">
            <Mail className="w-4 h-4"/> hello@gamedeals.app
          </p>
          <p className="text-xs text-zinc-500 mt-4 flex items-center gap-1">
            Built with <Heart className="w-3 h-3 text-[#FF2A4D] fill-current"/> for gamers
          </p>
        </div>
      </div>
      <div className="border-t border-zinc-200 dark:border-[#27272A] py-4 text-center text-xs text-zinc-500">
        © {new Date().getFullYear()} GameDeals. Deal data provided by CheapShark.
      </div>
    </footer>
  );
};

export default Footer;
