"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Chip } from "@/components/ui/Chip";
import { Button } from "@/components/ui/Button";
import {
  CITIES,
  PHONE_BRANDS,
  PHONE_CONDITIONS,
  STORAGE_OPTIONS,
  brandLabels,
  conditionHints,
  conditionLabels,
  formatTenge,
  storageLabel,
} from "@/lib/phones";
import {
  createListing,
  updateListing,
  uploadPhoto,
  type ListingInput,
} from "@/app/listings/actions";
import type { ListingDetail } from "@/lib/api-types";

type Errors = Record<string, string>;

const MAX_PHOTOS = 10;

export function ListingForm({ initial }: { initial?: ListingDetail }) {
  const router = useRouter();
  const editing = !!initial;

  const [brand, setBrand] = useState<string>(initial?.brand ?? "APPLE");
  const [model, setModel] = useState(initial?.model ?? "");
  const [storageGb, setStorageGb] = useState<string>(
    initial?.storageGb ? String(initial.storageGb) : "128",
  );
  const [ramGb, setRamGb] = useState(initial?.ramGb ? String(initial.ramGb) : "");
  const [color, setColor] = useState(initial?.color ?? "");
  const [condition, setCondition] = useState<string>(initial?.condition ?? "GOOD");
  const [batteryHealth, setBatteryHealth] = useState(
    initial?.batteryHealth ? String(initial.batteryHealth) : "",
  );
  const [price, setPrice] = useState(initial ? String(initial.price) : "");
  const [city, setCity] = useState(initial?.city ?? CITIES[0]);
  const [description, setDescription] = useState(initial?.description ?? "");
  const [images, setImages] = useState<string[]>(initial?.images ?? []);

  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  async function onPickFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setFormError(null);
    setUploading(true);
    const room = MAX_PHOTOS - images.length;
    const picked = Array.from(files).slice(0, Math.max(0, room));
    const uploaded: string[] = [];
    for (const file of picked) {
      const form = new FormData();
      form.append("file", file);
      const res = await uploadPhoto(form);
      if (!res.ok || !res.url) {
        setFormError(res.message ?? "Не удалось загрузить фото");
        break;
      }
      uploaded.push(res.url);
    }
    if (uploaded.length > 0) setImages((prev) => [...prev, ...uploaded]);
    setUploading(false);
  }

  function removePhoto(url: string) {
    setImages((prev) => prev.filter((u) => u !== url));
  }

  function validate(): ListingInput | null {
    const e: Errors = {};
    if (!model.trim()) e.model = "Укажите модель";
    const storage = parseInt(storageGb, 10);
    if (!Number.isFinite(storage) || storage <= 0) e.storageGb = "Выберите память";
    const p = parseInt(price, 10);
    if (!Number.isFinite(p) || p <= 0) e.price = "Больше нуля";
    if (!city.trim()) e.city = "Укажите город";
    if (!description.trim()) e.description = "Опишите телефон";
    const battery = batteryHealth === "" ? null : parseInt(batteryHealth, 10);
    if (battery != null && (!Number.isFinite(battery) || battery < 1 || battery > 100)) {
      e.batteryHealth = "От 1 до 100";
    }
    const ram = ramGb === "" ? null : parseInt(ramGb, 10);
    if (ram != null && (!Number.isFinite(ram) || ram < 0)) e.ramGb = "Не может быть отрицательным";
    if (images.length === 0) e.images = "Добавьте хотя бы одно фото";

    setErrors(e);
    if (Object.keys(e).length > 0) return null;
    return {
      brand,
      model: model.trim(),
      storageGb: storage,
      ramGb: ram,
      color: color.trim() || null,
      condition,
      batteryHealth: battery,
      price: p,
      city: city.trim(),
      description: description.trim(),
      images,
    };
  }

  async function save() {
    setFormError(null);
    const input = validate();
    if (!input) return;
    setSaving(true);

    const result = editing
      ? await updateListing(initial!.id, input)
      : await createListing(input);

    if (!result.ok) {
      setSaving(false);
      if (result.fieldErrors) setErrors(result.fieldErrors);
      else setFormError(result.message ?? "Не получилось сохранить");
      return;
    }
    router.push("/my-listings");
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-[640px] px-6 py-8 md:px-10">
      <h1 className="mb-2 text-28 font-semibold">
        {editing ? "Редактировать объявление" : "Продать телефон"}
      </h1>
      <p className="mb-6 text-13 text-text-dim">
        После сохранения объявление уходит на проверку — обычно это занимает пару часов.
      </p>

      <div className="flex flex-col gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Select label="Бренд" name="brand" value={brand} onChange={(e) => setBrand(e.target.value)}>
            {PHONE_BRANDS.map((b) => (
              <option key={b} value={b}>
                {brandLabels[b]}
              </option>
            ))}
          </Select>
          <Input
            label="Модель"
            name="model"
            value={model}
            onChange={(e) => setModel(e.target.value)}
            error={errors.model}
            placeholder="iPhone 13 Pro"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Select
            label="Память"
            name="storageGb"
            value={storageGb}
            onChange={(e) => setStorageGb(e.target.value)}
            error={errors.storageGb}
          >
            {STORAGE_OPTIONS.map((gb) => (
              <option key={gb} value={gb}>
                {storageLabel(gb)}
              </option>
            ))}
          </Select>
          <Input
            label="ОЗУ, ГБ"
            name="ramGb"
            type="number"
            inputMode="numeric"
            min={0}
            value={ramGb}
            onChange={(e) => setRamGb(e.target.value)}
            error={errors.ramGb}
            placeholder="8"
          />
          <Input
            label="Цвет"
            name="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            placeholder="Графитовый"
          />
        </div>

        <div>
          <p className="mb-2 text-13 font-medium text-text-dim">Состояние</p>
          <div className="flex flex-wrap gap-2">
            {PHONE_CONDITIONS.map((c) => (
              <Chip key={c} selected={condition === c} onToggle={() => setCondition(c)}>
                {conditionLabels[c]}
              </Chip>
            ))}
          </div>
          <p className="mt-2 text-13 text-text-dim">
            {conditionHints[condition as keyof typeof conditionHints]}
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Ёмкость аккумулятора, %"
            name="batteryHealth"
            type="number"
            inputMode="numeric"
            min={1}
            max={100}
            value={batteryHealth}
            onChange={(e) => setBatteryHealth(e.target.value)}
            error={errors.batteryHealth}
            placeholder="89"
          />
          <Input
            label="Цена, ₸"
            name="price"
            type="number"
            inputMode="numeric"
            min={0}
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            error={errors.price}
            placeholder="245000"
          />
        </div>
        {price && Number.isFinite(parseInt(price, 10)) && (
          <p className="-mt-2 text-13 text-text-dim">
            Покупатель увидит {formatTenge(parseInt(price, 10))}
          </p>
        )}

        <Select
          label="Город"
          name="city"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          error={errors.city}
        >
          {CITIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </Select>

        <Textarea
          label="Описание"
          name="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          error={errors.description}
          maxLength={3000}
          className="min-h-32"
          placeholder="Комплект, ремонты, царапины — чем подробнее, тем меньше вопросов от покупателей"
        />

        <div>
          <p className="mb-2 text-13 font-medium text-text-dim">
            Фотографии ({images.length}/{MAX_PHOTOS})
          </p>
          {images.length > 0 && (
            <div className="mb-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
              {images.map((url, i) => (
                <div key={url} className="relative overflow-hidden rounded-btn border border-border">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt={`Фото ${i + 1}`} className="aspect-square w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removePhoto(url)}
                    aria-label={`Удалить фото ${i + 1}`}
                    className="absolute right-1 top-1 rounded-full bg-bg/80 px-2 py-0.5 text-13 text-text hover:text-error"
                  >
                    ✕
                  </button>
                  {i === 0 && (
                    <span className="absolute bottom-1 left-1 rounded bg-bg/80 px-1.5 py-0.5 text-11 text-text-dim">
                      обложка
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
          <input
            type="file"
            accept="image/*"
            multiple
            disabled={uploading || images.length >= MAX_PHOTOS}
            onChange={(e) => onPickFiles(e.target.files)}
            className="block w-full cursor-pointer rounded-btn border border-border bg-bg px-3 py-2 text-15 text-text-dim file:mr-3 file:rounded file:border-0 file:bg-surface file:px-3 file:py-1 file:text-13 file:text-text"
          />
          {uploading && <p className="mt-2 text-13 text-text-dim">Загружаем…</p>}
          {errors.images && (
            <p role="alert" className="mt-2 text-13 text-error">
              {errors.images}
            </p>
          )}
        </div>

        {formError && (
          <p role="alert" className="text-13 text-error">
            {formError}
          </p>
        )}

        <div className="flex gap-3">
          <Button variant="primary" loading={saving} onClick={save}>
            {editing ? "Сохранить и отправить" : "Отправить на проверку"}
          </Button>
          <Button variant="ghost" onClick={() => router.back()}>
            Отмена
          </Button>
        </div>
      </div>
    </div>
  );
}
