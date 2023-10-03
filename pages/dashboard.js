import Navbar from "../components/navbar";
import { useEffect, useState } from "react";
import { getSession, useSession } from "next-auth/react";

import Approvals from "../components/approvals";
import Invoice from "../components/invoice";

import Link from "next/link";
import { useRouter } from "next/router";
import toast from "react-hot-toast";

export default function Dashboard() {
  let [component, setComponent] = useState("approvals");
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
      <Navbar navFor="dashboard" />
      <ul className="nav nav-tabs nav-justified mt-3" role="tablist">

        <li className="nav-item" role="presentation">
          <Link
            className={
              component == "approvals" ? "nav-link active" : "nav-link"
            }
            href=""
            onClick={() => setComponent("approvals")}
            role="tab"
          >
            Approvals
          </Link>
        </li>

        <li className="nav-item" role="presentation">
          <Link
            className={component == "invoice" ? "nav-link active" : "nav-link"}
            href=""
            onClick={() => setComponent("invoice")}
            role="tab"
          >
            Invoice
          </Link>
        </li>
      </ul>
      {component == "approvals" && <Approvals />}
      {component == "invoice" && <Invoice />}

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
