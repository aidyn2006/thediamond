import Link from "next/link";
import { auth } from "@/auth";
import { AppHeader } from "@/components/app/AppHeader";
import { PublicHeader } from "@/components/public/PublicHeader";
import { CategoryBar } from "@/components/public/CategoryBar";
import { SiteFooter } from "@/components/public/SiteFooter";
import { JsonLd } from "@/components/JsonLd";
import { memberNav } from "@/lib/nav";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";
import { GUIDES } from "@/lib/guides";

export const metadata = pageMetadata({
  title: "Полезное о покупке и продаже телефонов",
  description:
    "Разборы для покупателей и продавцов: как проверить телефон перед покупкой б/у, как проверить IMEI, как продать айфон срочно и не потерять в цене.",
  path: "/guides",
});

export default async function GuidesPage() {
  const session = await auth();

  return (
    <>
      {session?.user ? (
        <AppHeader email={session.user.email} items={memberNav} />
      ) : (
        <PublicHeader />
      )}
      <CategoryBar signedIn={!!session?.user} />

      <main id="main-content" className="mx-auto max-w-[900px] px-6 py-8 md:px-10">
        <h1 className="text-28 font-bold md:text-40">Полезное</h1>
        <p className="mt-3 max-w-[620px] text-15 leading-relaxed text-text-dim">
          Короткие разборы без воды: что проверять при встрече, как не купить телефон с
          чужим аккаунтом и как продать свой быстро и по рыночной цене.
        </p>

        <ul className="mt-8 flex flex-col gap-4">
          {GUIDES.map((g) => (
            <li key={g.slug}>
              <Link
                href={`/guides/${g.slug}`}
                className="block rounded-card border border-border bg-surface p-5 transition-colors duration-150 hover:border-accent"
              >
                <p className="text-17 font-semibold text-text">{g.h1}</p>
                <p className="mt-1 text-15 text-text-dim">{g.description}</p>
                <p className="mt-2 text-13 text-text-dim">{g.readMinutes} мин чтения</p>
              </Link>
            </li>
          ))}
        </ul>
      </main>

      <SiteFooter />

      <JsonLd data={breadcrumbJsonLd([{ name: "Полезное", path: "/guides" }])} />
    </>
  );
}
