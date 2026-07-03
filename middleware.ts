import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const pathname = req.nextUrl.pathname;

    if (pathname.startsWith("/admin") && token?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    if (
      pathname.startsWith("/product-owner") &&
      token?.role !== "PRODUCT_OWNER"
    ) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    if (pathname.startsWith("/user") && token?.role !== "USER") {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: [
    "/admin/:path*",
    "/user/:path*",
    "/product-owner/:path*",
    "/gallery/:path*",
    "/notification/:path*",
    "/payment/:path*",
    "/profile/:path*",
  ],
};

