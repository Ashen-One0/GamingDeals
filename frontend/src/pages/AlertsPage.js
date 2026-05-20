import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useTranslation } from "react-i18next";
import { Bell, BellRing, Trash2 } from "lucide-react";
import { API, useAuth } from "../contexts/AuthContext";
import { Button } from "../components/ui/button";
import { toast } from "sonner";
import { Navigate } from "react-router-dom";

const AlertsPage = () => {
  const { t } = useTranslation();
  const { user, authHeaders, loading } = useAuth();
  const [alerts, setAlerts] = useState([]);
  const [busy, setBusy] = useState(true);

  const load = useCallback(async () => {
    try {
      const r = await axios.get(`${API}/alerts`, { withCredentials: true, headers: authHeaders() });
      setAlerts(r.data || []);
    } catch {} finally { setBusy(false); }
  }, [authHeaders]);

  useEffect(() => { if (user) load(); }, [user, load]);

  if (loading) return <div className="p-10 text-center">{t("common.loading")}</div>;
  if (!user) return <Navigate to="/login" replace />;

  const remove = async (id) => {
    await axios.delete(`${API}/alerts/${id}`, { withCredentials: true, headers: authHeaders() });
    setAlerts(prev => prev.filter(a => a.alert_id !== id));
    toast.success("Deleted");
  };

  return (
    <div data-testid="alerts-page" className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="font-heading text-3xl sm:text-4xl font-black tracking-tight mb-2">{t("alerts.title")}</h1>
      <p className="text-zinc-500 mb-8">{alerts.length} active alerts</p>

      {busy ? <p className="text-zinc-500">{t("common.loading")}</p> : alerts.length === 0 ? (
        <div className="border border-dashed border-zinc-300 dark:border-[#27272A] p-12 text-center text-zinc-500">
          <Bell className="w-10 h-10 mx-auto mb-3 opacity-50"/>
          {t("alerts.empty")}
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map(a => (
            <div key={a.alert_id} data-testid="alert-item" className={`flex items-center gap-4 p-4 border ${a.triggered ? "border-[#D4FF00] bg-[#D4FF00]/5" : "border-zinc-200 dark:border-[#27272A] bg-white dark:bg-[#18181B]"}`}>
              <img src={a.thumb} alt={a.title} className="w-16 h-16 object-cover" loading="lazy"/>
              <div className="flex-1 min-w-0">
                <h3 className="font-heading font-bold truncate">{a.title}</h3>
                <div className="flex flex-wrap items-center gap-3 text-xs mt-1">
                  <span className="text-zinc-500">{t("alerts.target")} <span className="font-black text-zinc-900 dark:text-white">${a.target_price.toFixed(2)}</span></span>
                  {a.current_price != null && (
                    <span className="text-zinc-500">{t("alerts.current")} <span className="font-black text-zinc-900 dark:text-white">${a.current_price.toFixed(2)}</span></span>
                  )}
                  {a.triggered ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#D4FF00] text-black font-black text-[10px] uppercase tracking-widest">
                      <BellRing className="w-3 h-3"/> {t("alerts.triggered")}
                    </span>
                  ) : (
                    <span className="text-zinc-400 uppercase tracking-widest text-[10px]">{t("alerts.waiting")}</span>
                  )}
                </div>
              </div>
              <Button data-testid="alert-delete-btn" variant="outline" size="icon" onClick={()=>remove(a.alert_id)} className="rounded-none border-[#FF2A4D] text-[#FF2A4D]">
                <Trash2 className="w-4 h-4"/>
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AlertsPage;
