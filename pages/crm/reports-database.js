import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Navbar from "../../components/navbar";
import { useSession, SessionProvider, getSession } from "next-auth/react";
import { toast } from "sonner";
import CallingStatusTd from "../../components/extandable-td";
import Link from "next/link";
const moment = require("moment-timezone");

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
  const [itemPerPage, setItemPerPage] = useState(30)

  const [isFiltered, setIsFiltered] = useState(0);
  const [isRecall, setIsRecall] = useState(0);

  const [marketersList, setMarketersList] = useState([]);

  const [manageData, setManageData] = useState({
    _id: "",
    marketer_id: "",
    marketer_name: "",
    calling_date: "",
    followup_date: "",
    country: "",
    designation: "",
    website: "",
    category: "",
    company_name: "",
    contact_person: "",
    contact_number: "",
    email_address: "",
    calling_status: "",
    linkedin: "",
    calling_date_history: [],
    updated_by: "",
    followup_done: false,
    is_test: false,
    is_prospected: false,
  });

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
    generalsearchstring: "",
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
          item_per_page: itemPerPage
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
          page,
          item_per_page: itemPerPage
        },
      };

      const list = await fetchApi(url, options);

      if (!list.error) {
        console.log(list);
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
    try {
      const url = `${process.env.NEXT_PUBLIC_BASE_URL}/api/crm`;
      let options;

      let submitData = manageData;

      if (isRecall) {
        // console.log("|| RECALL CALLED ||");
        const today = moment().utc().format("YYYY-MM-DD");

        options = {
          method: "POST",
          body: JSON.stringify({
            ...manageData,
            calling_date_history: manageData.calling_date_history.includes(
              today,
            )
              ? manageData.calling_date_history
              : [...manageData.calling_date_history, today],
          }),
          headers: {
            "Content-Type": "application/json",
            editreport: true,
            name: session.user?.name,
          },
        };

        if (
          reports.items.find(
            (data) => data.followup_date == today && data._id == submitData._id,
          )
        ) {
          // console.log("RECALL ACCEPTED");
          // console.log(submitData);

          const result = await fetchApi(url, options);

          setManageData({
            _id: "",
            marketer_id: "",
            marketer_name: "",
            calling_date: "",
            followup_date: "",
            country: "",
            designation: "",
            website: "",
            category: "",
            company_name: "",
            contact_person: "",
            contact_number: "",
            email_address: "",
            calling_status: "",
            linkedin: "",
            calling_date_history: [],
            updated_by: "",
            followup_done: false,
            is_test: false,
            is_prospected: false,
          });
          setIsRecall(0);

          if (!result.error) {
            toast.success("Edited the report data");

            if (!isFiltered) await getAllReports();
            else await getAllReportsFiltered();
          } else {
            toast.error("Something gone wrong!");
          }

          // return
        } else {
          // console.log("RECALL REJECTED");

          const submitData = {
            req_type: "Report Edit",
            req_by: session.user.name,
            id: manageData._id,
            ...manageData,
            calling_date_history: manageData.calling_date_history.includes(
              today,
            )
              ? manageData.calling_date_history
              : [...manageData.calling_date_history, today],
            updated_by: session.user?.name,
          };

          delete submitData._id;

          // console.log("THIS IS THE SUBMIT DATA: ", submitData);

          const result = await fetch(
            process.env.NEXT_PUBLIC_BASE_URL + "/api/approval",
            {
              method: "POST",
              body: JSON.stringify(submitData),
              headers: {
                "Content-Type": "application/json",
              },
            },
          );

          setManageData({
            _id: "",
            marketer_id: "",
            marketer_name: "",
            calling_date: "",
            followup_date: "",
            country: "",
            designation: "",
            website: "",
            category: "",
            company_name: "",
            contact_person: "",
            contact_number: "",
            email_address: "",
            calling_status: "",
            linkedin: "",
            calling_date_history: [],
            updated_by: "",
            followup_done: false,
            is_test: false,
            is_prospected: false,
          });
          setIsRecall(0);

          if (!result.error) {
            toast.success(
              "Today is not the followup date of the report to recall, an approval request has been sent to admin",
            );
          } else {
            toast.error("Something gone wrong!");
          }
        }

        return;
      }

      options = {
        method: "POST",
        body: JSON.stringify(submitData),
        headers: {
          "Content-Type": "application/json",
          editreport: true,
          name: session.user?.name,
        },
      };

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
    setManageData({
      _id: "",
      marketer_id: "",
      marketer_name: "",
      calling_date: "",
      followup_date: "",
      country: "",
      website: "",
      category: "",
      company_name: "",
      contact_person: "",
      contact_number: "",
      email_address: "",
      calling_status: "",
      linkedin: "",
      calling_date_history: [],
      updated_by: "",
      followup_done: false,
      is_test: false,
      is_prospected: false,
    });
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
    setPage(1);
    if (!isFiltered) getAllReports();
    if (reports) setPageCount(reports?.pagination?.pageCount);
  }, [reports?.pagination?.pageCount]);

  useEffect(() => {
    if (reports?.pagination?.pageCount == 1) return;

    if (!isFiltered) getAllReports();
    else getAllReportsFiltered();
  }, [page, itemPerPage]);

  /*
  Future Note:
  This page has pagination bugs corrected.
  Others page's pagination need to be like this, other pages still contains the pagination bugs.
  
  Changes made in files to correct the bug:
    1. api/crm
    2. crm/reports-database
  */

  return (
    <>
      <Navbar
        navFor={session.user.role == "marketer" ? "call-reports" : "crm"}
      />
      <div className="containter">
        <div className="d-flex mt-3">
          <div className="container">
            <div
              className="float-end"
              style={{ display: "flex", alignItems: "center" }}
            >
              <span className="me-3">
                Page{" "}
                <strong>
                  {reports?.items?.length !== 0 ? page : 0}/{pageCount}
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
                  disabled={page === pageCount || pageCount === 0}
                  onClick={handleNext}
                >
                  Next
                </button>
              </div>

              <select disabled={!reports?.items?.length} style={{width: "70px"}} value={itemPerPage} onChange={(e)=>setItemPerPage(e.target.value)} className="form-select ms-2 me-2 form-select-sm" aria-label="Small select example">
                <option value="10">10</option>
                <option value="30">30</option>
                <option value="70">70</option>
                <option value="100">100</option>
              </select>

              <button
                type="button"
                data-bs-toggle="offcanvas"
                data-bs-target="#offcanvasNavbar"
                aria-controls="offcanvasNavbar"
                aria-label="Toggle navigation"
                className="btn m-2 btn-sm btn-outline-primary"
              >
                Filter
              </button>
            </div>
          </div>
        </div>

        <div style={{ overflowX: "auto" }} className="text-nowrap">
          <table className="table table-bordered table-hover">
            <thead>
              <tr className="table-dark">
                <th>#</th>
                <th>Calling Date</th>
                <th>Marketer</th>
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
                    <td>{item.marketer_name}</td>
                    <td>
                      {item.followup_date
                        ? convertToDDMMYYYY(item.followup_date)
                        : ""}
                    </td>

                    <td>{item.country}</td>
                    <td>
                      {item.website.length
                        ? item.website
                          .split(" ")
                          .filter((item) => item.length)
                          .map((websiteLink, index) => (
                            <p
                              key={index}
                              className="text-primary m-0 p-0 link"
                            >
                              <Link target="_blank" href={websiteLink}>
                                Click here to visit
                              </Link>
                            </p>
                          ))
                        : "No link provided"}
                    </td>
                    <td>{item.category}</td>
                    <td className="text-wrap">{item.company_name}</td>
                    <td className="text-wrap">{item.contact_person}</td>
                    <td>{item.designation}</td>
                    <td className="text-wrap">{item.contact_number}</td>
                    <td className="text-wrap">{item.email_address}</td>
                    <CallingStatusTd data={item.calling_status} />
                    <td>
                      {item.linkedin.length
                        ? item.linkedin
                          .split(" ")
                          .filter((item) => item.length)
                          .map((linkedinLink, index) => (
                            <p
                              key={index}
                              className="text-primary m-0 p-0 link"
                            >
                              <Link target="_blank" href={linkedinLink}>
                                Click here to visit
                              </Link>
                            </p>
                          ))
                        : "No link provided"}
                    </td>
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
                          setIsRecall(0);
                          setManageData({
                            _id: item._id || "",
                            marketer_id: item.marketer_id || "",
                            marketer_name: item.marketer_name || "",
                            calling_date: item.calling_date || "",
                            followup_date: item.followup_date || "",
                            country: item.country || "",
                            designation: item.designation || "",
                            website: item.website || "",
                            category: item.category || "",
                            company_name: item.company_name || "",
                            contact_person: item.contact_person || "",
                            contact_number: item.contact_number || "",
                            email_address: item.email_address || "",
                            calling_status: item.calling_status || "",
                            linkedin: item.linkedin || "",
                            calling_date_history:
                              item.calling_date_history || [],
                            updated_by: item.updated_by || "",
                            followup_done: item.followup_done || false,
                            is_test: item.is_test || false,
                            is_prospected: item.is_prospected || false,
                          });
                          setEditedBy(item.updated_by || "");
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
                  First Calling Date
                </label>
                <input
                  disabled
                  value={manageData.calling_date}
                  type="date"
                  className="form-control"
                  id="calling_date"
                />
              </div>
              <div className="mb-1">
                <label htmlFor="calling_date" className="form-label">
                  Calling Date History
                </label>
                <textarea
                  disabled
                  value={manageData.calling_date_history
                    ?.map((date) => `${convertToDDMMYYYY(date)}`)
                    .join("\n")}
                  type="date"
                  className="form-control"
                  id="calling_date"
                />
              </div>
              <div className="mb-3">
                <div className="form-check">
                  <input
                    type="checkbox"
                    id="myCheckbox"
                    className="form-check-input"
                    checked={isRecall}
                    onChange={(e) => setIsRecall((prevData) => !prevData)}
                  />

                  <label htmlFor="myCheckbox" className="form-check-label">
                    Recall
                  </label>
                </div>
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
                <textarea
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

      <div
        className="offcanvas offcanvas-end"
        tabIndex="-1"
        id="offcanvasNavbar"
        aria-labelledby="offcanvasNavbarLabel"
      >
        <div className="offcanvas-header">
          <h5 className="offcanvas-title" id="offcanvasNavbarLabel">
            Search reports
          </h5>
          <button
            type="button"
            className="btn-close"
            data-bs-dismiss="offcanvas"
            aria-label="Close"
          ></button>
        </div>
        <div className="offcanvas-body">
          <div className="d-grid gap-2">
            <div className="row">
              <div className="col">
                <label className="fw-bold" htmlFor="floatingSelectGrid">
                  Marketer name
                </label>
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
              </div>
            </div>

            <div className="row">
              <div className="col">
                <label className="fw-semibold" htmlFor="datePicker">
                  Date picker
                </label>
                <div id="datePicker" className="input-group">
                  <input
                    type="date"
                    id="fromDate"
                    className="form-control custom-input"
                    value={filters.fromdate}
                    onChange={(e) =>
                      setFilters({ ...filters, fromdate: e.target.value })
                    }
                  />
                  <span className="input-group-text">to</span>
                  <input
                    type="date"
                    id="toDate"
                    className="form-control custom-input"
                    value={filters.todate}
                    onChange={(e) =>
                      setFilters({ ...filters, todate: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>

            <div className="row">
              <div className="col">
                <label className="fw-semibold" htmlFor="floatingInput">
                  Country name
                </label>
                <input
                  value={filters.country}
                  onChange={(e) =>
                    setFilters({ ...filters, country: e.target.value })
                  }
                  type="text"
                  className="form-control"
                  id="floatingInput"
                />
              </div>
            </div>

            <div className="row">
              <div className="col">
                <label className="fw-semibold" htmlFor="floatingInput">
                  Category
                </label>
                <input
                  value={filters.category}
                  onChange={(e) =>
                    setFilters({ ...filters, category: e.target.value })
                  }
                  type="text"
                  className="form-control"
                  id="floatingInput"
                />
              </div>
            </div>

            <div className="row">
              <div className="col">
                <label className="fw-semibold" htmlFor="floatingInput">
                  Company name
                </label>
                <input
                  value={filters.company_name}
                  onChange={(e) =>
                    setFilters({ ...filters, company_name: e.target.value })
                  }
                  type="text"
                  className="form-control"
                  id="floatingInput"
                />
              </div>
            </div>

            <div className="row">
              <div className="col">
                <input
                  type="checkbox"
                  id="myCheckbox"
                  className="form-check-input"
                  checked={filters.test}
                  onChange={(e) =>
                    setFilters({ ...filters, test: !filters.test })
                  }
                />

                <label
                  htmlFor="myCheckbox"
                  className="form-check-label fw-semibold ms-1"
                >
                  Test Job
                </label>
              </div>
              <div className="col">
                <input
                  type="checkbox"
                  id="myCheckbox2"
                  className="form-check-input"
                  checked={filters.prospect}
                  onChange={(e) =>
                    setFilters({ ...filters, prospect: !filters.prospect })
                  }
                />

                <label
                  htmlFor="myCheckbox"
                  className="form-check-label fw-semibold ms-1"
                >
                  Prospecting
                </label>
              </div>
            </div>

            <button
              onClick={getAllReportsFiltered}
              className="btn btn-outline-primary"
            >
              Search
            </button>

            <div className="general-search-field d-grid gap-2 my-5">
              <div className="row">
                <div className="col">
                  <label className="fw-semibold" htmlFor="floatingInput">
                    General search text
                  </label>
                  <input
                    value={filters.generalsearchstring}
                    onChange={(e) =>
                      setFilters({
                        ...filters,
                        generalsearchstring: e.target.value,
                      })
                    }
                    type="text"
                    className="form-control"
                    id="floatingInput"
                  />
                </div>
              </div>

              <button
                onClick={getAllReportsFiltered}
                className="btn btn-outline-primary"
              >
                General Search
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

          .link:hover {
            cursor: pointer;
            text-decoration: underline;
            color: rgba(0, 0, 0, 0.7);
          }

          th,
          td {
            padding: 2.5px 10px;
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
