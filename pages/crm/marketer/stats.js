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

export default function MyStats(props) {
  const router = useRouter();
  const { name } = router.query;

  const [reportsPage, setReportsPage] = useState(1);
  const [reportsPageCount, setReportsPageCount] = useState(0);

  const [dailyReportsPage, setDailyReportsPage] = useState(1);
  const [dailyReportsPageCount, setDailyReportsPageCount] = useState(0);

  const [reportsIsFiltered, setReportsIsFiltered] = useState(0);
  const [dailyReportsIsFiltered, setDailyReportsIsFiltered] = useState(0);

  const [reportFilters, setReportFilters] = useState({
    country: "",
    company_name: "",
    category: "",
    fromdate: "",
    todate: "",
  });
  const [dailyReportFilters, setDailyReportFilters] = useState({
    fromdate: "",
    todate: "",
  });

  const [reports, setReports] = useState([]);
  const [dailyReports, setDailyReports] = useState([]);

  const [nearestFollowUps, setNearestFollowUps] = useState([]);

  async function getDailyReports() {
    try {
      const url = `${process.env.NEXT_PUBLIC_BASE_URL}/api/crm`;
      const options = {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          getdailyreports: true,
          marketer_name: name,
          dailyReportsPage,
        },
      };

      const list = await fetchApi(url, options);

      if (!list.error) {
        setDailyReports(list);
      } else {
        toast.error("Unable to retrieve reports");
      }
    } catch (error) {
      console.error("Error fetching reports:", error);
      toast.error("Error retrieving reports");
    }
  }
  async function getDailyReportsFiltered() {
    try {
      const url = `${process.env.NEXT_PUBLIC_BASE_URL}/api/crm`;
      const options = {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          getdailyreports: true,
          marketer_name: name,
          isfilter: true,
          ...dailyReportFilters,
        },
      };

      const list = await fetchApi(url, options);

      if (!list.error) {
        setDailyReports(list);
        setDailyReportsIsFiltered(1);
      } else {
        setDailyReportsIsFiltered(0);
        await getDailyReports();
      }
    } catch (error) {
      console.error("Error fetching reports:", error);
      toast.error("Error retrieving reports");
    }
  }

  async function getAllReports() {
    try {
      const url = `${process.env.NEXT_PUBLIC_BASE_URL}/api/crm`;
      const options = {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          getallreports: true,
          marketer_name: name,
          reportsPage,
        },
      };

      const list = await fetchApi(url, options);

      if (!list.error) {
        setReports(list);
      } else {
        toast.error("Unable to retrieve reports");
      }
    } catch (error) {
      console.error("Error fetching reports:", error);
      toast.error("Error retrieving reports");
    }
  }
  async function getAllReportsFiltered() {
    try {
      const url = `${process.env.NEXT_PUBLIC_BASE_URL}/api/crm`;
      const options = {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          getallreports: true,
          marketer_name: name,
          isfilter: true,
          ...reportFilters,
        },
      };

      const list = await fetchApi(url, options);

      if (!list.error) {
        setReports(list);
        setReportsIsFiltered(1);
      } else {
        setReportsIsFiltered(0);
        await getAllReports();
      }
    } catch (error) {
      console.error("Error fetching reports:", error);
      toast.error("Error retrieving reports");
    }
  }

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

  function handlePreviousDailyReports() {
    setDailyReportsPage((p) => {
      if (p === 1) return p;
      return p - 1;
    });
  }
  function handleNextDailyReports() {
    setDailyReportsPage((p) => {
      if (p === dailyReportsPageCount) return p;
      return p + 1;
    });
  }
  function handlePreviousReports() {
    setReportsPage((p) => {
      if (p === 1) return p;
      return p - 1;
    });
  }
  function handleNextReports() {
    setReportsPage((p) => {
      if (p === reportsPageCount) return p;
      return p + 1;
    });
  }

  useEffect(() => {
    console.log(props);
    setNearestFollowUps(props.nearestFollowUps);
  }, []);

  useEffect(() => {
    if (!reportsIsFiltered) getAllReports();
    if (reports) setReportsPageCount(reports?.pagination?.pageCount);
  }, [reports?.pagination?.pageCount]);

  useEffect(() => {
    if (!reportsIsFiltered) getAllReports();
    else getAllReportsFiltered();
  }, [reportsPage]);

  useEffect(() => {
    if (!dailyReportsIsFiltered) getDailyReports();
    if (dailyReports)
      setDailyReportsPageCount(dailyReports?.pagination?.pageCount);
  }, [dailyReports?.pagination?.pageCount]);

  useEffect(() => {
    if (!dailyReportsIsFiltered) getDailyReports();
    else getDailyReportsFiltered();
  }, [dailyReportsPage]);

  return (
    <>
      <Navbar navFor="crm" shortNote={name + " - STATS"} />
      <div className="containter">
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

        <div className="report-list mt-5">
          <h5 className="bg-light text-center p-2 mb-3 border">Call Reports</h5>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <div className="mb-3 p-3 bg-light rounded border d-flex justify-content-center">
              <div
                className="filter_time me-3"
                style={{ display: "flex", alignItems: "center" }}
              >
                <strong>Date: </strong>
                <input
                  type="date"
                  className="form-control mx-2 custom-input"
                  value={reportFilters.fromdate}
                  onChange={(e) =>
                    setReportFilters({
                      ...reportFilters,
                      fromdate: e.target.value,
                    })
                  }
                />
                <span> To </span>
                <input
                  type="date"
                  className="form-control ms-2 custom-input"
                  value={reportFilters.todate}
                  onChange={(e) =>
                    setReportFilters({
                      ...reportFilters,
                      todate: e.target.value,
                    })
                  }
                />
              </div>

              <div
                style={{ display: "flex", alignItems: "center" }}
                className="filter_folder me-3"
              >
                <strong>Country: </strong>
                <input
                  type="text"
                  placeholder="Country"
                  className="form-control ms-2 custom-input"
                  value={reportFilters.country}
                  onChange={(e) =>
                    setReportFilters({
                      ...reportFilters,
                      country: e.target.value,
                    })
                  }
                />
              </div>

              <div
                style={{ display: "flex", alignItems: "center" }}
                className="filter_task me-3"
              >
                <strong>Category: </strong>
                <input
                  type="text"
                  placeholder="Category"
                  className="form-control ms-2 custom-input"
                  value={reportFilters.category}
                  onChange={(e) =>
                    setReportFilters({
                      ...reportFilters,
                      category: e.target.value,
                    })
                  }
                />
              </div>

              <div
                style={{ display: "flex", alignItems: "center" }}
                className="filter_task me-3"
              >
                <strong>Company: </strong>
                <input
                  type="text"
                  placeholder="Company Name"
                  className="form-control ms-2 custom-input"
                  value={reportFilters.company_name}
                  onChange={(e) =>
                    setReportFilters({
                      ...reportFilters,
                      company_name: e.target.value,
                    })
                  }
                />
              </div>

              <button
                onClick={getAllReportsFiltered}
                className="btn ms-4 btn-sm btn-outline-primary"
              >
                Search
              </button>
            </div>
          </div>

          {reports?.items?.length !== 0 && (
            <div className="container mb-5">
              <div
                className="float-end"
                style={{ display: "flex", alignItems: "center" }}
              >
                <span className="me-3">
                  Page{" "}
                  <strong>
                    {reportsPage}/{reportsPageCount}
                  </strong>
                </span>
                <div
                  className="btn-group"
                  role="group"
                  aria-label="Basic outlined example"
                >
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-secondary"
                    disabled={reportsPage === 1}
                    onClick={handlePreviousReports}
                  >
                    Previous
                  </button>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-secondary"
                    disabled={reportsPage === reportsPageCount}
                    onClick={handleNextReports}
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}

          <div style={{ overflowX: "auto" }} className="text-nowrap">
            <table className="table table-bordered table-hover">
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
                </tr>
              </thead>
              <tbody>
                {reports?.items?.length ? (
                  reports?.items?.map((item, index) => (
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
                    </tr>
                  ))
                ) : (
                  <tr key={0}>
                    <td colSpan="13" className=" align-center text-center">
                      No Reports To Show.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        <div className="daily-report mt-3">
          <h5 className="bg-light text-center p-2 mb-3 border">
            Daily Reports
          </h5>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <div className="mb-3 p-3 bg-light rounded border d-flex justify-content-center">
              <div
                className="filter_time me-3"
                style={{ display: "flex", alignItems: "center" }}
              >
                <strong>Date: </strong>
                <input
                  type="date"
                  className="form-control mx-2 custom-input"
                  value={dailyReportFilters.fromdate}
                  onChange={(e) =>
                    setDailyReportFilters({
                      ...dailyReportFilters,
                      fromdate: e.target.value,
                    })
                  }
                />
                <span> To </span>
                <input
                  type="date"
                  className="form-control ms-2 custom-input"
                  value={dailyReportFilters.todate}
                  onChange={(e) =>
                    setDailyReportFilters({
                      ...dailyReportFilters,
                      todate: e.target.value,
                    })
                  }
                />
              </div>

              <button
                onClick={getDailyReportsFiltered}
                className="btn ms-4 btn-sm btn-outline-primary"
              >
                Search
              </button>
            </div>
          </div>

          {dailyReports?.items?.length !== 0 && (
            <div className="container mb-5">
              <div
                className="float-end"
                style={{ display: "flex", alignItems: "center" }}
              >
                <span className="me-3">
                  Page{" "}
                  <strong>
                    {dailyReportsPage}/{dailyReportsPageCount}
                  </strong>
                </span>
                <div
                  className="btn-group"
                  role="group"
                  aria-label="Basic outlined example"
                >
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-secondary"
                    disabled={dailyReportsPage === 1}
                    onClick={handlePreviousDailyReports}
                  >
                    Previous
                  </button>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-secondary"
                    disabled={dailyReportsPage === dailyReportsPageCount}
                    onClick={handleNextDailyReports}
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}

          <div style={{ overflowX: "auto" }} className="text-nowrap">
            <table className="table table-bordered table-hover">
              <thead>
                <tr className="table-dark">
                  <th>#</th>
                  <th>Report Date</th>
                  <th>Calls Made</th>
                  <th>Contacts Made</th>
                  <th>Prospects</th>
                  <th>Test Jobs</th>
                </tr>
              </thead>
              <tbody>
                {dailyReports?.items?.length ? (
                  dailyReports?.items?.map((item, index) => (
                    <tr key={index}>
                      <td>{index + 1}</td>
                      <td>
                        {item.report_date
                          ? convertToDDMMYYYY(item.report_date)
                          : ""}
                      </td>
                      <td>{item.calls_made}</td>
                      <td>{item.contacts_made}</td>
                      <td>{item.prospects}</td>
                      <td>{item.test_jobs}</td>
                    </tr>
                  ))
                ) : (
                  <tr key={0}>
                    <td colSpan="16" className=" align-center text-center">
                      No Reports To Show.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
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
