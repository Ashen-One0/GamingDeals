import React from "react";
import { useTranslation } from "react-i18next";
import { Search, X } from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Slider } from "./ui/slider";

const STORE_OPTIONS = [
  { id: "all", name: "All Platforms" },
  { id: "1", name: "Steam" },
  { id: "25", name: "Epic Games" },
  { id: "7", name: "GOG" },
  { id: "11", name: "Humble Store" },
  { id: "15", name: "Fanatical" },
  { id: "3", name: "GreenManGaming" },
  { id: "31", name: "Blizzard" },
];

const FilterPanel = ({ filters, setFilters, onApply, onReset }) => {
  const { t } = useTranslation();
  const update = (k, v) => setFilters(f => ({ ...f, [k]: v }));

  return (
    <aside
      data-testid="filter-panel"
      className="bg-white dark:bg-[#18181B] border border-zinc-200 dark:border-[#27272A] p-5 space-y-5 sticky top-20"
    >
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-sm font-black uppercase tracking-widest text-zinc-900 dark:text-white">
          {t("filters.title")}
        </h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={onReset}
          data-testid="filter-reset"
          className="text-xs text-zinc-500 hover:text-[#FF2A4D]"
        >
          <X className="w-3 h-3 me-1" />{t("filters.reset")}
        </Button>
      </div>

      <div className="space-y-2">
        <label className="text-xs uppercase tracking-widest text-zinc-500">{t("filters.search")}</label>
        <div className="relative">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <Input
            data-testid="filter-search-input"
            placeholder={t("filters.search")}
            value={filters.title || ""}
            onChange={e => update("title", e.target.value)}
            onKeyDown={e => e.key === "Enter" && onApply()}
            className="ps-9 rounded-none border-zinc-300 dark:border-[#27272A] bg-transparent"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-xs uppercase tracking-widest text-zinc-500">{t("filters.platform")}</label>
        <Select value={filters.storeID || "all"} onValueChange={v => update("storeID", v)}>
          <SelectTrigger data-testid="filter-platform-select" className="rounded-none border-zinc-300 dark:border-[#27272A]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STORE_OPTIONS.map(s => (
              <SelectItem key={s.id} value={s.id} data-testid={`store-${s.id}`}>{s.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <label className="text-xs uppercase tracking-widest text-zinc-500">
          {t("filters.price_range")}: <span className="text-[#D4FF00] font-bold">${filters.upperPrice || 50}</span>
        </label>
        <Slider
          data-testid="filter-price-slider"
          min={1}
          max={60}
          step={1}
          value={[filters.upperPrice || 50]}
          onValueChange={v => update("upperPrice", v[0])}
        />
      </div>

      <div className="space-y-2">
        <label className="text-xs uppercase tracking-widest text-zinc-500">
          {t("filters.min_discount")}: <span className="text-[#D4FF00] font-bold">{filters.minDiscount || 0}%</span>
        </label>
        <Slider
          data-testid="filter-discount-slider"
          min={0}
          max={90}
          step={5}
          value={[filters.minDiscount || 0]}
          onValueChange={v => update("minDiscount", v[0])}
        />
      </div>

      <div className="space-y-2">
        <label className="text-xs uppercase tracking-widest text-zinc-500">{t("filters.min_rating")}</label>
        <Input
          data-testid="filter-metacritic-input"
          type="number"
          min={0}
          max={100}
          placeholder="0-100"
          value={filters.metacritic || ""}
          onChange={e => update("metacritic", e.target.value)}
          className="rounded-none border-zinc-300 dark:border-[#27272A] bg-transparent"
        />
      </div>

      <div className="space-y-2">
        <label className="text-xs uppercase tracking-widest text-zinc-500">{t("filters.sort_by")}</label>
        <Select value={filters.sortBy || "Deal Rating"} onValueChange={v => update("sortBy", v)}>
          <SelectTrigger data-testid="filter-sort-select" className="rounded-none border-zinc-300 dark:border-[#27272A]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Deal Rating">{t("filters.deal_rating")}</SelectItem>
            <SelectItem value="Savings">{t("filters.savings")}</SelectItem>
            <SelectItem value="Price">{t("filters.price")}</SelectItem>
            <SelectItem value="Title">{t("filters.title_sort")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button
        onClick={onApply}
        data-testid="filter-apply-btn"
        className="w-full rounded-none bg-[#D4FF00] hover:bg-[#bce600] text-black font-black tracking-widest uppercase"
      >
        {t("filters.apply")}
      </Button>
    </aside>
  );
};

export default FilterPanel;
