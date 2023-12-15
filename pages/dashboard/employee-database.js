import React, { useEffect, useState } from "react";
import Navbar from "../../components/navbar";
import { toast } from "sonner";
import moment from "moment";
import NoteTd from "../../components/extandable-td";
import { useSession } from "next-auth/react";

export default function EmployeeDatabase() {
  const [employees, setEmployees] = useState([]);
  const [manageData, setManageData] = useState([]);
  const { data: session } = useSession();

  async function fetchApi(url, options) {
    const res = await fetch(url, options);
    const data = await res.json();
    return data;
  }

  function isEmployeePermanent(joiningDate) {
    // Existing logic to check if permanent
    const joinDate = new Date(joiningDate);
    const probationEndDate = new Date(
      joinDate.getFullYear(),
      joinDate.getMonth() + 6,
      joinDate.getDate(),
    );
    const today = new Date();
    const isPermanent = today >= probationEndDate;

    // Calculate remaining time if not permanent
    if (!isPermanent) {
      const remainingDays = Math.floor(
        (probationEndDate - today) / (1000 * 60 * 60 * 24),
      );
      return {
        isPermanent: false,
        remainingTime: formatRemainingTime(remainingDays),
      };
    }

    // Return permanent status if permanent
    return { isPermanent: true };
  }

  function formatRemainingTime(remainingDays) {
    const months = Math.floor(remainingDays / 30);
    const days = remainingDays % 30;

    if (months === 0) {
      return `${days} day${days > 1 ? "s" : ""}`;
    } else if (months === 1 && days === 0) {
      return `${months} month`;
    } else {
      return `${months} month${months > 1 ? "s" : ""}, ${days} day${
        days > 1 ? "s" : ""
      }`;
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
        req_by: session.user.name,
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
        <div className="user-list my-5">
          <div style={{ overflowX: "auto" }} className="text-nowrap">
            <table className="table p-3 table-hover table-bordered">
              <thead>
                <tr className="table-dark">
                  <th>Employee ID</th>
                  <th>Full Name</th>
                  <th>Joining Date</th>
                  <th>Phone</th>
                  <th>Email</th>
                  <th>Birth Date</th>
                  <th>NID</th>
                  <th>Blood Group</th>
                  <th>Designation</th>
                  <th>Department</th>
                  <th>Gross Salary</th>
                  <th>Status</th>
                  <th>Permanent</th>
                  <th>Bonus (Eid ul Fitr)</th>
                  <th>Bonus (Eid ul Adha)</th>
                  <th>Note</th>
                  <th>Manage</th>
                </tr>
              </thead>
              <tbody>
                {employees &&
                  employees.map((employee, index) => {
                    // Joined today
                    const employeeInfo = isEmployeePermanent(
                      employee.joining_date,
                    );
                    return (
                      <tr
                        key={index}
                        className={
                          employee.status == "Active"
                            ? "table-success"
                            : "table-danger"
                        }
                      >
                        <td>{employee.e_id}</td>
                        <td>{employee.real_name}</td>
                        <td>{convertToDDMMYYYY(employee.joining_date)}</td>
                        <td>{employee.phone}</td>
                        <td>{employee.email}</td>
                        <td>{employee.birth_date}</td>
                        <td>{employee.nid}</td>
                        <td>{employee.blood_group}</td>
                        <td>{employee.designation}</td>
                        <td>{employee.department}</td>
                        <td>{employee.gross_salary}</td>
                        <td>{employee.status}</td>
                        <td>
                          {employeeInfo.isPermanent
                            ? "Yes"
                            : employeeInfo.remainingTime}
                        </td>
                        <td>{employee.bonus_eid_ul_fitr}</td>
                        <td>{employee.bonus_eid_ul_adha}</td>
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
                  })}
              </tbody>
            </table>
          </div>
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
                <input
                  value={manageData.department}
                  onChange={(e) =>
                    setManageData((prevData) => ({
                      ...prevData,
                      department: e.target.value,
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
    </>
  );
}
