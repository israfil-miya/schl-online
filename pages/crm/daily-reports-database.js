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

export default function DailyReportsDatabase() {
  const router = useRouter();
  const { data: session } = useSession();
  const { name } = router.query;

  const [marketersList, setMarketersList] = useState([]);

  const [dailyReportsPage, setDailyReportsPage] = useState(1);
  const [dailyReportsPageCount, setDailyReportsPageCount] = useState(0);

  const [dailyReportsIsFiltered, setDailyReportsIsFiltered] = useState(0);

  const [dailyReportFilters, setDailyReportFilters] = useState({
    fromdate: "",
    todate: "",
    marketer_name: "",
  });

  const [dailyReports, setDailyReports] = useState([]);

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

  useEffect(() => {
    if (!dailyReportsIsFiltered) getDailyReports();
    if (dailyReports)
      setDailyReportsPageCount(dailyReports?.pagination?.pageCount);
  }, [dailyReports?.pagination?.pageCount]);

  useEffect(() => {
    if (!dailyReportsIsFiltered) getDailyReports();
    else getDailyReportsFiltered();
  }, [dailyReportsPage]);

  useEffect(() => {
    getMarketersList();
  }, []);

  return (
    <>
      <Navbar navFor={session.user.role == "marketer" ? "daily-reports" : "crm"} />
      <div className="container">
        <div className="daily-report my-5">
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
