"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { StatusPill } from "@/components/ui/StatusPill";
import { saveBrandProfile, type BrandProfileInput } from "@/app/onboarding/actions";
import type { BrandProfileResponse } from "@/lib/api-types";

export function BrandProfileEditor({ initial }: { initial: BrandProfileResponse }) {
  const router = useRouter();
  const [companyName, setCompanyName] = useState(initial.companyName);
  const [bin, setBin] = useState(initial.bin);
  const [website, setWebsite] = useState(initial.website ?? "");
  const [phone, setPhone] = useState(initial.phone);
  const [contactName, setContactName] = useState(initial.contactName);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function save() {
    setLoading(true);
    setMessage(null);
    setError(null);
    setErrors({});
    if (!/^\d{12}$/.test(bin)) {
      setErrors({ bin: "БИН — ровно 12 цифр" });
      setLoading(false);
      return;
    }
    const payload: BrandProfileInput = {
      companyName: companyName.trim(),
      bin: bin.trim(),
      website: website.trim() || undefined,
      phone: phone.trim(),
      contactName: contactName.trim(),
    };
    const res = await saveBrandProfile(payload);
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
        <h1 className="text-28 font-semibold">Профиль компании</h1>
        <StatusPill
          tone={initial.approved ? "success" : "warning"}
          label={initial.approved ? "Одобрен" : "На модерации"}
        />
      </div>
      <div className="flex flex-col gap-4">
        <Input label="Название компании" name="companyName" value={companyName} onChange={(e) => setCompanyName(e.target.value)} error={errors.companyName} />
        <Input label="БИН" name="bin" value={bin} onChange={(e) => setBin(e.target.value)} error={errors.bin} maxLength={12} inputMode="numeric" />
        <Input label="Сайт" name="website" value={website} onChange={(e) => setWebsite(e.target.value)} error={errors.website} />
        <Input label="Телефон" name="phone" value={phone} onChange={(e) => setPhone(e.target.value)} error={errors.phone} />
        <Input label="Контактное лицо" name="contactName" value={contactName} onChange={(e) => setContactName(e.target.value)} error={errors.contactName} />
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
