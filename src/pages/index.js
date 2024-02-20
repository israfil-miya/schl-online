import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { toast } from "sonner";
import { useSession, SessionProvider, getSession } from "next-auth/react";

import Navbar from "../components/navbar";



export default function Home({ orders, ordersRedo }) {
  const [countdowns, setCountdowns] = useState([]);

  const convertToDDMMYYYY = (dateString) => {
    if (!dateString) return "";
    const [year, month, day] = dateString?.split("-");
    if (year.length != 4) return dateString;
    return `${day}-${month}-${year}`;
  };

  const calculateCountdown = (timeDifferenceMs) => {
    const totalSeconds = Math.floor(timeDifferenceMs / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  const getCurrentTimes = (times) => {
    const timesNow = times.map((time) => time.timeDifference <= 0
      ? 'Over'
      : calculateCountdown(time.timeDifference));
    return timesNow;
  };

  useEffect(() => {
    const eventSource = new EventSource(process.env.NEXT_PUBLIC_BASE_URL + '/api/sse/order/remaining-time');

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setCountdowns(getCurrentTimes(data));
    };

    return () => {
      eventSource.close();
    };
  }, []);

  return (
    <>
      <Navbar navFor="tasks" />
      <div className="mb-5">
        <div style={{ overflowX: "auto" }} className="text-nowrap my-2">
          <h5 className="text-center py-4">Test & Correction</h5>
          <table className="table table-bordered py-3 table-hover">
            <thead>
              <tr>
                <th>#</th>
                <th>Client Code</th>
                <th>Folder</th>
                <th>Quantity</th>
                <th>Download Date</th>
                <th>Delivery Time</th>
                <th>Task</th>
                <th>E.T.</th>
                <th>Production</th>
                <th>QC1</th>
                <th>Comments</th>
                <th>Type</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {ordersRedo &&
                ordersRedo.map((order, index) => {
                  return (
                    <tr key={order._id}>
                      <td>{index + 1}</td>
                      <td className="text-break">{order.client_code}</td>
                      <td className="text-break">{order.folder}</td>
                      <td className="text-break">{order.quantity}</td>
                      <td className="text-break">
                        {order.download_date &&
                          convertToDDMMYYYY(order.download_date)}
                      </td>
                      <td className="text-break">
                        {order.delivery_date &&
                          convertToDDMMYYYY(order.delivery_date)}
                        <span className="text-body-secondary"> | </span>
                        {order.delivery_bd_time}
                      </td>
                      <td className="text-break">{order.task}</td>
                      <td className="text-break">{order.et}</td>
                      <td className="text-break">{order.production}</td>
                      <td className="text-break">{order.qc1}</td>
                      <td className="text-break">{order.comment}</td>
                      <td className="text-break">{order.type}</td>
                      <td className="text-break">{order.status}</td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>

        <div style={{ overflowX: "auto" }} className="text-nowrap my-2">
          <h5 className="text-center py-4">Running Task List</h5>
          <table className="table table-bordered py-3 table-hover">
            <thead>
              <tr>
                <th>#</th>
                <th>Client Code</th>
                <th>Folder</th>
                <th>Quantity</th>
                <th>Download Date</th>
                <th>Delivery Time</th>
                <th>Time Remaining</th>
                <th>Task</th>
                <th>E.T.</th>
                <th>Production</th>
                <th>QC1</th>
                <th>Comments</th>
                <th>Type</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {orders &&
                orders?.map((order, index) => {
                  let priorityColor = "";
                  let countdownTime = countdowns[index];

                  if (countdownTime) {
                    const [hours, minutes, seconds] = countdownTime?.split(":");
                    const totalSeconds =
                      parseInt(hours) * 3600 +
                      parseInt(minutes) * 60 +
                      parseInt(seconds);

                    if (totalSeconds > 0) {
                      if (totalSeconds <= 1800 || order.priority == "high") {
                        priorityColor = "table-danger";
                      } else if (
                        totalSeconds <= 3600 ||
                        order.priority == "medium"
                      ) {
                        priorityColor = "table-warning";
                      }
                    }
                    if (countdownTime == "Over") priorityColor = "table-dark";
                  }

                  return (
                    <tr
                      key={order._id}
                      className={priorityColor ? priorityColor : ""}
                    >
                      <td>{index + 1}</td>
                      <td className="text-break">{order.client_code}</td>
                      <td className="text-break">{order.folder}</td>
                      <td className="text-break">{order.quantity}</td>
                      <td className="text-break">
                        {order.download_date &&
                          convertToDDMMYYYY(order.download_date)}
                      </td>
                      <td className="text-break">
                        {order.delivery_date &&
                          convertToDDMMYYYY(order.delivery_date)}
                        <span className="text-body-secondary"> | </span>
                        {order.delivery_bd_time}
                      </td>
                      <td className="text-break">{countdowns?.[index]}</td>
                      <td className="text-break">{order.task}</td>
                      <td className="text-break">{order.et}</td>
                      <td className="text-break">{order.production}</td>
                      <td className="text-break">{order.qc1}</td>
                      <td className="text-break">{order.comment}</td>
                      <td className="text-break">{order.type}</td>
                      <td className="text-break">{order.status}</td>
                    </tr>
                  );
                })}
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
    session?.user.role !== "super" &&
    session?.user.role !== "admin" &&
    !ALLOWED_IPS?.includes(ip)
  ) {
    return {
      redirect: {
        destination: "/forbidden",
        permanent: false,
      },
    };
  }

  if (session?.user.role == "marketer")
    return {
      redirect: {
        destination: "/crm/marketers",
        permanent: true,
      },
    };

  const res = await fetch(process.env.NEXT_PUBLIC_BASE_URL + "/api/order", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      getordersunfinished: true,
    },
  });
  const res2 = await fetch(process.env.NEXT_PUBLIC_BASE_URL + "/api/order", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      getordersredo: true,
    },
  });
  const orders = await res.json();
  const ordersRedo = await res2.json();
  return { props: { orders, ordersRedo } };
}
