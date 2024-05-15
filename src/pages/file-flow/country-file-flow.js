import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Navbar from "@/components/navbar";

export default function View() {
  const router = useRouter();
  const [fromTime, setFromTime] = useState("");
  const [toTime, setToTime] = useState("");
  const [orders, setOrders] = useState({});
  const [countryFilter, setCountryFilter] = useState("");

  const optionsCountries = [
    "Australia",
    "Denmark",
    "Finland",
    "Norway",
    "Sweden",
    "Others",
  ];

  const { country, date } = router.query;

  function formatDateToYYYYMMDD(dateString) {
    const originalDate = new Date(dateString);

    if (isNaN(originalDate.getTime())) {
      return "Invalid Date";
    }

    const year = originalDate.getUTCFullYear();
    const month = (originalDate.getUTCMonth() + 1).toString().padStart(2, "0");
    const day = originalDate.getUTCDate().toString().padStart(2, "0");

    return `${year}-${month}-${day}`;
  }

  async function getOrders() {
    const url = `${process.env.NEXT_PUBLIC_BASE_URL}/api/order`;
    const options = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        country: countryFilter,
        getordersbycountry: true,
        fromtime: fromTime,
        totime: toTime,
      },
    };

    try {
      const res = await fetch(url, options);
      const data = await res.json();

      if (!data.error) {
        setOrders(data);
        console.log(data);
      } else {
        toast.error("Unable to retrieve orders list");
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  }

  useEffect(() => {
    setFromTime(formatDateToYYYYMMDD(date));
    setToTime(formatDateToYYYYMMDD(date));
    setCountryFilter(country);
  }, []);

  useEffect(() => {
    if (countryFilter && (fromTime || toTime)) getOrders();
  }, [countryFilter, fromTime, toTime]);

  return (
    <>
      <Navbar navFor="fileflow" />

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div className=" mx-2 form-floating">
          <select
            required
            onChange={(e) => setCountryFilter(e.target.value)}
            className="form-select"
            id="floatingSelectGrid"
          >
            {optionsCountries?.map((country, index) => {
              return (
                <>
                  <option key={index} defaultValue={index == 0}>
                    {country}
                  </option>
                </>
              );
            })}
          </select>
          <label htmlFor="floatingSelectGrid">Select a country</label>
        </div>

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

          <button
            onClick={getOrders}
            className="btn ms-4 btn-sm btn-outline-primary"
          >
            Refresh
          </button>
        </div>
      </div>

      <div className="container">
        <div style={{ overflowX: "auto" }} className="text-nowrap">
          <table className="table table-bordered py-3 table-hover">
            <thead>
              <tr className="table-dark">
                <th>#</th>
                <th>Client Name</th>
                <th>Folder</th>
                <th>Country</th>
                <th>NOF</th>
              </tr>
            </thead>
            <tbody>
              {orders?.details &&
                orders?.details.map((order, index) => (
                  <tr key={order._id}>
                    <td>{index + 1}</td>
                    <td className="text-break">{order.client_name}</td>
                    <td className="text-break">{order.folder}</td>
                    <td className="text-break">{order.country}</td>
                    <td className="text-break">{order.quantity}</td>
                  </tr>
                ))}
              <tr className="table-secondary">
                <td className="fw-bold">Total</td>
                <td></td>
                <td></td>
                <td></td>
                <td className="fw-bold">{orders?.totalFiles}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <style jsx>
        {`
          #floatingSelectGrid {
            max-height: 150px;
            overflow-y: auto;
          }
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
