"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { CITIES } from "@/lib/phones";
import { saveProfile, uploadAvatar } from "@/app/onboarding/actions";
import type { ProfileResponse } from "@/lib/api-types";

type Errors = Record<string, string>;

/**
 * Contact card editor, used both for onboarding (`mode="onboarding"`) and for
 * /profile. The phone number is the whole point — it's what a buyer gets when a
 * seller accepts a deal.
 */
export function ProfileEditor({
  initial,
  mode = "edit",
}: {
  initial?: ProfileResponse;
  mode?: "edit" | "onboarding";
}) {
  const router = useRouter();

  const [displayName, setDisplayName] = useState(initial?.displayName ?? "");
  const [phone, setPhone] = useState(initial?.phone ?? "");
  const [city, setCity] = useState(initial?.city ?? CITIES[0]);
  const [about, setAbout] = useState(initial?.about ?? "");
  const [avatarUrl, setAvatarUrl] = useState(initial?.avatarUrl ?? "");

  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function onPickAvatar(file: File | null) {
    if (!file) return;
    setFormError(null);
    setUploading(true);
    const form = new FormData();
    form.append("file", file);
    const res = await uploadAvatar(form);
    setUploading(false);
    if (!res.ok || !res.url) setFormError(res.message ?? "Не удалось загрузить фото");
    else setAvatarUrl(res.url);
  }

  async function save() {
    setFormError(null);
    setSaved(false);

    const e: Errors = {};
    if (!displayName.trim()) e.displayName = "Как вас зовут?";
    if (!/^\+?[0-9 ()-]{10,20}$/.test(phone.trim())) e.phone = "Например +7 701 123 45 67";
    if (!city.trim()) e.city = "Укажите город";
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    setSaving(true);
    const res = await saveProfile({
      displayName: displayName.trim(),
      phone: phone.trim(),
      city: city.trim(),
      avatarUrl: avatarUrl || null,
      about: about.trim() || null,
    });
    setSaving(false);

    if (!res.ok) {
      if (res.fieldErrors) setErrors(res.fieldErrors);
      else setFormError(res.message ?? "Не получилось сохранить");
      return;
    }
    if (mode === "onboarding") {
      router.push("/listings");
      router.refresh();
    } else {
      setSaved(true);
      router.refresh();
    }
  }

  return (
    <div className="mx-auto max-w-[560px] px-6 py-8 md:px-10">
      <h1 className="mb-2 text-28 font-semibold">
        {mode === "onboarding" ? "Расскажите о себе" : "Профиль"}
      </h1>
      <p className="mb-6 text-13 text-text-dim">
        Телефон видят только те, чью заявку вы приняли — в каталоге он не показывается.
      </p>

      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <Avatar src={avatarUrl || null} name={displayName || "?"} size={64} />
          <label className="flex-1">
            <span className="mb-1 block text-13 font-medium text-text-dim">Фото профиля</span>
            <input
              type="file"
              accept="image/*"
              disabled={uploading}
              onChange={(e) => onPickAvatar(e.target.files?.[0] ?? null)}
              className="block w-full cursor-pointer rounded-btn border border-border bg-bg px-3 py-2 text-13 text-text-dim file:mr-3 file:rounded file:border-0 file:bg-surface file:px-3 file:py-1 file:text-13 file:text-text"
            />
          </label>
        </div>

        <Input
          label="Имя"
          name="displayName"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          error={errors.displayName}
          placeholder="Аида"
        />
        <Input
          label="Телефон"
          name="phone"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          error={errors.phone}
          placeholder="+7 701 123 45 67"
        />
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
          label="О себе"
          name="about"
          value={about}
          onChange={(e) => setAbout(e.target.value)}
          maxLength={500}
          placeholder="Например: продаю телефоны после апгрейда, все чеки на руках"
        />

        {formError && (
          <p role="alert" className="text-13 text-error">
            {formError}
          </p>
        )}
        {saved && <p className="text-13 text-success">Сохранено</p>}

        <Button variant="primary" loading={saving} onClick={save}>
          {mode === "onboarding" ? "Готово" : "Сохранить"}
        </Button>
      </div>
    </div>
  );
}
