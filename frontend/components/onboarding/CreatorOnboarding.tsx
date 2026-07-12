"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { StepProgress } from "./StepProgress";
import { CATEGORIES, categoryLabels, platformLabels } from "@/lib/categories";
import {
  saveCreatorProfile,
  uploadAvatar,
  type CreatorProfileInput,
} from "@/app/onboarding/actions";

type Errors = Record<string, string>;

const TOTAL = 3;

export function CreatorOnboarding() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  // form state
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>();
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [city, setCity] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [bio, setBio] = useState("");
  const [socials, setSocials] = useState({
    instagramUrl: "",
    instagramFollowers: "",
    tiktokUrl: "",
    tiktokFollowers: "",
    threadsUrl: "",
    threadsFollowers: "",
    youtubeUrl: "",
    youtubeFollowers: "",
    telegramUrl: "",
  });

  function toggleCategory(cat: string) {
    setCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat],
    );
  }

  function validateStep(): boolean {
    const e: Errors = {};
    if (step === 1) {
      if (!name.trim()) e.name = "Как вас зовут?";
      if (!username.trim()) e.username = "Придумайте username";
      else if (!/^[a-zA-Z0-9_.]+$/.test(username))
        e.username = "Латиница, цифры, точка и подчёркивание";
      if (!city.trim()) e.city = "Укажите город";
      if (!birthDate) e.birthDate = "Укажите дату рождения";
      else {
        const age =
          (Date.now() - new Date(birthDate).getTime()) /
          (365.25 * 24 * 3600 * 1000);
        if (age < 16) e.birthDate = "Регистрация с 16 лет";
      }
    }
    if (step === 2) {
      if (categories.length === 0) e.categories = "Выберите хотя бы одну категорию";
    }
    if (step === 3) {
      const anySocial =
        socials.instagramUrl || socials.tiktokUrl || socials.threadsUrl || socials.youtubeUrl;
      if (!anySocial) e.socials = "Добавьте хотя бы одну соцсеть";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function next() {
    setFormError(null);
    if (validateStep()) setStep((s) => Math.min(TOTAL, s + 1));
  }
  function back() {
    setFormError(null);
    setStep((s) => Math.max(1, s - 1));
  }

  async function onAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setFormError(null);
    const fd = new FormData();
    fd.append("file", file);
    const res = await uploadAvatar(fd);
    setUploading(false);
    if (res.ok) setAvatarUrl(res.url);
    else setFormError(res.message ?? "Не удалось загрузить фото");
  }

  function toInt(v: string): number | null {
    const n = parseInt(v, 10);
    return Number.isFinite(n) ? n : null;
  }

  async function submit() {
    if (!validateStep()) return;
    setLoading(true);
    setFormError(null);
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
    const result = await saveCreatorProfile(payload);
    if (!result.ok) {
      setLoading(false);
      if (result.fieldErrors) setErrors(result.fieldErrors);
      if (result.code === "USERNAME_TAKEN") {
        setErrors((e) => ({ ...e, username: result.message! }));
        setStep(1);
      } else {
        setFormError(result.message ?? null);
      }
      return;
    }
    router.push("/pending");
    router.refresh();
  }

  return (
    <div className="min-h-dvh">
      <StepProgress current={step} total={TOTAL} />
      <div className="mx-auto max-w-[480px] px-6 py-10">
        <p className="mb-2 text-13 text-text-dim">Шаг {step} из {TOTAL}</p>

        {step === 1 && (
          <div className="flex flex-col gap-4">
            <h1 className="text-22 font-semibold">Расскажите о себе</h1>

            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border border-border bg-surface-2 text-text-dim">
                {avatarUrl ? (
                  <Image src={avatarUrl} alt="" width={64} height={64} className="h-full w-full object-cover" />
                ) : (
                  <span className="text-13">Фото</span>
                )}
              </div>
              <label className="cursor-pointer text-13 text-accent">
                {uploading ? "Загружаем…" : "Загрузить фото"}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={onAvatarChange}
                  disabled={uploading}
                />
              </label>
            </div>

            <Input label="Имя" name="name" value={name} onChange={(e) => setName(e.target.value)} error={errors.name} placeholder="Аида Нурланова" />
            <Input label="Username" name="username" value={username} onChange={(e) => setUsername(e.target.value)} error={errors.username} placeholder="aida_creates" />
            <Input label="Город" name="city" value={city} onChange={(e) => setCity(e.target.value)} error={errors.city} placeholder="Алматы" />
            <Input label="Дата рождения" name="birthDate" type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} error={errors.birthDate} />
          </div>
        )}

        {step === 2 && (
          <div className="flex flex-col gap-4">
            <h1 className="text-22 font-semibold">Ваши категории</h1>
            <p className="text-15 text-text-dim">Выберите, о чём вы делаете контент.</p>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <Chip key={cat} selected={categories.includes(cat)} onToggle={() => toggleCategory(cat)}>
                  {categoryLabels[cat]}
                </Chip>
              ))}
            </div>
            {errors.categories && <p className="text-13 text-error">{errors.categories}</p>}
            <Textarea label="О себе (необязательно)" name="bio" value={bio} onChange={(e) => setBio(e.target.value)} maxLength={500} hint="До 500 символов" error={errors.bio} />
          </div>
        )}

        {step === 3 && (
          <div className="flex flex-col gap-4">
            <h1 className="text-22 font-semibold">Соцсети и аудитория</h1>
            <p className="text-15 text-text-dim">Добавьте хотя бы одну площадку и число подписчиков.</p>
            {(["instagram", "tiktok", "threads", "youtube"] as const).map((p) => {
              const urlKey = `${p}Url` as const;
              const folKey = `${p}Followers` as const;
              return (
                <div key={p} className="grid grid-cols-[1fr_120px] gap-2">
                  <Input
                    label={platformLabels[p.toUpperCase() as keyof typeof platformLabels]}
                    name={urlKey}
                    value={socials[urlKey]}
                    onChange={(e) => setSocials((s) => ({ ...s, [urlKey]: e.target.value }))}
                    placeholder="Ссылка"
                  />
                  <Input
                    label="Подписчики"
                    name={folKey}
                    type="number"
                    min={0}
                    value={socials[folKey]}
                    onChange={(e) => setSocials((s) => ({ ...s, [folKey]: e.target.value }))}
                    placeholder="0"
                  />
                </div>
              );
            })}
            <Input label="Telegram (для связи с брендами)" name="telegramUrl" value={socials.telegramUrl} onChange={(e) => setSocials((s) => ({ ...s, telegramUrl: e.target.value }))} placeholder="https://t.me/username" />
            {errors.socials && <p className="text-13 text-error">{errors.socials}</p>}
          </div>
        )}

        {formError && <p className="mt-4 text-13 text-error">{formError}</p>}

        <div className="mt-8 flex gap-3">
          {step > 1 && (
            <Button variant="secondary" onClick={back} type="button">
              Назад
            </Button>
          )}
          {step < TOTAL ? (
            <Button variant="primary" onClick={next} type="button" fullWidth>
              Дальше
            </Button>
          ) : (
            <Button variant="primary" onClick={submit} type="button" loading={loading} fullWidth>
              Отправить на проверку
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
