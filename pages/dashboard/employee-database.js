import React, { useEffect, useState } from "react";
import Navbar from "../../components/navbar";
import { toast } from "sonner";

export default function EmployeeDatabase() {
  const [employees, setEmployees] = useState([]);
  const [manageData, setManageData] = useState([]);

  async function fetchApi(url, options) {
    const res = await fetch(url, options);
    const data = await res.json();
    return data;
  }

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

  async function deleteEmployee(deleteEmployeeData) {
    const url = `${process.env.NEXT_PUBLIC_BASE_URL}/api/approval`;
    const options = {
      method: "POST",
      body: JSON.stringify({
        req_type: "Employee Delete",
        req_by: session.user.name,
        id: deleteEmployeeData._id,
        ...deleteEmployeeData,
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
                  <th>Base Salary</th>
                  <th>Bonus (Eid ul Fitr)</th>
                  <th>Bonus (Eid ul Adha)</th>
                  <th>Note</th>
                  <th>Manage</th>
                </tr>
              </thead>
              <tbody>
                {employees &&
                  employees.map((employee, index) => (
                    <tr key={index}>
                      <td>{employee.e_id}</td>
                      <td>{employee.real_name}</td>
                      <td>{employee.joining_date}</td>
                      <td>{employee.phone}</td>
                      <td>{employee.email}</td>
                      <td>{employee.birth_date}</td>
                      <td>{employee.nid}</td>
                      <td>{employee.blood_group}</td>
                      <td>{employee.designation}</td>
                      <td>{employee.department}</td>
                      <td>{employee.base_salary}</td>
                      <td>{employee.bonus_eid_ul_fitr}</td>
                      <td>{employee.bonus_eid_ul_adha}</td>
                      <td className="text-wrap">{employee.note}</td>
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
                  ))}
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

              {/* Base Salary */}
              <div className="mb-3">
                <label htmlFor="date" className="form-label">
                  Base Salary
                </label>
                <input
                  value={manageData.base_salary}
                  onChange={(e) =>
                    setManageData((prevData) => ({
                      ...prevData,
                      base_salary: e.target.value,
                    }))
                  }
                  type="number"
                  className="form-control"
                />
              </div>

              {/* Base Salary */}
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

              {/* Base Salary */}
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
    </>
  );
}
