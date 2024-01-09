import React from "react";
import { getSession, useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Navbar from "../../components/navbar";
import { toast } from "sonner";

export default function Create() {
  const { data: session } = useSession();

  const [newEmployeeData, setNewEmployeeData] = useState({
    e_id: "",
    real_name: "",
    joining_date: "",
    phone: "",
    email: "",
    birth_date: "",
    nid: "",
    blood_group: "",
    designation: "",
    department: "Production",
    gross_salary: 0,
    bonus_eid_ul_fitr: 0,
    bonus_eid_ul_adha: 0,
    division: "",
    branch: "",
    provident_fund: 0,
    status: "Active",
    company_provided_name: "",
    note: "",
  });

  const AddNewUser = async (e) => {
    e.preventDefault();

    const res = await fetch(
      process.env.NEXT_PUBLIC_BASE_URL + "/api/employee",
      {
        method: "POST",
        body: JSON.stringify(newEmployeeData),
        headers: {
          newemployee: true,
          "Content-Type": "application/json",
        },
      },
    );

    let result = await res.json();

    if (!result.error) {
      toast.success("Created new employee");
    } else {
      console.error(result.error);
      toast.error("Unable to create employee");
    }

    setNewEmployeeData({
      e_id: "",
      real_name: "",
      joining_date: "",
      phone: "",
      email: "",
      birth_date: "",
      nid: "",
      blood_group: "",
      designation: "",
      department: "Production",
      gross_salary: 0,
      bonus_eid_ul_fitr: 0,
      bonus_eid_ul_adha: 0,
      division: "",
      branch: "",
      provident_fund: 0,
      status: "Active",
      company_provided_name: "",
      note: "",
    });
  };

  return (
    <>
      <Navbar navFor="admin" />

      <div className="container my-5">
        <div className="add-user">
          <h5 className="py-3">Add new employee</h5>
          <form onSubmit={AddNewUser} id="inputForm">
            {/* Employee Code */}
            <div className="mb-3">
              <label htmlFor="date" className="form-label">
                Employee ID
              </label>
              <input
                required
                value={newEmployeeData.e_id}
                onChange={(e) =>
                  setNewEmployeeData((prevData) => ({
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
                required
                value={newEmployeeData.real_name}
                onChange={(e) =>
                  setNewEmployeeData((prevData) => ({
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
                required
                value={newEmployeeData.joining_date}
                onChange={(e) =>
                  setNewEmployeeData((prevData) => ({
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
                value={newEmployeeData.phone}
                onChange={(e) =>
                  setNewEmployeeData((prevData) => ({
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
                value={newEmployeeData.email}
                onChange={(e) =>
                  setNewEmployeeData((prevData) => ({
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
                value={newEmployeeData.nid}
                onChange={(e) =>
                  setNewEmployeeData((prevData) => ({
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
                value={newEmployeeData.blood_group}
                onChange={(e) =>
                  setNewEmployeeData((prevData) => ({
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
                value={newEmployeeData.birth_date}
                onChange={(e) =>
                  setNewEmployeeData((prevData) => ({
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
                value={newEmployeeData.designation}
                onChange={(e) =>
                  setNewEmployeeData((prevData) => ({
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
                value={newEmployeeData.department}
                onChange={(e) =>
                  setNewEmployeeData((prevData) => ({
                    ...prevData,
                    department: e.target.value,
                  }))
                }
              >
                <option defaultValue={true} value="Production">
                  Production
                </option>
                <option value="Marketing">Marketing</option>
                <option value="Management">Management</option>
                <option value="Software">Software</option>
                <option value="Others">Others</option>
              </select>
            </div>

            {newEmployeeData.department == "Marketing" && (
              <div className="marketr-exclusive">
                <div className="mb-3">
                  <label htmlFor="date" className="form-label">
                    Company Provided Name
                  </label>
                  <input
                    required
                    value={newEmployeeData.company_provided_name}
                    onChange={(e) =>
                      setNewEmployeeData((prevData) => ({
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
                value={newEmployeeData.branch}
                onChange={(e) =>
                  setNewEmployeeData((prevData) => ({
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
                value={newEmployeeData.division}
                onChange={(e) =>
                  setNewEmployeeData((prevData) => ({
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
                value={newEmployeeData.gross_salary}
                onChange={(e) =>
                  setNewEmployeeData((prevData) => ({
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
                value={newEmployeeData.provident_fund}
                onChange={(e) =>
                  setNewEmployeeData((prevData) => ({
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
                value={newEmployeeData.status}
                onChange={(e) =>
                  setNewEmployeeData((prevData) => ({
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
                value={newEmployeeData.bonus_eid_ul_fitr}
                onFocus={() =>
                  setNewEmployeeData((prevData) => ({
                    ...prevData,
                    bonus_eid_ul_fitr: prevData.gross_salary / 2,
                  }))
                }
                onChange={(e) =>
                  setNewEmployeeData((prevData) => ({
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
                value={newEmployeeData.bonus_eid_ul_adha}
                onFocus={() =>
                  setNewEmployeeData((prevData) => ({
                    ...prevData,
                    bonus_eid_ul_adha: prevData.gross_salary / 2,
                  }))
                }
                onChange={(e) =>
                  setNewEmployeeData((prevData) => ({
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
                value={newEmployeeData.note}
                onChange={(e) =>
                  setNewEmployeeData((prevData) => ({
                    ...prevData,
                    note: e.target.value,
                  }))
                }
                className="form-control"
              />
            </div>

            <button type="submit" className="btn btn-sm btn-outline-primary">
              Submit
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
