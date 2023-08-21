import React from "react";
import { useEffect, useState } from "react";
import { getSession, useSession } from "next-auth/react";
import Navbar from "../../components/navbar";
import { toast } from "react-hot-toast";

export default function ClientRecords({ client, possibleTimePeriods }) {
  // console.log("possibleTimePeriods", possibleTimePeriods)
  const [timePeriodState, setTimePeriodState] = useState(
    possibleTimePeriods.length > 0
      ? JSON.stringify({
        year: possibleTimePeriods[0].year,
        month: possibleTimePeriods[0].month,
      })
      : ""
  );
  const [orders, setOrdersList] = useState();

  async function fetchData(url, options) {
    const res = await fetch(url, options);
    const data = await res.json();
    return data;
  }

  async function GetAllOrders(year, month, client_code) {
    try {
      const url = `${process.env.NEXT_PUBLIC_BASE_URL}/api/order`;
      const options = {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          getentriesbyyearandmonth: true,
          year,
          month,
          client_code,
        },
      };

      const ordersList = await fetchData(url, options);

      if (!ordersList.error) {
        // console.log(ordersList);
        setOrdersList(ordersList);
      } else {
        toast.error("Unable to retrieve orders list");
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Error retrieving orders");
    }
  }

  useEffect(() => {

    if (possibleTimePeriods.length) {
      const parsedTimePeriod = JSON.parse(timePeriodState);
      GetAllOrders(parsedTimePeriod.year, parsedTimePeriod.month, client.client_code);
    }
  }, [timePeriodState]);

  return (
    <>
      <Navbar navFor="admin" />
      <div className="container">
        <div className="my-5 time-period-selection d-flex justify-content-between">
          <h5 className="p-3 bg-warning">{client?.client_code}</h5>
          <div>
            <div>
              <label htmlFor="date" className="form-label">
                Choose Month & Year
              </label>

              <select
                className="form-select"
                value={timePeriodState}
                onChange={(e) => setTimePeriodState(e.target.value)}
                id="floatingSelect"
                required
              >
                {possibleTimePeriods.length === 0 ? (
                  <option disabled value="">
                    No time periods available
                  </option>
                ) : (
                  possibleTimePeriods.map((timePeriod, index) => {
                    const value = JSON.stringify(timePeriod);
                    return (
                      <option key={index} value={value}>
                        {`${timePeriod.year}/${timePeriod.month}`}
                      </option>
                    );
                  })
                )}
              </select>

            </div>
          </div>
        </div>
        <div className="orders-list my-5">
          {" "}
          <h5 className="d-flex py-3 justify-content-center text-center">
            LIST OF ALL TASKS
          </h5>
          <table
            style={{ overflow: "hidden" }}
            className="table table-bordered py-3 table-hover"
          >
            <thead>
              <tr>
                <th>#</th>
                <th>Added Time</th>
                <th>Client Name</th>
                <th>Folder</th>
                <th>Quantity</th>
                <th>Download Date</th>
                <th>Delivery Time</th>
                <th>Task</th>
                <th>E.T.</th>
                <th>Production</th>
                <th>QC1</th>
                <th>Assign</th>
                <th>Comments</th>
              </tr>
            </thead>
            <tbody>
              {orders &&
                orders.map((order, index) => (
                  <tr key={order._id}>
                    <td>{index + 1}</td>
                    <td className="text-break">
                      <span className="fw-medium">Date:</span>{" "}
                      {order.date_today}
                      <br />
                      <span className="fw-medium">Time:</span> {order.time_now}
                    </td>
                    <td className="text-break">{order.client_name}</td>
                    <td className="text-break">{order.folder}</td>
                    <td className="text-break">{order.quantity}</td>
                    <td className="text-break">{order.download_date}</td>
                    <td className="text-break">
                      <span className="fw-medium">Date:</span>{" "}
                      {order.delivery_date}
                      <br />
                      <span className="fw-medium">Time:</span>{" "}
                      {order.delivery_bd_time}
                    </td>
                    <td className="text-break">{order.task}</td>
                    <td className="text-break">{order.et}</td>
                    <td className="text-break">{order.production}</td>
                    <td className="text-break">{order.qc1}</td>
                    <td className="text-break">{order.assign}</td>
                    <td className="text-break">{order.comment}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

export async function getServerSideProps(context) {
  const { clientId } = context.params;
  const session = await getSession(context);

  // code for redirect if not logged in
  if (!session || session?.user?.role != "admin") {
    return {
      redirect: {
        destination: "/?error=You need Admin role to access the page",
        permanent: true,
      },
    };
  }







  const res1 = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/client`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      getclientinfo: true,
      _id: clientId,
    },
  });
  const resData1 = await res1.json();

  if (!resData1.error) {

    const res2 = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/order`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        gettimeperiods: true,
        client_code: resData1.client_code,
      },
    });
    const resData2 = await res2.json();

    if (!resData2.error) {
      return {
        props: { client: resData1, possibleTimePeriods: resData2 },
      };
    }

  } else {
    return {
      redirect: {
        destination: "/admin?error=Invalid client",
        permanent: true,
      },
    };
  }
}
