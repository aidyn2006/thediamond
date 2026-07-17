"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Chip } from "@/components/ui/Chip";
import { Button } from "@/components/ui/Button";
import {
  CATEGORIES,
  categoryLabels,
  PLATFORMS,
  platformLabels,
  formatTenge,
} from "@/lib/categories";
import {
  createCampaign,
  updateCampaign,
  submitCampaign,
  type CampaignInput,
} from "@/app/dashboard/actions";
import type { CampaignFull } from "@/lib/api-types";

type Errors = Record<string, string>;

export function CampaignForm({ initial }: { initial?: CampaignFull }) {
  const router = useRouter();
  const editing = !!initial;

  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [platforms, setPlatforms] = useState<string[]>(initial?.platforms ?? []);
  const [category, setCategory] = useState<string>(initial?.category ?? "FOOD");
  const [reward, setReward] = useState<string>(initial ? String(initial.rewardPerCreator) : "");
  const [needed, setNeeded] = useState<string>(initial ? String(initial.creatorsNeeded) : "");
  const [deadline, setDeadline] = useState(initial?.deadline ?? "");
  const [requirements, setRequirements] = useState(initial?.requirements ?? "");
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState<"draft" | "submit" | null>(null);

  const budget = useMemo(() => {
    const r = parseInt(reward, 10);
    const n = parseInt(needed, 10);
    if (Number.isFinite(r) && Number.isFinite(n)) return r * n;
    return null;
  }, [reward, needed]);

  function togglePlatform(p: string) {
    setPlatforms((prev) => (prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]));
  }

  function validate(): CampaignInput | null {
    const e: Errors = {};
    if (!title.trim()) e.title = "Введите название";
    if (!description.trim()) e.description = "Опишите задачу";
    if (platforms.length === 0) e.platforms = "Выберите хотя бы одну площадку";
    const r = parseInt(reward, 10);
    const n = parseInt(needed, 10);
    if (!Number.isFinite(r) || r <= 0) e.rewardPerCreator = "Больше нуля";
    if (!Number.isFinite(n) || n <= 0) e.creatorsNeeded = "Больше нуля";
    if (!deadline) e.deadline = "Укажите дедлайн";
    else if (new Date(deadline) <= new Date()) e.deadline = "Дата в будущем";
    if (!requirements.trim()) e.requirements = "Опишите требования";
    setErrors(e);
    if (Object.keys(e).length > 0) return null;
    return {
      title: title.trim(),
      description: description.trim(),
      platforms,
      category,
      rewardPerCreator: r,
      creatorsNeeded: n,
      deadline,
      requirements: requirements.trim(),
    };
  }

  async function save(mode: "draft" | "submit") {
    setFormError(null);
    const input = validate();
    if (!input) return;
    setLoading(mode);

    let result;
    if (editing) {
      result = await updateCampaign(initial!.id, input);
      if (result.ok && mode === "submit") {
        result = await submitCampaign(initial!.id);
      }
    } else {
      result = await createCampaign(input, mode === "submit");
    }

    if (!result.ok) {
      setLoading(null);
      if (result.fieldErrors) setErrors(result.fieldErrors);
      else setFormError(result.message ?? "Не получилось сохранить");
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-[640px] px-6 py-8 md:px-10">
      <h1 className="mb-6 text-28 font-semibold">
        {editing ? "Редактировать кампанию" : "Новая кампания"}
      </h1>

      <div className="flex flex-col gap-4">
        <Input label="Название" name="title" value={title} onChange={(e) => setTitle(e.target.value)} error={errors.title} placeholder="Обзор сезонного меню" />
        <Textarea label="Описание задачи" name="description" value={description} onChange={(e) => setDescription(e.target.value)} error={errors.description} maxLength={3000} className="min-h-32" placeholder="Что нужно снять и зачем" />

        <div>
          <p className="mb-2 text-13 font-medium text-text-dim">Площадки</p>
          <div className="flex flex-wrap gap-2">
            {PLATFORMS.map((p) => (
              <Chip key={p} selected={platforms.includes(p)} onToggle={() => togglePlatform(p)}>
                {platformLabels[p]}
              </Chip>
            ))}
          </div>
          {errors.platforms && <p className="mt-1 text-13 text-error">{errors.platforms}</p>}
        </div>

        <Select label="Категория" name="category" value={category} onChange={(e) => setCategory(e.target.value)}>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{categoryLabels[c]}</option>
          ))}
        </Select>

        <div className="grid grid-cols-2 gap-3">
          <Input label="Вознаграждение за креатора, ₸" name="reward" type="number" min={1} value={reward} onChange={(e) => setReward(e.target.value)} error={errors.rewardPerCreator} placeholder="45000" />
          <Input label="Сколько креаторов" name="needed" type="number" min={1} value={needed} onChange={(e) => setNeeded(e.target.value)} error={errors.creatorsNeeded} placeholder="5" />
        </div>
        <p className="tabular text-13 text-text-dim">
          Бюджет кампании: {budget != null ? formatTenge(budget) : "—"}
        </p>

        <Input label="Дедлайн" name="deadline" type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} error={errors.deadline} />
        <Textarea label="Требования" name="requirements" value={requirements} onChange={(e) => setRequirements(e.target.value)} error={errors.requirements} maxLength={3000} placeholder="Длина ролика, упоминания, площадки публикации" />

        {formError && <p role="alert" className="text-13 text-error">{formError}</p>}

        <div className="mt-2 flex flex-col gap-3 sm:flex-row">
          <Button variant="secondary" type="button" onClick={() => save("draft")} loading={loading === "draft"}>
            Сохранить черновик
          </Button>
          <Button variant="primary" type="button" onClick={() => save("submit")} loading={loading === "submit"}>
            Отправить на модерацию
          </Button>
        </div>
      </div>
    </div>
  );
}
