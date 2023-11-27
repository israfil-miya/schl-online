import React, { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "../../components/navbar";
import { useSession, SessionProvider, getSession } from "next-auth/react";
import { toast } from "sonner";
import { useRouter } from "next/router";

async function fetchApi(url, options) {
  const res = await fetch(url, options);
  const data = await res.json();
  return data;
}

export default function Marketers(props) {
  const router = useRouter();
  const { data: session } = useSession();
  const [marketersList, setMarketersList] = useState([]);
  const [dailyReportStatusRowHtml, setDailyReportStatusRowHtml] = useState();
  const [todayReportStatusRowHtml, setTodayReportStatusRowHtml] = useState();

  const [availableFollowUps, setAvailableFollowUps] = useState([]);

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

  const createDailyReportStatusTable = () => {
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
      </tr>,
    );

    return parsedTableRows;
  };
  const createTodayReportStatusTable = () => {
    let parsedTableRows = [];
    let total_calls_made = 0;
    let total_test_jobs = 0;
    let total_prospects = 0;

    props?.todayReportStatus.map((TodayReportOfMarketer, index) => {
      total_calls_made += parseInt(TodayReportOfMarketer.data.total_calls_made)
        ? parseInt(TodayReportOfMarketer.data.total_calls_made)
        : 0;
      total_test_jobs += parseInt(TodayReportOfMarketer.data.total_test_jobs)
        ? parseInt(TodayReportOfMarketer.data.total_test_jobs)
        : 0;
      total_prospects += parseInt(TodayReportOfMarketer.data.total_prospects)
        ? parseInt(TodayReportOfMarketer.data.total_prospects)
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
      </tr>,
    );

    return parsedTableRows;
  };

  useEffect(() => {
    setDailyReportStatusRowHtml(createDailyReportStatusTable());
    setTodayReportStatusRowHtml(createTodayReportStatusTable());
    setAvailableFollowUps(props.availableFollowUps);
    getMarketers();
  }, []);
  return (
    <>
      <Navbar navFor={session.user.role == "marketer" ? "marketers" : "crm"} />
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
                      <td className="">{marketer.name}</td>
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
              </tr>
            </thead>
            <tbody>
              {todayReportStatusRowHtml?.map((tableRow, index) => tableRow)}
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
              </tr>
            </thead>
            <tbody>
              {dailyReportStatusRowHtml?.map((tableRow, index) => tableRow)}
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
              {availableFollowUps?.length !== 0 ? (
                availableFollowUps?.map((followupdata, index) => {
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
    const url2 = `${process.env.NEXT_PUBLIC_BASE_URL}/api/crm`;
    const options2 = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        getdailyreportstoday: true,
      },
    };

    let res = await fetchApi(url, options);
    let res1 = await fetchApi(url1, options1);
    let res2 = await fetchApi(url2, options2);

    if (!res.error && !res1.error) {
      return {
        props: {
          dailyReportStatus: res,
          availableFollowUps: res1,
          todayReportStatus: res2,
        },
      };
    } else {
      return {
        props: {},
      };
    }
  }
}
