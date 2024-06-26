import React from "react";
import { getSession, useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import Navbar from "@/components/navbar";

export default function Browse() {
  const { data: session } = useSession();

  const [page, setPage] = useState(1);
  const [pageCount, setPageCount] = useState(0);

  const [orders, setOrders] = useState(null);

  const [filters, setFilters] = useState({
    folder: "",
    client_code: "",
    task: "",
    fromtime: "",
    totime: "",
    type: "",
  });

  const [isFiltered, setIsFiltered] = useState(0);
  const [manageData, setManageData] = useState({});

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
    if (!dateString) return "";
    const [year, month, day] = dateString.split("-");
    if (year.length != 4) return dateString;
    return `${day}-${month}-${year}`;
  };

  async function filteredData() {
    const url = `${process.env.NEXT_PUBLIC_BASE_URL}/api/order`;

    const options = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ordersnumber: 50,
        getordersbyfilter: true,
        ...filters,
        page,
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
        toast.success("Edited the order data");

        if (!isFiltered) await GetAllOrders();
        else await filteredData();
      } else {
        toast.error(result.message);
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

      <div className="d-flex mt-3">
        <div className="container">
          <div
            className="float-end"
            style={{ display: "flex", alignItems: "center" }}
          >
            <span className="me-3">
              Page{" "}
              <strong>
                {orders?.items?.length !== 0 ? page : 0}/{pageCount}
              </strong>
            </span>
            <div
              className="btn-group me-2"
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
              <th>NOF</th>
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
                  <td className="text-break">
                    {convertToDDMMYYYY(order.download_date)}
                  </td>
                  <td className="text-break">
                    {convertToDDMMYYYY(order.delivery_date)}
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
                            _id: order._id || "",
                            client_code: order.client_code || "",
                            client_name: order.client_name || "",
                            folder: order.folder || "",
                            quantity: order.quantity || "",
                            rate: order.rate || "",
                            download_date: order.download_date || "",
                            delivery_date: order.delivery_date || "",
                            delivery_bd_time: order.delivery_bd_time || "",
                            task: order.task || "",
                            et: order.et || "",
                            production: order.production || "",
                            qc1: order.qc1 || "",
                            comment: order.comment || "",
                            status: order.status || "",
                            type: order.type || "",
                            priority: order.priority || "",
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
                            download_date: order.download_date || "",
                            delivery_date: order.delivery_date || "",
                            delivery_bd_time: order.delivery_bd_time || "",
                            task: order.task || "",
                            et: order.et || "",
                            production: order.production || "",
                            qc1: order.qc1 || "",
                            comment: order.comment || "",
                            status: order.status || "",
                            type: order.type || "",
                            priority: order.priority || "",
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
                <label htmlFor="nof" className="form-label">
                  NOF
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
                  id="nof"
                  placeholder="Number of Files"
                />
              </div>

              {session.user.role == "manager" ? null : (
                <div className="mb-3">
                  <label htmlFor="rate" className="form-label">
                    Rate
                  </label>
                  <input
                    value={manageData.rate}
                    onChange={(e) =>
                      setManageData((prevData) => ({
                        ...prevData,
                        rate: e.target.value,
                      }))
                    }
                    type="number"
                    className="form-control"
                    id="rate"
                    placeholder="rate"
                  />
                </div>
              )}

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
              <div className="mb-3">
                <label htmlFor="status" className="form-label">
                  Priority
                </label>
                <select
                  onChange={(e) =>
                    setManageData((prevData) => ({
                      ...prevData,
                      priority: e.target.value,
                    }))
                  }
                  value={manageData.priority}
                  className="form-select"
                  id="floatingSelectGrid"
                >
                  <option
                    value={""}
                    defaultValue={true}
                    className="text-body-secondary"
                  >
                    Select priority
                  </option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
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

      <div
        className="offcanvas offcanvas-end"
        tabIndex="-1"
        id="offcanvasNavbar"
        aria-labelledby="offcanvasNavbarLabel"
      >
        <div className="offcanvas-header">
          <h5 className="offcanvas-title" id="offcanvasNavbarLabel">
            Search tasks
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
                  Client Code
                </label>
                <input
                  value={filters.client_code}
                  onChange={(e) =>
                    setFilters((prevData) => ({
                      ...prevData,
                      client_code: e.target.value,
                    }))
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
                    value={filters.fromtime}
                    onChange={(e) =>
                      setFilters((prevData) => ({
                        ...prevData,
                        fromtime: e.target.value,
                      }))
                    }
                  />
                  <span className="input-group-text">to</span>
                  <input
                    type="date"
                    id="toDate"
                    className="form-control custom-input"
                    value={filters.totime}
                    onChange={(e) =>
                      setFilters((prevData) => ({
                        ...prevData,
                        totime: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>
            </div>

            <div className="row">
              <div className="col">
                <label className="fw-semibold" htmlFor="floatingInput">
                  Folder Name
                </label>
                <input
                  value={filters.folder}
                  onChange={(e) =>
                    setFilters((prevData) => ({
                      ...prevData,
                      folder: e.target.value,
                    }))
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
                  Task
                </label>
                <input
                  value={filters.task}
                  onChange={(e) =>
                    setFilters((prevData) => ({
                      ...prevData,
                      task: e.target.value,
                    }))
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
                  Type
                </label>
                <input
                  value={filters.type}
                  onChange={(e) =>
                    setFilters((prevData) => ({
                      ...prevData,
                      type: e.target.value,
                    }))
                  }
                  type="text"
                  className="form-control"
                  id="floatingInput"
                />
              </div>
            </div>

            <button onClick={filteredData} className="btn btn-outline-primary">
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
