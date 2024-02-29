import "@/styles/globals.css";
import dynamic from "next/dynamic";
import Head from "next/head";
import Script from "next/script";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { useSession, SessionProvider, getSession } from "next-auth/react";
import { Toaster } from "sonner";
import { SpeedInsights } from "@vercel/speed-insights/next";

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

      <Toaster richColors position="top-right" reverseOrder={true} />

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
            <SpeedInsights />
          </Auth>
        ) : (
          <>
            <Component {...pageProps} />
            <SpeedInsights />
          </>
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

export default SCHL;
