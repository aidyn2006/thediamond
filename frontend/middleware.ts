import { auth } from "@/auth";
import { NextResponse } from "next/server";

const PUBLIC_PATHS = [
  "/",
  "/login",
  "/register",
  // Password-reset flow — reached by logged-OUT users (link on /login, link from
  // the reset email). Must stay public or the whole flow bounces back to /login.
  "/forgot-password",
  "/reset-password",
  // Default OG image — must be reachable by unauthenticated social/crawler bots.
  // (Dotted metadata routes like /robots.txt, /sitemap.xml, /manifest.webmanifest,
  // /icon.png are already excluded by the matcher below; this one has no dot.)
  "/opengraph-image",
];
// path prefixes that anyone (incl. logged-out visitors) may open
const PUBLIC_PREFIXES = ["/u/"];

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isPublic =
    PUBLIC_PATHS.includes(pathname) ||
    PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix));

  if (isPublic) return NextResponse.next();
  if (!req.auth) {
    const url = new URL("/login", req.nextUrl.origin);
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
});

export const config = {
  // run on everything except Next internals, the auth API and static assets
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
