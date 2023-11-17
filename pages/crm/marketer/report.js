import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Navbar from "../../../components/navbar";
import { useSession, SessionProvider, getSession } from "next-auth/react";
import { toast } from "sonner";

export default function DailyReport() {
  const router = useRouter();
  const { data: session } = useSession();

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
    calling_date: getTodayDate(),
    followup_date: "",
    country: "",
    website: "",
    category: "",
    company_name: "",
    contact_person: "",
    designation: "",
    contact_number: "",
    email_address: "",
    calling_status: "",
    email_status: "",
    feedback: "",
    linkedin: "",
    leads_taken_feedback: "",
    is_test: false
  });

  const { name } = router.query;

  const AddNewReport = async (e) => {
    e.preventDefault();

    console.log(reportData);

    const res = await fetch(process.env.NEXT_PUBLIC_BASE_URL + "/api/crm", {
      method: "POST",
      body: JSON.stringify({
        ...reportData,
        marketer_id: session.user._id,
        marketer_name: session.user.name,
      }),
      headers: {
        newreport: true,
        "Content-Type": "application/json",
      },
    });
    const result = await res.json();
    if (!result.error) {
      toast.success("Submitted new report");
    } else toast.error(result.message);

    setReportData((prev) => ({
      ...prev,
      followup_date: "",
      country: "",
      website: "",
      category: "",
      company_name: "",
      contact_person: "",
      designation: "",
      contact_number: "",
      email_address: "",
      calling_status: "",
      email_status: "",
      feedback: "",
      linkedin: "",
      leads_taken_feedback: "",
      is_test: false
    }));
  };

  return (
    <>
      <Navbar navFor="crm" />
      <div className="container my-5">
        <div className="add-report">
          <h5 className="py-3">New Report</h5>
          <form onSubmit={AddNewReport} id="inputForm">
            <div className="mb-3">
              <label htmlFor="calling_date" className="form-label">
                Calling Date
              </label>
              <input
                disabled
                value={reportData.calling_date}
                type="date"
                className="form-control"
                id="calling_date"
              />
            </div>
            <div className="mb-3">
              <label htmlFor="followup_date" className="form-label">
                Followup Date
              </label>
              <input
                value={reportData.followup_date}
                onChange={(e) =>
                  setReportData({
                    ...reportData,
                    followup_date: e.target.value,
                  })
                }
                type="date"
                className="form-control"
                id="followup_date"
              />
            </div>
            <div className="mb-3">
              <label htmlFor="country" className="form-label">
                Country
              </label>
              <input
                value={reportData.country}
                onChange={(e) =>
                  setReportData({ ...reportData, country: e.target.value })
                }
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
                value={reportData.website}
                onChange={(e) =>
                  setReportData({ ...reportData, website: e.target.value })
                }
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
                value={reportData.category}
                onChange={(e) =>
                  setReportData({ ...reportData, category: e.target.value })
                }
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
                value={reportData.company_name}
                onChange={(e) =>
                  setReportData({ ...reportData, company_name: e.target.value })
                }
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
                value={reportData.contact_person}
                onChange={(e) =>
                  setReportData({
                    ...reportData,
                    contact_person: e.target.value,
                  })
                }
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
                value={reportData.designation}
                onChange={(e) =>
                  setReportData({ ...reportData, designation: e.target.value })
                }
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
                value={reportData.contact_number}
                onChange={(e) =>
                  setReportData({
                    ...reportData,
                    contact_number: e.target.value,
                  })
                }
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
                value={reportData.email_address}
                onChange={(e) =>
                  setReportData({
                    ...reportData,
                    email_address: e.target.value,
                  })
                }
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
                value={reportData.calling_status}
                onChange={(e) =>
                  setReportData({
                    ...reportData,
                    calling_status: e.target.value,
                  })
                }
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
                value={reportData.email_status}
                onChange={(e) =>
                  setReportData({ ...reportData, email_status: e.target.value })
                }
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
                value={reportData.feedback}
                onChange={(e) =>
                  setReportData({ ...reportData, feedback: e.target.value })
                }
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
                value={reportData.linkedin}
                onChange={(e) =>
                  setReportData({ ...reportData, linkedin: e.target.value })
                }
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
                value={reportData.leads_taken_feedback}
                onChange={(e) =>
                  setReportData({
                    ...reportData,
                    leads_taken_feedback: e.target.value,
                  })
                }
                type="text"
                className="form-control"
                id="leads_taken_feedback"
              />
            </div>
            <div className="mb-3">
              <div className="form-check">
                {/* Checkbox input */}
                <input
                  type="checkbox"
                  id="myCheckbox"
                  className="form-check-input"
                  checked={reportData.is_test}
                  onChange={(e) =>
                    setReportData({
                      ...reportData,
                      is_test: !reportData.is_test,
                    })
                  }
                />

                {/* Label for the checkbox */}
                <label htmlFor="myCheckbox" className="form-check-label">
                  Test Job
                </label>
              </div>
            </div>

            <button type="submit" className="btn btn-sm btn-outline-primary">
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
