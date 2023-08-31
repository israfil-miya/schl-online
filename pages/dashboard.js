import React from "react";
import { getSession, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

import Navbar from "../components/navbar";

export default function Browse() {
  const { data: session } = useSession();
  const router = useRouter();
  const [orderInfo, setOrderInfo] = useState(null)
  const [approvals, setApprovals] = useState([]);

  async function fetchOrderData(url, options) {
    const res = await fetch(url, options);
    const data = await res.json();
    return data;
  }

  async function GetAllOrdersNonApproved() {
    try {
      const url = `${process.env.NEXT_PUBLIC_BASE_URL}/api/approval`;
      const options = {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          getallordersnonapproved: true,
        },
      };

      const ordersList = await fetchOrderData(url, options);

      if (!ordersList.error) {
        setApprovals(ordersList);
      } else {
        toast.error("Unable to retrieve waiting list");
      }
    } catch (error) {
      console.error("Error fetching waiting list:", error);
      toast.error("Error retrieving waiting list");
    }
  }

  async function GetOrderInfoById(orderId) {
    try {
      const url = `${process.env.NEXT_PUBLIC_BASE_URL}/api/approval`;
      const options = {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          getorderinfobyid: true,
        },
      };

      const ordersList = await fetchOrderData(url, options);

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


  useEffect(() => {
    GetAllOrdersNonApproved();
  }, []);


  return (
    <>
      <Navbar navFor="dashboard" />

      <div className="container my-5">
        <div className="waiting-list">
          <h5 className="py-3">Waiting for approval</h5>


          <table
            style={{ overflow: "hidden" }}
            className="table table-bordered py-3 table-hover"
          >
            <thead>
              <tr>
                <th>#</th>
                <th>Request Type</th>
                <th>Resust Status</th>
                <th>Manage</th>
              </tr>
            </thead>
            <tbody>


              {approvals &&
                approvals.map((approveReq, index) => (
                  <tr key={approveReq._id}>
                    <td>{index + 1}</td>
                    <td>{approveReq.req_type}</td>
                    <td>{approveReq.req_approved ? "Approved" : "Not approved"}</td>
                    <td>
                      <button className="btn btn-sm btn-outline-primary">
                        Approve
                      </button>
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
            font-size: 15px
          }

          th,
          td {
            padding: 3px 6px;
          }
        `}
      </style>
    </>)
}