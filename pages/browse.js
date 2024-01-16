import React from "react";
import { getSession, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import Navbar from "../components/navbar";

export default function Browse() {
  const { data: session } = useSession();

  const [page, setPage] = useState(1);
  const [pageCount, setPageCount] = useState(0);

  const router = useRouter();
  const [orders, setOrders] = useState(null);
  const [fromTime, setFromTime] = useState("");
  const [toTime, setToTime] = useState("");
  const [foldetFilter, setFolderFilter] = useState("");
  const [clientFilter, setClientFilter] = useState("");
  const [taskFilter, setTaskFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [isFiltered, setIsFiltered] = useState(0);
  const [manageData, setManageData] = useState({
    _id: "",
    client_code: "",
    client_name: "",
    folder: "",
    quantity: false,
    download_date: "",
    delivery_date: "",
    delivery_bd_time: "",
    task: "",
    et: false,
    production: "",
    qc1: false,
    comment: "",
    status: "",
  });

  const [editedBy, setEditedBy] = useState("");

  async function fetchOrderData(url, options) {
    const res = await fetch(url, options);
    const data = await res.json();
    return data;
  }

  async function GetAllOrders() {
    try {
      const url = `${process.env.NEXT_PUBLIC_BASE_URL}/api/order`;
      const options = {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          getallorders: true,
          page,
        },
      };

      const ordersList = await fetchOrderData(url, options);

      console.log(ordersList);

      if (!ordersList.error) {
        setOrders(ordersList);
      } else {
        toast.error("Unable to retrieve orders list");
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Error retrieving orders");
    }
  }

  const convertToDDMMYYYY = (dateString) => {
    const [year, month, day] = dateString.split("-");
    if (year.length != 4) return dateString;
    return `${day}-${month}-${year}`;
  };

  const convertToYYYYMMDD = (dateString) => {
    const [day, month, year] = dateString.split("-");
    return `${year}-${month}-${day}`;
  };

  async function filteredData() {
    let adjustedFromTime = fromTime;
    let adjustedToTime = toTime;

    if (fromTime) {
      adjustedFromTime = convertToDDMMYYYY(fromTime);
    }
    if (toTime) {
      adjustedToTime = convertToDDMMYYYY(toTime);
    }

    const url = `${process.env.NEXT_PUBLIC_BASE_URL}/api/order`;

    const options = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ordersnumber: 50,
        getordersbyfilter: true,
        folder: foldetFilter,
        client: clientFilter,
        task: taskFilter,
        fromtime: adjustedFromTime,
        totime: adjustedToTime,
        typefilter: typeFilter,
        page, // Include the current page in the request headers
      },
    };

    try {
      const orders = await fetchOrderData(url, options);

      if (!orders.error) {
        setIsFiltered(1);
        setOrders(orders);
      } else {
        setIsFiltered(0);
        await GetAllOrders();
      }
    } catch (error) {
      console.error("Error fetching filtered orders:", error);
    }
  }

  const FinishOrder = async (finishOrderData) => {
    const url = `${process.env.NEXT_PUBLIC_BASE_URL}/api/order`;
    const options = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        finishorder: true,
        id: finishOrderData._id,
      },
    };

    try {
      const resData = await fetchOrderData(url, options);

      if (!resData.error) {
        toast.success("Changed the status to FINISHED", {
          duration: 3500,
        });
        if (!isFiltered) await GetAllOrders();
        else await filteredData();
      } else {
        toast.error("Unable to change status");
      }
    } catch (error) {
      console.error("Error changing status:", error);
      toast.error("Error changing status");
    }
  };

  const RedoOrder = async (redoOrderData) => {
    const url = `${process.env.NEXT_PUBLIC_BASE_URL}/api/order`;
    const options = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        redoorder: true,
        id: redoOrderData._id,
      },
    };

    try {
      const resData = await fetchOrderData(url, options);

      if (!resData.error) {
        toast.success("Changed the status to CORRECTION", {
          duration: 3500,
        });
        if (!isFiltered) await GetAllOrders();
        else await filteredData();
      } else {
        toast.error("Unable to change status");
      }
    } catch (error) {
      console.error("Error changing status:", error);
      toast.error("Error changing status");
    }
  };

  async function deleteOrder() {
    let result;
    const res = await fetch(
      process.env.NEXT_PUBLIC_BASE_URL + "/api/approval",
      {
        method: "POST",
        body: JSON.stringify({
          req_type: "Task Delete",
          req_by: session.user.real_name,
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

  async function editOrder() {
    if (manageData.download_date && manageData.download_date.includes("-")) {
      manageData.download_date = convertToDDMMYYYY(manageData.download_date);
    }
    if (manageData.delivery_date && manageData.delivery_date.includes("-")) {
      manageData.delivery_date = convertToDDMMYYYY(manageData.delivery_date);
    }

    const url = `${process.env.NEXT_PUBLIC_BASE_URL}/api/order`;
    const options = {
      method: "POST",
      body: JSON.stringify(manageData),
      headers: {
        "Content-Type": "application/json",
        editorder: true,
        name: session.user?.real_name,
      },
    };

    try {
      const result = await fetchOrderData(url, options);

      if (!result.error) {
        toast.success("Edited the order data", {
          duration: 3500,
        });

        if (!isFiltered) await GetAllOrders();
        else await filteredData();
      } else {
        router.replace(`/admin?error=${result.message}`);
      }
    } catch (error) {
      console.error("Error editing order:", error);
      toast.error("Error editing order");
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
    if (!isFiltered) GetAllOrders();
    if (orders) setPageCount(orders?.pagination?.pageCount);
  }, [orders?.pagination?.pageCount]);

  useEffect(() => {
    if (!isFiltered) GetAllOrders();
    else filteredData();
  }, [page]);

  return (
    <>
      <Navbar navFor="browse" />
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div
          style={{ overflowX: "auto" }}
          className=" text-nowrap my-5 p-3 bg-light rounded border d-flex justify-content-center"
        >
          <div
            className="filter_time me-3"
            style={{ display: "flex", alignItems: "center" }}
          >
            <strong>Date: </strong>
            <input
              type="date"
              className="form-control mx-2 custom-input"
              value={fromTime}
              onChange={(e) => setFromTime(e.target.value)}
            />
            <span> To </span>
            <input
              type="date"
              className="form-control ms-2 custom-input"
              value={toTime}
              onChange={(e) => setToTime(e.target.value)}
            />
          </div>

          <div
            style={{ display: "flex", alignItems: "center" }}
            className="filter_folder me-3"
          >
            <strong>Folder: </strong>
            <input
              type="text"
              placeholder="Folder"
              className="form-control ms-2 custom-input"
              value={foldetFilter}
              onChange={(e) => setFolderFilter(e.target.value)}
            />
          </div>

          <div
            style={{ display: "flex", alignItems: "center" }}
            className="filter_client me-3"
          >
            <strong>Client: </strong>
            <input
              type="text"
              placeholder="Client"
              className="form-control ms-2 custom-input"
              value={clientFilter}
              onChange={(e) => setClientFilter(e.target.value)}
            />
          </div>

          <div
            style={{ display: "flex", alignItems: "center" }}
            className="filter_task me-3"
          >
            <strong>Task: </strong>
            <input
              type="text"
              placeholder="Task"
              className="form-control ms-2 custom-input"
              value={taskFilter}
              onChange={(e) => setTaskFilter(e.target.value)}
            />
          </div>

          <div
            style={{ display: "flex", alignItems: "center" }}
            className="filter_type me-3"
          >
            <strong>Type: </strong>
            <input
              type="text"
              placeholder="Task Type"
              className="form-control ms-2 custom-input"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            />
          </div>

          <button
            onClick={filteredData}
            className="btn ms-4 btn-sm btn-outline-primary"
          >
            Search
          </button>
        </div>
      </div>

      {orders?.items?.length !== 0 && (
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
        <table className="table table-bordered py-3 table-hover">
          <thead>
            <tr className="table-dark">
              <th>#</th>
              <th>Client Code</th>
              {session.user.role == "admin" || session.user.role == "super" ? (
                <th>Client Name</th>
              ) : (
                <></>
              )}
              <th>Folder</th>
              <th>Quantity</th>
              <th>Download Date</th>
              <th>Delivery Time</th>
              <th>Task</th>
              <th>E.T.</th>
              <th>Production</th>
              <th>QC1</th>
              <th>Type</th>
              <th>Status</th>
              <th>Manage</th>
            </tr>
          </thead>
          <tbody>
            {orders?.items &&
              orders?.items.map((order, index) => (
                <tr key={order._id}>
                  <td>{index + 1}</td>
                  <td className="text-break">{order.client_code}</td>

                  {session.user.role == "admin" ||
                  session.user.role == "super" ? (
                    <td className="text-wrap">{order.client_name}</td>
                  ) : null}

                  <td className="text-wrap text-break">{order.folder}</td>
                  <td className="text-break">{order.quantity}</td>
                  <td className="text-break">{order.download_date}</td>
                  <td className="text-break">
                    {order.delivery_date}
                    <span className="text-body-secondary"> | </span>
                    {order.delivery_bd_time}
                  </td>
                  <td className="text-break">{order.task}</td>
                  <td className="text-break">{order.et}</td>
                  <td className="text-break">{order.production}</td>
                  <td className="text-break">{order.qc1}</td>
                  <td className="text-break">{order.type}</td>
                  <td className="text-break">{order.status}</td>
                  {session.user.role == "admin" ||
                  session.user.role == "super" ? (
                    // Default state

                    <td
                      className="align-middle"
                      style={{ textAlign: "center" }}
                    >
                      <button
                        onClick={() => {
                          setManageData({
                            _id: order._id ?? "",
                            client_code: order.client_code ?? "",
                            client_name: order.client_name ?? "",
                            folder: order.folder ?? "",
                            quantity: order.quantity ?? "",
                            download_date:
                              convertToYYYYMMDD(order.download_date) ?? "",
                            delivery_date:
                              convertToYYYYMMDD(order.delivery_date) ?? "",
                            delivery_bd_time: order.delivery_bd_time ?? "",
                            task: order.task ?? "",
                            et: order.et ?? "",
                            production: order.production ?? "",
                            qc1: order.qc1 ?? "",
                            comment: order.comment ?? "",
                            status: order.status ?? "",
                            type: order.type ?? "",
                          });
                          setEditedBy(order.updated_by ?? "");
                        }}
                        className="btn btn-sm btn-outline-primary me-1"
                        data-bs-toggle="modal"
                        data-bs-target="#editModal"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setManageData({ _id: order._id })}
                        className="btn btn-sm btn-outline-danger me-1"
                        data-bs-toggle="modal"
                        data-bs-target="#deleteModal"
                      >
                        Delete
                      </button>
                      <button
                        onClick={
                          order.status === "Finished"
                            ? () => RedoOrder(order)
                            : () => FinishOrder(order)
                        }
                        className={`btn btn-sm ${
                          order.status === "Finished"
                            ? "btn-outline-warning"
                            : "btn-outline-success"
                        }`}
                      >
                        {order.status === "Finished" ? "Redo" : "Finish"}
                      </button>
                    </td>
                  ) : null}

                  {session.user.role == "manager" ? (
                    // Default state

                    <td
                      className="align-middle"
                      style={{ textAlign: "center" }}
                    >
                      <button
                        onClick={() => {
                          setManageData({
                            _id: order._id || "",
                            client_code: order.client_code || "",
                            client_name: order.client_name || "",
                            folder: order.folder || "",
                            quantity: order.quantity || "",
                            download_date:
                              convertToYYYYMMDD(order.download_date) || "",
                            delivery_date:
                              convertToYYYYMMDD(order.delivery_date) || "",
                            delivery_bd_time: order.delivery_bd_time || "",
                            task: order.task || "",
                            et: order.et || "",
                            production: order.production || "",
                            qc1: order.qc1 || "",
                            comment: order.comment || "",
                            status: order.status || "",
                            type: order.type || "",
                          });
                          setEditedBy(order.updated_by || "");
                        }}
                        className="btn btn-sm mx-2 btn-outline-primary"
                        data-bs-toggle="modal"
                        data-bs-target="#editModal"
                      >
                        Edit
                      </button>
                    </td>
                  ) : (
                    <></>
                  )}
                </tr>
              ))}
          </tbody>
        </table>
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
                Edit task
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
                  value={manageData.client_code}
                  onChange={(e) =>
                    setManageData((prevData) => ({
                      ...prevData,
                      client_code: e.target.value,
                    }))
                  }
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
                  value={manageData.client_name}
                  onChange={(e) =>
                    setManageData((prevData) => ({
                      ...prevData,
                      client_name: e.target.value,
                    }))
                  }
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
                  value={manageData.folder}
                  onChange={(e) =>
                    setManageData((prevData) => ({
                      ...prevData,
                      folder: e.target.value,
                    }))
                  }
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
                  value={manageData.quantity}
                  onChange={(e) =>
                    setManageData((prevData) => ({
                      ...prevData,
                      quantity: e.target.value,
                    }))
                  }
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
                  value={manageData.download_date}
                  onChange={(e) =>
                    setManageData((prevData) => ({
                      ...prevData,
                      download_date: e.target.value,
                    }))
                  }
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
                  value={manageData.delivery_date}
                  onChange={(e) =>
                    setManageData((prevData) => ({
                      ...prevData,
                      delivery_date: e.target.value,
                    }))
                  }
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
                  value={manageData.delivery_bd_time}
                  onChange={(e) =>
                    setManageData((prevData) => ({
                      ...prevData,
                      delivery_bd_time: e.target.value,
                    }))
                  }
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
                  value={manageData.task}
                  onChange={(e) =>
                    setManageData((prevData) => ({
                      ...prevData,
                      task: e.target.value,
                    }))
                  }
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
                  value={manageData.et}
                  onChange={(e) =>
                    setManageData((prevData) => ({
                      ...prevData,
                      et: e.target.value,
                    }))
                  }
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
                  value={manageData.production}
                  onChange={(e) =>
                    setManageData((prevData) => ({
                      ...prevData,
                      production: e.target.value,
                    }))
                  }
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
                  value={manageData.qc1}
                  onChange={(e) =>
                    setManageData((prevData) => ({
                      ...prevData,
                      qc1: e.target.value,
                    }))
                  }
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
                <textarea
                  value={manageData.comment}
                  onChange={(e) =>
                    setManageData((prevData) => ({
                      ...prevData,
                      comment: e.target.value,
                    }))
                  }
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
                  value={manageData.type}
                  onChange={(e) =>
                    setManageData((prevData) => ({
                      ...prevData,
                      type: e.target.value,
                    }))
                  }
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
                  value={manageData.status}
                  onChange={(e) =>
                    setManageData((prevData) => ({
                      ...prevData,
                      status: e.target.value,
                    }))
                  }
                  type="text"
                  className="form-control"
                  id="status"
                  placeholder="Status"
                />
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
                onClick={editOrder}
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
                Delete Task Confirmation
              </h1>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              <p>Do you really want to delete this task?</p>
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
                onClick={deleteOrder}
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
            padding: 5px auto;
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
  if (!session || session.user.role == "user") {
    return {
      redirect: {
        destination:
          "/?error=You need Manager/Admin/Super role to access the page",
        permanent: true,
      },
    };
  } else
    return {
      props: {},
    };
}
