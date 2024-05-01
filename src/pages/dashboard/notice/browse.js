import React, { useState, useEffect } from "react";
import Navbar from "@/components/navbar";
import { toast } from "sonner";
import { useRouter } from "next/router";
import { getSession, useSession } from "next-auth/react";

function NoticeView() {
  const router = useRouter();
  const { data: session } = useSession();
  let [notices, setNotices] = useState([]);

  const [editedBy, setEditedBy] = useState("");

  const [page, setPage] = useState(1);
  const [pageCount, setPageCount] = useState(0);
  const [itemPerPage, setItemPerPage] = useState(30);
  let [manageData, setManageData] = useState({
    _id: "",
    notice_no: "",
    title: "",
    file_name: "",
    description: "",
    channel: "marketers",
  });

  const [filters, setFilters] = useState({
    fromTime: "",
    toTime: "",
    notice_no: "",
    title: "",
    channel: "",
  });

  const [isFiltered, setIsFiltered] = useState(0);

  let handleOnChange = (e) => {
    setManageData((prevData) => ({
      ...prevData,
      [e.target.name]: e.target.value,
    }));
  };

  let constructFileName = (file_name, notice_no) => {
    console.log("FILE NAME:", file_name, notice_no);
    let file_ext = file_name.split(".").pop();
    let file_name_without_ext = file_name.split(".").slice(0, -1).join(".");
    let new_file_name = `${file_name_without_ext}_${notice_no}.${file_ext}`;
    return new_file_name;
  };

  async function fetchApi(url, options) {
    const res = await fetch(url, options);
    const data = await res.json();
    return data;
  }

  const handleDeleteNotice = async () => {
    try {
      const url = `${process.env.NEXT_PUBLIC_BASE_URL}/api/notice`;
      const options = {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          deletenotice: true,
          _id: manageData._id,
        },
      };
      const res = await fetchApi(url, options);

      if (!res.error) {
        if (manageData.file_name) {
          console.log(
            "Deleting file from server",
            constructFileName(manageData.file_name, manageData.notice_no),
            manageData.file_name,
            manageData.notice_no,
          );

          const url2 = `${process.env.NEXT_PUBLIC_BASE_URL}/api/ftp`;
          const options2 = {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              deletefile: true,
              filename: constructFileName(
                manageData.file_name,
                manageData.notice_no,
              ),
              folder_name: "notice",
            },
          };

          const res2 = await fetchApi(url2, options2);

          if (!res2.error) {
            toast.success("Successfully deleted the notice", {
              toastId: "success",
            });
            await getNotices();
          } else
            toast.error("Unable to delete file from server", {
              toastId: "error2",
            });
        } else {
          toast.success("Successfully deleted the notice", {
            toastId: "success",
          });
          await getNotices();
        }
      } else {
        console.error("Error deleting notice:", res.message);
        toast.error("Unable to delete notice", { toastId: "error3" });
      }
      setManageData({
        _id: "",
        notice_no: "",
        title: "",
        file_name: "",
        description: "",
        channel: "marketers",
      });
    } catch (error) {
      console.error("Error deleting notice:", error);
      toast.error("Error deleting notice", { toastId: "error4" });
    }
  };

  const handleEditNotice = async () => {
    const url = `${process.env.NEXT_PUBLIC_BASE_URL}/api/notice`;
    const options = {
      method: "POST",
      body: JSON.stringify(manageData),
      headers: {
        "Content-Type": "application/json",
        editnotice: true,
        name: session.user?.real_name,
      },
    };

    try {
      const result = await fetchApi(url, options);

      if (!result.error) {
        toast.success("Edited the notice");

        if (!isFiltered) await getNotices();
        else await getNoticesFiltered();
      } else {
        toast.error(result.message);
      }
      setManageData({
        _id: "",
        notice_no: "",
        title: "",
        file_name: "",
        description: "",
        channel: "marketers",
      });
    } catch (error) {
      console.error("Error editing notice:", error);
      toast.error("Error editing notice");
    }
  };

  const getNotices = async () => {
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
  };

  const getNoticesFiltered = async () => {
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
        channel: filters.channel,
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
  };

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
    // console.log("initial effect")
    getNotices();
  }, []);

  useEffect(() => {
    // console.log("page effect")
    if (notices?.pagination?.pageCount == 1) return;

    if (!isFiltered) getNotices();
    else getNoticesFiltered();
  }, [page]);

  useEffect(() => {
    // console.log("page count effect")
    setPage(1);
    if (!isFiltered) getNotices();
    if (notices) setPageCount(notices?.pagination?.pageCount);
  }, [notices?.pagination?.pageCount]);

  useEffect(() => {
    // console.log("items per page effect")
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
                <th>Channel</th>
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
                      <td>{item.channel}</td>
                      <td>{item.notice_no}</td>
                      <td>{item.title}</td>
                      <td
                        className="align-middle"
                        style={{ textAlign: "center" }}
                      >
                        <button
                          onClick={() => {
                            if (item.channel === "marketers")
                              router.push(`/crm/notices/${item.notice_no}`);
                            else if (item.channel === "production")
                              // router.push(`/production/notices/${item.notice_no}`);
                              toast.info("Production notice not available", {
                                toastId: "info",
                              });
                          }}
                          className="btn btn-sm btn-outline-warning me-1"
                        >
                          View
                        </button>
                        <button
                          onClick={() => {
                            setManageData(item);
                            setEditedBy(item.updated_by || "");
                          }}
                          className="btn btn-sm btn-outline-primary me-1"
                          data-bs-toggle="modal"
                          data-bs-target="#editModal"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() =>
                            setManageData({
                              _id: item._id,
                              file_name: item.file_name,
                              notice_no: item.notice_no,
                            })
                          }
                          className="btn btn-sm btn-outline-danger me-1"
                          data-bs-toggle="modal"
                          data-bs-target="#deleteModal"
                        >
                          Delete
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
        className="modal fade"
        id="editModal"
        tabIndex="-1"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
          <div className="modal-content">
            <div className="modal-header">
              <h1 className="modal-title fs-5" id="staticBackdropLabel">
                Edit Notice Data
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
                <label className="form-label">Channel</label>
                <select
                  required
                  value={manageData.channel}
                  onChange={handleOnChange}
                  name="channel"
                  className="form-select"
                >
                  <option value="marketers">Marketers</option>
                  <option value="production">Production</option>
                </select>
              </div>
              <div className="mb-3">
                <label className="form-label">Notice No.</label>
                <input
                  type="text"
                  value={manageData.notice_no}
                  onChange={handleOnChange}
                  name="notice_no"
                  className="form-control"
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Title</label>
                <input
                  type="text"
                  value={manageData.title}
                  onChange={handleOnChange}
                  name="title"
                  className="form-control"
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Description</label>
                <textarea
                  value={manageData.description}
                  onChange={handleOnChange}
                  rows={15}
                  name="description"
                  className="form-control w-100"
                  required
                ></textarea>
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
                onClick={handleEditNotice}
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
                Delete Notice Confirmation
              </h1>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              <p>Do you really want to delete this notice?</p>
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
                onClick={handleDeleteNotice}
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
                <label className="fw-bold" htmlFor="floatingSelectGrid">
                  Channel
                </label>
                <select
                  required
                  onChange={(e) =>
                    setFilters({ ...filters, channel: e.target.value })
                  }
                  className="form-select"
                  id="floatingSelectGrid"
                >
                  <option
                    value={""}
                    defaultValue={true}
                    className="text-body-secondary"
                  >
                    Select a channel
                  </option>
                  <option value={"marketers"}>Marketers</option>
                  <option value={"production"}>Production</option>
                </select>
              </div>
            </div>
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

export default NoticeView;
