import { NextResponse } from "next/server";

const ALLOWED_IPS = process.env.ALLOWEDIP.split(" ");

export default function Middleware(req) {
  const ip = req.headers["x-forwarded-for"] || req.ip;

  if (ip === undefined) return NextResponse.next();

  if (!ALLOWED_IPS.includes(ip))
    return new Response(
      "Forbidden: This website can only be accessed from the office!",
      { status: 403 },
    );

  return NextResponse.next();
}
