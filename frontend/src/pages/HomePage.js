import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { ArrowRight, Flame, Tag, ShieldCheck } from "lucide-react";
import DealCard from "../components/DealCard";
import AdSlot from "../components/AdSlot";
import { Button } from "../components/ui/button";
import { API, useAuth } from "../contexts/AuthContext";
import { toast } from "sonner";
import AlertDialog from "../components/AlertDialog";

const HomePage = () => {
  const { t } = useTranslation();
  const { user, authHeaders } = useAuth();
  const [trending, setTrending] = useState([]);
  const [savings, setSavings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [wishlistIds, setWishlistIds] = useState(new Set());
  const [alertGame, setAlertGame] = useState(null);

  const loadDeals = useCallback(async () => {
    try {
      const [r1, r2] = await Promise.all([
        axios.get(`${API}/deals?sortBy=Deal Rating&pageSize=8`),
        axios.get(`${API}/deals?sortBy=Savings&desc=1&pageSize=8`),
      ]);
      setTrending(r1.data || []);
      setSavings(r2.data || []);
    } catch {
      toast.error(t("common.error"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  const loadWishlist = useCallback(async () => {
    if (!user) return;
    try {
      const r = await axios.get(`${API}/wishlist`, { withCredentials: true, headers: authHeaders() });
      setWishlistIds(new Set((r.data || []).map(i => i.game_id)));
    } catch {}
  }, [user, authHeaders]);

  useEffect(() => { loadDeals(); }, [loadDeals]);
  useEffect(() => { loadWishlist(); }, [loadWishlist]);

  const toggleWishlist = async (deal) => {
    if (!user) { toast.error(t("common.login_required")); return; }
    const gid = deal.gameID;
    if (wishlistIds.has(gid)) {
      await axios.delete(`${API}/wishlist/${gid}`, { withCredentials: true, headers: authHeaders() });
      setWishlistIds(prev => { const n = new Set(prev); n.delete(gid); return n; });
      toast.success("Removed");
    } else {
      await axios.post(`${API}/wishlist`, {
        game_id: gid, title: deal.title, thumb: deal.thumb, cheapest_price: deal.salePrice,
      }, { withCredentials: true, headers: authHeaders() });
      setWishlistIds(prev => new Set(prev).add(gid));
      toast.success("Added to wishlist");
    }
  };

  const openAlert = (deal) => {
    if (!user) { toast.error(t("common.login_required")); return; }
    setAlertGame(deal);
  };

  return (
    <div data-testid="home-page" className="min-h-screen">
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-zinc-200 dark:border-[#27272A]">
        <div className="absolute inset-0 -z-10 dark:opacity-30 opacity-20"
             style={{
               backgroundImage:
                 "radial-gradient(circle at 20% 20%, #D4FF00 0%, transparent 35%), radial-gradient(circle at 80% 60%, #FF2A4D 0%, transparent 40%)",
             }}/>
        <div className="absolute inset-0 -z-10 dark:bg-[radial-gradient(#27272A_1px,transparent_1px)] bg-[radial-gradient(#e4e4e7_1px,transparent_1px)] [background-size:24px_24px] opacity-40"/>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28 grid lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div data-testid="hero-eyebrow" className="inline-flex items-center gap-2 border border-[#D4FF00]/40 bg-[#D4FF00]/10 text-[#D4FF00] dark:text-[#D4FF00] text-zinc-700 px-3 py-1 text-xs font-bold tracking-[0.2em]">
              <Flame className="w-3 h-3" /> {t("hero.eyebrow")}
            </div>
            <h1
              data-testid="hero-title"
              className="font-heading text-4xl sm:text-5xl lg:text-7xl font-black tracking-tight text-zinc-900 dark:text-white leading-[0.95]"
            >
              {t("hero.title")}
            </h1>
            <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-300 max-w-2xl">
              {t("hero.subtitle")}
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Link to="/deals">
                <Button
                  data-testid="hero-cta-primary"
                  className="rounded-none bg-[#D4FF00] hover:bg-[#bce600] text-black font-black px-6 py-6 text-sm tracking-widest uppercase"
                >
                  {t("hero.cta_primary")} <ArrowRight className="w-4 h-4 ms-2" />
                </Button>
              </Link>
              {!user && (
                <Link to="/login">
                  <Button
                    variant="outline"
                    data-testid="hero-cta-secondary"
                    className="rounded-none border-zinc-300 dark:border-[#27272A] px-6 py-6 text-sm tracking-widest uppercase"
                  >
                    {t("hero.cta_secondary")}
                  </Button>
                </Link>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-6 text-zinc-500 dark:text-zinc-400">
              {["Steam","Epic","GOG","PlayStation","Xbox"].map(p => (
                <span key={p} className="px-3 py-1 border border-zinc-300 dark:border-[#27272A] text-xs uppercase tracking-widest font-bold">{p}</span>
              ))}
            </div>
          </div>

          <div className="lg:col-span-5 grid grid-cols-2 gap-3">
            <div className="bg-white dark:bg-[#18181B] border border-zinc-200 dark:border-[#27272A] p-5">
              <Tag className="w-6 h-6 text-[#D4FF00]" />
              <p className="mt-3 text-3xl font-black">100K+</p>
              <p className="text-xs uppercase tracking-widest text-zinc-500">Live Deals</p>
            </div>
            <div className="bg-zinc-900 dark:bg-[#18181B] text-white border border-zinc-900 dark:border-[#27272A] p-5">
              <Flame className="w-6 h-6 text-[#FF2A4D]" />
              <p className="mt-3 text-3xl font-black">-90%</p>
              <p className="text-xs uppercase tracking-widest text-zinc-300">Peak Discount</p>
            </div>
            <div className="col-span-2 bg-[#D4FF00] text-black p-5">
              <ShieldCheck className="w-6 h-6" />
              <p className="mt-3 text-3xl font-black">5 Stores</p>
              <p className="text-xs uppercase tracking-widest">Steam · Epic · GOG · PS · Xbox</p>
            </div>
          </div>
        </div>
      </section>

      {/* HOT DEALS */}
      <Section title={t("hot_deals")} loading={loading} deals={savings} wishlistIds={wishlistIds}
        onToggleWishlist={toggleWishlist} onSetAlert={openAlert} />

      {/* MID-PAGE AD */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AdSlot size="leaderboard" testId="home-mid-ad" />
      </div>

      {/* TRENDING */}
      <Section title={t("trending")} loading={loading} deals={trending} wishlistIds={wishlistIds}
        onToggleWishlist={toggleWishlist} onSetAlert={openAlert} />

      {/* BOTTOM BANNER AD */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-14">
        <AdSlot size="banner" testId="home-bottom-ad" />
      </div>

      {alertGame && (
        <AlertDialog
          deal={alertGame}
          onClose={() => setAlertGame(null)}
          onCreated={() => { setAlertGame(null); toast.success("Alert set!"); }}
        />
      )}
    </div>
  );
};

const Section = ({ title, loading, deals, wishlistIds, onToggleWishlist, onSetAlert }) => {
  const { t } = useTranslation();
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
      <div className="flex items-end justify-between mb-6">
        <h2 className="font-heading text-2xl sm:text-3xl font-black tracking-tight text-zinc-900 dark:text-white">
          {title}
        </h2>
        <Link to="/deals" className="text-sm font-bold tracking-widest uppercase text-zinc-600 dark:text-zinc-300 hover:text-[#D4FF00]">
          {t("view_all")} →
        </Link>
      </div>
      {loading ? (
        <div className="text-center text-zinc-500 py-10">{t("common.loading")}</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {deals.slice(0, 8).map(d => (
            <DealCard key={d.dealID} deal={d}
              inWishlist={wishlistIds.has(d.gameID)}
              onToggleWishlist={onToggleWishlist}
              onSetAlert={onSetAlert} />
          ))}
        </div>
      )}
    </section>
  );
};

export default HomePage;
