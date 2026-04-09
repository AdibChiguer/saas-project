import { NextResponse } from "next/server";

// const SECURE_ROUTES = ["/dashboard", "/settings", "/account"];

export async function middleware(request) {
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)"], // apply to all routes except static
};
