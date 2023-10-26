import React, { useState, useEffect } from "react";
import Navbar from "../../components/navbar";
import BarChart from "../../components/charts/Bar.chart";
import { getSession } from "next-auth/react";
import { toast } from "react-hot-toast";
import Orders from "../../db/Orders";

export default function Statistics() {
  const [ordersQP, setOrdersQP] = useState([]);
  const [ordersCD, setOrdersCD] = useState([]);
  const [ordersStatus, setOrdersStatus] = useState([]);

  const [fromTime, setFromTime] = useState("");
  const [toTime, setToTime] = useState("");
  const [statsOf, setStatsOf] = useState("Files");
  const [CDParsedHtml, setCDParsedHtml] = useState([]);

  const [statDataFlow, setStatDataFlow] = useState({ datasets: [] });
  const [statDataFlowStatus, setStatDataFlowStatus] = useState({
    datasets: [],
  });

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
      return `${year}-${month}-${day}`;
    };

    setFromTime(formatDate(fifteenDaysAgo));
    setToTime(formatDate(today));
  }

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
        getordersbyfilterstat: true,
        fromtime: adjustedFromTime,
        totime: adjustedToTime,
      },
    };

    try {
      const res = await fetch(url, options);
      const data = await res.json();

      if (!data.error) {
        setOrdersQP(data.ordersQP);
        setOrdersCD(data.ordersCD);
        setOrdersStatus(data.ordersStatus);
        console.log("ORDERS STATUS: ", data.ordersStatus);
      } else {
        toast.error("Unable to retrieve orders list");
      }
    } catch (error) {
      console.error("Error fetching filtered orders:", error);
    }
  }

  function parseCDHtml(statof) {
    let parsed = [];
    console.log("Stats", statof);
    console.log(ordersCD);
    for (const country in ordersCD) {
      parsed.push(
        <tr key={country}>
          <th>{country}</th>
          {ordersCD[country].map((data, index) => (
            <td key={index}>
              {statsOf == "Files" ? data.fileQuantity : data.orderQuantity}
            </td>
          ))}
        </tr>,
      );
    }
    console.log(parsed);
    setCDParsedHtml(parsed);
  }

  useEffect(() => {
    getDateRange();
  }, []);

  useEffect(() => {
    if (fromTime && toTime) {
      filteredData();
      parseCDHtml(statsOf);
    }
  }, [fromTime, toTime]);

  useEffect(() => {
    parseCDHtml(statsOf); // Move this useEffect to ensure it's called after statsOf is updated
  }, [ordersCD, statsOf]);

  useEffect(() => {
    setStatDataFlowStatus({
      labels: ordersStatus.map((data) => data.date),
      datasets: [
        {
          data: ordersStatus.map((data) =>
            statsOf == "Files"
              ? data.fileQuantity
              : statsOf == "Orders"
              ? data.orderQuantity
              : null,
          ),
          backgroundColor: "#efa438",
          borderColor: "black",
          borderWidth: 2,
          minBarLength: 1,
        },
        {
          data: ordersStatus.map((data) =>
            statsOf == "Files"
              ? data.filePending
              : statsOf == "Orders"
              ? data.orderPending
              : null,
          ),
          backgroundColor: "#466cdb",
          borderColor: "black",
          borderWidth: 2,
          minBarLength: 1,
        },
      ],
    });
  }, [ordersStatus, statsOf]);

  useEffect(() => {
    setStatDataFlow({
      labels: ordersQP.map((data) => data.date),
      datasets: [
        {
          data: ordersQP.map((data) =>
            statsOf == "Files"
              ? data.fileQuantity
              : statsOf == "Orders"
              ? data.orderQuantity
              : null,
          ),
          backgroundColor: "#efa438",
          borderColor: "black",
          borderWidth: 2,
          minBarLength: 1,
        },
      ],
    });
  }, [ordersQP, statsOf]);

  return (
    <>
      <Navbar navFor="admin" />
      <div className="m-3">
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
              <label className="form-check-label ms-2" htmlFor="radio1">
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
              <label className="form-check-label ms-2" htmlFor="radio2">
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
              Refresh
            </button>
          </div>
        </div>
        <div className="FlowChart my-3">
          {ordersQP?.length !== 0 ? (
            <BarChart
              title={`File Flow Period: ${ordersQP[0].date} - ${
                ordersQP[ordersQP.length - 1].date
              }`}
              chartData={statDataFlow}
            />
          ) : (
            <p className="text-center my-3">Loading...</p>
          )}
        </div>
        {CDParsedHtml.length !== 0 && (
          <div
            style={{ overflowX: "auto" }}
            className="CountryFlowTable my-3 p-3 bg-light shadow-sm rounded border justify-content-center"
          >
            {ordersQP?.length !== 0 ? (
              <p className="fw-bold text-center">{`File Flow Period: ${
                ordersQP[0].date
              } - ${ordersQP[ordersQP.length - 1].date}`}</p>
            ) : null}

            <table className="table text-center table-bordered">
              <thead>
                <tr>
                  <th></th>

                  {ordersQP.map((data, index) => (
                    <th key={index}>{data.date.split(" ")[1]}</th>
                  ))}
                </tr>
              </thead>
              <tbody>{CDParsedHtml.map((tableRow, index) => tableRow)}</tbody>
            </table>
          </div>
        )}
        <div className="StatusChart my-3">
          {ordersStatus?.length !== 0 ? (
            <BarChart
              title={`File Flow Status Period: ${ordersStatus[0].date} - ${
                ordersStatus[ordersStatus.length - 1].date
              } (Last 14 days)`}
              chartData={statDataFlowStatus}
            />
          ) : null}
        </div>
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
