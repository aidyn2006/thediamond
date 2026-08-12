import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { isPublicPath } from "@/lib/routes";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  // The public surface is defined once, in lib/routes.ts — the SEO hubs live at the
  // root under keyword slugs, so an allow-list of literal paths cannot express it.
  const isPublic = isPublicPath(pathname);

  // /listings/* is public for reading, but posting and editing are not. Those pages
  // also call requireMember() server-side; this keeps the redirect instant.
  const isSellerPath =
    pathname === "/listings/new" || /^\/listings\/[^/]+\/edit$/.test(pathname);

  if (isPublic && !isSellerPath) return NextResponse.next();
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
