import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useTranslation } from "react-i18next";
import { Heart, Bell, ExternalLink } from "lucide-react";
import { API, useAuth } from "../contexts/AuthContext";
import { Button } from "../components/ui/button";
import { toast } from "sonner";
import AlertDialog from "../components/AlertDialog";
import { Navigate } from "react-router-dom";

const WishlistPage = () => {
  const { t } = useTranslation();
  const { user, authHeaders, loading } = useAuth();
  const [items, setItems] = useState([]);
  const [busy, setBusy] = useState(true);
  const [alertGame, setAlertGame] = useState(null);

  const load = useCallback(async () => {
    try {
      const r = await axios.get(`${API}/wishlist`, { withCredentials: true, headers: authHeaders() });
      setItems(r.data || []);
    } catch {} finally { setBusy(false); }
  }, [authHeaders]);

  useEffect(() => { if (user) load(); }, [user, load]);

  if (loading) return <div className="p-10 text-center">{t("common.loading")}</div>;
  if (!user) return <Navigate to="/login" replace />;

  const remove = async (gid) => {
    await axios.delete(`${API}/wishlist/${gid}`, { withCredentials: true, headers: authHeaders() });
    setItems(prev => prev.filter(i => i.game_id !== gid));
    toast.success("Removed");
  };

  return (
    <div data-testid="wishlist-page" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="font-heading text-3xl sm:text-4xl font-black tracking-tight mb-2">{t("wishlist.title")}</h1>
      <p className="text-zinc-500 mb-8">{items.length} items</p>

      {busy ? <p className="text-zinc-500">{t("common.loading")}</p> : items.length === 0 ? (
        <div className="border border-dashed border-zinc-300 dark:border-[#27272A] p-12 text-center text-zinc-500">
          <Heart className="w-10 h-10 mx-auto mb-3 opacity-50"/>
          {t("wishlist.empty")}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {items.map(i => (
            <div key={i.game_id} data-testid="wishlist-item" className="bg-white dark:bg-[#18181B] border border-zinc-200 dark:border-[#27272A] overflow-hidden flex flex-col">
              <div className="aspect-[3/4] bg-zinc-100 dark:bg-black overflow-hidden">
                <img src={i.thumb} alt={i.title} className="w-full h-full object-cover" loading="lazy"/>
              </div>
              <div className="p-4 flex flex-col gap-3 flex-1">
                <h3 className="font-heading font-bold leading-tight line-clamp-2">{i.title}</h3>
                {i.cheapest_price && (
                  <p className="text-2xl font-black">${parseFloat(i.cheapest_price).toFixed(2)}</p>
                )}
                <div className="mt-auto flex gap-2">
                  <a
                    href={`https://www.cheapshark.com/redirect?dealID=${i.game_id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 inline-flex items-center justify-center gap-1 bg-zinc-900 dark:bg-[#D4FF00] text-[#D4FF00] dark:text-black px-3 py-2 text-xs font-bold tracking-wider uppercase"
                  >
                    {t("deal.view")} <ExternalLink className="w-3 h-3"/>
                  </a>
                  <Button data-testid="wishlist-alert-btn" variant="outline" size="icon" onClick={()=>setAlertGame({ gameID: i.game_id, title: i.title, thumb: i.thumb, salePrice: i.cheapest_price })} className="rounded-none">
                    <Bell className="w-4 h-4"/>
                  </Button>
                  <Button data-testid="wishlist-remove-btn" variant="outline" size="icon" onClick={()=>remove(i.game_id)} className="rounded-none border-[#FF2A4D] text-[#FF2A4D]">
                    <Heart className="w-4 h-4 fill-current"/>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {alertGame && (
        <AlertDialog deal={alertGame} onClose={()=>setAlertGame(null)} onCreated={()=>{ setAlertGame(null); toast.success("Alert set!"); }}/>
      )}
    </div>
  );
};

export default WishlistPage;
