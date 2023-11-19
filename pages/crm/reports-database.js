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
  const { data: session } = useSession();

  const [page, setPage] = useState(1);
  const [pageCount, setPageCount] = useState(0);

  const [isFiltered, setIsFiltered] = useState(0);

  const [marketersList, setMarketersList] = useState([]);

  const [manageData, setManageData] = useState({});

  const [editedBy, setEditedBy] = useState("");

  const [filters, setFilters] = useState({
    country: "",
    company_name: "",
    category: "",
    fromdate: "",
    todate: "",
    marketer_name: "",
    test: false,
    prospect: false,
  });

  const [reports, setReports] = useState([]);

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

  async function deleteReport() {
    let result;
    const res = await fetch(
      process.env.NEXT_PUBLIC_BASE_URL + "/api/approval",
      {
        method: "POST",
        body: JSON.stringify({
          req_type: "Report Delete",
          req_by: session.user.name,
          id: manageData._id,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
    result = await res.json();
    if (!result.error) {
      toast.success("Request sent for approval");
    }
  }

  async function editReport() {
    const url = `${process.env.NEXT_PUBLIC_BASE_URL}/api/crm`;
    const options = {
      method: "POST",
      body: JSON.stringify(manageData),
      headers: {
        "Content-Type": "application/json",
        editreport: true,
        name: session.user?.name,
      },
    };

    try {
      const result = await fetchApi(url, options);

      if (!result.error) {
        toast.success("Edited the report data");

        if (!isFiltered) await getAllReports();
        else await getAllReportsFiltered();
      } else {
        toast.error("Something gone wrong!");
      }
    } catch (error) {
      console.error("Error editing report:", error);
      toast.error("Error editing report");
    }
  }

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

  useEffect(() => {
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

  return (
    <>
      <Navbar
        navFor={session.user.role == "marketer" ? "call-reports" : "crm"}
      />
      <div className="containter">
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
                style={{ display: "flex", alignItems: "center" }}
                className="filter_stats_of me-3"
              >
                <input
                  type="checkbox"
                  id="myCheckbox"
                  className="form-check-input"
                  checked={filters.test}
                  onChange={(e) =>
                    setFilters({ ...filters, test: !filters.test })
                  }
                />

                <label htmlFor="myCheckbox" className="form-check-label">
                  Test Job
                </label>

                <input
                  type="checkbox"
                  id="myCheckbox2"
                  className="form-check-input"
                  checked={filters.prospect}
                  onChange={(e) =>
                    setFilters({ ...filters, prospect: !filters.prospect })
                  }
                />

                <label htmlFor="myCheckbox" className="form-check-label">
                  Prospecting
                </label>
              </div>

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
                  <th>LinkedIn</th>
                  <th>Test</th>
                  <th>Prospected</th>
                  <th>Manage</th>
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
                      <td className="text-wrap">{item.calling_status}</td>
                      <td>{item.linkedin}</td>
                      <td>{item.is_test ? "Yes" : "No"}</td>
                      <td>
                        {item.is_prospected
                          ? `Yes (${item.followup_done ? "Done" : "Pending"})`
                          : "No"}
                      </td>
                      <td
                        className="align-middle"
                        style={{ textAlign: "center" }}
                      >
                        <button
                          onClick={() => {
                            setManageData(item);
                            setEditedBy(item.updated_by ?? "");
                          }}
                          className="btn btn-sm btn-outline-primary me-1"
                          data-bs-toggle="modal"
                          data-bs-target="#editModal"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setManageData({ _id: item._id })}
                          className="btn btn-sm btn-outline-danger me-1"
                          data-bs-toggle="modal"
                          data-bs-target="#deleteModal"
                        >
                          Delete
                        </button>
                      </td>
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

      <div
        className="modal fade"
        id="editModal"
        tabIndex="-1"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
          <div className="modal-content">
            <div className="modal-header">
              <h1 className="modal-title fs-5" id="staticBackdropLabel">
                Edit Report Data
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
                  value={manageData.calling_date}
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
                  value={manageData.followup_date}
                  onChange={(e) =>
                    setManageData((prevData) => ({
                      ...prevData,
                      followup_date: e.target.value,
                    }))
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
                  value={manageData.country}
                  onChange={(e) =>
                    setManageData((prevData) => ({
                      ...prevData,
                      country: e.target.value,
                    }))
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
                  value={manageData.website}
                  onChange={(e) =>
                    setManageData((prevData) => ({
                      ...prevData,
                      website: e.target.value,
                    }))
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
                  value={manageData.category}
                  onChange={(e) =>
                    setManageData((prevData) => ({
                      ...prevData,
                      category: e.target.value,
                    }))
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
                  value={manageData.company_name}
                  onChange={(e) =>
                    setManageData((prevData) => ({
                      ...prevData,
                      company_name: e.target.value,
                    }))
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
                  value={manageData.contact_person}
                  onChange={(e) =>
                    setManageData((prevData) => ({
                      ...prevData,
                      contact_person: e.target.value,
                    }))
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
                  value={manageData.designation}
                  onChange={(e) =>
                    setManageData((prevData) => ({
                      ...prevData,
                      designation: e.target.value,
                    }))
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
                  value={manageData.contact_number}
                  onChange={(e) =>
                    setManageData((prevData) => ({
                      ...prevData,
                      contact_number: e.target.value,
                    }))
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
                  value={manageData.email_address}
                  onChange={(e) =>
                    setManageData((prevData) => ({
                      ...prevData,
                      email_address: e.target.value,
                    }))
                  }
                  type="email"
                  className="form-control"
                  id="email_address"
                />
              </div>
              <div className="mb-3">
                <label htmlFor="calling_status" className="form-label">
                  Calling Status
                </label>
                <input
                  value={manageData.calling_status}
                  onChange={(e) =>
                    setManageData((prevData) => ({
                      ...prevData,
                      calling_status: e.target.value,
                    }))
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
                  value={manageData.email_status}
                  onChange={(e) =>
                    setManageData((prevData) => ({
                      ...prevData,
                      email_status: e.target.value,
                    }))
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
                  onChange={(e) =>
                    setManageData((prevData) => ({
                      ...prevData,
                      feedback: e.target.value,
                    }))
                  }
                  value={manageData.feedback}
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
                  value={manageData.linkedin}
                  onChange={(e) =>
                    setManageData((prevData) => ({
                      ...prevData,
                      linkedin: e.target.value,
                    }))
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
                  value={manageData.leads_taken_feedback}
                  onChange={(e) =>
                    setManageData((prevData) => ({
                      ...prevData,
                      leads_taken_feedback: e.target.value,
                    }))
                  }
                  type="text"
                  className="form-control"
                  id="leads_taken_feedback"
                />
              </div>

              <div className="">
                <div className="form-check">
                  <input
                    type="checkbox"
                    id="myCheckbox"
                    className="form-check-input"
                    checked={manageData.is_test}
                    onChange={(e) =>
                      setManageData({
                        ...manageData,
                        is_test: !manageData.is_test,
                      })
                    }
                  />

                  <label htmlFor="myCheckbox" className="form-check-label">
                    Test Job
                  </label>
                </div>
              </div>
              <div className="mb-3">
                <div className="form-check">
                  <input
                    type="checkbox"
                    id="myCheckbox2"
                    className="form-check-input"
                    checked={manageData.is_prospected}
                    onChange={(e) =>
                      setManageData({
                        ...manageData,
                        is_prospected: !manageData.is_prospected,
                      })
                    }
                  />

                  <label htmlFor="myCheckbox" className="form-check-label">
                    Prospecting
                  </label>
                </div>
              </div>
            </div>
            <div className="modal-footer p-1">
              {editedBy ? (
                <div className="d-flex justify-content-start align-items-center me-auto text-body-secondary">
                  <span className="me-1">Last updated by </span>

                  <span className="fw-medium">{editedBy}</span>
                </div>
              ) : null}

              <button
                type="button"
                className="btn btn-sm btn-outline-secondary"
                data-bs-dismiss="modal"
              >
                Close
              </button>
              <button
                onClick={editReport}
                type="button"
                data-bs-dismiss="modal"
                className="btn btn-sm btn-outline-primary"
              >
                Update
              </button>
            </div>
          </div>
        </div>
      </div>

      <div
        className="modal fade"
        id="deleteModal"
        tabIndex="-1"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h1 className="modal-title fs-5" id="staticBackdropLabel">
                Delete Report Confirmation
              </h1>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              <p>Do you really want to delete this report?</p>
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
                onClick={deleteReport}
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