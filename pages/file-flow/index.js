import React, { useState, useEffect } from "react";
import Navbar from "../../components/navbar";
import BarChart from "../../components/charts/Bar.chart";
import { getSession } from "next-auth/react";
import { toast } from "sonner";
import Link from "next/link";

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
      let dailyTotalValue = 0;
      parsed.push(
        <tr key={country}>
          <td
            style={{
              minWidth: "40px",
              maxWidth: "40px",
              padding: "0px 0px 0px 5px",
              backgroundColor: "#7aa63e",
              color: "#fff",
            }}
          >
            {country}
          </td>
          {ordersCD[country].map((data, index) => {
            dailyTotalValue +=
              statsOf == "Files" ? data.fileQuantity : data.orderQuantity;
            return (
              <td
                className="text-center"
                style={{ padding: "0px" }}
                key={index}
              >
                <Link
                target="_blank"
                  href={
                    data.isoDate
                      ? `/file-flow/country-file-flow?country=${country}&date=${data.isoDate}`
                      : ""
                  }
                >
                  {statsOf == "Files" ? data.fileQuantity : data.orderQuantity}
                </Link>
              </td>
            );
          })}
          <td className="text-center fw-bold" style={{ padding: "0px" }}>
            {dailyTotalValue}
          </td>
        </tr>,
      );
    }
    let tempObj = {};
    if (ordersCD.Australia) {
      ordersCD.Australia.map((countryDataByDate, index) => {
        tempObj[countryDataByDate.date] = 0;
      });
    }
    for (const country in ordersCD) {
      ordersCD[country].map((countryDataByDate, index) => {
        tempObj[countryDataByDate.date] +=
          statsOf == "Files"
            ? countryDataByDate.fileQuantity
            : countryDataByDate.orderQuantity;
      });
    }

    const totalArr = Object.values(tempObj);
    let totalValue = 0;

    totalArr.length !== 0 &&
      parsed.push(
        <tr>
          <th
            style={{
              maxWidth: "40px",
              padding: "0px 0px 0px 5px",
              backgroundColor: "#7aa63e",
              color: "#fff",
            }}
          >
            Total
          </th>
          {totalArr.map((value, index) => {
            totalValue += value;
            return (
              <td
                className="text-center fw-bold"
                style={{ padding: "0px" }}
                key={index}
              >
                {value}
              </td>
            );
          })}
          <td className="text-center fw-bold" style={{ padding: "0px" }}>
            {totalValue}
          </td>
        </tr>,
      );

    console.log(parsed);
    setCDParsedHtml(parsed);
  }

  useEffect(() => {
    getDateRange();
  }, []);

  useEffect(() => {
    if (fromTime && toTime) {
      filteredData();
    }
  }, [fromTime, toTime]);

  useEffect(() => {
    if (ordersCD && fromTime && toTime && statsOf) {
      parseCDHtml(statsOf);
    }
  }, [ordersCD, fromTime, toTime, statsOf]);

  useEffect(() => {
    let quantityTotal = 0;
    let quantityPending = 0;

    ordersStatus.map((data) => {
      if (statsOf == "Files") {
        quantityTotal += data.fileQuantity;
        quantityPending += data.filePending;
      } else {
        quantityTotal += data.orderQuantity;
        quantityPending += data.orderPending;
      }
    }),
      setStatDataFlowStatus({
        labels: ordersStatus.map((data) => data.date),
        datasets: [
          {
            label: `Total ${
              statsOf == "Files" ? "Files" : "Orders"
            } (${quantityTotal})`,
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
            label: `Pending ${
              statsOf == "Files" ? "Files" : "Orders"
            } (${quantityPending})`,
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
        showLegend: true,
      });
  }, [ordersStatus, statsOf]);

  useEffect(() => {
    const uniqueMonths = [
      ...new Set(ordersQP.map((data) => new Date(data.date).getMonth())),
    ];
    const colors = {};

    uniqueMonths.forEach((month, index) => {
      colors[month] = index % 2 === 0 ? "#4169e1" : "#ffad33"; // Alternate between blue and red
    });

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
          backgroundColor: ordersQP.map((data) => {
            const month = new Date(data.date).getMonth();
            return colors[month] || "#efa438"; // Default color
          }),

          borderColor: "black",
          borderWidth: 2,
          minBarLength: 1,
        },
      ],
      showLegend: false,
    });
  }, [ordersQP, statsOf]);

  return (
    <>
      <Navbar navFor="fileflow" />
      <div className="m-3">
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div className="my-2 p-3 bg-light rounded border d-flex justify-content-center">
            <div
              style={{ display: "flex", alignItems: "center" }}
              className="filter_stats_of me-3"
            >
              <input
                className="form-check-input me-2"
                type="radio"
                value="Files"
                id="radio1"
                checked={statsOf == "Files"}
                onChange={(e) => setStatsOf(e.target.value)}
              />
              <label className="form-check-label me-3" htmlFor="radio1">
                Files Flow
              </label>

              <input
                className="form-check-input me-2"
                type="radio"
                value={`Orders`}
                id={`radio2`}
                checked={statsOf == "Orders"}
                onChange={(e) => setStatsOf(e.target.value)}
              />
              <label className="form-check-label" htmlFor="radio2">
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

        <div className="FlowChart">
          {ordersQP?.length !== 0 ? (
            <BarChart
              title={`${
                statsOf == "Files" ? "Files Flow" : "Orders Flow"
              } Period: ${ordersQP[0].date} - ${
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
              <p className="fw-bold text-center">{`${
                statsOf == "Files" ? "Files Flow" : "Orders Flow"
              } Period: ${ordersQP[0].date} - ${
                ordersQP[ordersQP.length - 1].date
              }`}</p>
            ) : null}

            <table className="table table-bordered">
              <thead>
                <tr>
                  <th
                    style={{ backgroundColor: "#7aa63e", color: "#fff" }}
                  ></th>

                  {ordersQP.map((data, index) => (
                    <th
                      className="text-center"
                      style={{ backgroundColor: "#7aa63e", color: "#fff" }}
                      key={index}
                    >
                      {data.date.split(" ")[1]}
                    </th>
                  ))}

                  <th
                    className="text-center"
                    style={{ backgroundColor: "#7aa63e", color: "#fff" }}
                  >
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>{CDParsedHtml.map((tableRow, index) => tableRow)}</tbody>
            </table>
          </div>
        )}
        <div className="StatusChart my-3">
          {ordersStatus?.length !== 0 ? (
            <BarChart
              title={`Current Status Period: ${ordersStatus[0].date} - ${
                ordersStatus[ordersStatus.length - 1].date
              } (Last 14 days)`}
              chartData={statDataFlowStatus}
            />
          ) : null}
        </div>
      </div>
      <style jsx>
        {`
          .table {
            font-size: 15px;
          }

          th,
          td {
            padding: 0px;
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
