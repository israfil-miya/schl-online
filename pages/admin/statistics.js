import React, { useState, useEffect } from "react";
import Navbar from "../../components/navbar";
import BarChart from "../../components/charts/Bar.chart";
import { getSession } from "next-auth/react";
import { toast } from "react-hot-toast";
import Orders from "../../db/Orders";

export default function Statistics() {
  const [orders, setOrders] = useState([]);
  const [fromTime, setFromTime] = useState("");
  const [toTime, setToTime] = useState("");
  const [statsOf, setStatsOf] = useState("Files");

  const convertToDDMMYYYY = (dateString) => {
    const [year, month, day] = dateString.split("-");
    if (year.length !== 4) return dateString;
    return `${day}-${month}-${year}`;
  };

  function getDateRange() {
    const today = new Date();
    const fifteenDaysAgo = new Date();
    fifteenDaysAgo.setDate(today.getDate() - 30);

    const formatDate = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${day}-${month}-${year}`;
    };

    const dateRange = {
      from: formatDate(fifteenDaysAgo),
      to: formatDate(today),
    };

    return dateRange;
  }

  async function filteredData() {
    let adjustedFromTime = fromTime || getDateRange().from;
    let adjustedToTime = toTime || getDateRange().to;

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
        statsfor: statsOf,
        getordersbyfilterstat: true,
        fromtime: adjustedFromTime,
        totime: adjustedToTime,
      },
    };

    try {
      const res = await fetch(url, options);
      const data = await res.json();

      if (!data.error) {
        setOrders(data.ordersQP);

        console.log(data)
      } else {
        toast.error("Unable to retrieve orders list");
      }
    } catch (error) {
      console.error("Error fetching filtered orders:", error);
    }
  }

  useEffect(() => {
    filteredData();
  }, []);

  useEffect(() => {
    setStatData({
      labels: orders.map((data) => data.date),
      datasets: [
        {
          data: orders.map((data) => data.fileQuantity),
          backgroundColor: "#EEDC82",
          borderColor: "black",
          borderWidth: 2,
        },
      ],
    });
  }, [orders]);

  const [statData, setStatData] = useState({
    labels: [],
    datasets: [
      {
        data: [],
        backgroundColor: "#EEDC82",
        borderColor: "black",
        borderWidth: 2,
      },
    ],
  });

  return (
    <>
      <Navbar navFor="admin" />
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div className="my-5 p-3 bg-light rounded border d-flex justify-content-center">
        <div
            style={{ display: "flex", alignItems: "center" }}
            className="filter_stats_of me-3"
          >
            <input
              className="form-check-input"
              type="radio"
              value="Files"
              id="radio1"
              checked={statsOf == "Files"}
              onChange={(e) => setStatsOf(e.target.value)}
            />
            <label
              className="form-check-label ms-2"
              htmlFor="radio1"
            >
              Files Flow
            </label>

            <input
              className="form-check-input"
              type="radio"
              value={`Orders`}
              id={`radio2`}
              checked={statsOf == "Orders"}
              onChange={(e) => setStatsOf(e.target.value)}
            />
            <label
              className="form-check-label ms-2"
              htmlFor="radio2"
            >
              Orders Flow
            </label>
          </div>

  
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

          <button
            onClick={filteredData}
            className="btn ms-4 btn-sm btn-outline-primary"
          >
            Search
          </button>
        </div>
      </div>
      <div className="container">
        {orders?.length !== 0 ? (
          <BarChart
            title={`File Flow Period: ${orders[0].date} - ${orders[orders.length - 1].date
              }`}
            chartData={statData}
          />
        ) : (
          <p className="text-center my-3">No Tasks found</p>
        )}
      </div>
    </>
  );
}

export async function getServerSideProps(context) {
  const session = await getSession(context);

  // code for redirect if not logged in
  if (
    !session ||
    session.user.role == "user" ||
    session.user.role == "manager"
  ) {
    return {
      redirect: {
        destination: "/?error=You need Admin/Super role to access the page",
        permanent: true,
      },
    };
  } else
    return {
      props: {},
    };
}
