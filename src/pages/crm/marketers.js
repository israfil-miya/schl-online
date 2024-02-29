import React, { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/navbar";
import { useSession, SessionProvider, getSession } from "next-auth/react";
import { toast } from "sonner";
import { useRouter } from "next/router";
const moment = require("moment-timezone");

async function fetchApi(url, options) {
  const res = await fetch(url, options);
  const data = await res.json();
  return data;
}

export default function Marketers(props) {
  const router = useRouter();
  const { data: session } = useSession();

  const [marketersList, setMarketersList] = useState([]);
  const [availableFollowups, setAvailableFollowups] = useState([]);
  const [dailyReportStatusRowHtml, setDailyReportStatusRowHtml] = useState([]);
  const [todayReportStatusRowHtml, setTodayReportStatusRowHtml] = useState([]);
  const [fromTimePeriod, setFromTimePeriod] = useState(
    moment().subtract(5, "days").tz("Asia/Dhaka").format("YYYY-MM-DD"),
  );
  const [toTimePeriod, setToTimePeriod] = useState(
    moment().tz("Asia/Dhaka").format("YYYY-MM-DD"),
  );

  const [dailyReportStatusLoading, setDailyReportStatusLoading] =
    useState(false);

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
        toast.error("Unable to retrieve marketers list", { toastId: "error1" });
      }
    } catch (error) {
      console.error("Error fetching marketers list:", error);
      toast.error("Error retrieving marketers list", { toastId: "error3" });
    }
  };

  function countDays(fromDate, toDate) {
    const from_date = new Date(fromDate);
    const to_date = new Date(toDate);

    console.log(from_date, to_date, fromDate, toDate);

    const timeDifference = to_date.getTime() - from_date.getTime();
    const daysDifference = Math.floor(timeDifference / (1000 * 3600 * 24));
    return daysDifference;
  }

  const getAvailableFollowups = async () => {
    try {
      const url = `${process.env.NEXT_PUBLIC_BASE_URL}/api/crm`;
      const options = {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          getnearestfollowups: true,
        },
      };

      const list = await fetchApi(url, options);

      if (!list.error) {
        setAvailableFollowups(list);
      } else {
        toast.error("Unable to retrieve followup list", { toastId: "error1" });
      }
    } catch (error) {
      console.error("Error fetching followup list:", error);
      toast.error("Error retrieving followup list", { toastId: "error3" });
    }
  };

  const getTodayReportStatus = async () => {
    try {
      const url = `${process.env.NEXT_PUBLIC_BASE_URL}/api/crm`;
      const options = {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          getdailyreportstoday: true,
        },
      };

      const list = await fetchApi(url, options);

      if (!list.error) {
        return list;
      } else {
        toast.error("Unable to retrieve today report status list", {
          toastId: "error1",
        });
        return null;
      }
    } catch (error) {
      console.error("Error fetching today report status list:", error);
      toast.error("Error retrieving today report status list", {
        toastId: "error3",
      });
    }
  };

  const convertToDDMMYYYY = (dateString) => {
    if (!dateString) return "";
    const [year, month, day] = dateString.split("-");
    if (year.length != 4) return dateString;
    return `${day}-${month}-${year}`;
  };

  const getDailyReportStatus = async (fromtime, totime) => {
    try {
      setDailyReportStatusLoading(true);

      const url = `${process.env.NEXT_PUBLIC_BASE_URL}/api/crm`;
      const options = {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          getdailyreportslastdays: true,
          fromtime,
          totime,
        },
      };

      const list = await fetchApi(url, options);

      if (!list.error) {
        return list;
      } else {
        toast.error("Unable to retrieve daily report status list", {
          toastId: "error1",
        });
        return null;
      }
    } catch (error) {
      console.error("Error fetching daily report status list:", error);
      toast.error("Error retrieving daily report status list", {
        toastId: "error3",
      });
    } finally {
      setDailyReportStatusLoading(false); // Set loading state to false after completion
    }
  };

  const createDailyReportStatusTable = async () => {
    let parsedTableRows = [];
    let total_calls_made = 0;
    let total_test_jobs = 0;
    let total_prospects = 0;
    let total_leads = 0;

    let reportTimePeriod = countDays(fromTimePeriod, toTimePeriod);

    if (reportTimePeriod < 0) {
      toast.error("From date can't be more recent than To date");
      return null;
    } else {
      let dailyReportStatus = await getDailyReportStatus(
        fromTimePeriod,
        toTimePeriod,
      );

      dailyReportStatus?.map((FiveDayReportOfMarketer, index) => {
        total_calls_made += parseInt(
          FiveDayReportOfMarketer.data.total_calls_made,
        )
          ? parseInt(FiveDayReportOfMarketer.data.total_calls_made)
          : 0;
        total_test_jobs += parseInt(
          FiveDayReportOfMarketer.data.total_test_jobs,
        )
          ? parseInt(FiveDayReportOfMarketer.data.total_test_jobs)
          : 0;
        total_prospects += parseInt(
          FiveDayReportOfMarketer.data.total_prospects,
        )
          ? parseInt(FiveDayReportOfMarketer.data.total_prospects)
          : 0;
        total_leads += parseInt(FiveDayReportOfMarketer.data.total_leads)
          ? parseInt(FiveDayReportOfMarketer.data.total_leads)
          : 0;
        parsedTableRows.push(
          <tr key={index}>
            <td
              style={{
                maxWidth: "5px",
                padding: "0px 0px 0px 5px",
                backgroundColor: "#212529",
                color: "#fff",
              }}
            >
              {index + 1}. {FiveDayReportOfMarketer.marketer_name}
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
            <td className="text-center" style={{ padding: "0px" }}>
              {FiveDayReportOfMarketer.data.total_leads}
            </td>
          </tr>,
        );
      });

      parsedTableRows.push(
        <tr className="table-secondary">
          <th
            style={{
              maxWidth: "5px",
              padding: "0px 0px 0px 5px",
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
          <th className="text-center" style={{ padding: "0px" }}>
            {total_leads}
          </th>
        </tr>,
      );

      setDailyReportStatusRowHtml(parsedTableRows);
    }
  };

  const createTodayReportStatusTable = async () => {
    let parsedTableRows = [];
    let total_calls_made = 0;
    let total_test_jobs = 0;
    let total_prospects = 0;
    let total_leads = 0;

    let todayReportStatus = await getTodayReportStatus();

    todayReportStatus.map((TodayReportOfMarketer, index) => {
      total_calls_made += parseInt(TodayReportOfMarketer.data.total_calls_made)
        ? parseInt(TodayReportOfMarketer.data.total_calls_made)
        : 0;
      total_test_jobs += parseInt(TodayReportOfMarketer.data.total_test_jobs)
        ? parseInt(TodayReportOfMarketer.data.total_test_jobs)
        : 0;
      total_prospects += parseInt(TodayReportOfMarketer.data.total_prospects)
        ? parseInt(TodayReportOfMarketer.data.total_prospects)
        : 0;
      total_leads += parseInt(TodayReportOfMarketer.data.total_leads)
        ? parseInt(TodayReportOfMarketer.data.total_leads)
        : 0;
      parsedTableRows.push(
        <tr key={index}>
          <td
            style={{
              maxWidth: "5px",
              padding: "0px 0px 0px 5px",
              backgroundColor: "#212529",
              color: "#fff",
            }}
          >
            {index + 1}. {TodayReportOfMarketer.marketer_name}
          </td>
          <td className="text-center" style={{ padding: "0px" }}>
            {TodayReportOfMarketer.data.total_calls_made}
          </td>
          <td className="text-center" style={{ padding: "0px" }}>
            {TodayReportOfMarketer.data.total_prospects}
          </td>
          <td className="text-center" style={{ padding: "0px" }}>
            {TodayReportOfMarketer.data.total_test_jobs}
          </td>
          <td className="text-center" style={{ padding: "0px" }}>
            {TodayReportOfMarketer.data.total_leads}
          </td>
        </tr>,
      );
    });

    parsedTableRows.push(
      <tr className="table-secondary">
        <th
          style={{
            maxWidth: "5px",
            padding: "0px 0px 0px 5px",
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
        <th className="text-center" style={{ padding: "0px" }}>
          {total_leads}
        </th>
      </tr>,
    );

    setTodayReportStatusRowHtml(parsedTableRows);
  };

  useEffect(() => {
    createDailyReportStatusTable();
    createTodayReportStatusTable();
    getAvailableFollowups();
    getMarketers();
  }, []);

  return (
    <>
      <Navbar
        navFor={session.user.role == "marketer" ? "marketers" : "crm"}
        shortNote={session.user?.real_name}
      />
      {marketersList.length > 0 &&
      dailyReportStatusRowHtml.length > 0 &&
      availableFollowups.length > 0 ? (
        <div className="container">
          <div className="marketers-list my-5">
            <h5 className="bg-light text-center p-2 mb-3 border">
              Marketers List
            </h5>

            <table className="table table-hover">
              <thead>
                <tr className="table-dark">
                  <th>#</th>
                  <th>Real Name</th>
                  <th>Marketer Name</th>
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
                        <td>{marketer.real_name}</td>
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

          <div className="today-report-status mt-3">
            <h5 className="bg-light text-center p-2 mb-3 border">
              Daily Report Status (Today)
            </h5>

            <table className="table table-bordered table-hover">
              <thead>
                <tr>
                  <th
                    className="text-center"
                    style={{ backgroundColor: "#212529", color: "#fff" }}
                  >
                    Name
                  </th>

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
                  <th
                    className="text-center"
                    style={{ backgroundColor: "#212529", color: "#fff" }}
                  >
                    Leads
                  </th>
                </tr>
              </thead>
              <tbody>
                {todayReportStatusRowHtml?.map((tableRow, index) => tableRow)}
              </tbody>
            </table>
          </div>

          <div className="daily-report-status mt-3">
            <h5 className="bg-light text-center justify-content-center align-center d-flex p-2 mb-3 border">
              <span className="mt-2">Daily Report Status</span>
              <div className="px-5" style={{ maxWidth: "60%" }}>
                <div id="datePicker" className="input-group">
                  <input
                    type="date"
                    id="fromDate"
                    className="form-control custom-input"
                    value={fromTimePeriod}
                    onChange={(e) => setFromTimePeriod(e.target.value)}
                  />
                  <span className="input-group-text">to</span>
                  <input
                    type="date"
                    id="toDate"
                    className="form-control custom-input"
                    value={toTimePeriod}
                    onChange={(e) => setToTimePeriod(e.target.value)}
                  />
                  <button
                    onClick={createDailyReportStatusTable}
                    className="btn btn-outline-primary btn-small"
                  >
                    Filter
                  </button>
                </div>
              </div>
            </h5>

            <table className="table table-bordered table-hover">
              <thead>
                <tr>
                  <th
                    className="text-center"
                    style={{ backgroundColor: "#212529", color: "#fff" }}
                  >
                    Name
                  </th>

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
                  <th
                    className="text-center"
                    style={{ backgroundColor: "#212529", color: "#fff" }}
                  >
                    Leads
                  </th>
                </tr>
              </thead>
              <tbody>
                {dailyReportStatusLoading ? (
                  <tr key={0}>
                    <td colSpan="5" className="text-center">
                      Loading...
                    </td>
                  </tr>
                ) : (
                  dailyReportStatusRowHtml?.map((tableRow, index) => tableRow)
                )}
              </tbody>
            </table>
          </div>

          <div className="followup-list my-5 text-nowrap">
            <h5 className="bg-light text-center p-2 mb-3 border">
              Available Followups
            </h5>

            <table className="table table-hover">
              <thead>
                <tr className="table-dark">
                  <th>#</th>
                  <th>Marketer Name</th>
                  <th>Remaining Followup</th>
                  <th>Nearest Date</th>
                </tr>
              </thead>
              <tbody>
                {availableFollowups?.length !== 0 ? (
                  availableFollowups?.map((followupdata, index) => {
                    return (
                      <tr key={index}>
                        <td>{index + 1}</td>
                        <td className="marketer_name text-decoration-underline">
                          <Link
                            target="_blank"
                            href={
                              process.env.NEXT_PUBLIC_BASE_URL +
                              "/crm/followup/" +
                              followupdata.marketer_name
                            }
                          >
                            {followupdata.marketer_name}
                          </Link>
                        </td>

                        <td className="text-wrap">
                          {followupdata.followups_count}
                        </td>
                        <td className="text-wrap">
                          {convertToDDMMYYYY(followupdata.followup_date)}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td className="text-center" colSpan="3">
                      No avaiable followup
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <p className="text-center my-3">Loading...</p>
      )}

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
    (session.user.role != "admin" &&
      session.user.role != "super" &&
      session.user.role != "marketer")
  ) {
    return {
      redirect: {
        destination: "/?error=You need Admin/Super role to access the page",
        permanent: true,
      },
    };
  } else {
    return {
      props: {},
    };
  }
}
