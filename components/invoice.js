import { useEffect, useState } from "react";
import { getSession, useSession } from "next-auth/react";

import Create from "./invoiceTabs/create";
import Browse from "./invoiceTabs/browse";

import Link from "next/link";
import { useRouter } from "next/router";
import toast from "react-hot-toast";

export default function Invoice() {
  let [component, setComponent] = useState("create");
  const router = useRouter();
  let { error, success } = router.query;

  useEffect(() => {
    if (error) {
      toast.error(error, {
        toastId: "error",
      });
      error = undefined;
      router.replace("/dashboard");
    }
    if (success) {
      toast.success(success, {
        toastId: "success",
      });
      success = undefined;
      router.replace("/dashboard");
    }
  }, [error, success, router, component]);

  return (
    <>
      
      <ul className="nav nav-tabs nav-justified mt-3" role="tablist">
        <li className="nav-item" role="presentation">
          <Link
            className={component == "create" ? "nav-link active" : "nav-link"}
            href=""
            onClick={() => setComponent("create")}
            role="tab"
          >
            Create Invoice
          </Link>
        </li>

        <li className="nav-item" role="presentation">
          <Link
            className={component == "browse" ? "nav-link active" : "nav-link"}
            href=""
            onClick={() => setComponent("browse")}
            role="tab"
          >
            Invoice Browse
          </Link>
        </li>
      </ul>

      {component == "create" && <Create />}
      {component == "browse" && <Browse />} 
    

      <style jsx>
        {`
          .nav {
            color: white;
          }
        `}
      </style>
    </>
  );
}

export async function getServerSideProps(context) {
  const session = await getSession(context);

  // code for redirect if not logged in
  if (!session || session.user.role != "super") {
    return {
      redirect: {
        destination: "/?error=You need Super role to access the page",
        permanent: true,
      },
    };
  } else
    return {
      props: {},
    };
}
