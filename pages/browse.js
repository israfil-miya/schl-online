import React from "react";
import { useEffect, useState } from "react";
import Navbar from "../components/navbar";

export default function Browse({ orders: ordersArr }) {
  const [orders, setOrders] = useState(ordersArr);
  const [fromTime, setFromTime] = useState("");
  const [toTime, setToTime] = useState("");
  const [foldetFilter, setFolderFilter] = useState("");
  const [clientFilter, setClientFilter] = useState("");
  const [taskFilter, setTaskFilter] = useState("");

  const filteredData = async () => {
    const res = await fetch(process.env.NEXT_PUBLIC_BASE_URL + "/api/order", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        getordersbyfilter: true,
        folder: foldetFilter,
        client: clientFilter,
        task: taskFilter,
        fromtime: fromTime,
        totime: toTime,
      },
    });
    const orders = await res.json();
    if (!orders.error) {
      setOrders(orders);
    } else {
      setOrders(ordersArr);
    }
  };

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
        <div className="my-5 p-3 bg-light rounded border d-flex justify-content-center">
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

          <button
            onClick={filteredData}
            className="btn ms-5 btn-outline-primary"
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
          <tr>
            <th>#</th>
            <th>Added Time</th>
            <th>Client Code</th>
            <th>Folder</th>
            <th>Quantity</th>
            <th>Download Date</th>
            <th>Delivery Time</th>
            <th>Task</th>
            <th>E.T.</th>
            <th>Production</th>
            <th>QC1</th>
            <th>Comment</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {orders &&
            orders.map((order, index) => (
              <tr key={order._id}>
                <td>{index + 1}</td>
                <td className="text-break">
                  {order.date_today}
                  <span className="text-body-secondary"> | </span>
                  {order.time_now}
                </td>
                <td className="text-break">{order.client_code}</td>
                <td className="text-break">{order.folder}</td>
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
                <td className="text-break">{order.comment}</td>
                <td className="text-break">{order.status}</td>
              </tr>
            ))}
        </tbody>
      </table>

      <style jsx>
        {`
.table {
  font-size: 2ex
}

th, td {
  padding: 1px 6px
}
        `}
      </style>
    </>
  );
}
export async function getServerSideProps(context) {
  const res = await fetch(process.env.NEXT_PUBLIC_BASE_URL + "/api/order", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      getallorders: true,
    },
  });
  const orders = await res.json();
  return { props: { orders } };
}
