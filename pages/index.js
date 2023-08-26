import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import toast from "react-hot-toast";

import Navbar from "../components/navbar";

const getCurrentTimes = (orders) => {
  const timesNow = orders.map((order) =>
    order.timeDifference <= 0
      ? "Over"
      : calculateCountdown(order.timeDifference)
  );
  return timesNow;
};

function calculateCountdown(timeDifferenceMs) {
  const totalSeconds = Math.floor(timeDifferenceMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
}

export default function Home({ orders }) {
  const router = useRouter();
  let { error, success } = router.query;

  const [countdowns, setCountdowns] = useState(getCurrentTimes(orders));

  const GetAllOrdersTime = async () => {
    const res = await fetch(process.env.NEXT_PUBLIC_BASE_URL + "/api/order", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        getonlytime: true,
      },
    });
    const orders = await res.json();
    return orders;
  };

  useEffect(() => {
    if (error) {
      toast.error(error, {
        toastId: "error",
      });
      router.replace("/");
    }
    if (success) {
      toast.success(success, {
        toastId: "success",
      });
      router.replace("/");
    }

    if (!orders || orders.error) {
      toast.error("Unable to retrieve tasks list");
    }

    const countdownIntervalId = setInterval(async () => {
      const updatedOrders = await GetAllOrdersTime();
      const updatedCountdowns = getCurrentTimes(updatedOrders);
      setCountdowns(updatedCountdowns);
    }, process.env.NEXT_PUBLIC_UPDATE_DELAY);

    return () => {
      clearInterval(countdownIntervalId); // Clear countdown interval
    };
  }, [error, success, router, orders]);

  return (
    <>
      <Navbar navFor="tasks" />
      <div className="mb-5">
        <h5 className="text-center py-4">TASKS LIST</h5>
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
              <th>Time Remaining</th>
              <th>Task</th>
              <th>E.T.</th>
              <th>Production</th>
              <th>QC1</th>
              <th>Comments</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {orders &&
              orders.map((order, index) => {
                let priorityColor = "";
                const countdownTime = countdowns[index];
                const [hours, minutes, seconds] = countdownTime.split(":");
                const totalSeconds =
                  parseInt(hours) * 3600 +
                  parseInt(minutes) * 60 +
                  parseInt(seconds);

                if (totalSeconds > 0) {
                  if (totalSeconds <= 600) {
                    priorityColor = "table-danger";
                  } else if (totalSeconds <= 1800) {
                    priorityColor = "table-warning";
                  }
                }
                if (countdownTime == "Over") priorityColor = "table-secondary";

                return (
                  <tr
                    key={order._id}
                    className={priorityColor ? priorityColor : ""}
                  >
                    <td>{index + 1}</td>
                    <td className="text-break">
                      <span className="fw-medium">Date:</span>{" "}
                      {order.date_today}
                      <br />
                      <span className="fw-medium">Time:</span> {order.time_now}
                    </td>
                    <td className="text-break">{order.client_code}</td>
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
                    <td className="text-break">{countdowns[index]}</td>
                    <td className="text-break">{order.task}</td>
                    <td className="text-break">{order.et}</td>
                    <td className="text-break">{order.production}</td>
                    <td className="text-break">{order.qc1}</td>
                    <td className="text-break">{order.comment}</td>
                    <td className="text-break">{order.status}</td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
      <style jsx>
        {`
          .table-danger {
            background-color: red !important;
          }
          .table-warning {
            background-color: yellow !important;
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
      getordersunfinished: true,
    },
  });
  const orders = await res.json();
  return { props: { orders } };
}
