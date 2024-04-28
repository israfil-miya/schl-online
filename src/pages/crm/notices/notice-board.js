import React, { useState, useEffect, useCallback } from "react";
import Navbar from "@/components/navbar";
import { toast } from "sonner";
import { useRouter } from "next/router";

function Notices() {
  const router = useRouter();
  let [notices, setNotices] = useState([]);

  const [page, setPage] = useState(1);
  const [pageCount, setPageCount] = useState(0);
  const [itemPerPage, setItemPerPage] = useState(30);

  const [filters, setFilters] = useState({
    fromTime: "",
    toTime: "",
    notice_no: "",
    title: "",
  });

  const [isFiltered, setIsFiltered] = useState(0);

  async function fetchApi(url, options) {
    const res = await fetch(url, options);
    const data = await res.json();
    return data;
  }

  async function getNotices() {
    try {
      const url = `${process.env.NEXT_PUBLIC_BASE_URL}/api/notice`;
      const options = {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          getnotices: true,
          item_per_page: itemPerPage,
          page,
        },
      };

      const list = await fetchApi(url, options);

      if (!list.error) {
        setNotices(list);
      } else {
        toast.error("Unable to retrieve file list", { toastId: "error1" });
      }
    } catch (error) {
      console.error("Error fetching file list:", error);
      toast.error("Error retrieving file list", { toastId: "error3" });
    }
  }

  async function getNoticesFiltered() {
    const url = `${process.env.NEXT_PUBLIC_BASE_URL}/api/notice`;

    const options = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        getnoticesbyfilter: true,
        fromtime: filters.fromTime,
        totime: filters.toTime,
        notice_no: filters.notice_no,
        title: filters.title,
        page,
        item_per_page: itemPerPage,
      },
    };

    try {
      const list = await fetchApi(url, options);

      if (!list.error) {
        setIsFiltered(1);
        setNotices(list);
      } else {
        setIsFiltered(0);
        await getNotices();
      }
    } catch (error) {
      console.error("Error fetching filtered notices:", error);
    }
  }

  function isoDateToDdMmYyyy(isoDate) {
    const date = new Date(isoDate);
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0"); // Months are 0-based
    const year = date.getFullYear().toString();

    return `${day}-${month}-${year}`;
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
    getNotices();
  }, []);

  useEffect(() => {
    if (notices?.pagination?.pageCount == 1) return;

    if (!isFiltered) getNotices();
    else getNoticesFiltered();
  }, [page]);

  useEffect(() => {
    setPage(1);
    if (!isFiltered) getNotices();
    if (notices) setPageCount(notices?.pagination?.pageCount);
  }, [notices?.pagination?.pageCount]);

  useEffect(() => {
    if (!isFiltered) getNotices();
    else getNoticesFiltered();
  }, [itemPerPage]);

  return (
    <>
      <Navbar navFor="notices" />

      <div className="container">
        <div className="d-flex mt-3">
          <div className="container">
            <div
              className="float-end"
              style={{ display: "flex", alignItems: "center" }}
            >
              <span className="me-3">
                Page{" "}
                <strong>
                  {notices?.items?.length !== 0 ? page : 0}/{pageCount}
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

              <select
                disabled={!notices?.items?.length}
                style={{ width: "70px" }}
                value={itemPerPage}
                onChange={(e) => setItemPerPage(e.target.value)}
                className="form-select ms-2 me-2 form-select-sm"
              >
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
                <th>Date</th>
                <th>Notice No</th>
                <th>Title</th>
                <th>Manage</th>
              </tr>
            </thead>
            <tbody>
              {notices?.items?.length ? (
                notices?.items?.map((item, index) => {
                  return (
                    <tr key={item.notice_no}>
                      <td>{index + 1}</td>
                      <td>
                        {item.updatedAt
                          ? isoDateToDdMmYyyy(item.updatedAt)
                          : ""}
                      </td>
                      <td>{item.notice_no}</td>
                      <td>{item.title}</td>
                      <td
                        className="align-middle"
                        style={{ textAlign: "center" }}
                      >
                        <button
                          onClick={() => {
                            router.push(`/crm/notices/${item.notice_no}`);
                          }}
                          className="btn btn-sm btn-outline-primary me-1"
                          data-bs-toggle="modal"
                          data-bs-target="#editModal"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr key={"no_notices"}>
                  <td colSpan="5" className=" align-center text-center">
                    No Notices To Show.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
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
            Search notices
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
                <label className="fw-semibold" htmlFor="floatingInput">
                  Notice No
                </label>
                <input
                  value={filters.notice_no}
                  onChange={(e) =>
                    setFilters({ ...filters, notice_no: e.target.value })
                  }
                  type="text"
                  className="form-control"
                  id="floatingInput"
                />
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
                    value={filters.fromTime}
                    onChange={(e) =>
                      setFilters({ ...filters, fromTime: e.target.value })
                    }
                  />
                  <span className="input-group-text">to</span>
                  <input
                    type="date"
                    id="toDate"
                    className="form-control custom-input"
                    value={filters.toTime}
                    onChange={(e) =>
                      setFilters({ ...filters, toTime: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>
            <div className="row">
              <div className="col">
                <label className="fw-semibold" htmlFor="floatingInput">
                  Title
                </label>
                <input
                  value={filters.title}
                  onChange={(e) =>
                    setFilters({ ...filters, title: e.target.value })
                  }
                  type="text"
                  className="form-control"
                  id="floatingInput"
                />
              </div>
            </div>
            <button
              onClick={getNoticesFiltered}
              className="btn btn-outline-primary"
            >
              Search
            </button>
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
            padding: 2.5px 10px;
          }
        `}
      </style>
    </>
  );
}

export default Notices;
