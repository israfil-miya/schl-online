import React, { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "../../components/navbar";
import { useSession, SessionProvider, getSession } from "next-auth/react";
import toast from "react-hot-toast";

export default function Marketers() {
  const [marketersList, setMarketersList] = useState([]);

  async function fetchApi(url, options) {
    const res = await fetch(url, options);
    const data = await res.json();
    return data;
  }

  const getMarketers = async () => {
    try {
      const url = `${process.env.NEXT_PUBLIC_BASE_URL}/api/crm`;
      const options = {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          getallmarketers: true,
        },
      };

      const list = await fetchApi(url, options);

      if (!list.error) {
        setMarketersList(list);
      } else {
        toast.error("Unable to retrieve file list", { toastId: "error1" });
      }
    } catch (error) {
      console.error("Error fetching file list:", error);
      toast.error("Error retrieving file list", { toastId: "error3" });
    }
  };

  const convertToDDMMYYYY = (dateString) => {
    const [year, month, day] = dateString.split("-");
    if (year.length != 4) return dateString;
    return `${day}-${month}-${year}`;
  };

  useEffect(() => {
    getMarketers();
  }, []);
  return (
    <>
      <Navbar navFor="crm" />
      <div className="container">
        <div className="markers-list my-5">
          <h5 className="py-3">Marketers List</h5>

          <table className="table table-hover">
            <thead>
              <tr className="table-dark">
                <th>#</th>
                <th>Real Name</th>
                <th>Company Name</th>
                <th>Joining Date</th>
                <th>Phone</th>
                <th>Email</th>
              </tr>
            </thead>
            <tbody>
              {marketersList?.length !== 0 &&
                marketersList?.map((marketer, index) => {
                  return (
                    <tr key={index}>
                      <td>{index + 1}</td>
                      <td className="marketer_name text-decoration-underline">
                        <Link
                          href={`/crm/marketer/stats?name=${marketer.name}`}
                        >
                          {marketer.name}
                        </Link>
                      </td>
                      <td>{marketer.company_provided_name}</td>
                      <td>
                        {marketer.joining_date
                          ? convertToDDMMYYYY(marketer.joining_date)
                          : ""}
                      </td>
                      <td>{marketer.phone}</td>
                      <td>{marketer.email}</td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>

      <style jsx>
        {`
          .marketer_name:hover {
            color: rgba(0, 0, 0, 0.7);
          }
        `}
      </style>
    </>
  );
}

export async function getServerSideProps(context) {
  const session = await getSession(context);

  const ALLOWED_IPS = process.env.NEXT_PUBLIC_ALLOWEDIP?.split(" ");

  const req = context.req;
  const ip =
    process.env.NODE_ENV === "development"
      ? process.env.NEXT_PUBLIC_DEVIP
      : req?.headers["x-forwarded-for"] || req?.ip;

  if (!ip) {
    return {
      redirect: {
        destination: "/forbidden",
        permanent: false,
      },
    };
  }

  if (
    process.env.NODE_ENV !== "development" &&
    session.user.role !== "super" &&
    session.user.role !== "admin" &&
    !ALLOWED_IPS?.includes(ip)
  ) {
    return {
      redirect: {
        destination: "/forbidden",
        permanent: false,
      },
    };
  }

  // code for redirect if not logged in
  if (
    !session ||
    session.user.role != "admin" ||
    session.user.role != "super"
  ) {
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
