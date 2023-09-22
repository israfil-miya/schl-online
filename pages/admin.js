import Navbar from "../components/navbar";
import { useEffect, useState } from "react";
import { getSession, useSession } from "next-auth/react";
import dynamic from "next/dynamic";


import Tasks from "../components/tasks";
import Users from "../components/users";
import Statistics from "../components/statistics";
import Clients from "../components/clients";

import Link from "next/link";
import { useRouter } from "next/router";
import toast from "react-hot-toast";

export default function Admin() {
  let [component, setComponent] = useState("tasks");
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
      <Navbar navFor="admin" />
      <ul className="nav nav-tabs nav-justified mt-3" role="tablist">
        <li className="nav-item" role="presentation">
          <Link
            className={component == "users" ? "nav-link active" : "nav-link"}
            href=""
            onClick={() => setComponent("users")}
            role="tab"
          >
            Users
          </Link>
        </li>

        <li className="nav-item" role="presentation">
          <Link
            className={component == "tasks" ? "nav-link active" : "nav-link"}
            href=""
            onClick={() => setComponent("tasks")}
            role="tab"
          >
            Tasks
          </Link>
        </li>

        <li className="nav-item" role="presentation">
          <Link
            className={component == "clients" ? "nav-link active" : "nav-link"}
            href=""
            onClick={() => setComponent("clients")}
            role="tab"
          >
            Clients
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
      {component == "users" && <Users />}
      {component == "tasks" && <Tasks />}
      {component == "clients" && <Clients />}
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
  if (!session || session.user.role == "user" || session.user.role == "manager") {
    return {
      redirect: {
        destination: "/?error=You need Admin/Super role to access the page",
        permanent: true,
      },
    };
  } else
    return {
      props: {},
    };
}
