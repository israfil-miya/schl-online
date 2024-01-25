import React, { useState, useEffect } from "react";
import Navbar from "../../../../components/navbar";
import Link from "next/link";
import { useSession, getSession } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/router";
import { toast } from "sonner";

export default function Page() {
  const { data: session } = useSession();
  const [employeeData, setEmployeeData] = useState({});
  const [salaryComponents, setSalaryComponents] = useState([]);
  let router = useRouter();
  let employeeRealName = router?.query?.name;
  const [pfMoneyAmount, setPfMoneyAmount] = useState(0);

  async function fetchApi(url, options) {
    const res = await fetch(url, options);
    const data = await res.json();
    return data;
  }

  const convertToDDMMYYYY = (dateString) => {
    const [year, month, day] = dateString.split("-");
    if (year.length != 4) return dateString;
    return `${day}-${month}-${year}`;
  };

  function calculateSalaryComponents(grossSalary) {
    const base = Math.floor((grossSalary / 3) * 2);
    const houseRent = Math.floor(grossSalary / 3 / 2);
    const convAllowance = Math.floor(grossSalary / 3 / 2);
    const calculatedTotal = base + houseRent + convAllowance;
    const difference = grossSalary - calculatedTotal;
    const adjustedBase = base + difference;

    return [adjustedBase, houseRent, convAllowance, grossSalary];
  }

  async function GetEmployeeByName() {
    try {
      const url = `${process.env.NEXT_PUBLIC_BASE_URL}/api/employee`;
      const options = {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          getmarkernamebyrealname: true,
          real_name: employeeRealName,
        },
      };

      const resData = await fetchApi(url, options);

      if (!resData.error) {
        setEmployeeData(resData);
        setSalaryComponents(calculateSalaryComponents(resData.gross_salary));
        console.log(resData);
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

    console.log(totalMonths);

    return totalMonths;
  }

  function getPFMoneyAmount() {
    let totalSavedAmount = 0;

    const formattedSalaryComponents =
      salaryComponents.length > 0 ? salaryComponents[0] : 0;

    if (employeeData.pf_history && employeeData.pf_history.length) {
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
      const startDate = employeeData.pf_start_date;
      const newAmount = Math.round(
        formattedSalaryComponents *
          (employeeData.provident_fund / 100 || 0) *
          getMonthsTillNow(startDate),
      );

      totalSavedAmount = newAmount;
    }
    setPfMoneyAmount(totalSavedAmount);
  }
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
                  <div className="row justify-content-between">
                    <div className="col-6 p-4 text-end text-body-secondary fw-semibold">
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
                        {salaryComponents[0]?.toLocaleString("en-US")} BDT
                      </p>
                      <p className="m-0 p-0">
                        {salaryComponents[1]?.toLocaleString("en-US")} BDT
                      </p>
                      <p className="m-0 p-0">
                        {salaryComponents[2]?.toLocaleString("en-US")} BDT
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
                        {salaryComponents[3]?.toLocaleString("en-US")} BDT/month
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
                        Employee&apos;s Part
                      </p>
                      <p className="m-0 p-0 ps-1">
                        <input
                          type="text"
                          value={
                            employeeData?.pf_start_date
                              ? employeeData.provident_fund
                                ? pfMoneyAmount.toLocaleString("en-US") + " BDT"
                                : "Loading..."
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
                                : "Loading..."
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
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
