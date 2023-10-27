import { NextResponse } from "next/server";

export default function Middleware(req) {
  const allowedIps = ["103.106.236.161"];
  const ip = req.headers["x-forwarded-for"] || req.ip;
  // const ip = "103.100.122.100"

  if (ip === undefined) return NextResponse.next();

  if (!allowedIps.includes(ip)) {
    const url = req.nextUrl.clone();
    if (url.pathname.startsWith("/favicon") || url.pathname.startsWith("/img"))
      return NextResponse.next();
    return NextResponse.rewrite(new URL("/forbidden", req.url));
  }

  return NextResponse.next();
}

Middleware.noAuth = true;
