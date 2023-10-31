import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Navbar from "../../components/navbar";

export default function View() {
  const router = useRouter();
  const [fromTime, setFromTime] = useState("");
  const [toTime, setToTime] = useState("");
  const [countryFilter, setCountryFilter] = useState("");
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

  useEffect(() => {
    setFromTime(formatDateToYYYYMMDD(date));
    setToTime(formatDateToYYYYMMDD(date));
    setCountryFilter(country);
  }, []);

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
        <div className="my-5 p-3 bg-light rounded border d-flex justify-content-center">
          <div
            style={{ display: "flex", alignItems: "center" }}
            className="filter_country me-3"
          >
            <strong>Country: </strong>
            <input
              type="text"
              placeholder="Country"
              className="form-control ms-2 custom-input"
              value={countryFilter}
              onChange={(e) => setCountryFilter(e.target.value)}
            />
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
            onClick={null}
            className="btn ms-4 btn-sm btn-outline-primary"
          >
            Search
          </button>
        </div>
      </div>
      <div className="container">
        <b>Country:</b> {country}
        <br />
        <b>Date:</b> {date}
      </div>
    </>
  );
}
