import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import axios from "axios";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { API, useAuth } from "../contexts/AuthContext";
import { toast } from "sonner";

const AlertDialog = ({ deal, onClose, onCreated }) => {
  const { t } = useTranslation();
  const { authHeaders } = useAuth();
  const [target, setTarget] = useState(deal?.salePrice ? (parseFloat(deal.salePrice) * 0.8).toFixed(2) : "");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await axios.post(`${API}/alerts`, {
        game_id: deal.gameID,
        title: deal.title,
        thumb: deal.thumb,
        target_price: parseFloat(target),
      }, { withCredentials: true, headers: authHeaders() });
      onCreated?.();
    } catch (err) {
      toast.error(err?.response?.data?.detail || t("common.error"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={!!deal} onOpenChange={(o) => !o && onClose()}>
      <DialogContent data-testid="alert-dialog" className="rounded-none border-zinc-200 dark:border-[#27272A]">
        <DialogHeader>
          <DialogTitle className="font-heading">{t("deal.set_alert")}</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="flex items-center gap-3">
            <img src={deal.thumb} alt="" className="w-14 h-14 object-cover"/>
            <p className="font-bold">{deal.title}</p>
          </div>
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-widest text-zinc-500">{t("wishlist.target_price")} ($)</label>
            <Input data-testid="alert-target-input" type="number" min="0.01" step="0.01" required value={target} onChange={e=>setTarget(e.target.value)} className="rounded-none"/>
          </div>
          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={onClose} className="rounded-none">{t("common.cancel")}</Button>
            <Button type="submit" disabled={busy} data-testid="alert-submit" className="rounded-none bg-[#D4FF00] hover:bg-[#bce600] text-black font-black uppercase tracking-widest">
              {t("wishlist.create_alert")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AlertDialog;
