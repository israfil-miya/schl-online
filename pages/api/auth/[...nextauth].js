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
