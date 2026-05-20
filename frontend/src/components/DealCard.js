import React from "react";
import { useTranslation } from "react-i18next";
import { Heart, Bell, ExternalLink, Store } from "lucide-react";

const STORE_MAP = {
  "1": { name: "Steam", abbr: "STM" },
  "2": { name: "GamersGate", abbr: "GG" },
  "3": { name: "GreenManGaming", abbr: "GMG" },
  "7": { name: "GOG", abbr: "GOG" },
  "8": { name: "Origin", abbr: "ORI" },
  "11": { name: "Humble Store", abbr: "HUM" },
  "13": { name: "Uplay", abbr: "UBI" },
  "15": { name: "Fanatical", abbr: "FAN" },
  "21": { name: "WinGameStore", abbr: "WGS" },
  "23": { name: "GameBillet", abbr: "GB" },
  "24": { name: "Voidu", abbr: "VOI" },
  "25": { name: "Epic Games", abbr: "EPIC" },
  "27": { name: "Gamesplanet", abbr: "GP" },
  "28": { name: "Gamesload", abbr: "GL" },
  "29": { name: "2Game", abbr: "2G" },
  "30": { name: "IndieGala", abbr: "IG" },
  "31": { name: "Blizzard", abbr: "BLZ" },
  "32": { name: "AllYouPlay", abbr: "AYP" },
  "33": { name: "DLGamer", abbr: "DLG" },
  "34": { name: "Noctre", abbr: "NCT" },
  "35": { name: "DreamGame", abbr: "DG" },
};

const dealUrl = (dealID) => `https://www.cheapshark.com/redirect?dealID=${dealID}`;

const DealCard = ({ deal, inWishlist, onToggleWishlist, onSetAlert }) => {
  const { t } = useTranslation();
  const savings = parseFloat(deal.savings || 0);
  const salePrice = parseFloat(deal.salePrice || 0);
  const normalPrice = parseFloat(deal.normalPrice || 0);
  const storeInfo = STORE_MAP[deal.storeID] || { name: `Store ${deal.storeID}`, abbr: "STR" };

  return (
    <div
      data-testid={`deal-card-${deal.dealID}`}
      className="group relative bg-white dark:bg-[#18181B] border border-zinc-200 dark:border-[#27272A] flex flex-col overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-[#FF2A4D] dark:hover:border-[#FF2A4D]"
    >
      {savings > 0 && (
        <div
          data-testid="deal-discount-badge"
          className="absolute top-3 start-3 z-10 bg-[#D4FF00] text-black font-black text-xs px-2 py-1 tracking-wider"
        >
          -{Math.round(savings)}% {t("deal.off")}
        </div>
      )}

      <div className="aspect-[3/4] w-full bg-zinc-100 dark:bg-black overflow-hidden">
        <img
          src={deal.thumb}
          alt={deal.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
      </div>

      <div className="p-4 flex flex-col gap-3 flex-1">
        <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
          <Store className="w-3.5 h-3.5" />
          <span data-testid="deal-store" className="font-bold">{storeInfo.name}</span>
        </div>

        <h3
          data-testid="deal-title"
          className="font-heading text-base font-bold leading-tight text-zinc-900 dark:text-white line-clamp-2 min-h-[2.5rem]"
        >
          {deal.title}
        </h3>

        <div className="flex items-end gap-2 mt-auto">
          <span data-testid="deal-sale-price" className="text-2xl font-black text-zinc-900 dark:text-white">
            ${salePrice.toFixed(2)}
          </span>
          {normalPrice > salePrice && (
            <span className="text-sm text-zinc-500 line-through" data-testid="deal-normal-price">
              ${normalPrice.toFixed(2)}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <a
            data-testid="deal-view-btn"
            href={dealUrl(deal.dealID)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 inline-flex items-center justify-center gap-1 bg-zinc-900 dark:bg-[#D4FF00] text-[#D4FF00] dark:text-black px-3 py-2 text-xs font-bold tracking-wider uppercase hover:opacity-90 transition"
          >
            {t("deal.view")} <ExternalLink className="w-3 h-3" />
          </a>
          <button
            data-testid={`wishlist-btn-${deal.gameID}`}
            onClick={() => onToggleWishlist?.(deal)}
            className={`p-2 border transition ${
              inWishlist
                ? "bg-[#FF2A4D] border-[#FF2A4D] text-white"
                : "border-zinc-300 dark:border-[#27272A] text-zinc-600 dark:text-zinc-300 hover:border-[#FF2A4D] hover:text-[#FF2A4D]"
            }`}
            aria-label={inWishlist ? t("deal.remove_wishlist") : t("deal.add_wishlist")}
          >
            <Heart className={`w-4 h-4 ${inWishlist ? "fill-current" : ""}`} />
          </button>
          <button
            data-testid={`alert-btn-${deal.gameID}`}
            onClick={() => onSetAlert?.(deal)}
            className="p-2 border border-zinc-300 dark:border-[#27272A] text-zinc-600 dark:text-zinc-300 hover:border-[#D4FF00] hover:text-[#D4FF00] transition"
            aria-label={t("deal.set_alert")}
          >
            <Bell className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DealCard;
