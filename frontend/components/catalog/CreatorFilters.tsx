"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { CATEGORIES, categoryLabels } from "@/lib/categories";

export function CreatorFilters() {
  const router = useRouter();
  const params = useSearchParams();
  const [city, setCity] = useState(params.get("city") ?? "");

  function apply(next: Record<string, string>) {
    const sp = new URLSearchParams(params.toString());
    for (const [k, v] of Object.entries(next)) {
      if (v) sp.set(k, v);
      else sp.delete(k);
    }
    router.push(`/creators?${sp.toString()}`);
  }

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); apply({ city }); }}
      className="flex flex-col gap-3 sm:flex-row sm:items-end"
    >
      <Select
        label="Категория"
        name="category"
        defaultValue={params.get("category") ?? ""}
        onChange={(e) => apply({ category: e.target.value })}
        className="sm:w-48"
      >
        <option value="">Все категории</option>
        {CATEGORIES.map((c) => (
          <option key={c} value={c}>{categoryLabels[c]}</option>
        ))}
      </Select>
      <div className="flex-1">
        <Input label="Город" name="city" placeholder="Алматы" value={city} onChange={(e) => setCity(e.target.value)} />
      </div>
    </form>
  );
}
