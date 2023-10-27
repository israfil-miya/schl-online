import { NextResponse } from "next/server";

const ALLOWED_IPS = process.env.ALLOWEDIP.split(" ");

// This object will store information about clients who have been redirected.
const clientsRedirected = {};

export default function Middleware(req) {
  // Get the client's IP address from the request headers.
  const ip = req.headers["x-forwarded-for"] || req.ip 

  // Log the client's IP address.
  console.log("Client IP:", ip);

  if (ip === undefined) {
    console.log("IP is undefined, allowing the request.");
    return NextResponse.next();
  }

  if (!ALLOWED_IPS.includes(ip)) {
    // Check if the client has already been redirected.
    if (clientsRedirected[ip]) {
      console.log("Client has already been redirected, blocking the request.");
      return new Response("Forbidden: This website can only be accessed from the office!", { status: 403 });
    }

    // Mark the client as redirected.
    clientsRedirected[ip] = true;

    const url = req.nextUrl.clone();
    if (url.pathname.startsWith("/favicon") || url.pathname.startsWith("/images")) {
      console.log("Request is for favicon or images, allowing request to continue.");
      return NextResponse.next();
    }

    console.log("Blocking the request.");
    return new Response("Forbidden: This website can only be accessed from the office!", { status: 403 });
  }

  console.log("IP is allowed, allowing request to continue.");
  return NextResponse.next();
}
