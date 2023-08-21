import "../styles/globals.css";
import dynamic from "next/dynamic";
import Head from "next/head";
import Script from "next/script";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { useSession, SessionProvider } from "next-auth/react";
import { Toaster } from "react-hot-toast";

// Dynamically import NextNProgress only on the client side
const DynamicNextNProgress = dynamic(() => import("nextjs-progressbar"), {
  ssr: false,
});

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Script
        src="https://cdn.jsdelivr.net/npm/@popperjs/core@2.11.8/dist/umd/popper.min.js"
        integrity="sha384-I7E8VVD/ismYTF4hNIPjVp/Zjvgyol6VFvRkX/vR+Vc4jQkC+hVqc2pM8ODewa9r"
        crossOrigin="anonymous"
      />
      <Script
        src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.1/dist/js/bootstrap.min.js"
        integrity="sha384-Rx+T1VzGupg4BHQYs2gCW9It+akI2MM/mndMCy36UVfodzcJcF0GGLxZIzObiEfa"
        crossOrigin="anonymous"
      />

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
          color="#4169e1"
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
}

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
export default MyApp;
