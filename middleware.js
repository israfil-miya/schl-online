import { NextResponse } from "next/server";

export default function Middleware(req) {
  const allowedIps = process.env.ALLOWEDIP.split(" ")
  console.log(allowedIps)
  // const ip = req.headers["x-forwarded-for"] || req.ip;
  const ip = allowedIps[0]

  if (ip === undefined) return NextResponse.next();

  if (!allowedIps.includes(ip)) {
    const url = req.nextUrl.clone();
    if (url.pathname.startsWith("/favicon") || url.pathname.startsWith("/images"))
      return NextResponse.next();
    return NextResponse.rewrite(new URL("/forbidden", req.url));
  }

  return NextResponse.next();
}

Middleware.noAuth = true;
