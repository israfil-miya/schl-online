import React from "react";
import { getSession, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

export default function Browse() {
  const { data: session } = useSession();
  const router = useRouter();
  const [usersApprovals, setUsersApprovals] = useState([]);
  const [ordersApprovals, setOrdersApprovals] = useState([]);
  const [manageData, setManageData] = useState({});

  async function fetchApi(url, options) {
    const res = await fetch(url, options);
    const data = await res.json();
    return data;
  }

  async function GetAllOrdersForApproval() {
    try {
      const url = `${process.env.NEXT_PUBLIC_BASE_URL}/api/approval`;
      const options = {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          getallordersforapproval: true,
        },
      };

      const ordersList = await fetchApi(url, options);

      if (!ordersList.error) {
        setOrdersApprovals(ordersList);
      } else {
        toast.error("Unable to retrieve orders waiting list");
      }
    } catch (error) {
      console.error("Error fetching orders waiting list:", error);
      toast.error("Error retrieving orders waiting list");
    }
  }

  async function GetAllUsersForApproval() {
    try {
      const url = `${process.env.NEXT_PUBLIC_BASE_URL}/api/approval`;
      const options = {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          getallusersforapproval: true,
        },
      };

      const usersList = await fetchApi(url, options);

      if (!usersList.error) {
        setUsersApprovals(usersList);
      } else {
        toast.error("Unable to retrieve users waiting list");
      }
    } catch (error) {
      console.error("Error fetching users waiting list:", error);
      toast.error("Error retrieving users waiting list");
    }
  }

  async function handleResponse(data) {
    try {
      console.log(data);
      const url = `${process.env.NEXT_PUBLIC_BASE_URL}/api/approval`;
      const options = {
        method: "POST",
        body: JSON.stringify({
          response: data.response,
          checked_by: session.user.name,
          _id: data._id,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      };

      const resData = await fetchApi(url, options);

      if (!resData.error) {
        if (manageData.req_type.split(" ")[0] == "User") {
          await GetAllUsersForApproval();
        } else if (manageData.req_type.split(" ")[0] == "Task") {
          await GetAllOrdersForApproval();
        } else return;
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
    GetAllOrdersForApproval();
    GetAllUsersForApproval();
  }, []);

  return (
    <>
      <div className="container my-5">
        <div className="waiting-list">
          <div className="d-flex py-3">
            <h5>Users Approvals</h5>
            <span className="text-body-secondary ms-2">
              ({usersApprovals.length})
            </span>
          </div>
          <table
            style={{ overflow: "hidden" }}
            className="table table-bordered py-3 table-hover"
          >
            <thead>
              <tr>
                <th>#</th>
                <th>Request Type</th>
                <th>Request Status</th>
                <th>Request By</th>
                <th>Request Timestamp</th>
                <th>Manage</th>
              </tr>
            </thead>
            <tbody>
              {usersApprovals &&
                usersApprovals.map((approveReq, index) => (
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
                    <td
                      className="align-middle"
                      style={{ textAlign: "center" }}
                    >
                      {approveReq.checked_by == "None" ? (
                        <>
                          <button className="btn btn-sm btn-outline-success me-1">
                            Approve
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger me-1"
                            onClick={() =>
                              handleResponse({
                                ...approveReq,
                                response: "reject",
                              })
                            }
                          >
                            Reject
                          </button>
                          <button className="btn btn-sm btn-outline-primary">
                            View
                          </button>
                        </>
                      ) : (
                        <p>
                          Checked by{" "}
                          <span className="fw-medium">
                            {approveReq.checked_by}
                          </span>{" "}
                          on{" "}
                          <span className="fw-medium">
                            {
                              formatTimestamp(
                                approveReq.updatedAt.toLocaleString()
                              ).date
                            }{" "}
                          </span>{" "}
                          at{" "}
                          <span className="fw-medium">
                            {
                              formatTimestamp(
                                approveReq.updatedAt.toLocaleString()
                              ).time
                            }
                          </span>
                        </p>
                      )}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        <div className="waiting-list">
          <div className="d-flex py-3">
            <h5>Tasks Approvals</h5>
            <span className="text-body-secondary ms-2">
              ({ordersApprovals.length})
            </span>
          </div>
          <table
            style={{ overflow: "hidden" }}
            className="table table-bordered py-3 table-hover"
          >
            <thead>
              <tr>
                <th>#</th>
                <th>Request Type</th>
                <th>Request Status</th>
                <th>Request By</th>
                <th>Request Timestamp</th>
                <th>Manage</th>
              </tr>
            </thead>
            <tbody>
              {ordersApprovals &&
                ordersApprovals.map((approveReq, index) => (
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
                    <td
                      className="align-middle"
                      style={{ textAlign: "center" }}
                    >
                      {approveReq.checked_by == "None" ? (
                        <>
                          <button className="btn btn-sm btn-outline-success me-1">
                            Approve
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger me-1"
                            onClick={() =>
                              handleResponse({
                                ...approveReq,
                                response: "reject",
                              })
                            }
                          >
                            Reject
                          </button>
                          <button className="btn btn-sm btn-outline-primary">
                            View
                          </button>
                        </>
                      ) : (
                        <p>
                          Checked by{" "}
                          <span className="fw-medium">
                            {approveReq.checked_by}
                          </span>{" "}
                          on{" "}
                          <span className="fw-medium">
                            {
                              formatTimestamp(
                                approveReq.updatedAt.toLocaleString()
                              ).date
                            }{" "}
                          </span>{" "}
                          at{" "}
                          <span className="fw-medium">
                            {
                              formatTimestamp(
                                approveReq.updatedAt.toLocaleString()
                              ).time
                            }
                          </span>
                        </p>
                      )}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
      <style jsx>
        {`
          .table {
            font-size: 15px;
          }

          th,
          td {
            padding: 3px 6px;
          }
        `}
      </style>
    </>
  );
}
