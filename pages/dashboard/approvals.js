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
  const [manageData, setManageData] = useState({});
  const [modalTempStore, setModalTempStore] = useState({});

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
        },
      };

      const list = await fetchApi(url, options);

      if (!list.error) {
        setApprovals(list);
      } else {
        toast.error("Unable to retrieve waiting list");
      }
    } catch (error) {
      console.error("Error fetching waiting list:", error);
      toast.error("Error retrieving waiting list");
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

  async function handleResponse(data) {
    try {
      console.log("THIS DATA BEFORE RESPONSE: ", data);

      const url = `${process.env.NEXT_PUBLIC_BASE_URL}/api/approval`;
      const options = {
        method: "POST",
        body: JSON.stringify({
          ...data,
          checked_by: session.user.name,
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

  useEffect(() => {
    GetAllApprovals();
  }, []);

  return (
    <>
      <Navbar navFor="dashboard" />
      <div className="my-5">
        <div className="text-center my-4">
          <h5>Approval requests</h5>
          {/* <span className="text-body-secondary ms-2">
            (
            {
              approvals.filter((approveReq) => approveReq.checked_by == "None")
                .length
            }
            )
          </span> */}
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
            {approvals &&
              approvals.map((approveReq, index) => (
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
                                : approveReq.req_type.split(" ")[0] == "Report"
                                ? GetReportById(approveReq.id)
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
                                : approveReq.req_type.split(" ")[0] == "Report"
                                ? "#editModal3"
                                : null
                            }
                          >
                            View
                          </button>
                        ) : null}

                        {approveReq.req_type.split(" ")[1] == "Edit" ? (
                          <button
                            onClick={() => setManageData(approveReq)}
                            className="btn btn-sm btn-outline-primary"
                            data-bs-toggle="modal"
                            data-bs-target={
                              approveReq.req_type.split(" ")[0] == "User"
                                ? "#editModal2"
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
              ))}
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

              <div className="mb-3">
                <label htmlFor="date" className="form-label">
                  Joining Date
                </label>
                <input
                  value={userInfo.joining_date}
                  disabled
                  type="date"
                  className="form-control"
                />
              </div>
              <div className="mb-3">
                <label htmlFor="date" className="form-label">
                  Phone
                </label>
                <input
                  value={userInfo.phone}
                  disabled
                  type="text"
                  className="form-control"
                />
              </div>
              <div className="mb-3">
                <label htmlFor="date" className="form-label">
                  Email
                </label>
                <input
                  value={userInfo.email}
                  disabled
                  type="email"
                  className="form-control"
                />
              </div>

              {userInfo.role == "marketer" && (
                <div className="marketr-exclusive">
                  <div className="mb-3">
                    <label htmlFor="date" className="form-label">
                      Company Provided Name
                    </label>
                    <input
                      value={userInfo.company_provided_name}
                      disabled
                      type="text"
                      className="form-control"
                    />
                  </div>
                </div>
              )}
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
                  Name
                </label>
                <input
                  required
                  value={manageData.name}
                  onChange={(e) =>
                    setManageData((prevData) => ({
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
                  value={manageData.password}
                  onChange={(e) =>
                    setManageData((prevData) => ({
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
                  value={manageData.role}
                  onChange={(e) =>
                    setManageData((prevData) => ({
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

            <div className="mb-3">
              <label htmlFor="date" className="form-label">
                Joining Date
              </label>
              <input
                required
                value={manageData.joiningdate}
                onChange={(e) =>
                  setManageData((prevData) => ({
                    ...prevData,
                    joiningdate: e.target.value,
                  }))
                }
                type="date"
                className="form-control"
              />
            </div>
            <div className="mb-3">
              <label htmlFor="date" className="form-label">
                Phone
              </label>
              <input
                required
                value={manageData.phone}
                onChange={(e) =>
                  setManageData((prevData) => ({
                    ...prevData,
                    phone: e.target.value,
                  }))
                }
                type="text"
                assword
                className="form-control"
              />
            </div>
            <div className="mb-3">
              <label htmlFor="date" className="form-label">
                Email
              </label>
              <input
                required
                value={manageData.email}
                onChange={(e) =>
                  setManageData((prevData) => ({
                    ...prevData,
                    email: e.target.value,
                  }))
                }
                type="text"
                className="form-control"
              />
            </div>

            {manageData.role == "marketer" && (
              <div className="marketr-exclusive">
                <div className="mb-3">
                  <label htmlFor="date" className="form-label">
                    Company Provided Name
                  </label>
                  <input
                    required
                    value={manageData.companyprovidedname}
                    onChange={(e) =>
                      setManageData((prevData) => ({
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
                    ...manageData,
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
                  Calling Date
                </label>
                <input
                  disabled
                  value={reportData.calling_date}
                  type="text"
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
                  disabled
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
                  disabled
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
                  disabled
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
                  disabled
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
                  disabled
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
                  disabled
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
                  disabled
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
                  disabled
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
                  disabled
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
                  value={reportData.calling_status}
                  disabled
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
                  disabled
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
                  disabled
                  value={reportData.feedback}
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
                  disabled
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
                  disabled
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
                    checked={reportData.is_test}
                    disabled
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
                    disabled
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
