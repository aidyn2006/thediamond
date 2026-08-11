"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import {
  CITIES,
  PHONE_CONDITIONS,
  STORAGE_OPTIONS,
  conditionLabels,
  storageLabel,
} from "@/lib/phones";

/** Fields that live inside the sheet — brand has its own chip row above it. */
const SHEET_KEYS = ["condition", "city", "minPrice", "maxPrice", "minStorage"] as const;

/**
 * Search box + «Фильтры» sheet. Only the search field and the button are always on
 * screen; everything else opens in a modal, so the grid starts right under the brand
 * chips instead of below a wall of inputs.
 *
 * State still lives in the URL, so a filtered catalog stays linkable and
 * server-rendered.
 */
export function FilterSheet({ basePath = "/listings" }: { basePath?: string }) {
  const router = useRouter();
  const params = useSearchParams();

  const [open, setOpen] = useState(false);
  const [q, setQ] = useState(params.get("q") ?? "");
  const [condition, setCondition] = useState(params.get("condition") ?? "");
  const [city, setCity] = useState(params.get("city") ?? "");
  const [minPrice, setMinPrice] = useState(params.get("minPrice") ?? "");
  const [maxPrice, setMaxPrice] = useState(params.get("maxPrice") ?? "");
  const [minStorage, setMinStorage] = useState(params.get("minStorage") ?? "");

  // Chip clicks and «Сбросить» change the URL without remounting this component,
  // so mirror the query back into the fields.
  useEffect(() => {
    setQ(params.get("q") ?? "");
    setCondition(params.get("condition") ?? "");
    setCity(params.get("city") ?? "");
    setMinPrice(params.get("minPrice") ?? "");
    setMaxPrice(params.get("maxPrice") ?? "");
    setMinStorage(params.get("minStorage") ?? "");
  }, [params]);

  const sheetCount = SHEET_KEYS.filter((k) => params.get(k)).length;
  const anyFilter = sheetCount > 0 || !!params.get("q") || !!params.get("brand");

  function push(next: Record<string, string>) {
    const qs = new URLSearchParams();
    // Brand comes from the chip row, so it survives everything this sheet does.
    const brand = params.get("brand");
    if (brand) qs.set("brand", brand);
    Object.entries(next).forEach(([key, value]) => {
      if (value) qs.set(key, value);
    });
    const s = qs.toString();
    router.push(s ? `${basePath}?${s}` : basePath);
  }

  function apply() {
    push({ q: q.trim(), condition, city, minPrice, maxPrice, minStorage });
    setOpen(false);
  }

  function clearAll() {
    setQ("");
    setCondition("");
    setCity("");
    setMinPrice("");
    setMaxPrice("");
    setMinStorage("");
    router.push(basePath);
  }

  return (
    <>
      <div className="flex flex-wrap items-end gap-2">
        <form
          className="min-w-[220px] flex-1"
          onSubmit={(e) => {
            e.preventDefault();
            push({ q: q.trim(), condition, city, minPrice, maxPrice, minStorage });
          }}
        >
          <Input
            label="Поиск по модели"
            name="q"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="iPhone 13, Redmi Note…"
          />
        </form>

        <Button type="button" variant="secondary" onClick={() => setOpen(true)}>
          Фильтры
          {sheetCount > 0 && (
            <span className="rounded-pill bg-accent px-2 text-13 text-surface tabular">
              {sheetCount}
            </span>
          )}
        </Button>

        {anyFilter && (
          <Button type="button" variant="ghost" onClick={clearAll}>
            Сбросить
          </Button>
        )}
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="Фильтры">
        <div className="flex flex-col gap-3">
          <Select
            label="Состояние"
            name="condition"
            value={condition}
            onChange={(e) => setCondition(e.target.value)}
          >
            <option value="">Любое</option>
            {PHONE_CONDITIONS.map((c) => (
              <option key={c} value={c}>
                {conditionLabels[c]}
              </option>
            ))}
          </Select>

          <Select label="Город" name="city" value={city} onChange={(e) => setCity(e.target.value)}>
            <option value="">Все города</option>
            {CITIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Цена от, ₸"
              name="minPrice"
              type="number"
              inputMode="numeric"
              min={0}
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              placeholder="50000"
            />
            <Input
              label="Цена до, ₸"
              name="maxPrice"
              type="number"
              inputMode="numeric"
              min={0}
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              placeholder="400000"
            />
          </div>

          <Select
            label="Память от"
            name="minStorage"
            value={minStorage}
            onChange={(e) => setMinStorage(e.target.value)}
          >
            <option value="">Любая</option>
            {STORAGE_OPTIONS.map((gb) => (
              <option key={gb} value={gb}>
                {storageLabel(gb)}
              </option>
            ))}
          </Select>

          <div className="mt-2 flex gap-2">
            <Button type="button" variant="primary" onClick={apply}>
              Показать
            </Button>
            {sheetCount > 0 && (
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setCondition("");
                  setCity("");
                  setMinPrice("");
                  setMaxPrice("");
                  setMinStorage("");
                  push({ q: q.trim() });
                  setOpen(false);
                }}
              >
                Очистить
              </Button>
            )}
          </div>
        </div>
      </Modal>
    </>
  );
}
