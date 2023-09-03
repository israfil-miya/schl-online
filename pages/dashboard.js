import Navbar from "../components/navbar";
import { useEffect, useState } from "react";
import { getSession, useSession } from "next-auth/react";
import dynamic from "next/dynamic";

import Statistics from "../components/statistics";
import Approvals from "../components/approvals";
import Users from "../components/users";

import Link from "next/link";
import { useRouter } from "next/router";
import toast from "react-hot-toast";

export default function Admin() {
  let [component, setComponent] = useState("approvals");
  const router = useRouter();
  let { error, success } = router.query;

  useEffect(() => {
    if (error) {
      toast.error(error, {
        toastId: "error",
      });
      error = undefined;
      router.replace("/admin");
    }
    if (success) {
      toast.success(success, {
        toastId: "success",
      });
      success = undefined;
      router.replace("/admin");
    }
  }, [error, success, router, component]);

  return (
    <>
      <Navbar navFor="dashboard" />
      <ul className="nav nav-tabs nav-justified mt-3" role="tablist">
        {/*         
        <li className="nav-item" role="presentation">
          <Link
            className={component == "users" ? "nav-link active" : "nav-link"}
            href=""
            onClick={() => setComponent("users")}
            role="tab"
          >
            Users
          </Link>
        </li> */}

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
            className={
              component == "statistics" ? "nav-link active" : "nav-link"
            }
            href=""
            onClick={() => setComponent("statistics")}
            role="tab"
          >
            Statistics
          </Link>
        </li>
      </ul>
      {/* {component == "users" && <Users />} */}
      {component == "approvals" && <Approvals />}
      {component == "statistics" && <Statistics />}

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
