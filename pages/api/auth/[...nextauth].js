import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
export default NextAuth({
  secret: process.env.SECRET,
  providers: [
    CredentialsProvider({
      id: "signin",
      name: "signin",
      async authorize(credentials) {
        const { name, password } = credentials;
        if (!name || !password) return null;
        const res = await fetch(
          process.env.NEXT_PUBLIC_BASE_URL + "/api/user",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              name,
              password,
              signin: true,
            },
          },
        );
        const user = await res.json();

        if (user && !user.error) {
          /*
          const decryptedPass = await verifyPassword(password, user.password)
          if (!decryptedPass) return null
          */
          return user;
        }
        throw new Error(user.message);
      },
    }),
  ],
  debug: process.env.NODE_ENV === "development",
  session: {
    strategy: "jwt",
  },
  jwt: {
    encryption: true,
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.user = user;
      }
      return Promise.resolve(token);
    },

    async session({ session, token }) {
      session.user = token.user;
      return Promise.resolve(session);
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
});

NextAuth.getInitialProps = async (context) => {
  const req = context.ctx.req;
  const ALLOWED_IPS = process.env.ALLOWEDIP.split(" ");

  const session = await getSession(context);
  const ip = req.headers["x-forwarded-for"] || req.ip || "103.106.236.161";

  if (session) {
    if (
      context.ctx.req.url !== "/forbidden" &&
      ip !== undefined &&
      context.ctx.req.url !== "/login" &&
      session.user.role !== "super" &&
      session.user.role !== "admin"
    ) {
      if (!ALLOWED_IPS.includes(ip)) {
        console.log(context.ctx.req.url);
        // Redirect to the forbidden page if the IP is not in the allowed list
        context.ctx.res.writeHead(302, { Location: "/forbidden" });
        context.ctx.res.end();
        return { pageProps: { session } };
      }
    }
  }
  // If none of the above conditions apply, return the session data
  return { pageProps: { session } };
};
