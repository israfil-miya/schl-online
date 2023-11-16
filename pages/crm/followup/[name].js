import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Navbar from "../../../components/navbar";
import { useSession, SessionProvider, getSession } from "next-auth/react";
import { toast } from "sonner";

async function fetchApi(url, options) {
  const res = await fetch(url, options);
  const data = await res.json();
  return data;
}

export default function Followup(props) {
  const router = useRouter();
  const { name } = router.query;

  const [nearestFollowUps, setNearestFollowUps] = useState([]);

  const convertToDDMMYYYY = (dateString) => {
    const [year, month, day] = dateString.split("-");
    if (year.length != 4) return dateString;
    return `${day}-${month}-${year}`;
  };

  useEffect(() => {
    setNearestFollowUps(props.nearestFollowUps);
  }, []);

  return (
    <>
      <Navbar navFor="crm" shortNote={name + " - FOLLOWUP"} />
      <div className="followup-list my-5 text-nowrap">
        <h5 className="bg-light text-center p-2 mb-3 border">
          Closest Followups
        </h5>

        <table className="table table-hover">
          <thead>
            <tr className="table-dark">
              <th>#</th>
              <th>Calling Date</th>
              <th>Followup Date</th>
              <th>Country</th>
              <th>Website</th>
              <th>Category</th>
              <th>Company Name</th>
              <th>Contact Person</th>
              <th>Designation</th>
              <th>Contact Number</th>
              <th>Email Address</th>
              <th>Calling Status</th>
              <th>LinkedIn</th>
              <th>Finish</th>
            </tr>
          </thead>
          <tbody>
            {nearestFollowUps?.length !== 0 ? (
              nearestFollowUps?.map((item, index) => {
                return (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>
                      {item.calling_date
                        ? convertToDDMMYYYY(item.calling_date)
                        : ""}
                    </td>
                    <td>
                      {item.followup_date
                        ? convertToDDMMYYYY(item.followup_date)
                        : ""}
                    </td>
                    <td>{item.country}</td>
                    <td>{item.website}</td>
                    <td>{item.category}</td>
                    <td>{item.company_name}</td>
                    <td>{item.contact_person}</td>
                    <td>{item.designation}</td>
                    <td>{item.contact_number}</td>
                    <td>{item.email_address}</td>
                    <td>{item.calling_status}</td>
                    <td>{item.linkedin}</td>
                    <td></td>
                  </tr>
                );
              })
            ) : (
              <tr key={0}>
                <td colSpan="13" className=" align-center text-center">
                  No Followups To Show.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <style jsx>
        {`
          .table {
            font-size: 15px;
          }

          th,
          td {
            padding: 5px 2.5px;
          }
        `}
      </style>
    </>
  );
}

export async function getServerSideProps(context) {
  const session = await getSession(context);
  const { name } = context.query;

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
    (session.user.role != "marketer" &&
      session.user.role != "admin" &&
      session.user.role != "super")
  ) {
    return {
      redirect: {
        destination:
          "/?error=You need Marketer/Admin/Super role to access the page",
        permanent: true,
      },
    };
  } else {
    const url1 = `${process.env.NEXT_PUBLIC_BASE_URL}/api/crm`;
    const options1 = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        getnearestfollowups: true,
        marketer_name: name,
      },
    };

    let res1 = await fetchApi(url1, options1);

    if (!res1.error) {
      return {
        props: {
          nearestFollowUps: res1,
        },
      };
    } else {
      return {
        props: {},
      };
    }
  }
}
