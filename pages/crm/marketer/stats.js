import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Navbar from "../../../components/navbar";
import toast from "react-hot-toast";

export default function MyStats() {
  const router = useRouter();
  const { name } = router.query;

  const [page, setPage] = useState(1);
  const [pageCount, setPageCount] = useState(0);

  const [isFiltered, setIsFiltered] = useState(0);

  const [filters, setFilters] = useState({
    country: "",
    company_name: "",
    category: "",
    fromdate: "",
    todate: "",
  });

  const [reports, setReports] = useState([]);

  async function fetchApi(url, options) {
    const res = await fetch(url, options);
    const data = await res.json();
    return data;
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
          marketer_name: name,
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
    if (!isFiltered) getAllReports();
    if (reports) setPageCount(reports?.pagination?.pageCount);
  }, [reports?.pagination?.pageCount]);

  useEffect(() => {
    if (!isFiltered) getAllReports();
    else getAllReportsFiltered();
  }, [page]);

  return (
    <>
      <Navbar navFor="crm" />
      <div className="containter text-center">
        <div
          style={{ overflowX: "auto" }}
          className="text-nowrap client-list my-5"
        >
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

              {/* <div className="float-start">
            <div className={`btn-group ${!isFiltered ? "d-none" : ""}`} role="group" aria-label="Basic outlined example">
              <button type="button" className="btn btn-sm btn-outline-success">
                EXCEL EXPORT
              </button>
            </div>
          </div> */}
            </div>
          )}

          <div style={{ overflowX: "auto" }} className="text-nowrap">
            <table className="table table-bordered table-striped">
              <thead>
                <tr>
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
      </div>
    </>
  );
}
