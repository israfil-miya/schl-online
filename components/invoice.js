import Navbar from "../components/navbar";
import { useEffect, useState } from "react";
import { getSession, useSession } from "next-auth/react";
import dynamic from "next/dynamic";

import Create from "./invoiceTabs/create";
import Database from "./invoiceTabs/database";

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
            className={component == "database" ? "nav-link active" : "nav-link"}
            href=""
            onClick={() => setComponent("database")}
            role="tab"
          >
            Invoice Database
          </Link>
        </li>
      </ul>
      {/* {component == "users" && <Users />} */}
      {component == "create" && <Create />}
      {component == "database" && <Database />}

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
