import React, { useEffect, useState } from "react";
import Navbar from "../../components/navbar";
import { toast } from "sonner";
import moment from "moment";
import NoteTd from "../../components/extandable-td";
import { useSession } from "next-auth/react";
import Link from "next/link";

export default function EmployeeDatabase() {
  const [employees, setEmployees] = useState([]);
  const [manageData, setManageData] = useState([]);
  const [totalPayout, setTotalPayout] = useState({
    gross: 0,
    bonus_fitr: 0,
    bonus_adha: 0,
  });
  const { data: session } = useSession();

  const [filters, setFilters] = useState({
    servicetime: "",
    blood_group: "",
    generalsearchstring: "",
  });

  async function fetchApi(url, options) {
    const res = await fetch(url, options);
    const data = await res.json();
    return data;
  }

  function formatRemainingTime(remainingDays) {
    const years = Math.floor(remainingDays / 365); // Calculate years
    const remainingMonths = Math.floor((remainingDays % 365) / 30); // Adjust months
    const days = remainingDays % 30; // Remaining days within the month

    if (years === 0) {
      if (remainingMonths === 0) {
        return `${days} day${days > 1 ? "s" : ""}`; // Only days
      } else if (remainingMonths === 1 && days === 0) {
        return `${remainingMonths} month`; // Only months
      } else {
        return `${remainingMonths} month${
          remainingMonths > 1 ? "s" : ""
        }, ${days} day${days > 1 ? "s" : ""}`; // Months and days
      }
    } else {
      if (remainingMonths === 0 && days === 0) {
        return `${years} year`; // Only years
      } else if (remainingMonths === 0) {
        return `${years} year, ${days} day${days > 1 ? "s" : ""}`; // Years and days
      } else {
        return `${years} year${years > 1 ? "s" : ""}, ${remainingMonths} month${
          remainingMonths > 1 ? "s" : ""
        }, ${days} day${days > 1 ? "s" : ""}`; // Years, months, and days
      }
    }
  }

  const convertToDDMMYYYY = (dateString) => {
    const [year, month, day] = dateString.split("-");
    if (year.length != 4) return dateString;
    return `${day}-${month}-${year}`;
  };

  async function getAllEmployees() {
    try {
      const url = `${process.env.NEXT_PUBLIC_BASE_URL}/api/employee`;
      const options = {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          getallemployees: true,
        },
      };

      const employeesList = await fetchApi(url, options);

      if (!employeesList.error) {
        setTotalPayout({
          gross: 0,
          bonus_fitr: 0,
          bonus_adha: 0,
        });
        employeesList.forEach((employee) => {
          if (employee.status === "Active") {
            setTotalPayout((prevData) => ({
              gross: parseInt(prevData.gross) + parseInt(employee.gross_salary),
              bonus_fitr:
                parseInt(prevData.bonus_fitr) +
                parseInt(employee.bonus_eid_ul_fitr),
              bonus_adha:
                parseInt(prevData.bonus_adha) +
                parseInt(employee.bonus_eid_ul_adha),
            }));
          }
        });
        setEmployees(employeesList);
      } else {
        toast.error("Unable to retrieve employees list");
      }
    } catch (error) {
      console.error("Error fetching employees:", error);
      toast.error("Error retrieving employees");
    }
  }

  async function getAllEmployeesFiltered() {
    try {
      const url = `${process.env.NEXT_PUBLIC_BASE_URL}/api/employee`;
      const options = {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          getallemployeebyfilter: true,
          ...filters,
        },
      };

      const employeesList = await fetchApi(url, options);

      if (!employeesList.error) {
        setTotalPayout({
          gross: 0,
          bonus_fitr: 0,
          bonus_adha: 0,
        });
        employeesList.forEach((employee) => {
          if (employee.status === "Active") {
            setTotalPayout((prevData) => ({
              gross: prevData.gross + employee.gross_salary,
              bonus_fitr: prevData.bonus_fitr + employee.bonus_eid_ul_fitr,
              bonus_adha: prevData.bonus_adha + employee.bonus_eid_ul_adha,
            }));
          }
        });

        setEmployees(employeesList);
      } else {
        toast.error("Unable to retrieve employees list");
      }
    } catch (error) {
      console.error("Error fetching employees:", error);
      toast.error("Error retrieving employees");
    }
  }

  async function deleteEmployee() {
    const url = `${process.env.NEXT_PUBLIC_BASE_URL}/api/approval`;
    const options = {
      method: "POST",
      body: JSON.stringify({
        req_type: "Employee Delete",
        req_by: session.user.real_name,
        id: manageData._id,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    };

    let result = await fetchApi(url, options);

    if (!result.error) {
      toast.success("Request sent for approval");
    }

    if (result.error) {
      toast.message(result.message);
    }
  }

  async function editEmployee() {
    const url = `${process.env.NEXT_PUBLIC_BASE_URL}/api/employee`;
    const options = {
      method: "POST",
      body: JSON.stringify(manageData),
      headers: {
        "Content-Type": "application/json",
        editemployee: true,
      },
    };

    try {
      const result = await fetchApi(url, options);

      if (!result.error) {
        toast.success("Edited the employee data");
        await getAllEmployees();
      } else {
        toast.error("Unable to edit employee data");
      }
    } catch (error) {
      console.error("Error editing employee:", error);
      toast.error("Error editing employee");
    }
  }

  useEffect(() => {
    getAllEmployees();
  }, []);

  return (
    <>
      <Navbar navFor="dashboard" />
      <div className="my-5">
        <h5 className="text-center">Employee List</h5>

        <div className="d-flex mt-3">
          <div className="container">
            <div
              className="float-end"
              style={{ display: "flex", alignItems: "center" }}
            >
              <button
                type="button"
                data-bs-toggle="offcanvas"
                data-bs-target="#offcanvasNavbar"
                aria-controls="offcanvasNavbar"
                aria-label="Toggle navigation"
                className="btn m-2 btn-sm btn-outline-primary"
              >
                Filter
              </button>
            </div>
          </div>
        </div>

        <div className="text-nowrap">
          <table className="table p-3 table-hover">
            <thead className="sticky-header">
              <tr className="table-dark">
                <th>#</th>
                <th>EID</th>
                <th>Full Name</th>
                <th>Joining Date</th>
                <th>Blood Group</th>
                <th>Designation</th>
                <th>Department</th>
                <th>Gross Salary</th>
                <th>Status</th>
                <th>Permanent Status</th>
                <th>Note</th>
                <th>Manage</th>
              </tr>
            </thead>
            <tbody>
              {employees?.length != 0 ? (
                employees.map((employee, index) => {
                  return (
                    <tr
                      key={index}
                      className={
                        employee.status == "Active" ? null : "table-danger"
                      }
                    >
                      <td>{index + 1}</td>
                      <td>{employee.e_id}</td>
                      <td className="employee_name text-decoration-underline">
                        <Link
                          target="_blank"
                          href={
                            process.env.NEXT_PUBLIC_BASE_URL +
                            "/employee/profile/" +
                            employee.real_name
                          }
                        >
                          {employee.real_name}
                        </Link>
                      </td>
                      <td>
                        {employee.joining_date?.length
                          ? convertToDDMMYYYY(employee.joining_date)
                          : null}
                      </td>
                      <td>{employee.blood_group}</td>
                      <td>{employee.designation}</td>
                      <td>{employee.department}</td>
                      <td>{employee.gross_salary} BDT</td>
                      <td>{employee.status}</td>
                      <td>
                        {employee.status == "Active"
                          ? employee.permanentInfo.isPermanent
                            ? `Yes (${formatRemainingTime(
                                employee.permanentInfo.jobAgeInDays,
                              )})`
                            : formatRemainingTime(
                                employee.permanentInfo.remainingTimeInDays,
                              )
                          : "N/A"}
                      </td>
                      <NoteTd data={employee.note} />
                      <td
                        className="align-middle"
                        style={{ textAlign: "center" }}
                      >
                        <button
                          onClick={() => setManageData(employee)}
                          className="btn btn-sm btn-outline-primary me-1"
                          data-bs-toggle="modal"
                          data-bs-target="#editModal"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setManageData({ _id: employee._id })}
                          className="btn btn-sm btn-outline-danger me-1"
                          data-bs-toggle="modal"
                          data-bs-target="#deleteModal"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr key={0}>
                  <td colSpan="17" className=" align-center text-center">
                    No employee data to show
                  </td>
                </tr>
              )}
              {employees?.length != 0 && (
                <tr className="table-dark">
                  <td></td>
                  <td></td>
                  <td className="fw-semibold">
                    SALARY (GROSS): {totalPayout.gross} BDT
                  </td>
                  <td></td>
                  <td></td>
                  <td className="fw-semibold">
                    BONUS (EID-UL-FITR): {totalPayout.bonus_fitr} BDT
                  </td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td className="fw-semibold">
                    BONUS (EID-UL-ADHA): {totalPayout.bonus_adha} BDT
                  </td>
                  <td></td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div
        className="modal fade"
        id="editModal"
        tabIndex="-1"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
          <div className="modal-content">
            <div className="modal-header">
              <h1 className="modal-title fs-5" id="staticBackdropLabel">
                Edit employee details
              </h1>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              {/* Employee Code */}
              <div className="mb-3">
                <label htmlFor="date" className="form-label">
                  Employee ID
                </label>
                <input
                  value={manageData.e_id}
                  onChange={(e) =>
                    setManageData((prevData) => ({
                      ...prevData,
                      e_id: e.target.value,
                    }))
                  }
                  type="text"
                  className="form-control"
                />
              </div>

              {/* Full Name */}
              <div className="mb-3">
                <label htmlFor="date" className="form-label">
                  Full Name
                </label>
                <input
                  value={manageData.real_name}
                  onChange={(e) =>
                    setManageData((prevData) => ({
                      ...prevData,
                      real_name: e.target.value,
                    }))
                  }
                  type="text"
                  className="form-control"
                />
              </div>

              {/* Joining Date */}
              <div className="mb-3">
                <label htmlFor="date" className="form-label">
                  Joining Date
                </label>
                <input
                  value={manageData.joining_date}
                  onChange={(e) =>
                    setManageData((prevData) => ({
                      ...prevData,
                      joining_date: e.target.value,
                    }))
                  }
                  type="date"
                  className="form-control"
                />
              </div>

              {/* Phone Number */}
              <div className="mb-3">
                <label htmlFor="date" className="form-label">
                  Phone
                </label>
                <input
                  value={manageData.phone}
                  onChange={(e) =>
                    setManageData((prevData) => ({
                      ...prevData,
                      phone: e.target.value,
                    }))
                  }
                  type="text"
                  className="form-control"
                />
              </div>

              {/* Email */}
              <div className="mb-3">
                <label htmlFor="date" className="form-label">
                  Email
                </label>
                <input
                  value={manageData.email}
                  onChange={(e) =>
                    setManageData((prevData) => ({
                      ...prevData,
                      email: e.target.value,
                    }))
                  }
                  type="email"
                  className="form-control"
                />
              </div>

              {/* NID Number */}
              <div className="mb-3">
                <label htmlFor="date" className="form-label">
                  NID Number
                </label>
                <input
                  value={manageData.nid}
                  onChange={(e) =>
                    setManageData((prevData) => ({
                      ...prevData,
                      nid: e.target.value,
                    }))
                  }
                  type="text"
                  className="form-control"
                />
              </div>

              {/* Blood Group */}
              <div className="mb-3">
                <label htmlFor="date" className="form-label">
                  Blood Group
                </label>

                <select
                  className="form-select"
                  id="floatingSelect"
                  value={manageData.blood_group}
                  onChange={(e) =>
                    setManageData((prevData) => ({
                      ...prevData,
                      blood_group: e.target.value,
                    }))
                  }
                >
                  <option
                    value={""}
                    defaultValue={true}
                    className="text-body-secondary"
                  >
                    Select a blood group
                  </option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>

              {/* Birth Date */}
              <div className="mb-3">
                <label htmlFor="date" className="form-label">
                  Birth Date
                </label>
                <input
                  value={manageData.birth_date}
                  onChange={(e) =>
                    setManageData((prevData) => ({
                      ...prevData,
                      birth_date: e.target.value,
                    }))
                  }
                  type="date"
                  className="form-control"
                />
              </div>

              {/* Designation */}
              <div className="mb-3">
                <label htmlFor="date" className="form-label">
                  Designation
                </label>
                <input
                  value={manageData.designation}
                  onChange={(e) =>
                    setManageData((prevData) => ({
                      ...prevData,
                      designation: e.target.value,
                    }))
                  }
                  type="text"
                  className="form-control"
                />
              </div>

              {/* Department */}
              <div className="mb-3">
                <label htmlFor="date" className="form-label">
                  Department
                </label>

                <select
                  className="form-select"
                  id="floatingSelect"
                  value={manageData.department}
                  onChange={(e) =>
                    setManageData((prevData) => ({
                      ...prevData,
                      department: e.target.value,
                    }))
                  }
                >
                  <option value="Production">Production</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Management">Management</option>
                  <option value="Software">Software</option>
                  <option value="Others">Others</option>
                </select>
              </div>

              {manageData.department == "Marketing" && (
                <div className="marketr-exclusive">
                  <div className="mb-3">
                    <label htmlFor="date" className="form-label">
                      Company Provided Name
                    </label>
                    <input
                      required
                      value={manageData.company_provided_name}
                      onChange={(e) =>
                        setManageData((prevData) => ({
                          ...prevData,
                          company_provided_name: e.target.value,
                        }))
                      }
                      type="text"
                      className="form-control"
                    />
                  </div>
                </div>
              )}

              {/* Bramch */}
              <div className="mb-3">
                <label htmlFor="date" className="form-label">
                  Branch
                </label>
                <input
                  value={manageData.branch}
                  onChange={(e) =>
                    setManageData((prevData) => ({
                      ...prevData,
                      branch: e.target.value,
                    }))
                  }
                  type="text"
                  className="form-control"
                />
              </div>

              {/* Division */}
              <div className="mb-3">
                <label htmlFor="date" className="form-label">
                  Division
                </label>
                <input
                  value={manageData.division}
                  onChange={(e) =>
                    setManageData((prevData) => ({
                      ...prevData,
                      division: e.target.value,
                    }))
                  }
                  type="text"
                  className="form-control"
                />
              </div>

              {/* Gross Salary */}
              <div className="mb-3">
                <label htmlFor="date" className="form-label">
                  Gross Salary
                </label>
                <input
                  value={manageData.gross_salary}
                  onChange={(e) =>
                    setManageData((prevData) => ({
                      ...prevData,
                      gross_salary: e.target.value,
                    }))
                  }
                  type="number"
                  className="form-control"
                />
              </div>

              {/* Provident Fund */}
              <div className="mb-3">
                <label htmlFor="date" className="form-label">
                  Provident Fund
                </label>
                <input
                  value={manageData.provident_fund}
                  onChange={(e) =>
                    setManageData((prevData) => ({
                      ...prevData,
                      provident_fund: e.target.value,
                    }))
                  }
                  type="number"
                  className="form-control"
                />
              </div>

              {/* Status */}
              <div className="mb-3">
                <label htmlFor="date" className="form-label">
                  Status
                </label>

                <select
                  required
                  className="form-select"
                  id="floatingSelect"
                  value={manageData.status}
                  onChange={(e) =>
                    setManageData((prevData) => ({
                      ...prevData,
                      status: e.target.value,
                    }))
                  }
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Resigned">Resigned</option>
                  <option value="Fired">Fired</option>
                </select>
              </div>

              {/* Eid-ul-fitr Bonus */}
              <div className="mb-3">
                <label htmlFor="date" className="form-label">
                  Eid-ul-fitr Bonus
                </label>
                <input
                  value={manageData.bonus_eid_ul_fitr}
                  onChange={(e) =>
                    setManageData((prevData) => ({
                      ...prevData,
                      bonus_eid_ul_fitr: e.target.value,
                    }))
                  }
                  type="number"
                  className="form-control"
                />
              </div>

              {/* Eid-ul-adha Bonus */}
              <div className="mb-3">
                <label htmlFor="date" className="form-label">
                  Eid-ul-adha Bonus
                </label>
                <input
                  value={manageData.bonus_eid_ul_adha}
                  onChange={(e) =>
                    setManageData((prevData) => ({
                      ...prevData,
                      bonus_eid_ul_adha: e.target.value,
                    }))
                  }
                  type="number"
                  className="form-control"
                />
              </div>

              {/* Note*/}
              <div className="mb-3">
                <label htmlFor="date" className="form-label">
                  Note
                </label>
                <textarea
                  value={manageData.note}
                  onChange={(e) =>
                    setManageData((prevData) => ({
                      ...prevData,
                      note: e.target.value,
                    }))
                  }
                  className="form-control"
                />
              </div>
            </div>
            <div className="modal-footer p-1">
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary"
                data-bs-dismiss="modal"
              >
                Close
              </button>
              <button
                onClick={editEmployee}
                type="button"
                data-bs-dismiss="modal"
                className="btn btn-sm btn-outline-primary"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      </div>

      <div
        className="modal fade"
        id="deleteModal"
        tabIndex="-1"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h1 className="modal-title fs-5" id="staticBackdropLabel">
                Delete Employee Data Confirmation
              </h1>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              <p>Do you really want to delete this eployee data?</p>
            </div>
            <div className="modal-footer p-1">
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary"
                data-bs-dismiss="modal"
              >
                No
              </button>
              <button
                onClick={deleteEmployee}
                type="button"
                className="btn btn-sm btn-outline-danger"
                data-bs-dismiss="modal"
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      </div>

      <div
        className="offcanvas offcanvas-end"
        tabIndex="-1"
        id="offcanvasNavbar"
        aria-labelledby="offcanvasNavbarLabel"
      >
        <div className="offcanvas-header">
          <h5 className="offcanvas-title" id="offcanvasNavbarLabel">
            Search employees
          </h5>
          <button
            type="button"
            className="btn-close"
            data-bs-dismiss="offcanvas"
            aria-label="Close"
          ></button>
        </div>
        <div className="offcanvas-body">
          <div className="d-grid gap-2">
            <div className="row">
              <div className="col">
                <label className="fw-bold" htmlFor="floatingSelectGrid">
                  Blood Group
                </label>
                <select
                  required
                  onChange={(e) =>
                    setFilters({ ...filters, blood_group: e.target.value })
                  }
                  className="form-select"
                  id="floatingSelectGrid"
                >
                  <option
                    value={""}
                    defaultValue={true}
                    className="text-body-secondary"
                  >
                    Select a blood group
                  </option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>
            </div>
            <div className="row">
              <div className="col">
                <label className="fw-bold" htmlFor="floatingSelectGrid">
                  Service Time
                </label>
                <select
                  required
                  onChange={(e) =>
                    setFilters({ ...filters, servicetime: e.target.value })
                  }
                  className="form-select"
                  id="floatingSelectGrid"
                >
                  <option
                    value={""}
                    defaultValue={true}
                    className="text-body-secondary"
                  >
                    Select service time
                  </option>
                  <option value="lessThan1Year">Less than 1 year</option>
                  <option value="atLeast1Year">At least 1 year</option>
                  <option value="atLeast2Years">At least 2 years</option>
                  <option value="atLeast3Years">At least 3 years</option>
                  <option value="moreThan3Years">More than 3 years</option>
                </select>
              </div>
            </div>

            {/* <div className="row">
              <div className="col">
                <label className="fw-semibold" htmlFor="datePicker">
                  Date picker
                </label>
                <div id="datePicker" className="input-group">
                  <input
                    type="date"
                    id="fromDate"
                    className="form-control custom-input"
                    value={filters.fromdate}
                    onChange={(e) =>
                      setFilters({ ...filters, fromdate: e.target.value })
                    }
                  />
                  <span className="input-group-text">to</span>
                  <input
                    type="date"
                    id="toDate"
                    className="form-control custom-input"
                    value={filters.todate}
                    onChange={(e) =>
                      setFilters({ ...filters, todate: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>

            <div className="row">
              <div className="col">
                <label className="fw-semibold" htmlFor="floatingInput">
                  Country name
                </label>
                <input
                  value={filters.country}
                  onChange={(e) =>
                    setFilters({ ...filters, country: e.target.value })
                  }
                  type="text"
                  className="form-control"
                  id="floatingInput"
                />
              </div>
            </div>

            <div className="row">
              <div className="col">
                <label className="fw-semibold" htmlFor="floatingInput">
                  Category
                </label>
                <input
                  value={filters.category}
                  onChange={(e) =>
                    setFilters({ ...filters, category: e.target.value })
                  }
                  type="text"
                  className="form-control"
                  id="floatingInput"
                />
              </div>
            </div>

            <div className="row">
              <div className="col">
                <label className="fw-semibold" htmlFor="floatingInput">
                  Company name
                </label>
                <input
                  value={filters.company_name}
                  onChange={(e) =>
                    setFilters({ ...filters, company_name: e.target.value })
                  }
                  type="text"
                  className="form-control"
                  id="floatingInput"
                />
              </div>
            </div>

            <div className="row">
              <div className="col">
                <input
                  type="checkbox"
                  id="myCheckbox"
                  className="form-check-input"
                  checked={filters.test}
                  onChange={(e) =>
                    setFilters({ ...filters, test: !filters.test })
                  }
                />

                <label
                  htmlFor="myCheckbox"
                  className="form-check-label fw-semibold ms-1"
                >
                  Test Job
                </label>
              </div>
              <div className="col">
                <input
                  type="checkbox"
                  id="myCheckbox2"
                  className="form-check-input"
                  checked={filters.prospect}
                  onChange={(e) =>
                    setFilters({ ...filters, prospect: !filters.prospect })
                  }
                />

                <label
                  htmlFor="myCheckbox"
                  className="form-check-label fw-semibold ms-1"
                >
                  Prospecting
                </label>
              </div>
            </div> */}

            <button
              onClick={getAllEmployeesFiltered}
              className="btn btn-outline-primary"
            >
              Search
            </button>

            <div className="general-search-field d-grid gap-2 my-5">
              <div className="row">
                <div className="col">
                  <label className="fw-semibold" htmlFor="floatingInput">
                    General search text
                  </label>
                  <input
                    value={filters.generalsearchstring}
                    onChange={(e) =>
                      setFilters({
                        ...filters,
                        generalsearchstring: e.target.value,
                      })
                    }
                    type="text"
                    className="form-control"
                    id="floatingInput"
                  />
                </div>
              </div>

              <button
                onClick={getAllEmployeesFiltered}
                className="btn btn-outline-primary"
              >
                General Search
              </button>
            </div>
          </div>
        </div>
      </div>

      <style jsx>
        {`
          .sticky-header {
            position: sticky;
            top: 0;
            z-index: 100;
          }
          .employee_name:hover {
            color: rgba(0, 0, 0, 0.7);
        `}
      </style>
    </>
  );
}
