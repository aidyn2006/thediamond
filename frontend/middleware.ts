import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { isPublicPath, splitLocale } from "@/lib/routes";

/**
 * The root layout needs the request's language for <html lang>, and a server component
 * cannot read the URL. Passing it as a request header is the cheapest hand-off — the
 * alternative (a [locale] segment wrapping every route) would move every existing
 * Russian URL, which is exactly what we refuse to do.
 */
export default auth((req) => {
  const { pathname } = req.nextUrl;
  const { locale } = splitLocale(pathname);
  const headers = new Headers(req.headers);
  headers.set("x-locale", locale);
  const pass = () => NextResponse.next({ request: { headers } });
  // The public surface is defined once, in lib/routes.ts — the SEO hubs live at the
  // root under keyword slugs, so an allow-list of literal paths cannot express it.
  const isPublic = isPublicPath(pathname);

  // /listings/* is public for reading, but posting and editing are not. Those pages
  // also call requireMember() server-side; this keeps the redirect instant.
  const isSellerPath =
    pathname === "/listings/new" || /^\/listings\/[^/]+\/edit$/.test(pathname);

  if (isPublic && !isSellerPath) return pass();
  if (!req.auth) {
    const url = new URL("/login", req.nextUrl.origin);
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }
  return pass();
});

export const config = {
  // run on everything except Next internals, the auth API and static assets
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
