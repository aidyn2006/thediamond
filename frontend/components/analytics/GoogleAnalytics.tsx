import { Suspense } from "react";
import Script from "next/script";
import { PageViewTracker } from "./PageViewTracker";

/**
 * Google Analytics 4 (gtag.js).
 *
 * Measurement id comes from `NEXT_PUBLIC_GA_ID`. It is baked in at build time, so a
 * Docker image built without it simply has no analytics — which is what we want in
 * dev and in preview builds.
 *
 * Load order matters and is deliberate:
 *  1. the inline init runs while the HTML is parsed, so `window.gtag` exists and the
 *     `js` + `config` commands are queued *before* React hydrates;
 *  2. the ~150 KB vendor script is fetched `afterInteractive`, i.e. off the critical
 *     path — it drains the queue on arrival, so no event is lost;
 *  3. <PageViewTracker/> then owns every page view (see `send_page_view: false`).
 */
export function GoogleAnalytics() {
  const gaId = process.env.NEXT_PUBLIC_GA_ID;
  // Guard the inline script: only ever interpolate an id-shaped value.
  if (!gaId || !/^[\w-]+$/.test(gaId)) return null;

  return (
    <>
      <script
        id="ga-init"
        dangerouslySetInnerHTML={{
          __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}window.gtag=gtag;gtag('js',new Date());gtag('config','${gaId}',{send_page_view:false});`,
        }}
      />
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
        strategy="afterInteractive"
      />
      {/* useSearchParams() needs a boundary, otherwise it opts every page out of static rendering. */}
      <Suspense fallback={null}>
        <PageViewTracker />
      </Suspense>
    </>
  );
}
