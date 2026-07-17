import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  CATEGORIES,
  categoryBySlug,
  categoryLabels,
  categorySlugs,
} from "@/lib/categories";
import { getPublicCreators } from "@/lib/api";
import { pageMetadata, catalogJsonLd, breadcrumbJsonLd } from "@/lib/seo";
import { PublicHeader } from "@/components/public/PublicHeader";
import { CategoryNav } from "@/components/catalog/CategoryNav";
import { PublicCreatorCard } from "@/components/catalog/PublicCreatorCard";
import { JsonLd } from "@/components/JsonLd";

export const revalidate = 3600;
// Unknown slugs 404 rather than rendering an empty (thin) indexable page.
export const dynamicParams = false;

export function generateStaticParams() {
  return CATEGORIES.map((c) => ({ category: categorySlugs[c] }));
}

function describe(label: string) {
  return `Каталог креаторов и микроинфлюенсеров категории «${label}» в Казахстане. Профили, аудитория и площадки — свяжитесь напрямую на TheDiamond.`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category } = await params;
  const cat = categoryBySlug[category];
  if (!cat) return { title: "Категория не найдена", robots: { index: false, follow: false } };
  const label = categoryLabels[cat];
  return pageMetadata({
    title: `${label} — креаторы Казахстана`,
    description: describe(label),
    path: `/catalog/${category}`,
  });
}

export default async function CategoryHubPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const cat = categoryBySlug[category];
  if (!cat) notFound();

  const label = categoryLabels[cat];
  const description = describe(label);
  const title = `${label} — креаторы Казахстана`;
  const creators = await getPublicCreators({ category: cat });

  return (
    <div className="min-h-dvh">
      <JsonLd
        data={[
          catalogJsonLd({ name: title, description, path: `/catalog/${category}`, creators }),
          breadcrumbJsonLd([
            { name: "Главная", path: "/" },
            { name: "Каталог", path: "/catalog" },
            { name: label, path: `/catalog/${category}` },
          ]),
        ]}
      />
      <PublicHeader />

      <main id="main-content" tabIndex={-1} className="mx-auto max-w-[1200px] px-6 py-10 md:px-10">
        <h1 className="font-display text-28 font-semibold md:text-40">
          {label}: креаторы Казахстана
        </h1>
        <p className="mt-3 max-w-[60ch] text-15 text-text-dim">{description}</p>

        <div className="mt-8">
          <CategoryNav active={cat} />
        </div>

        {creators.length === 0 ? (
          <p className="py-16 text-center text-15 text-text-dim">
            В этой категории пока никого. Посмотрите другие — они выше.
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
