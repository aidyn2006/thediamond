"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { StatusPill } from "@/components/ui/StatusPill";
import { CATEGORIES, categoryLabels, platformLabels } from "@/lib/categories";
import {
  saveCreatorProfile,
  uploadAvatar,
  type CreatorProfileInput,
} from "@/app/onboarding/actions";
import type { CreatorProfileResponse } from "@/lib/api-types";

export function CreatorProfileEditor({ initial }: { initial: CreatorProfileResponse }) {
  const router = useRouter();
  const social = (p: string) => initial.socials.find((s) => s.platform === p);

  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(initial.avatarUrl ?? undefined);
  const [name, setName] = useState(initial.name);
  const [username, setUsername] = useState(initial.username);
  const [city, setCity] = useState(initial.city);
  const [birthDate, setBirthDate] = useState(initial.birthDate);
  const [categories, setCategories] = useState<string[]>(initial.categories);
  const [bio, setBio] = useState(initial.bio ?? "");
  const [socials, setSocials] = useState({
    instagramUrl: social("INSTAGRAM")?.url ?? "",
    instagramFollowers: String(social("INSTAGRAM")?.followers ?? ""),
    tiktokUrl: social("TIKTOK")?.url ?? "",
    tiktokFollowers: String(social("TIKTOK")?.followers ?? ""),
    threadsUrl: social("THREADS")?.url ?? "",
    threadsFollowers: String(social("THREADS")?.followers ?? ""),
    youtubeUrl: social("YOUTUBE")?.url ?? "",
    youtubeFollowers: String(social("YOUTUBE")?.followers ?? ""),
    telegramUrl: initial.telegramUrl ?? "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  function toggle(cat: string) {
    setCategories((p) => (p.includes(cat) ? p.filter((c) => c !== cat) : [...p, cat]));
  }
  function toInt(v: string): number | null {
    const n = parseInt(v, 10);
    return Number.isFinite(n) ? n : null;
  }

  async function onAvatar(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    const res = await uploadAvatar(fd);
    setUploading(false);
    if (res.ok) setAvatarUrl(res.url);
    else setError(res.message ?? "Не удалось загрузить фото");
  }

  async function save() {
    setLoading(true);
    setMessage(null);
    setError(null);
    setErrors({});
    const payload: CreatorProfileInput = {
      name: name.trim(),
      username: username.trim(),
      city: city.trim(),
      birthDate,
      categories,
      bio: bio.trim() || undefined,
      avatarUrl,
      instagramUrl: socials.instagramUrl || undefined,
      tiktokUrl: socials.tiktokUrl || undefined,
      threadsUrl: socials.threadsUrl || undefined,
      youtubeUrl: socials.youtubeUrl || undefined,
      telegramUrl: socials.telegramUrl || undefined,
      instagramFollowers: toInt(socials.instagramFollowers),
      tiktokFollowers: toInt(socials.tiktokFollowers),
      threadsFollowers: toInt(socials.threadsFollowers),
      youtubeFollowers: toInt(socials.youtubeFollowers),
    };
    const res = await saveCreatorProfile(payload);
    setLoading(false);
    if (!res.ok) {
      if (res.fieldErrors) setErrors(res.fieldErrors);
      setError(res.message ?? "Не получилось сохранить");
      return;
    }
    setMessage("Профиль сохранён");
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-[640px] px-6 py-8 md:px-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-28 font-semibold">Мой профиль</h1>
        <StatusPill
          tone={initial.approved ? "success" : "warning"}
          label={initial.approved ? "Одобрен" : "На модерации"}
        />
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border border-border bg-surface-2 text-text-dim">
            {avatarUrl ? (
              <Image src={avatarUrl} alt="" width={64} height={64} className="h-full w-full object-cover" />
            ) : (
              <span className="text-13">Фото</span>
            )}
          </div>
          <label className="cursor-pointer text-13 text-accent">
            {uploading ? "Загружаем…" : "Сменить фото"}
            <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={onAvatar} disabled={uploading} />
          </label>
        </div>

        <Input label="Имя" name="name" value={name} onChange={(e) => setName(e.target.value)} error={errors.name} />
        <Input label="Username" name="username" value={username} onChange={(e) => setUsername(e.target.value)} error={errors.username} />
        <Input label="Город" name="city" value={city} onChange={(e) => setCity(e.target.value)} error={errors.city} />
        <Input label="Дата рождения" name="birthDate" type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} error={errors.birthDate} />

        <div>
          <p className="mb-2 text-13 font-medium text-text-dim">Категории</p>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <Chip key={c} selected={categories.includes(c)} onToggle={() => toggle(c)}>
                {categoryLabels[c]}
              </Chip>
            ))}
          </div>
        </div>

        <Textarea label="О себе" name="bio" value={bio} onChange={(e) => setBio(e.target.value)} maxLength={500} hint="До 500 символов" />

        {(["instagram", "tiktok", "threads", "youtube"] as const).map((p) => {
          const urlKey = `${p}Url` as const;
          const folKey = `${p}Followers` as const;
          return (
            <div key={p} className="grid grid-cols-[1fr_120px] gap-2">
              <Input label={platformLabels[p.toUpperCase() as keyof typeof platformLabels]} name={urlKey} value={socials[urlKey]} onChange={(e) => setSocials((s) => ({ ...s, [urlKey]: e.target.value }))} placeholder="Ссылка" />
              <Input label="Подписчики" name={folKey} type="number" min={0} value={socials[folKey]} onChange={(e) => setSocials((s) => ({ ...s, [folKey]: e.target.value }))} placeholder="0" />
            </div>
          );
        })}
        <Input label="Telegram" name="telegramUrl" value={socials.telegramUrl} onChange={(e) => setSocials((s) => ({ ...s, telegramUrl: e.target.value }))} placeholder="https://t.me/username" />

        {error && <p className="text-13 text-error">{error}</p>}
        {message && <p className="text-13 text-success">{message}</p>}

        <div>
          <Button variant="primary" onClick={save} loading={loading} type="button">
            Сохранить
          </Button>
        </div>
      </div>
    </div>
  );
}
