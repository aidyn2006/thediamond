"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { CATEGORIES, categoryLabels, PLATFORMS, platformLabels } from "@/lib/categories";

export function FeedFilters() {
  const router = useRouter();
  const params = useSearchParams();
  const [search, setSearch] = useState(params.get("search") ?? "");

  function apply(next: Record<string, string>) {
    const sp = new URLSearchParams(params.toString());
    for (const [k, v] of Object.entries(next)) {
      if (v) sp.set(k, v);
      else sp.delete(k);
    }
    router.push(`/campaigns?${sp.toString()}`);
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        apply({ search });
      }}
      className="flex flex-col gap-3 sm:flex-row sm:items-end"
    >
      <div className="flex-1">
        <Input
          label="Поиск"
          name="search"
          placeholder="Название кампании"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <Select
        label="Категория"
        name="category"
        defaultValue={params.get("category") ?? ""}
        onChange={(e) => apply({ category: e.target.value })}
        className="sm:w-44"
      >
        <option value="">Все категории</option>
        {CATEGORIES.map((c) => (
          <option key={c} value={c}>{categoryLabels[c]}</option>
        ))}
      </Select>
      <Select
        label="Платформа"
        name="platform"
        defaultValue={params.get("platform") ?? ""}
        onChange={(e) => apply({ platform: e.target.value })}
        className="sm:w-40"
      >
        <option value="">Все площадки</option>
        {PLATFORMS.map((p) => (
          <option key={p} value={p}>{platformLabels[p]}</option>
        ))}
      </Select>
    </form>
  );
}
