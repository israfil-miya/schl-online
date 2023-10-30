import "../styles/globals.css";
import dynamic from "next/dynamic";
import Head from "next/head";
import Script from "next/script";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { useSession, SessionProvider, getSession } from "next-auth/react";
import { Toaster } from "react-hot-toast";

// Dynamically import NextNProgress only on the client side
const DynamicNextNProgress = dynamic(() => import("nextjs-progressbar"), {
  ssr: false,
});

const SCHL = ({ Component, pageProps }) => {
  return (
    <>
      <Script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js" />

      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link
          rel="icon"
          type="image/x-icon"
          href="/images/NEW-SCH-logo-text-grey.png"
        ></link>
        <title>SCHL PORTAL</title>
      </Head>

      <Toaster position="top-right" reverseOrder={true} />

      {/* Render NextNProgress only on the client side */}
      {typeof window !== "undefined" && (
        <DynamicNextNProgress
          color="#7aa73f"
          startPosition={0.3}
          stopDelayMs={200}
          height={1.5}
          showOnShallow={true}
          options={{ easing: "ease", speed: 500, showSpinner: false }}
        />
      )}

      <SessionProvider session={pageProps.session}>
        {!Component.noAuth ? (
          <Auth>
            <Component {...pageProps} />
          </Auth>
        ) : (
          <Component {...pageProps} />
        )}
      </SessionProvider>
    </>
  );
};

const Auth = ({ children }) => {
  const { data: session, status } = useSession();
  const loading = status === "loading";
  const hasUser = !!session?.user;
  const router = useRouter();
  useEffect(() => {
    if (!loading && !hasUser) {
      router.replace("/login?error=You have to login first");
    }
  }, [loading, hasUser]);
  if (loading || !hasUser) {
    return <div>Loading...</div>;
  }
  return children;
};

SCHL.getInitialProps = async (context) => {
  const req = context.ctx.req;
  const ALLOWED_IPS = process.env.NEXT_PUBLIC_ALLOWEDIP?.split(" ");

  const session = await getSession(context);
  const ip = req?.headers["x-forwarded-for"] || req?.ip;

  if (session) {
    if (
      context.ctx.req?.url !== "/forbidden" &&
      ip !== undefined &&
      context.ctx.req?.url !== "/login" &&
      session.user.role !== "super" &&
      session.user.role !== "admin"
    ) {
      if (!ALLOWED_IPS?.includes(ip)) {
        console.log(context.ctx.req?.url);
        // Redirect to the forbidden page if the IP is not in the allowed list
        context.ctx.res?.writeHead(302, { Location: "/forbidden" });
        context.ctx.res?.end();
        return { pageProps: { session } };
      }
    }
  }
  // If none of the above conditions apply, return the session data
  return { pageProps: { session } };
};

export default SCHL;
