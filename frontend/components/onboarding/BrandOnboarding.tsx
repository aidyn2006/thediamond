"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { StepProgress } from "./StepProgress";
import { saveBrandProfile, type BrandProfileInput } from "@/app/onboarding/actions";

type Errors = Record<string, string>;

export function BrandOnboarding() {
  const router = useRouter();
  const [companyName, setCompanyName] = useState("");
  const [bin, setBin] = useState("");
  const [website, setWebsite] = useState("");
  const [phone, setPhone] = useState("");
  const [contactName, setContactName] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function validate(): boolean {
    const e: Errors = {};
    if (!companyName.trim()) e.companyName = "Название компании";
    if (!/^\d{12}$/.test(bin)) e.bin = "БИН — ровно 12 цифр";
    if (!phone.trim()) e.phone = "Укажите телефон";
    if (!contactName.trim()) e.contactName = "Контактное лицо";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function submit() {
    if (!validate()) return;
    setLoading(true);
    setFormError(null);
    const payload: BrandProfileInput = {
      companyName: companyName.trim(),
      bin: bin.trim(),
      website: website.trim() || undefined,
      phone: phone.trim(),
      contactName: contactName.trim(),
    };
    const result = await saveBrandProfile(payload);
    if (!result.ok) {
      setLoading(false);
      if (result.fieldErrors) setErrors(result.fieldErrors);
      else setFormError(result.message ?? null);
      return;
    }
    router.push("/pending");
    router.refresh();
  }

  return (
    <div className="min-h-dvh">
      <StepProgress current={1} total={1} />
      <div className="mx-auto max-w-[480px] px-6 py-10">
        <h1 className="mb-1 text-22 font-semibold">Реквизиты компании</h1>
        <p className="mb-6 text-15 text-text-dim">
          Эти данные видит только модерация — креаторам они не показываются.
        </p>
        <div className="flex flex-col gap-4">
          <Input label="Название компании" name="companyName" value={companyName} onChange={(e) => setCompanyName(e.target.value)} error={errors.companyName} placeholder="ТОО «Шоқан Кофе»" />
          <Input label="БИН" name="bin" value={bin} onChange={(e) => setBin(e.target.value)} error={errors.bin} placeholder="12 цифр" inputMode="numeric" maxLength={12} />
          <Input label="Сайт (необязательно)" name="website" value={website} onChange={(e) => setWebsite(e.target.value)} error={errors.website} placeholder="https://example.kz" />
          <Input label="Телефон" name="phone" value={phone} onChange={(e) => setPhone(e.target.value)} error={errors.phone} placeholder="+7 701 234 56 78" />
          <Input label="Контактное лицо" name="contactName" value={contactName} onChange={(e) => setContactName(e.target.value)} error={errors.contactName} placeholder="Ержан Мукашев" />
          {formError && <p className="text-13 text-error">{formError}</p>}
          <Button variant="primary" onClick={submit} type="button" loading={loading} fullWidth>
            Отправить на проверку
          </Button>
        </div>
      </div>
    </div>
  );
}
