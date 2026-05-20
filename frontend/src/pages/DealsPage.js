import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useTranslation } from "react-i18next";
import DealCard from "../components/DealCard";
import FilterPanel from "../components/FilterPanel";
import { API, useAuth } from "../contexts/AuthContext";
import { toast } from "sonner";
import AlertDialog from "../components/AlertDialog";
import { Button } from "../components/ui/button";

const DealsPage = () => {
  const { t } = useTranslation();
  const { user, authHeaders } = useAuth();
  const [filters, setFilters] = useState({
    title: "",
    storeID: "all",
    upperPrice: 50,
    minDiscount: 0,
    metacritic: "",
    sortBy: "Deal Rating",
  });
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [wishlistIds, setWishlistIds] = useState(new Set());
  const [alertGame, setAlertGame] = useState(null);

  const load = useCallback(async (p = 0) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("pageSize", "24");
      params.set("pageNumber", String(p));
      params.set("sortBy", filters.sortBy);
      params.set("desc", filters.sortBy === "Savings" ? "1" : "0");
      params.set("upperPrice", String(filters.upperPrice));
      if (filters.storeID && filters.storeID !== "all") params.set("storeID", filters.storeID);
      if (filters.title) params.set("title", filters.title);
      if (filters.metacritic) params.set("metacritic", filters.metacritic);
      const r = await axios.get(`${API}/deals?${params.toString()}`);
      let data = r.data || [];
      if (filters.minDiscount > 0) {
        data = data.filter(d => parseFloat(d.savings || 0) >= filters.minDiscount);
      }
      setDeals(data);
    } catch {
      toast.error(t("common.error"));
    } finally {
      setLoading(false);
    }
  }, [filters, t]);

  const loadWishlist = useCallback(async () => {
    if (!user) return;
    try {
      const r = await axios.get(`${API}/wishlist`, { withCredentials: true, headers: authHeaders() });
      setWishlistIds(new Set((r.data || []).map(i => i.game_id)));
    } catch {}
  }, [user, authHeaders]);

  useEffect(() => { load(0); setPage(0); /* eslint-disable-next-line */ }, []);
  useEffect(() => { loadWishlist(); }, [loadWishlist]);

  const toggleWishlist = async (deal) => {
    if (!user) { toast.error(t("common.login_required")); return; }
    const gid = deal.gameID;
    if (wishlistIds.has(gid)) {
      await axios.delete(`${API}/wishlist/${gid}`, { withCredentials: true, headers: authHeaders() });
      setWishlistIds(prev => { const n = new Set(prev); n.delete(gid); return n; });
    } else {
      await axios.post(`${API}/wishlist`, {
        game_id: gid, title: deal.title, thumb: deal.thumb, cheapest_price: deal.salePrice,
      }, { withCredentials: true, headers: authHeaders() });
      setWishlistIds(prev => new Set(prev).add(gid));
    }
  };

  const openAlert = (deal) => {
    if (!user) { toast.error(t("common.login_required")); return; }
    setAlertGame(deal);
  };

  return (
    <div data-testid="deals-page" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="grid lg:grid-cols-12 gap-6">
        <div className="lg:col-span-3">
          <FilterPanel
            filters={filters}
            setFilters={setFilters}
            onApply={() => load(0)}
            onReset={() => {
              setFilters({ title: "", storeID: "all", upperPrice: 50, minDiscount: 0, metacritic: "", sortBy: "Deal Rating" });
              setTimeout(() => load(0), 0);
            }}
          />
        </div>
        <div className="lg:col-span-9">
          <div className="flex items-end justify-between mb-5">
            <h1 className="font-heading text-3xl font-black tracking-tight text-zinc-900 dark:text-white">
              {t("nav.deals")}
            </h1>
            <span className="text-xs uppercase tracking-widest text-zinc-500">{deals.length} {t("hot_deals")}</span>
          </div>

          {loading ? (
            <div className="text-center text-zinc-500 py-20">{t("common.loading")}</div>
          ) : deals.length === 0 ? (
            <div className="text-center text-zinc-500 py-20 border border-zinc-200 dark:border-[#27272A]">
              No deals found
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {deals.map(d => (
                <DealCard key={d.dealID} deal={d}
                  inWishlist={wishlistIds.has(d.gameID)}
                  onToggleWishlist={toggleWishlist}
                  onSetAlert={openAlert} />
              ))}
            </div>
          )}

          <div className="flex justify-center gap-3 mt-10">
            <Button
              variant="outline"
              data-testid="page-prev"
              disabled={page === 0 || loading}
              onClick={() => { const p = Math.max(0, page - 1); setPage(p); load(p); window.scrollTo(0,0); }}
              className="rounded-none"
            >
              ← Prev
            </Button>
            <span className="px-4 py-2 text-sm font-bold">Page {page + 1}</span>
            <Button
              variant="outline"
              data-testid="page-next"
              disabled={loading || deals.length < 24}
              onClick={() => { const p = page + 1; setPage(p); load(p); window.scrollTo(0,0); }}
              className="rounded-none"
            >
              Next →
            </Button>
          </div>
        </div>
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

export default DealsPage;
