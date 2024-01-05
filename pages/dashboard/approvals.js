import React from "react";
import { getSession, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import Navbar from "../../components/navbar";

export default function Approvals() {
  const { data: session } = useSession();
  const router = useRouter();

  const [approvals, setApprovals] = useState([]);

  const [orderInfo, setOrderInfo] = useState({});
  const [userInfo, setUserInfo] = useState({});
  const [clientInfo, setClientInfo] = useState({});
  const [reportData, setReportData] = useState({});
  const [employeeData, setEmployeeData] = useState({});
  const [userData, setUserData] = useState({});
  const [modalTempStore, setModalTempStore] = useState({});

  const [page, setPage] = useState(1);
  const [pageCount, setPageCount] = useState(0);
  const [itemPerPage, setItemPerPage] = useState(30);

  const [isFiltered, setIsFiltered] = useState(0);
  const [filters, setFilters] = useState({
    request_by: "",
    request_type: "",
    approved_check: false,
    rejected_check: false,
    waiting_check: false,
  });

  const convertToDDMMYYYY = (dateString) => {
    const [year, month, day] = dateString.split("-");
    if (year.length != 4) return dateString;
    return `${day}-${month}-${year}`;
  };

  async function fetchApi(url, options) {
    const res = await fetch(url, options);
    const data = await res.json();
    return data;
  }

  async function GetAllApprovals() {
    try {
      const url = `${process.env.NEXT_PUBLIC_BASE_URL}/api/approval`;
      const options = {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          getallapprovals: true,
          page,
          item_per_page: itemPerPage,
        },
      };

      const list = await fetchApi(url, options);

      if (!list.error) {
        setApprovals(list);
        setOrderInfo({});
        setUserInfo({});
        setClientInfo({});
        setReportData({});
        setEmployeeData({});
        setUserData({});
      } else {
        toast.error("Unable to retrieve waiting list");
      }
    } catch (error) {
      console.error("Error fetching approvals waiting list:", error);
      toast.error("Error retrieving approvals waiting list");
    }
  }

  async function GetAllApprovalsFiltered() {
    try {
      const url = `${process.env.NEXT_PUBLIC_BASE_URL}/api/approval`;
      const options = {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          getallapprovals: true,
          isfilter: true,
          ...filters,
          page,
          item_per_page: itemPerPage,
        },
      };

      const list = await fetchApi(url, options);

      if (!list.error) {
        console.log(list);
        setApprovals(list);
        setOrderInfo({});
        setUserInfo({});
        setClientInfo({});
        setReportData({});
        setEmployeeData({});
        setUserData({});
        setIsFiltered(1);
      } else {
        setIsFiltered(0);
        await GetAllApprovals();
      }
    } catch (error) {
      console.error("Error fetching approvals waiting list by filter:", error);
      toast.error("Error fetching approvals waiting list by filter");
    }
  }

  async function GetOrdersById(id) {
    try {
      const url = `${process.env.NEXT_PUBLIC_BASE_URL}/api/order`;
      const options = {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          getordersbyid: true,
          id,
        },
      };

      const resData = await fetchApi(url, options);

      if (!resData.error) {
        setOrderInfo(resData);
      } else {
        toast.error("Unable to retrieve order info");
      }
    } catch (error) {
      console.error("Error fetching order info:", error);
      toast.error("Error retrieving order info");
    }
  }

  async function GetUsersById(id) {
    try {
      const url = `${process.env.NEXT_PUBLIC_BASE_URL}/api/user`;
      const options = {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          getusersbyid: true,
          id,
        },
      };

      const resData = await fetchApi(url, options);

      if (!resData.error) {
        setUserInfo(resData);
      } else {
        toast.error("Unable to retrieve user info");
      }
    } catch (error) {
      console.error("Error fetching user info:", error);
      toast.error("Error retrieving user info");
    }
  }

  async function GetClientsById(id) {
    try {
      const url = `${process.env.NEXT_PUBLIC_BASE_URL}/api/client`;
      const options = {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          getclientsbyid: true,
          id,
        },
      };

      const resData = await fetchApi(url, options);

      if (!resData.error) {
        setClientInfo(resData);
      } else {
        toast.error("Unable to retrieve client info");
      }
    } catch (error) {
      console.error("Error fetching client info:", error);
      toast.error("Error retrieving client info");
    }
  }

  async function GetReportById(id) {
    try {
      const url = `${process.env.NEXT_PUBLIC_BASE_URL}/api/crm`;
      const options = {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          getreportbyid: true,
          id,
        },
      };

      const resData = await fetchApi(url, options);

      if (!resData.error) {
        setReportData(resData);
      } else {
        toast.error("Unable to retrieve report data");
      }
    } catch (error) {
      console.error("Error fetching report data:", error);
      toast.error("Error retrieving report data");
    }
  }

  async function GetEmployeeById(id) {
    try {
      const url = `${process.env.NEXT_PUBLIC_BASE_URL}/api/employee`;
      const options = {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          getemployeebyid: true,
          id,
        },
      };

      const resData = await fetchApi(url, options);

      if (!resData.error) {
        setEmployeeData(resData);
      } else {
        toast.error("Unable to retrieve employee data");
      }
    } catch (error) {
      console.error("Error fetching employee data:", error);
      toast.error("Error retrieving employee data");
    }
  }

  async function handleResponse(data) {
    try {
      console.log("THIS DATA BEFORE RESPONSE: ", data);

      const url = `${process.env.NEXT_PUBLIC_BASE_URL}/api/approval`;
      const options = {
        method: "POST",
        body: JSON.stringify({
          ...data,
          checked_by: session.user.real_name,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      };

      const resData = await fetchApi(url, options);

      if (!resData.error) {
        await GetAllApprovals();
      } else {
        toast.error("Unable to handle response");
      }
    } catch (error) {
      console.error("Error handling response:", error);
      toast.error("Error handling response");
    }
  }

  function formatTimestamp(timestamp) {
    const date = new Date(timestamp);

    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");

    return {
      date: `${day}-${month}-${year}`,
      time: `${hours}:${minutes}`,
    };
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
    setPage(1);
    if (!isFiltered) GetAllApprovals();
    if (approvals) setPageCount(approvals?.pagination?.pageCount);
  }, [approvals?.pagination?.pageCount]);

  useEffect(() => {
    if (approvals?.pagination?.pageCount == 1) return;

    if (!isFiltered) GetAllApprovals();
    else GetAllApprovalsFiltered();
  }, [page, itemPerPage]);

  return (
    <>
      <Navbar navFor="dashboard" />
      <div className="my-5">
        <div className="container">
          <div
            className="float-end"
            style={{ display: "flex", alignItems: "center" }}
          >
            <span className="me-3">
              Page{" "}
              <strong>
                {approvals?.items?.length !== 0 ? page : 0}/{pageCount}
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
              disabled={!approvals?.items?.length}
              style={{ width: "70px" }}
              value={itemPerPage}
              onChange={(e) => setItemPerPage(e.target.value)}
              className="form-select ms-2 me-2 form-select-sm"
              aria-label="Small select example"
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
        <table
          style={{ overflow: "hidden" }}
          className="table table-bordered py-3 table-hover"
        >
          <thead>
            <tr className="table-dark">
              <th>#</th>
              <th>Request Type</th>
              <th>Request Status</th>
              <th>Request By</th>
              <th>Request Timestamp</th>
              <th>Manage</th>
            </tr>
          </thead>
          <tbody>
            {approvals?.items?.length ? (
              approvals?.items?.map((approveReq, index) => (
                <tr key={approveReq._id}>
                  <td>{index + 1}</td>
                  <td>{approveReq.req_type}</td>
                  <td>
                    {!approveReq.is_rejected &&
                    approveReq.checked_by != "None" ? (
                      "Approved"
                    ) : (
                      <></>
                    )}
                    {approveReq.is_rejected &&
                    approveReq.checked_by != "None" ? (
                      "Rejected"
                    ) : (
                      <></>
                    )}
                    {approveReq.checked_by == "None" ? "Waiting" : <></>}
                  </td>
                  <td>{approveReq.req_by}</td>
                  <td>
                    {
                      formatTimestamp(approveReq.createdAt.toLocaleString())
                        .date
                    }{" "}
                    <span className="text-body-secondary"> | </span>
                    {
                      formatTimestamp(approveReq.createdAt.toLocaleString())
                        .time
                    }
                  </td>
                  <td>
                    {approveReq.checked_by == "None" ? (
                      <>
                        <button
                          onClick={() =>
                            setModalTempStore({
                              ...approveReq,
                              response: "approve",
                            })
                          }
                          data-bs-toggle="modal"
                          data-bs-target="#confirmModal"
                          className="btn btn-sm btn-outline-success me-1"
                        >
                          Approve
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger me-1"
                          onClick={() =>
                            setModalTempStore({
                              ...approveReq,
                              response: "reject",
                            })
                          }
                          data-bs-toggle="modal"
                          data-bs-target="#confirmModal"
                        >
                          Reject
                        </button>

                        {approveReq.req_type.split(" ")[1] == "Delete" ? (
                          <button
                            onClick={() => {
                              approveReq.req_type.split(" ")[0] == "Client"
                                ? GetClientsById(approveReq.id)
                                : approveReq.req_type.split(" ")[0] == "Task"
                                  ? GetOrdersById(approveReq.id)
                                  : approveReq.req_type.split(" ")[0] == "User"
                                    ? GetUsersById(approveReq.id)
                                    : approveReq.req_type.split(" ")[0] ==
                                        "Report"
                                      ? GetReportById(approveReq.id)
                                      : approveReq.req_type.split(" ")[0] ==
                                          "Employee"
                                        ? GetEmployeeById(approveReq.id)
                                        : null;
                            }}
                            className="btn btn-sm btn-outline-primary"
                            data-bs-toggle="modal"
                            data-bs-target={
                              approveReq.req_type.split(" ")[0] == "Client"
                                ? "#editModal0"
                                : approveReq.req_type.split(" ")[0] == "Task"
                                  ? "#editModal"
                                  : approveReq.req_type.split(" ")[0] == "User"
                                    ? "#editModal1"
                                    : approveReq.req_type.split(" ")[0] ==
                                        "Report"
                                      ? "#editModal4"
                                      : approveReq.req_type.split(" ")[0] ==
                                          "Employee"
                                        ? "#editModal5"
                                        : null
                            }
                          >
                            View
                          </button>
                        ) : null}

                        {approveReq.req_type.split(" ")[1] == "Edit" ? (
                          <button
                            onClick={() => {
                              approveReq.req_type.split(" ")[0] == "User"
                                ? setUserData(approveReq)
                                : approveReq.req_type.split(" ")[0] == "Report"
                                  ? setReportData(approveReq)
                                  : null;
                            }}
                            className="btn btn-sm btn-outline-primary"
                            data-bs-toggle="modal"
                            data-bs-target={
                              approveReq.req_type.split(" ")[0] == "User"
                                ? "#editModal2"
                                : approveReq.req_type.split(" ")[0] == "Report"
                                  ? "#editModal3"
                                  : null
                            }
                          >
                            View
                          </button>
                        ) : null}
                      </>
                    ) : (
                      <>
                        Checked by{" "}
                        <span className="fw-semibold">
                          {approveReq.checked_by}
                        </span>{" "}
                        on{" "}
                        <span className="fw-semibold">
                          {
                            formatTimestamp(
                              approveReq.updatedAt.toLocaleString(),
                            ).date
                          }{" "}
                        </span>{" "}
                        at{" "}
                        <span className="fw-semibold">
                          {
                            formatTimestamp(
                              approveReq.updatedAt.toLocaleString(),
                            ).time
                          }
                        </span>
                      </>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr key={0}>
                <td colSpan="6" className=" align-center text-center">
                  Nothing in approvals to Show.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div
        className="modal fade"
        id="editModal0"
        tabIndex="-1"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-scrollable modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h1 className="modal-title fs-5" id="staticBackdropLabel">
                Client Info
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
                <label htmlFor="clientCode" className="form-label">
                  Client Code
                </label>
                <input
                  value={clientInfo.client_code}
                  disabled
                  type="text"
                  className="form-control"
                  id="clientCode"
                  placeholder="Client Code"
                />
              </div>
              <div className="mb-3">
                <label htmlFor="clientName" className="form-label">
                  Client Name
                </label>
                <input
                  value={clientInfo.client_name}
                  disabled
                  type="text"
                  className="form-control"
                  id="clientName"
                  placeholder="Client Name"
                />
              </div>
            </div>
            <div className="modal-footer p-1">
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary"
                data-bs-dismiss="modal"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>

      <div
        className="modal fade"
        id="editModal"
        tabIndex="-1"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-scrollable modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h1 className="modal-title fs-5" id="staticBackdropLabel">
                Task Info
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
                <label htmlFor="clientCode" className="form-label">
                  Client Code
                </label>
                <input
                  value={orderInfo.client_code}
                  disabled
                  type="text"
                  className="form-control"
                  id="clientCode"
                  placeholder="Client Code"
                />
              </div>
              <div className="mb-3">
                <label htmlFor="clientName" className="form-label">
                  Client Name
                </label>
                <input
                  value={orderInfo.client_name}
                  disabled
                  type="text"
                  className="form-control"
                  id="clientName"
                  placeholder="Client Name"
                />
              </div>
              <div className="mb-3">
                <label htmlFor="folder" className="form-label">
                  Folder
                </label>
                <input
                  value={orderInfo.folder}
                  disabled
                  type="text"
                  className="form-control"
                  id="folder"
                  placeholder="Folder"
                />
              </div>
              <div className="mb-3">
                <label htmlFor="quantity" className="form-label">
                  Quantity
                </label>
                <input
                  value={orderInfo.quantity}
                  disabled
                  type="number"
                  className="form-control"
                  id="quantity"
                  placeholder="Quantity"
                />
              </div>
              <div className="mb-3">
                <label htmlFor="downloadDate" className="form-label">
                  Download Date
                </label>
                <input
                  value={orderInfo.download_date}
                  disabled
                  type="date"
                  className="form-control"
                  id="downloadDate"
                />
              </div>
              <div className="mb-3">
                <label htmlFor="deliveryDate" className="form-label">
                  Delivery Date
                </label>
                <input
                  value={orderInfo.delivery_date}
                  disabled
                  type="date"
                  className="form-control"
                  id="deliveryDate"
                />
              </div>
              <div className="mb-3">
                <label htmlFor="deliveryBDTime" className="form-label">
                  Delivery BD Time
                </label>
                <input
                  value={orderInfo.delivery_bd_time}
                  disabled
                  type="time"
                  className="form-control"
                  id="deliveryBDTime"
                />
              </div>
              <div className="mb-3">
                <label htmlFor="task" className="form-label">
                  Task
                </label>
                <input
                  value={orderInfo.task}
                  disabled
                  type="text"
                  className="form-control"
                  id="task"
                  placeholder="Task"
                />
              </div>
              <div className="mb-3">
                <label htmlFor="et" className="form-label">
                  E.T.
                </label>
                <input
                  value={orderInfo.et}
                  disabled
                  type="number"
                  className="form-control"
                  id="et"
                  placeholder="E.T."
                />
              </div>
              <div className="mb-3">
                <label htmlFor="production" className="form-label">
                  Production
                </label>
                <input
                  value={orderInfo.production}
                  disabled
                  type="string"
                  className="form-control"
                  id="production"
                  placeholder="Production"
                />
              </div>
              <div className="mb-3">
                <label htmlFor="qc1" className="form-label">
                  QC1
                </label>
                <input
                  value={orderInfo.qc1}
                  disabled
                  type="number"
                  className="form-control"
                  id="qc1"
                  placeholder="QC1"
                />
              </div>
              <div className="mb-3">
                <label htmlFor="comments" className="form-label">
                  Comment
                </label>
                <input
                  value={orderInfo.comment}
                  disabled
                  className="form-control"
                  id="comment"
                  rows="3"
                  placeholder="Comment"
                />
              </div>
              <div className="mb-3">
                <label htmlFor="type" className="form-label">
                  Task Type
                </label>
                <input
                  value={orderInfo.type}
                  disabled
                  type="text"
                  className="form-control"
                  id="type"
                  placeholder="Task Type"
                />
              </div>
              <div className="mb-3">
                <label htmlFor="status" className="form-label">
                  Status
                </label>
                <input
                  value={orderInfo.status}
                  disabled
                  type="text"
                  className="form-control"
                  id="status"
                  placeholder="Status"
                />
              </div>
            </div>
            <div className="modal-footer p-1">
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary"
                data-bs-dismiss="modal"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>

      <div
        className="modal fade"
        id="editModal1"
        tabIndex="-1"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h1 className="modal-title fs-5" id="staticBackdropLabel">
                User Info
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
                <label htmlFor="date" className="form-label">
                  Employee Name
                </label>
                <input
                  required
                  value={userInfo.real_name}
                  disabled
                  type="text"
                  className="form-control"
                />
              </div>
              <div className="mb-3">
                <label htmlFor="date" className="form-label">
                  Name
                </label>
                <input
                  required
                  value={userInfo.name}
                  disabled
                  type="text"
                  className="form-control"
                />
              </div>
              <div className="mb-3">
                <label htmlFor="date" className="form-label">
                  Password
                </label>
                <input
                  required
                  value={userInfo.password}
                  disabled
                  type="text"
                  className="form-control"
                />
              </div>
              <div className="mb-3">
                <label htmlFor="date" className="form-label">
                  Role
                </label>

                <select
                  className="form-select"
                  id="floatingSelect"
                  required
                  value={userInfo.role}
                  disabled
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                  <option value="super">Super</option>
                  <option value="manager">Manager</option>
                  <option value="marketer">Marketer</option>
                </select>
              </div>
            </div>
            <div className="modal-footer p-1">
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary"
                data-bs-dismiss="modal"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>

      <div
        className="modal fade"
        id="editModal2"
        tabIndex="-1"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h1 className="modal-title fs-5" id="staticBackdropLabel">
                Edit User
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
                <label htmlFor="date" className="form-label">
                  Employee Name
                </label>
                <input
                  required
                  value={userData.real_name}
                  onChange={(e) =>
                    setUserData((prevData) => ({
                      ...prevData,
                      real_name: e.target.value,
                    }))
                  }
                  type="text"
                  className="form-control"
                />
              </div>
              <div className="mb-3">
                <label htmlFor="date" className="form-label">
                  Name
                </label>
                <input
                  required
                  value={userData.name}
                  onChange={(e) =>
                    setUserData((prevData) => ({
                      ...prevData,
                      name: e.target.value,
                    }))
                  }
                  type="text"
                  className="form-control"
                />
              </div>
              <div className="mb-3">
                <label htmlFor="date" className="form-label">
                  Password
                </label>
                <input
                  required
                  value={userData.password}
                  onChange={(e) =>
                    setUserData((prevData) => ({
                      ...prevData,
                      password: e.target.value,
                    }))
                  }
                  type="text"
                  className="form-control"
                />
              </div>
              <div className="mb-3">
                <label htmlFor="date" className="form-label">
                  Role
                </label>

                <select
                  className="form-select"
                  id="floatingSelect"
                  required
                  value={userData.role}
                  onChange={(e) =>
                    setUserData((prevData) => ({
                      ...prevData,
                      role: e.target.value,
                    }))
                  }
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                  <option value="super">Super</option>
                  <option value="manager">Manager</option>
                  <option value="marketer">Marketer</option>
                </select>
              </div>
            </div>

            {userData.role == "marketer" && (
              <div className="marketr-exclusive">
                <div className="mb-3">
                  <label htmlFor="date" className="form-label">
                    Company Provided Name
                  </label>
                  <input
                    required
                    value={userData.companyprovidedname}
                    onChange={(e) =>
                      setUserData((prevData) => ({
                        ...prevData,
                        companyprovidedname: e.target.value,
                      }))
                    }
                    type="text"
                    className="form-control"
                  />
                </div>
              </div>
            )}

            <div className="modal-footer p-1">
              <button
                type="button"
                className="btn btn-sm btn-outline-success"
                data-bs-toggle="modal"
                data-bs-target="#confirmModal"
                onClick={() =>
                  setModalTempStore({
                    ...userData,
                    response: "approve",
                  })
                }
              >
                Approve
              </button>
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary"
                data-bs-dismiss="modal"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>

      <div
        className="modal fade"
        id="editModal3"
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
                  value={reportData.calling_date}
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
                  value={reportData.calling_date_history
                    ?.map((date) => `${convertToDDMMYYYY(date)}`)
                    .join("\n")}
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
                    setReportData((prevData) => ({
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
                  value={reportData.country}
                  onChange={(e) =>
                    setReportData((prevData) => ({
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
                  value={reportData.website}
                  onChange={(e) =>
                    setReportData((prevData) => ({
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
                  value={reportData.category}
                  onChange={(e) =>
                    setReportData((prevData) => ({
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
                  value={reportData.company_name}
                  onChange={(e) =>
                    setReportData((prevData) => ({
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
                  value={reportData.contact_person}
                  onChange={(e) =>
                    setReportData((prevData) => ({
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
                  value={reportData.designation}
                  onChange={(e) =>
                    setReportData((prevData) => ({
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
                  value={reportData.contact_number}
                  onChange={(e) =>
                    setReportData((prevData) => ({
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
                  value={reportData.email_address}
                  onChange={(e) =>
                    setReportData((prevData) => ({
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
                  value={reportData.calling_status}
                  onChange={(e) =>
                    setReportData((prevData) => ({
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
                  value={reportData.linkedin}
                  onChange={(e) =>
                    setReportData((prevData) => ({
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
                    checked={reportData.is_test}
                    onChange={(e) =>
                      setReportData({
                        ...reportData,
                        is_test: !reportData.is_test,
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
                    checked={reportData.is_prospected}
                    onChange={(e) =>
                      setReportData({
                        ...reportData,
                        is_prospected: !reportData.is_prospected,
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
              <button
                type="button"
                className="btn btn-sm btn-outline-success"
                data-bs-toggle="modal"
                data-bs-target="#confirmModal"
                onClick={() =>
                  setModalTempStore({
                    ...reportData,
                    response: "approve",
                  })
                }
              >
                Approve
              </button>
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary"
                data-bs-dismiss="modal"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>

      <div
        className="modal fade"
        id="editModal4"
        tabIndex="-1"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
          <div className="modal-content">
            <div className="modal-header">
              <h1 className="modal-title fs-5" id="staticBackdropLabel">
                Report Data
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
                  value={reportData.calling_date}
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
                  value={reportData.calling_date_history
                    ?.map((date) => `${convertToDDMMYYYY(date)}`)
                    .join("\n")}
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
                  disabled
                  value={reportData.followup_date}
                  onChange={(e) =>
                    setReportData((prevData) => ({
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
                  disabled
                  value={reportData.country}
                  onChange={(e) =>
                    setReportData((prevData) => ({
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
                  disabled
                  value={reportData.website}
                  onChange={(e) =>
                    setReportData((prevData) => ({
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
                  disabled
                  value={reportData.category}
                  onChange={(e) =>
                    setReportData((prevData) => ({
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
                  disabled
                  value={reportData.company_name}
                  onChange={(e) =>
                    setReportData((prevData) => ({
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
                  disabled
                  value={reportData.contact_person}
                  onChange={(e) =>
                    setReportData((prevData) => ({
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
                  disabled
                  value={reportData.designation}
                  onChange={(e) =>
                    setReportData((prevData) => ({
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
                  disabled
                  value={reportData.contact_number}
                  onChange={(e) =>
                    setReportData((prevData) => ({
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
                  disabled
                  value={reportData.email_address}
                  onChange={(e) =>
                    setReportData((prevData) => ({
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
                  disabled
                  value={reportData.calling_status}
                  onChange={(e) =>
                    setReportData((prevData) => ({
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
                  disabled
                  value={reportData.linkedin}
                  onChange={(e) =>
                    setReportData((prevData) => ({
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
                    disabled
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

                  <label htmlFor="myCheckbox" className="form-check-label">
                    Test Job
                  </label>
                </div>
              </div>
              <div className="mb-3">
                <div className="form-check">
                  <input
                    disabled
                    type="checkbox"
                    id="myCheckbox2"
                    className="form-check-input"
                    checked={reportData.is_prospected}
                    onChange={(e) =>
                      setReportData({
                        ...reportData,
                        is_prospected: !reportData.is_prospected,
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
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary"
                data-bs-dismiss="modal"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>

      <div
        className="modal fade"
        id="editModal5"
        tabIndex="-1"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
          <div className="modal-content">
            <div className="modal-header">
              <h1 className="modal-title fs-5" id="staticBackdropLabel">
                Employee Data
              </h1>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              {/* Employee Code */}
              <div className="mb-3">
                <label htmlFor="date" className="form-label">
                  Employee ID
                </label>
                <input
                  value={employeeData.e_id}
                  disabled
                  type="text"
                  className="form-control"
                />
              </div>

              {/* Full Name */}
              <div className="mb-3">
                <label htmlFor="date" className="form-label">
                  Full Name
                </label>
                <input
                  value={employeeData.real_name}
                  disabled
                  type="text"
                  className="form-control"
                />
              </div>

              {/* Joining Date */}
              <div className="mb-3">
                <label htmlFor="date" className="form-label">
                  Joining Date
                </label>
                <input
                  value={employeeData.joining_date}
                  disabled
                  type="date"
                  className="form-control"
                />
              </div>

              {/* Phone Number */}
              <div className="mb-3">
                <label htmlFor="date" className="form-label">
                  Phone
                </label>
                <input
                  value={employeeData.phone}
                  disabled
                  type="text"
                  className="form-control"
                />
              </div>

              {/* Email */}
              <div className="mb-3">
                <label htmlFor="date" className="form-label">
                  Email
                </label>
                <input
                  value={employeeData.email}
                  disabled
                  type="email"
                  className="form-control"
                />
              </div>

              {/* NID Number */}
              <div className="mb-3">
                <label htmlFor="date" className="form-label">
                  NID Number
                </label>
                <input
                  value={employeeData.nid}
                  disabled
                  type="text"
                  className="form-control"
                />
              </div>

              {/* Blood Group */}
              <div className="mb-3">
                <label htmlFor="date" className="form-label">
                  Blood Group
                </label>

                <select
                  className="form-select"
                  id="floatingSelect"
                  value={employeeData.blood_group}
                  disabled
                >
                  <option
                    value={""}
                    defaultValue={true}
                    className="text-body-secondary"
                  >
                    Select a blood group
                  </option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>

              {/* Birth Date */}
              <div className="mb-3">
                <label htmlFor="date" className="form-label">
                  Birth Date
                </label>
                <input
                  value={employeeData.birth_date}
                  disabled
                  type="date"
                  className="form-control"
                />
              </div>

              {/* Designation */}
              <div className="mb-3">
                <label htmlFor="date" className="form-label">
                  Designation
                </label>
                <input
                  value={employeeData.designation}
                  disabled
                  type="text"
                  className="form-control"
                />
              </div>

              {/* Department */}
              <div className="mb-3">
                <label htmlFor="date" className="form-label">
                  Department
                </label>

                <select
                  className="form-select"
                  id="floatingSelect"
                  value={employeeData.department}
                  disabled
                >
                  <option value="Production">Production</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Management">Management</option>
                  <option value="Software">Software</option>
                  <option value="Others">Others</option>
                </select>
              </div>

              {employeeData.department == "Marketing" && (
                <div className="marketr-exclusive">
                  <div className="mb-3">
                    <label htmlFor="date" className="form-label">
                      Company Provided Name
                    </label>
                    <input
                      required
                      value={employeeData.company_provided_name}
                      disabled
                      type="text"
                      className="form-control"
                    />
                  </div>
                </div>
              )}

              {/* Gross Salary */}
              <div className="mb-3">
                <label htmlFor="date" className="form-label">
                  Gross Salary
                </label>
                <input
                  value={employeeData.gross_salary}
                  disabled
                  type="number"
                  className="form-control"
                />
              </div>

              {/* Status */}
              <div className="mb-3">
                <label htmlFor="date" className="form-label">
                  Status
                </label>

                <select
                  required
                  className="form-select"
                  id="floatingSelect"
                  value={employeeData.status}
                  disabled
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Resigned">Resigned</option>
                  <option value="Fired">Fired</option>
                </select>
              </div>

              {/* Eid-ul-fitr Bonus */}
              <div className="mb-3">
                <label htmlFor="date" className="form-label">
                  Eid-ul-fitr Bonus
                </label>
                <input
                  value={employeeData.bonus_eid_ul_fitr}
                  disabled
                  type="number"
                  className="form-control"
                />
              </div>

              {/* Eid-ul-adha Bonus */}
              <div className="mb-3">
                <label htmlFor="date" className="form-label">
                  Eid-ul-adha Bonus
                </label>
                <input
                  value={employeeData.bonus_eid_ul_adha}
                  disabled
                  type="number"
                  className="form-control"
                />
              </div>

              {/* Note*/}
              <div className="mb-3">
                <label htmlFor="date" className="form-label">
                  Note
                </label>
                <textarea
                  value={employeeData.note}
                  disabled
                  className="form-control"
                />
              </div>
            </div>

            <div className="modal-footer p-1">
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary"
                data-bs-dismiss="modal"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>

      <div
        className="modal fade"
        id="confirmModal"
        tabIndex="-1"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h1 className="modal-title fs-5" id="staticBackdropLabel">
                Action Confirmation
              </h1>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              <p>Are you sure about your action?</p>
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
                onClick={() => handleResponse(modalTempStore)}
                type="button"
                className="btn btn-sm btn-outline-primary"
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
            Filter Approvals
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
                  Request Type
                </label>
                <select
                  required
                  onChange={(e) =>
                    setFilters({ ...filters, request_type: e.target.value })
                  }
                  className="form-select"
                  id="floatingSelectGrid"
                >
                  <option
                    value={""}
                    defaultValue={true}
                    className="text-body-secondary"
                  >
                    Select request type
                  </option>
                  <option value={"User Create"}>User Create</option>
                  <option value={"User Delete"}>User Delete</option>
                  <option value={"Task Delete"}>Task Delete</option>
                  <option value={"Report Edit"}>Report Edit</option>
                  <option value={"Report Delete"}>Report Delete</option>
                  <option value={"Employee Delete"}>Employee Delete</option>
                </select>
              </div>
            </div>

            <div className="row">
              <div className="col">
                <label className="fw-semibold" htmlFor="floatingInput">
                  Requested Person Name
                </label>
                <input
                  value={filters.request_by}
                  onChange={(e) =>
                    setFilters({ ...filters, request_by: e.target.value })
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
                  checked={filters.approved_check}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      approved_check: !filters.approved_check,
                    })
                  }
                />

                <label
                  htmlFor="myCheckbox"
                  className="form-check-label fw-semibold ms-1"
                >
                  Approved
                </label>
              </div>
              <div className="col">
                <input
                  type="checkbox"
                  id="myCheckbox2"
                  className="form-check-input"
                  checked={filters.rejected_check}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      rejected_check: !filters.rejected_check,
                    })
                  }
                />

                <label
                  htmlFor="myCheckbox"
                  className="form-check-label fw-semibold ms-1"
                >
                  Rejected
                </label>
              </div>
              <div className="col">
                <input
                  type="checkbox"
                  id="myCheckbox2"
                  className="form-check-input"
                  checked={filters.waiting_check}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      waiting_check: !filters.waiting_check,
                    })
                  }
                />

                <label
                  htmlFor="myCheckbox"
                  className="form-check-label fw-semibold ms-1"
                >
                  Waiting
                </label>
              </div>
            </div>

            <button
              onClick={GetAllApprovalsFiltered}
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
            padding: 10px 5px;
          }
        `}
      </style>
    </>
  );
}

export async function getServerSideProps(context) {
  let session = await getSession(context);

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
  if (!session || session.user.role != "super") {
    return {
      redirect: {
        destination: "/?error=You need Super role to access the page",
        permanent: true,
      },
    };
  } else
    return {
      props: {},
    };
}
