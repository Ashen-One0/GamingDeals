import React from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { Sun, Moon, Heart, Bell, LogOut, User2, Gamepad2 } from "lucide-react";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const change = (lng) => {
    i18n.changeLanguage(lng);
    document.documentElement.dir = lng === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = lng;
  };
  const current = i18n.language?.slice(0, 2) || "en";
  const labels = { en: "EN", ar: "ع", es: "ES" };
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          data-testid="language-switcher"
          className="rounded-none border-[#27272A] dark:border-[#27272A] font-bold tracking-wider"
        >
          {labels[current] || "EN"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" data-testid="language-menu">
        <DropdownMenuLabel className="text-xs uppercase tracking-widest">Language</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem data-testid="lang-en" onClick={() => change("en")}>English</DropdownMenuItem>
        <DropdownMenuItem data-testid="lang-ar" onClick={() => change("ar")}>العربية</DropdownMenuItem>
        <DropdownMenuItem data-testid="lang-es" onClick={() => change("es")}>Español</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const Header = () => {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();

  const navClass = ({ isActive }) =>
    `text-sm font-medium tracking-wide transition-colors ${
      isActive ? "text-[#D4FF00]" : "text-zinc-300 hover:text-white"
    }`;

  return (
    <header
      data-testid="site-header"
      className="sticky top-0 z-50 backdrop-blur-xl bg-white/70 dark:bg-black/60 border-b border-zinc-200 dark:border-[#27272A]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        <Link to="/" data-testid="logo-link" className="flex items-center gap-2 group">
          <span className="w-9 h-9 rounded-none bg-[#D4FF00] flex items-center justify-center transition-transform group-hover:rotate-3">
            <Gamepad2 className="w-5 h-5 text-black" strokeWidth={2.5} />
          </span>
          <span className="font-heading text-xl font-black tracking-tight text-zinc-900 dark:text-white">
            {t("app_name")}
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <NavLink to="/" end className={navClass} data-testid="nav-home">{t("nav.home")}</NavLink>
          <NavLink to="/deals" className={navClass} data-testid="nav-deals">{t("nav.deals")}</NavLink>
          <NavLink to="/wishlist" className={navClass} data-testid="nav-wishlist">
            <span className="flex items-center gap-1"><Heart className="w-4 h-4" />{t("nav.wishlist")}</span>
          </NavLink>
          <NavLink to="/alerts" className={navClass} data-testid="nav-alerts">
            <span className="flex items-center gap-1"><Bell className="w-4 h-4" />{t("nav.alerts")}</span>
          </NavLink>
        </nav>

        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <Button
            variant="outline"
            size="icon"
            onClick={toggle}
            data-testid="theme-toggle"
            className="rounded-none border-zinc-300 dark:border-[#27272A]"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </Button>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" data-testid="user-menu" className="rounded-none">
                  {user.picture ? (
                    <img src={user.picture} alt="" className="w-5 h-5 rounded-full me-2" />
                  ) : (
                    <User2 className="w-4 h-4 me-2" />
                  )}
                  <span className="hidden sm:inline truncate max-w-[120px]">{user.name || user.email}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>{user.email}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem data-testid="menu-wishlist" onClick={() => navigate("/wishlist")}>
                  <Heart className="w-4 h-4 me-2" />{t("nav.wishlist")}
                </DropdownMenuItem>
                <DropdownMenuItem data-testid="menu-alerts" onClick={() => navigate("/alerts")}>
                  <Bell className="w-4 h-4 me-2" />{t("nav.alerts")}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem data-testid="menu-logout" onClick={logout}>
                  <LogOut className="w-4 h-4 me-2" />{t("nav.logout")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              onClick={() => navigate("/login")}
              data-testid="header-login-btn"
              className="rounded-none bg-[#D4FF00] hover:bg-[#bce600] text-black font-bold tracking-wide"
            >
              {t("nav.login")}
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
