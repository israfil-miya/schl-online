import React, { useState, useEffect } from "react";
import Navbar from "@/components/navbar";
import Link from "next/link";
import { useSession, getSession } from "next-auth/react";
import { useRouter } from "next/router";
import Image from "next/image";
import { toast } from "sonner";
import Cookies from "js-cookie";
import jwt from "jsonwebtoken";
import HiddenText from "@/components/hidden-text";

export default function Page() {
  const { data: session } = useSession();
  const [employeeData, setEmployeeData] = useState({});
  const [salaryComponents, setSalaryComponents] = useState([]);
  const router = useRouter();
  const [pfMoneyAmount, setPfMoneyAmount] = useState(0);

  async function fetchApi(url, options) {
    const res = await fetch(url, options);
    const data = await res.json();
    return data;
  }

  function verifyTokenAndRedirect(token) {
    const decoded = jwt?.verify(token, process.env.NEXT_PUBLIC_SECRET);
    const userIdFromToken = decoded.userId;
    const sessionUserId = session.user._id || null;

    if (!(userIdFromToken === sessionUserId) || !(Date.now() < decoded.exp)) {
      router.push("/protected?redirect=" + "/account/profile");
    }
  }

  function HandleVerifyUser() {
    let verify_token = Cookies.get("verify-token.tmp")?.trim();

    // Wait for 5 seconds until verify_token has a value
    const waitTime = 5000; // 5 seconds in milliseconds
    const interval = 100; // Check every 100 milliseconds
    let elapsedTime = 0;

    const intervalId = setInterval(() => {
      verify_token = Cookies.get("verify-token.tmp")?.trim();
      if (verify_token || elapsedTime >= waitTime) {
        clearInterval(intervalId); // Stop the interval once verify_token has a value or timeout occurs
        if (!verify_token) {
          console.log("Timeout: verify_token not received within 5 seconds.");
          return; // Return or handle the timeout scenario
        }
        verifyTokenAndRedirect(verify_token); // Proceed with verifying the token
      }
      elapsedTime += interval;
    }, interval);
  }

  const convertToDDMMYYYY = (dateString) => {
    if (!dateString) return "";
    const [year, month, day] = dateString.split("-");
    if (year.length != 4) return dateString;
    return `${day}-${month}-${year}`;
  };

  function calculateSalaryComponents(grossSalary) {
    const basePercentage = 68;
    const base = Math.floor((grossSalary * basePercentage) / 100);
    const houseRent = Math.floor(
      (grossSalary * (100 - basePercentage)) / 100 / 2,
    );
    const convAllowance = Math.floor(
      (grossSalary * (100 - basePercentage)) / 100 / 2,
    );

    // const calculatedTotal = base + houseRent + convAllowance;
    // const difference = grossSalary - calculatedTotal;
    // const adjustedBase = base + difference;

    return [base, houseRent, convAllowance, grossSalary];
  }

  async function GetEmployeeByName() {
    try {
      const url = `${process.env.NEXT_PUBLIC_BASE_URL}/api/employee`;
      const options = {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          getmarkernamebyrealname: true,
          real_name: session.user.real_name,
        },
      };

      const resData = await fetchApi(url, options);

      if (!resData.error) {
        setEmployeeData(resData);
        setSalaryComponents(calculateSalaryComponents(resData.gross_salary));
      } else {
        toast.error("Unable to retrieve employee data");
      }
    } catch (error) {
      console.error("Error fetching employee data:", error);
      toast.error("Error retrieving employee data");
    }
  }

  function getMonthsTillNow(dateString) {
    const dateParts = dateString.split("-");
    const givenYear = parseInt(dateParts[0]);
    const givenMonth = parseInt(dateParts[1]) - 1;

    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();

    const totalYears = currentYear - givenYear;
    const totalMonths = totalYears * 12 + (currentMonth - givenMonth);

    // console.log(totalMonths);

    return totalMonths;
  }

  function getPFMoneyAmount() {
    let totalSavedAmount = 0;

    const formattedSalaryComponents =
      salaryComponents.length > 0 ? salaryComponents[0] : 0;

    // console.log("EMPLOYEEDATA: ", employeeData);

    if (employeeData.pf_history && employeeData.pf_history.length) {
      // console.log("EMPLOYEEDATA (IF): ", employeeData);

      totalSavedAmount =
        employeeData.pf_history[employeeData.pf_history.length - 1]
          .saved_amount;
      const prevDate =
        employeeData.pf_history[employeeData.pf_history.length - 1].date;

      const newAmount = Math.round(
        formattedSalaryComponents *
          (employeeData.provident_fund / 100 || 0) *
          getMonthsTillNow(prevDate),
      );

      totalSavedAmount += newAmount;
    } else {
      // console.log("EMPLOYEEDATA (ELSE): ", employeeData);

      const startDate = employeeData.pf_start_date;
      const newAmount = Math.round(
        formattedSalaryComponents *
          (employeeData.provident_fund / 100 || 0) *
          getMonthsTillNow(startDate),
      );

      totalSavedAmount = newAmount;
    }

    // console.log("TOTAL AMOUNT: ", totalSavedAmount);
    setPfMoneyAmount(totalSavedAmount);
  }

  useEffect(() => {
    HandleVerifyUser();
  }, []);

  useEffect(() => {
    GetEmployeeByName();
  }, []);

  useEffect(() => {
    if (salaryComponents.length && employeeData) {
      getPFMoneyAmount();
    }
  }, [salaryComponents.length]);

  return (
    <>
      <Navbar navFor="account" />
      <div className="overflow-hidden g-4">
        <div className="row justify-content-between">
          <div className="col-3 bg-light p-4">
            <div className="bg-white me-1 p-2 rounded">
              <div className="container">
                <div className="d-flex justify-content-center mb-2">
                  {
                    <Image
                      width={150}
                      height={150}
                      className="rounded-circle border"
                      src={"/images/oriental-tiles.png"}
                    />

                    // <div
                    //   style={{ height: "150px", width: "150px" }}
                    //   className="rounded-circle text-body-secondary p-5 border text-center bg-light"
                    // >
                    //   {employeeData.real_name}
                    // </div>
                  }
                </div>

                <h5 className="mb-1 text-center">
                  <strong>{employeeData.real_name}</strong>
                </h5>
                <p className="small mb-0 text-center">({employeeData.e_id})</p>
                <h6 className="mb-0 text-center">{employeeData.designation}</h6>
                <hr />
                <div className="g-4">
                  <div className="row text-center justify-content-between">
                    <div className="col-6 p-4 text-start text-body-secondary fw-semibold">
                      <p className="lh-sm">Joined On</p>
                      <p className="lh-sm">Department</p>
                      <p className="lh-sm">Phone</p>
                      <p className="lh-sm">Status</p>
                    </div>
                    <div className="col-6 p-4 text-start">
                      <p className="lh-sm">
                        {employeeData?.joining_date &&
                          convertToDDMMYYYY(employeeData.joining_date)}
                      </p>
                      <p className="lh-sm">{employeeData.department}</p>
                      <p className="lh-sm">{employeeData.phone}</p>
                      <p className="lh-sm">{employeeData.status}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white my-3 me-1 p-2 rounded">
              <div className="container">
                <h5 className="mb-1 text-center">
                  <u>Salary Structure</u>
                </h5>
                <div className="g-4 py-0">
                  <div className="row justify-content-between">
                    <div className="col-6 pt-4 pb-1 px-4 text-start text-body-secondary fw-semibold">
                      <p className="m-0 p-0">Basic</p>
                      <p className="m-0 p-0">House Rent</p>
                      <p className="m-0 p-0">Conv. Allowance</p>
                    </div>
                    <div className="col-6 pt-4 pb-1 px-4 text-start">
                      <p className="m-0 p-0">
                        <HiddenText>
                          {salaryComponents[0]?.toLocaleString("en-US")} BDT
                        </HiddenText>
                      </p>
                      <p className="m-0 p-0">
                        <HiddenText>
                          {salaryComponents[1]?.toLocaleString("en-US")} BDT
                        </HiddenText>
                      </p>
                      <p className="m-0 p-0">
                        <HiddenText>
                          {salaryComponents[2]?.toLocaleString("en-US")} BDT
                        </HiddenText>
                      </p>
                    </div>
                  </div>
                  <hr className="m-0" />
                  <div className="row justify-content-between">
                    <div className="col-6 py-1 px-4 text-start text-body-secondary fw-semibold">
                      <p className="lh-sm fw-semibold">Gross:</p>
                    </div>
                    <div className="col-6 py-1 px-4 text-start">
                      <p className="lh-sm">
                        <HiddenText>
                          {salaryComponents[3]?.toLocaleString("en-US")}{" "}
                          BDT/month
                        </HiddenText>
                      </p>
                    </div>
                    <small>
                      <em>
                        ***Over Time (OT) ={" "}
                        <span className="fw-semibold">
                          {Math.round(
                            salaryComponents[0] / 30 / 8,
                          )?.toLocaleString("en-US")}{" "}
                          BDT
                        </span>
                        /hour
                      </em>
                    </small>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white my-3 me-1 p-2 rounded">
              <div className="container">
                <h5 className=" text-center">
                  <u>Provident Fund (PF)</u>
                </h5>
                <p className="text-center">
                  Start Date:{" "}
                  {employeeData?.pf_start_date
                    ? convertToDDMMYYYY(employeeData.pf_start_date)
                    : "N/A"}
                </p>
                <div className="g-4 py-0">
                  <div className="row justify-content-between">
                    <div className="col-6 pb-1 px-4 text-start">
                      <p className="m-1 p-0 text-body-secondary fw-semibold">
                        Your&apos;s Part
                      </p>
                      <p className="m-0 p-0 ps-1">
                        <input
                          type="text"
                          value={
                            employeeData?.pf_start_date
                              ? employeeData.provident_fund
                                ? pfMoneyAmount.toLocaleString("en-US") + " BDT"
                                : "N/A"
                              : "N/A"
                          }
                          disabled
                        />
                      </p>
                    </div>
                    <div className="col-6 pb-1 px-4 text-start">
                      <p className="m-1 p-0 text-body-secondary fw-semibold">
                        Company&apos;s Part
                      </p>
                      <p className="m-0 p-0 ps-1">
                        <input
                          type="text"
                          value={
                            employeeData?.pf_start_date
                              ? employeeData.provident_fund
                                ? pfMoneyAmount.toLocaleString("en-US") + " BDT"
                                : "N/A"
                              : "N/A"
                          }
                          disabled
                        />
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-9 bg-light p-4">
            <div className="bg-white p-3 rounded">
              <p>Under Construction!</p>
              <Link className="text-primary" href={"/account/change-password"}>
                Change your password
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
