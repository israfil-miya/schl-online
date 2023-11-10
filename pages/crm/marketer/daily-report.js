import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Navbar from "../../../components/navbar";
import { getSession, useSession } from "next-auth/react";
import toast from "react-hot-toast";

export default function DailyReport() {
  const router = useRouter();
  const { data: session } = useSession();
  const { name } = router.query;

  const getTodayDate = () => {
    const today = new Date();

    const formatDate = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    };

    return formatDate(today);
  };
  const [reportData, setReportData] = useState({
    report_date: getTodayDate(),
    marketer_name: session.user.name,
    calls_made: "",
    contacts_made: "",
    prospects: "",
    test_jobs: "",
  });

  const [existingReport, setExistingReport] = useState({});

  const AddDailyReport = async (e) => {
    if (e) e.preventDefault();

    console.log(reportData);

    const res = await fetch(process.env.NEXT_PUBLIC_BASE_URL + "/api/crm", {
      method: "POST",
      body: JSON.stringify({
        ...reportData,
      }),
      headers: {
        dailyreport: true,
        "Content-Type": "application/json",
      },
    });
    const result = await res.json();
    if (!result.error) {
      if (result.newReport) {
        console.log(result);
        toast.success("Submitted today's report");
      } else {
        setExistingReport({
          report_date: result.prevData.report_date,
          marketer_name: result.prevData.marketer_name,
          calls_made: result.prevData.calls_made,
          contacts_made: result.prevData.contacts_made,
          prospects: result.prevData.prospects,
          test_jobs: result.prevData.test_jobs,
        });
      }
    } else toast.error(result.message);

    setReportData((prev) => ({
      ...prev,
      calls_made: "",
      contacts_made: "",
      prospects: "",
      test_jobs: "",
    }));
  };

  return (
    <>
      <Navbar navFor="crm" />
      <div className="container my-5">
        <div className="add-today-report">
          <h5 className="py-3">Today&apos;s Report</h5>
          {existingReport.report_date && (
            <small style={{ color: "red" }}>
              Today&apos;s report already have been submitted!
            </small>
          )}
          <form
            aria-disabled={existingReport.report_date}
            onSubmit={AddDailyReport}
            id="inputForm"
          >
            <div className="mb-3">
              <label htmlFor="calling_date" className="form-label">
                Report Date
              </label>
              <input
                disabled
                value={reportData.report_date}
                type="date"
                className="form-control"
                id="calling_date"
              />
            </div>
            <div className="mb-3">
              <label htmlFor="followup_date" className="form-label">
                Marketer Name
              </label>
              <input
                disabled
                value={reportData.marketer_name}
                type="string"
                className="form-control"
                id="followup_date"
              />
            </div>
            <div className="mb-3">
              <label htmlFor="country" className="form-label">
                Total Calls Made
              </label>
              <input
                disabled={existingReport.report_date}
                value={reportData.calls_made}
                onChange={(e) =>
                  setReportData({ ...reportData, calls_made: e.target.value })
                }
                type="number"
                className="form-control"
                id="country"
              />
            </div>
            <div className="mb-3">
              <label htmlFor="website" className="form-label">
                Total Contacts Made
              </label>
              <input
                disabled={existingReport.report_date}
                value={reportData.contacts_made}
                onChange={(e) =>
                  setReportData({
                    ...reportData,
                    contacts_made: e.target.value,
                  })
                }
                type="number"
                className="form-control"
                id="website"
              />
            </div>
            <div className="mb-3">
              <label htmlFor="category" className="form-label">
                Total Prospects
              </label>
              <input
                disabled={existingReport.report_date}
                value={reportData.prospects}
                onChange={(e) =>
                  setReportData({ ...reportData, prospects: e.target.value })
                }
                type="number"
                className="form-control"
                id="category"
              />
            </div>
            <div className="mb-3">
              <label htmlFor="company_name" className="form-label">
                Test Jobs
              </label>
              <input
                disabled={existingReport.report_date}
                value={reportData.test_jobs}
                onChange={(e) =>
                  setReportData({ ...reportData, test_jobs: e.target.value })
                }
                type="number"
                className="form-control"
                id="company_name"
              />
            </div>

            <button
              disabled={existingReport.report_date}
              type="submit"
              className="btn btn-sm btn-outline-primary"
            >
              Submit
            </button>
          </form>
        </div>
      </div>
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
  if (!session || session.user.role != "marketer") {
    return {
      redirect: {
        destination: "/?error=You need Marketer role to access the page",
        permanent: true,
      },
    };
  } else
    return {
      props: {},
    };
}
