"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import {
  CITIES,
  PHONE_BRANDS,
  PHONE_CONDITIONS,
  STORAGE_OPTIONS,
  brandLabels,
  conditionLabels,
  storageLabel,
} from "@/lib/phones";

/**
 * Catalog filter bar. State lives in the URL so a filtered catalog is linkable
 * and server-rendered — no client-side listing fetches.
 */
export function CatalogFilters({ basePath = "/listings" }: { basePath?: string }) {
  const router = useRouter();
  const params = useSearchParams();

  const [q, setQ] = useState(params.get("q") ?? "");
  const [brand, setBrand] = useState(params.get("brand") ?? "");
  const [condition, setCondition] = useState(params.get("condition") ?? "");
  const [city, setCity] = useState(params.get("city") ?? "");
  const [minPrice, setMinPrice] = useState(params.get("minPrice") ?? "");
  const [maxPrice, setMaxPrice] = useState(params.get("maxPrice") ?? "");
  const [minStorage, setMinStorage] = useState(params.get("minStorage") ?? "");

  const active =
    !!(q || brand || condition || city || minPrice || maxPrice || minStorage);

  function apply() {
    const next = new URLSearchParams();
    const entries: [string, string][] = [
      ["q", q.trim()],
      ["brand", brand],
      ["condition", condition],
      ["city", city],
      ["minPrice", minPrice],
      ["maxPrice", maxPrice],
      ["minStorage", minStorage],
    ];
    entries.forEach(([key, value]) => {
      if (value) next.set(key, value);
    });
    const qs = next.toString();
    router.push(qs ? `${basePath}?${qs}` : basePath);
  }

  function reset() {
    setQ("");
    setBrand("");
    setCondition("");
    setCity("");
    setMinPrice("");
    setMaxPrice("");
    setMinStorage("");
    router.push(basePath);
  }

  return (
    <form
      className="mb-6 flex flex-col gap-3 rounded-card border border-border bg-surface p-4"
      onSubmit={(e) => {
        e.preventDefault();
        apply();
      }}
    >
      <Input
        label="Поиск по модели"
        name="q"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="iPhone 13, Redmi Note…"
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Select
          label="Бренд"
          name="brand"
          value={brand}
          onChange={(e) => setBrand(e.target.value)}
        >
          <option value="">Любой</option>
          {PHONE_BRANDS.map((b) => (
            <option key={b} value={b}>
              {brandLabels[b]}
            </option>
          ))}
        </Select>

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
      </div>

      <div className="flex gap-2">
        <Button type="submit" variant="primary">
          Показать
        </Button>
        {active && (
          <Button type="button" variant="ghost" onClick={reset}>
            Сбросить
          </Button>
        )}
      </div>
    </form>
  );
}
