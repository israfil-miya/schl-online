import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Navbar from "../../components/navbar";
import { useSession, SessionProvider, getSession } from "next-auth/react";
import { toast } from "sonner";

async function fetchApi(url, options) {
  const res = await fetch(url, options);
  const data = await res.json();
  return data;
}

export default function Report(props) {
  const router = useRouter();
  const { name } = router.query;

  const [page, setPage] = useState(1);
  const [pageCount, setPageCount] = useState(0);

  const [isFiltered, setIsFiltered] = useState(0);

  const [marketersList, setMarketersList] = useState([]);

  const [filters, setFilters] = useState({
    country: "",
    company_name: "",
    category: "",
    fromdate: "",
    todate: "",
    marketer_name: "",
  });

  const [reports, setReports] = useState([]);

  const [dailyReportsPage, setDailyReportsPage] = useState(1);
  const [dailyReportsPageCount, setDailyReportsPageCount] = useState(0);

  const [dailyReportsIsFiltered, setDailyReportsIsFiltered] = useState(0);

  const [dailyReportFilters, setDailyReportFilters] = useState({
    fromdate: "",
    todate: "",
    marketer_name: "",
  });

  const [dailyReports, setDailyReports] = useState([]);

  const [dailyReportStatusRowHtml, setDailyReportStatusRowHtml] = useState();

  async function getAllReports() {
    try {
      const url = `${process.env.NEXT_PUBLIC_BASE_URL}/api/crm`;
      const options = {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          getallreports: true,
          page,
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
          isfilter: true,
          ...filters,
        },
      };

      const list = await fetchApi(url, options);

      if (!list.error) {
        setReports(list);
        setIsFiltered(1);
      } else {
        setIsFiltered(0);
        await getAllReports();
      }
    } catch (error) {
      console.error("Error fetching reports:", error);
      toast.error("Error retrieving reports");
    }
  }

  async function getDailyReports() {
    try {
      const url = `${process.env.NEXT_PUBLIC_BASE_URL}/api/crm`;
      const options = {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          getdailyreports: true,
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

  const convertToDDMMYYYY = (dateString) => {
    const [year, month, day] = dateString.split("-");
    if (year.length != 4) return dateString;
    return `${day}-${month}-${year}`;
  };

  const getMarketersList = async () => {
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
        let marketersName = [];
        list.forEach((marketer, index) => {
          marketersName.push({
            _id: marketer._id,
            marketer_name: marketer.name,
          });
        });

        setMarketersList(marketersName);
      } else {
        toast.error("Unable to retrieve file list", { toastId: "error1" });
      }
    } catch (error) {
      console.error("Error fetching file list:", error);
      toast.error("Error retrieving file list", { toastId: "error3" });
    }
  };

  function handlePrevious() {
    setPage((p) => {
      if (p === 1) return p;
      return p - 1;
    });
  }
  function handleNext() {
    setPage((p) => {
      if (p === pageCount) return p;
      return p + 1;
    });
  }

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

  const createDailyStatusReportTable = () => {
    let parsedTableRows = [];
    props?.dailyReportStatus.map((FiveDayReportOfMarketer, index) => {
      parsedTableRows.push(
        <tr key={index}>
          <th
            style={{
              minWidth: "40px",
              maxWidth: "40px",
              padding: "0px 0px 0px 5px",
              backgroundColor: "#212529",
              color: "#fff",
            }}
          >
            {FiveDayReportOfMarketer.marketer_name}
          </th>
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
            {"No Follow Up"}
          </td>
        </tr>,
      );
    });
    setDailyReportStatusRowHtml(parsedTableRows);
  };

  useEffect(() => {
    createDailyStatusReportTable();
    getMarketersList();
  }, []);

  useEffect(() => {
    if (!isFiltered) getAllReports();
    if (reports) setPageCount(reports?.pagination?.pageCount);
  }, [reports?.pagination?.pageCount]);

  useEffect(() => {
    if (!isFiltered) getAllReports();
    else getAllReportsFiltered();
  }, [page]);

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
      <Navbar navFor="crm" />
      <div className="containter mb-5">
        <div className="daily-report mt-5">
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <div className=" mx-2 form-floating">
              <select
                required
                onChange={(e) =>
                  setFilters({ ...filters, marketer_name: e.target.value })
                }
                className="form-select"
                id="floatingSelectGrid"
              >
                <option
                  value={""}
                  defaultValue={true}
                  className="text-body-secondary"
                >
                  Select a marketer
                </option>
                {marketersList?.map((marketer, index) => {
                  return (
                    <>
                      <option key={index}>{marketer?.marketer_name}</option>
                    </>
                  );
                })}
              </select>
              <label htmlFor="floatingSelectGrid">Marketer filter</label>
            </div>
            <div className="mb-3 p-3 bg-light rounded border d-flex justify-content-center">
              <div
                className="filter_time me-3"
                style={{ display: "flex", alignItems: "center" }}
              >
                <strong>Date: </strong>
                <input
                  type="date"
                  className="form-control mx-2 custom-input"
                  value={filters.fromdate}
                  onChange={(e) =>
                    setFilters({ ...filters, fromdate: e.target.value })
                  }
                />
                <span> To </span>
                <input
                  type="date"
                  className="form-control ms-2 custom-input"
                  value={filters.todate}
                  onChange={(e) =>
                    setFilters({ ...filters, todate: e.target.value })
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
                  value={filters.country}
                  onChange={(e) =>
                    setFilters({ ...filters, country: e.target.value })
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
                  value={filters.category}
                  onChange={(e) =>
                    setFilters({ ...filters, category: e.target.value })
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
                  value={filters.company_name}
                  onChange={(e) =>
                    setFilters({ ...filters, company_name: e.target.value })
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
                    {page}/{pageCount}
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
                    disabled={page === 1}
                    onClick={handlePrevious}
                  >
                    Previous
                  </button>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-secondary"
                    disabled={page === pageCount}
                    onClick={handleNext}
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
                  <th>Email Status</th>
                  <th>Feedback</th>
                  <th>LinkedIn</th>
                  <th>Leads Taken Feedback</th>
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
                      <td>{item.email_status}</td>
                      <td className="text-wrap">{item.feedback}</td>
                      <td>{item.linkedin}</td>
                      <td className="text-wrap">{item.leads_taken_feedback}</td>
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
            <div className=" mx-2 form-floating">
              <select
                required
                onChange={(e) =>
                  setDailyReportFilters({
                    ...dailyReportFilters,
                    marketer_name: e.target.value,
                  })
                }
                className="form-select"
                id="floatingSelectGrid"
              >
                <option
                  value={""}
                  defaultValue={true}
                  className="text-body-secondary"
                >
                  Select a marketer
                </option>
                {marketersList?.map((marketer, index) => {
                  return (
                    <>
                      <option key={index} defaultValue={index == 0}>
                        {marketer?.marketer_name}
                      </option>
                    </>
                  );
                })}
              </select>
              <label htmlFor="floatingSelectGrid">Select a marketer</label>
            </div>
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

        <div className="daily-report-status mt-3">
          <h5 className="bg-light text-center p-2 mb-3 border">
            Daily Report Status (Last Five Business Day)
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
                <th
                  className="text-center"
                  style={{ backgroundColor: "#212529", color: "#fff" }}
                >
                  Follow Up
                </th>
              </tr>
            </thead>
            <tbody>
              {dailyReportStatusRowHtml?.map((tableRow, index) => tableRow)}
            </tbody>
          </table>
        </div>
      </div>
      <style jsx>
        {`
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

    let res = await fetchApi(url, options);

    if (!res.error) {
      return {
        props: { dailyReportStatus: res },
      };
    } else {
      return {
        props: {},
      };
    }
  }
}
