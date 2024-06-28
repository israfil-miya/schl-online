import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

// This function can be marked `async` if using `await` inside
export async function middleware(request) {
  const session = await getToken({ req: request, secret: process.env.SECRET });
  console.log("session in middleware: ", session);

  if (session.user.role == "marketer") {
    return NextResponse.redirect(
      new URL("https://marketers.studioclickhouse.com/")
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
