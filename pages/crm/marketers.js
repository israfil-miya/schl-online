import React, { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "../../components/navbar";
import { useSession, SessionProvider, getSession } from "next-auth/react";
import { toast } from "sonner";

async function fetchApi(url, options) {
  const res = await fetch(url, options);
  const data = await res.json();
  return data;
}

export default function Marketers(props) {
  const [marketersList, setMarketersList] = useState([]);
  const [dailyReportStatusRowHtml, setDailyReportStatusRowHtml] = useState();
  const [nearestFollowUps, setNearestFollowUps] = useState([]);
  const [veiwFollowUp, setVeiwFollowUp] = useState({});

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

  const convertToYYYYMMDD = (dateString) => {
    console.log(dateString);
    if (!dateString) return null;
    const [day, month, year] = dateString.split("-");
    return `${year}-${month}-${day}`;
  };

  const createDailyStatusReportTable = () => {
    let parsedTableRows = [];
    let total_calls_made = 0;
    let total_test_jobs = 0;
    let total_prospects = 0;

    props?.dailyReportStatus.map((FiveDayReportOfMarketer, index) => {
      total_calls_made += parseInt(
        FiveDayReportOfMarketer.data.total_calls_made,
      )
        ? parseInt(FiveDayReportOfMarketer.data.total_calls_made)
        : 0;
      total_test_jobs += parseInt(FiveDayReportOfMarketer.data.total_test_jobs)
        ? parseInt(FiveDayReportOfMarketer.data.total_test_jobs)
        : 0;
      total_prospects += parseInt(FiveDayReportOfMarketer.data.total_prospects)
        ? parseInt(FiveDayReportOfMarketer.data.total_prospects)
        : 0;
      parsedTableRows.push(
        <tr key={index}>
          <td
            style={{
              minWidth: "40px",
              maxWidth: "40px",
              padding: "0px 0px 0px 5px",
              backgroundColor: "#212529",
              color: "#fff",
            }}
          >
            {FiveDayReportOfMarketer.marketer_name}
          </td>
          <td className="text-center" style={{ padding: "0px" }}>
            {FiveDayReportOfMarketer.data.total_calls_made}
          </td>
          <td className="text-center" style={{ padding: "0px" }}>
            {FiveDayReportOfMarketer.data.total_prospects}
          </td>
          <td className="text-center" style={{ padding: "0px" }}>
            {FiveDayReportOfMarketer.data.total_test_jobs}
          </td>
        </tr>,
      );
    });

    parsedTableRows.push(
      <tr>
        <th
          style={{
            minWidth: "40px",
            maxWidth: "40px",
            padding: "0px 0px 0px 5px",
            backgroundColor: "#212529",
            color: "#fff",
          }}
        >
          Total
        </th>
        <th className="text-center" style={{ padding: "0px" }}>
          {total_calls_made}
        </th>
        <th className="text-center" style={{ padding: "0px" }}>
          {total_prospects}
        </th>
        <th className="text-center" style={{ padding: "0px" }}>
          {total_test_jobs}
        </th>
      </tr>,
    );

    return parsedTableRows;
  };

  useEffect(() => {
    setDailyReportStatusRowHtml(createDailyStatusReportTable());
    setNearestFollowUps(props.nearestFollowUps);
    getMarketers();
  }, []);
  return (
    <>
      <Navbar navFor="crm" />
      <div className="container">
        <div className="markers-list my-5">
          <h5 className="bg-light text-center p-2 mb-3 border">
            Marketers List
          </h5>

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

        <div className="daily-report-status mt-3">
          <h5 className="bg-light text-center p-2 mb-3 border">
            Daily Report Status (Last Five Business Days)
          </h5>

          <table className="table table-bordered table-hover">
            <thead>
              <tr>
                <th style={{ backgroundColor: "#212529", color: "#fff" }}></th>

                <th
                  className="text-center"
                  style={{ backgroundColor: "#212529", color: "#fff" }}
                >
                  Calls
                </th>

                <th
                  className="text-center"
                  style={{ backgroundColor: "#212529", color: "#fff" }}
                >
                  Prospects
                </th>

                <th
                  className="text-center"
                  style={{ backgroundColor: "#212529", color: "#fff" }}
                >
                  Tests
                </th>
              </tr>
            </thead>
            <tbody>
              {dailyReportStatusRowHtml?.map((tableRow, index) => tableRow)}
            </tbody>
          </table>
        </div>

        <div className="followup-list my-5 text-nowrap">
          <h5 className="bg-light text-center p-2 mb-3 border">
            Closest Followups
          </h5>

          <table className="table table-hover">
            <thead>
              <tr className="table-dark">
                <th>#</th>
                <th>Marketer Name</th>
                <th>Follow Up Date(s)</th>
                <th>Calling Status</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {nearestFollowUps?.length !== 0 &&
                nearestFollowUps?.map((followupdata, index) => {
                  return (
                    <tr key={index} className={index == 0 && "table-secondary"}>
                      <td>{index + 1}</td>
                      <td className="marketer_name">
                        {followupdata.marketer_name}
                      </td>
                      <td>
                        {followupdata.followup_date
                          ? convertToDDMMYYYY(followupdata.followup_date)
                          : ""}
                      </td>
                      <td className="text-wrap">
                        {followupdata.calling_status}
                      </td>
                      <td
                        className="align-middle"
                        style={{ textAlign: "center" }}
                      >
                        <button
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => {
                            setVeiwFollowUp({
                              ...followupdata,
                              followup_date:
                                convertToYYYYMMDD(followupdata.followup_date) ??
                                "",
                              calling_date:
                                convertToYYYYMMDD(followupdata.calling_date) ??
                                "",
                            });
                          }}
                          data-bs-toggle="modal"
                          data-bs-target="#veiwModal"
                        >
                          Veiw
                        </button>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>

      <div
        className="modal fade"
        id="veiwModal"
        tabIndex="-1"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered ">
          <div className="modal-content">
            <div className="modal-header">
              <h1 className="modal-title fs-5" id="staticBackdropLabel">
                Report Data
              </h1>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              <div className="mb-3">
                <label htmlFor="calling_date" className="form-label">
                  Calling Date
                </label>
                <input
                  disabled
                  value={veiwFollowUp.calling_date}
                  type="text"
                  className="form-control"
                  id="calling_date"
                />
              </div>
              <div className="mb-3">
                <label htmlFor="followup_date" className="form-label">
                  Followup Date
                </label>
                <input
                  value={veiwFollowUp.followup_date}
                  disabled
                  type="text"
                  className="form-control"
                  id="followup_date"
                />
              </div>
              <div className="mb-3">
                <label htmlFor="country" className="form-label">
                  Country
                </label>
                <input
                  value={veiwFollowUp.country}
                  disabled
                  type="text"
                  className="form-control"
                  id="country"
                />
              </div>
              <div className="mb-3">
                <label htmlFor="website" className="form-label">
                  Website
                </label>
                <input
                  value={veiwFollowUp.website}
                  disabled
                  type="text"
                  className="form-control"
                  id="website"
                />
              </div>
              <div className="mb-3">
                <label htmlFor="category" className="form-label">
                  Category
                </label>
                <input
                  value={veiwFollowUp.category}
                  disabled
                  type="text"
                  className="form-control"
                  id="category"
                />
              </div>
              <div className="mb-3">
                <label htmlFor="company_name" className="form-label">
                  Company Name
                </label>
                <input
                  value={veiwFollowUp.company_name}
                  disabled
                  type="text"
                  className="form-control"
                  id="company_name"
                />
              </div>
              <div className="mb-3">
                <label htmlFor="contact_person" className="form-label">
                  Contact Person
                </label>
                <input
                  value={veiwFollowUp.contact_person}
                  disabled
                  type="text"
                  className="form-control"
                  id="contact_person"
                />
              </div>
              <div className="mb-3">
                <label htmlFor="designation" className="form-label">
                  Designation
                </label>
                <input
                  value={veiwFollowUp.designation}
                  disabled
                  type="text"
                  className="form-control"
                  id="designation"
                />
              </div>
              <div className="mb-3">
                <label htmlFor="contact_number" className="form-label">
                  Contact Number
                </label>
                <input
                  value={veiwFollowUp.contact_number}
                  disabled
                  type="text"
                  className="form-control"
                  id="contact_number"
                />
              </div>
              <div className="mb-3">
                <label htmlFor="email_address" className="form-label">
                  Email Address
                </label>
                <input
                  value={veiwFollowUp.email_address}
                  disabled
                  type="text"
                  className="form-control"
                  id="email_address"
                />
              </div>
              <div className="mb-3">
                <label htmlFor="calling_status" className="form-label">
                  Calling Status
                </label>
                <input
                  value={veiwFollowUp.calling_status}
                  disabled
                  type="text"
                  className="form-control"
                  id="calling_status"
                />
              </div>
              <div className="mb-3">
                <label htmlFor="email_status" className="form-label">
                  Email Status
                </label>
                <input
                  value={veiwFollowUp.email_status}
                  disabled
                  type="text"
                  className="form-control"
                  id="email_status"
                />
              </div>
              <div className="mb-3">
                <label htmlFor="feedback" className="form-label">
                  Feedback
                </label>
                <textarea
                  disabled
                  value={veiwFollowUp.feedback}
                  type="text"
                  className="form-control"
                  id="feedback"
                />
              </div>
              <div className="mb-3">
                <label htmlFor="linkedin" className="form-label">
                  LinkedIn
                </label>
                <input
                  value={veiwFollowUp.linkedin}
                  disabled
                  type="text"
                  className="form-control"
                  id="linkedin"
                />
              </div>
              <div className="mb-3">
                <label htmlFor="leads_taken_feedback" className="form-label">
                  Leads Taken Feedback
                </label>
                <textarea
                  value={veiwFollowUp.leads_taken_feedback}
                  disabled
                  type="text"
                  className="form-control"
                  id="leads_taken_feedback"
                />
              </div>
            </div>
            <div className="modal-footer p-1">
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary"
                data-bs-dismiss="modal"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>

      <style jsx>
        {`
          .marketer_name:hover {
            color: rgba(0, 0, 0, 0.7);
          }
          .table {
            font-size: 15px;
          }

          th,
          td {
            padding: 2.5px 5px;
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
    (session.user.role != "admin" && session.user.role != "super")
  ) {
    return {
      redirect: {
        destination: "/?error=You need Admin/Super role to access the page",
        permanent: true,
      },
    };
  } else {
    const url = `${process.env.NEXT_PUBLIC_BASE_URL}/api/crm`;
    const options = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        getdailyreportslast5days: true,
      },
    };

    const url1 = `${process.env.NEXT_PUBLIC_BASE_URL}/api/crm`;
    const options1 = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        getnearestfollowups: true,
      },
    };

    let res = await fetchApi(url, options);
    let res1 = await fetchApi(url1, options1);

    if (!res.error && !res1.error) {
      return {
        props: {
          dailyReportStatus: res,
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
