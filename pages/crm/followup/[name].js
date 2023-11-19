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

export default function Followup() {
  const router = useRouter();
  const { name } = router.query;
  const { data: session } = useSession();

  const [nearestFollowUps, setNearestFollowUps] = useState([]);

  const [manageData, setManageData] = useState([]);

  const convertToDDMMYYYY = (dateString) => {
    const [year, month, day] = dateString.split("-");
    if (year.length != 4) return dateString;
    return `${day}-${month}-${year}`;
  };

  const handlefinishfollowup = async () => {
    let result;
    const res = await fetch(process.env.NEXT_PUBLIC_BASE_URL + "/api/crm", {
      method: "GET",
      headers: {
        finishfollowup: true,
        updated_by: session.user.name,
        id: manageData._id,
        "Content-Type": "application/json",
      },
    });
    result = await res.json();
    if (!result.error) {
      let listLength = await getReportsForFollowup();
      if (!listLength) {
        console.log("this executed");
        router.push(process.env.NEXT_PUBLIC_BASE_URL + "/crm/marketers");
      }
      toast.success("Changed the status of followup");
    }
  };

  const getReportsForFollowup = async () => {
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
      setNearestFollowUps(res1);
      return res1.length;
    } else {
      toast.error("Unable to fetch the folowup list of " + name);
    }
  };

  useEffect(() => {
    getReportsForFollowup();
  }, []);

  return (
    <>
      <Navbar navFor="crm" shortNote={name + " - FOLLOWUP"} />
      <div className="followup-list my-5 text-nowrap">
        <h5 className="bg-light text-center p-2 mb-3 border">
          Available Followups
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
              <th>Test</th>
              <th>Prospected</th>
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
                    <td>{item.is_test ? "Yes" : "No"}</td>
                    <td>{item.is_prospected ? "Yes" : "No"}</td>
                    <td
                      className="align-middle"
                      style={{ textAlign: "center" }}
                    >
                      <button
                        onClick={() => setManageData(item)}
                        className="btn btn-sm btn-outline-primary"
                        data-bs-toggle="modal"
                        data-bs-target="#finishModal"
                      >
                        Finish
                      </button>
                    </td>
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

      <div
        className="modal fade"
        id="finishModal"
        tabIndex="-1"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h1 className="modal-title fs-5" id="staticBackdropLabel">
                Finish Confirmation
              </h1>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              <p>Are you sure?</p>
            </div>
            <div className="modal-footer p-1">
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary"
                data-bs-dismiss="modal"
              >
                No
              </button>
              <button
                onClick={handlefinishfollowup}
                type="button"
                className="btn btn-sm btn-outline-danger"
                data-bs-dismiss="modal"
              >
                Yes
              </button>
            </div>
          </div>
        </div>
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
    return {
      props: {},
    };
  }
}
