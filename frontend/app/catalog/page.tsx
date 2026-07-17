import type { Metadata } from "next";
import { PublicHeader } from "@/components/public/PublicHeader";
import { CategoryNav } from "@/components/catalog/CategoryNav";
import { PublicCreatorCard } from "@/components/catalog/PublicCreatorCard";
import { JsonLd } from "@/components/JsonLd";
import { getPublicCreators } from "@/lib/api";
import { pageMetadata, catalogJsonLd, breadcrumbJsonLd } from "@/lib/seo";

export const revalidate = 3600;

const TITLE = "Каталог креаторов Казахстана";
const DESCRIPTION =
  "Найдите UGC-креаторов и микроинфлюенсеров Казахстана: по категориям и городам. Профили, аудитория и площадки — свяжитесь напрямую.";

export const metadata: Metadata = pageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: "/catalog",
});

export default async function CatalogPage() {
  const creators = await getPublicCreators();

  return (
    <div className="min-h-dvh">
      <JsonLd
        data={[
          catalogJsonLd({ name: TITLE, description: DESCRIPTION, path: "/catalog", creators }),
          breadcrumbJsonLd([
            { name: "Главная", path: "/" },
            { name: "Каталог", path: "/catalog" },
          ]),
        ]}
      />
      <PublicHeader />

      <main id="main-content" tabIndex={-1} className="mx-auto max-w-[1200px] px-6 py-10 md:px-10">
        <h1 className="font-display text-28 font-semibold md:text-40">Каталог креаторов</h1>
        <p className="mt-3 max-w-[60ch] text-15 text-text-dim">{DESCRIPTION}</p>

        <div className="mt-8">
          <CategoryNav />
        </div>

        {creators.length === 0 ? (
          <p className="py-16 text-center text-15 text-text-dim">
            Пока никого не нашли. Загляните позже.
          </p>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {creators.map((c) => (
              <PublicCreatorCard key={c.id} creator={c} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
