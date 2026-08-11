import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { auth } from "@/auth";
import { AppHeader } from "@/components/app/AppHeader";
import { PublicHeader } from "@/components/public/PublicHeader";
import { CategoryBar } from "@/components/public/CategoryBar";
import { SiteFooter } from "@/components/public/SiteFooter";
import { FaqBlock } from "@/components/seo/FaqBlock";
import { JsonLd } from "@/components/JsonLd";
import { memberNav } from "@/lib/nav";
import {
  articleJsonLd,
  breadcrumbJsonLd,
  faqPageJsonLd,
  pageMetadata,
} from "@/lib/seo";
import { GUIDES, guideBySlug } from "@/lib/guides";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const guide = guideBySlug[slug];
  if (!guide) return pageMetadata({ title: "Материал не найден", index: false });
  return pageMetadata({
    title: guide.title,
    description: guide.description,
    path: `/guides/${slug}`,
    ogType: "article",
  });
}

export function generateStaticParams() {
  return GUIDES.map((g) => ({ slug: g.slug }));
}

export default async function GuidePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const session = await auth();
  const { slug } = await params;
  const guide = guideBySlug[slug];
  if (!guide) notFound();

  return (
    <>
      {session?.user ? (
        <AppHeader email={session.user.email} items={memberNav} />
      ) : (
        <PublicHeader />
      )}
      <CategoryBar signedIn={!!session?.user} />

      <main id="main-content" className="mx-auto max-w-[760px] px-6 py-8 md:px-10">
        <nav aria-label="Хлебные крошки" className="mb-4 text-13 text-text-dim">
          <Link href="/guides" className="hover:text-text">
            Полезное
          </Link>
          <span className="mx-2" aria-hidden="true">
            /
          </span>
          <span className="text-text">{guide.h1}</span>
        </nav>

        <article>
          <h1 className="text-28 font-bold leading-tight md:text-40">{guide.h1}</h1>
          <p className="mt-2 text-13 text-text-dim">
            Обновлено{" "}
            {new Date(guide.updated).toLocaleDateString("ru-RU", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}{" "}
            · {guide.readMinutes} мин чтения
          </p>
          <p className="mt-5 text-17 leading-relaxed text-text">{guide.intro}</p>

          {guide.sections.map((s) => (
            <section key={s.heading} className="mt-8">
              <h2 className="mb-3 text-22 font-semibold">{s.heading}</h2>
              {s.paragraphs?.map((p) => (
                <p key={p} className="mb-3 text-15 leading-relaxed text-text-dim">
                  {p}
                </p>
              ))}
              {s.bullets && (
                <ul className="flex flex-col gap-2">
                  {s.bullets.map((b) => (
                    <li
                      key={b}
                      className="flex gap-2 text-15 leading-relaxed text-text-dim"
                    >
                      <span aria-hidden="true" className="text-accent">
                        •
                      </span>
                      {b}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </article>

        <FaqBlock qa={guide.faq} />

        <section aria-labelledby="next" className="mt-12">
          <h2 id="next" className="mb-3 text-17 font-semibold">
            Что дальше
          </h2>
          <ul className="flex flex-col gap-2">
            {guide.related.map((r) => (
              <li key={r.href}>
                <Link
                  href={r.href}
                  className="text-15 text-accent underline underline-offset-2"
                >
                  {r.label}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </main>

      <SiteFooter />

      <JsonLd
        data={[
          articleJsonLd({
            headline: guide.h1,
            description: guide.description,
            path: `/guides/${slug}`,
            published: guide.updated,
          }),
          breadcrumbJsonLd([
            { name: "Полезное", path: "/guides" },
            { name: guide.h1, path: `/guides/${slug}` },
          ]),
          faqPageJsonLd(guide.faq),
        ]}
      />
    </>
  );
}
