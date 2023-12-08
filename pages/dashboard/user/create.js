import React from "react";
import { getSession, useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Navbar from "../../../components/navbar";

export default function Create() {
    const { data: session } = useSession();

    const [newUserData, setNewUserData] = useState({
        name: "",
        password: "",
        role: "user",
        phone: "",
        email: "",
        company_provided_name: "",
        joining_date: "",
        code: "",
        real_first_name: "",
        real_last_name: "",
        birth_date: "",
        nid: 0,
        blood_group: "",
        designation: "",
        department: "",
        base_salary: 0,
        note: "",
    });

    async function fetchApi(url, options) {
        const res = await fetch(url, options);
        const data = await res.json();
        return data;
    }

    const AddNewUser = async (e) => {
        e.preventDefault();

        if (session.user.role == "admin" && (role == "super" || role == "admin")) {
            toast.error("You don't have the permission");
            return;
        }
        let result;

        if (session.user.role == "super") {
            const res = await fetch(process.env.NEXT_PUBLIC_BASE_URL + "/api/user", {
                method: "POST",
                body: JSON.stringify({
                    name,
                    password,
                    role,
                    phone,
                    email,
                    company_provided_name: companyProvidedName,
                    joining_date: joiningDate,
                }),
                headers: {
                    "Content-Type": "application/json",
                },
            });
            result = await res.json();

            if (!result.error) {
                toast.success("Created new user");
            }
        } else {
            const res = await fetch(
                process.env.NEXT_PUBLIC_BASE_URL + "/api/approval",
                {
                    method: "POST",
                    body: JSON.stringify({
                        req_type: "User Create",
                        req_by: session.user.name,
                        name,
                        password,
                        role,
                        phone,
                        email,
                        company_provided_name: companyProvidedName,
                        joining_date: joiningDate,
                    }),
                    headers: {
                        "Content-Type": "application/json",
                    },
                },
            );
            result = await res.json();
            if (!result.error) {
                toast.success("Request sent for approval");
            }
        }

        setNewUserData({
            name: "",
            password: "",
            role: "",
            phone: "",
            email: "",
            company_provided_name: "",
            joining_date: "",
            code: "",
            real_first_name: "",
            real_last_name: "",
            nid: 0,
            blood_group: "",
            designation: "",
            department: "",
            base_salary: 0,
            note: "",
        });
    };

    const handleInputChange = (fieldName) => (e) => {
        setNewUserData((prevData) => ({
            ...prevData,
            [fieldName]: e.target.value,
        }));
    };

    return (
        <>
            <Navbar navFor="dashboard" />

            <div className="container my-5">
                <div className="add-user">
                    <h5 className="py-3">Add New User</h5>
                    <form onSubmit={AddNewUser} id="inputForm">

                        {/* Employee Code */}
                        <div className="mb-3">
                            <label htmlFor="date" className="form-label">
                                Employee Code
                            </label>
                            <input
                                value={newUserData.code}
                                onChange={(e) =>
                                    setNewUserData((prevData) => ({
                                        ...prevData,
                                        code: e.target.value,
                                    }))
                                }
                                type="text"
                                className="form-control"
                            />
                        </div>

                        {/* First Name */}
                        <div className="mb-3">
                            <label htmlFor="date" className="form-label">
                                First Name
                            </label>
                            <input
                                value={newUserData.real_first_name}
                                onChange={(e) =>
                                    setNewUserData((prevData) => ({
                                        ...prevData,
                                        real_first_name: e.target.value,
                                    }))
                                }
                                type="text"
                                className="form-control"
                            />
                        </div>

                        {/* Last Name */}
                        <div className="mb-3">
                            <label htmlFor="date" className="form-label">
                                Last Name
                            </label>
                            <input
                                value={newUserData.real_last_name}
                                onChange={(e) =>
                                    setNewUserData((prevData) => ({
                                        ...prevData,
                                        real_last_name: e.target.value,
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
                                value={newUserData.joining_date}
                                onChange={(e) =>
                                    setNewUserData((prevData) => ({
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
                                value={newUserData.phone}
                                onChange={(e) =>
                                    setNewUserData((prevData) => ({
                                        ...prevData,
                                        phone: e.target.value,
                                    }))
                                }
                                type="text"
                                assword
                                className="form-control"
                            />
                        </div>

                        {/* Email */}
                        <div className="mb-3">
                            <label htmlFor="date" className="form-label">
                                Email
                            </label>
                            <input
                                value={newUserData.email}
                                onChange={(e) =>
                                    setNewUserData((prevData) => ({
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
                                National Identity Number
                            </label>
                            <input
                                value={newUserData.nid}
                                onChange={(e) =>
                                    setNewUserData((prevData) => ({
                                        ...prevData,
                                        nid: e.target.value,
                                    }))
                                }
                                type="number"
                                className="form-control"
                            />
                        </div>

                        {/* Blood Group */}
                        <div className="mb-3">
                            <label htmlFor="date" className="form-label">
                                Blood Group
                            </label>
                            <input
                                value={newUserData.blood_group}
                                onChange={(e) =>
                                    setNewUserData((prevData) => ({
                                        ...prevData,
                                        blood_group: e.target.value,
                                    }))
                                }
                                type="text"
                                className="form-control"
                            />
                        </div>

                        {/* Birth Date */}
                        <div className="mb-3">
                            <label htmlFor="date" className="form-label">
                                Birth Date
                            </label>
                            <input
                                value={newUserData.birth_date}
                                onChange={(e) =>
                                    setNewUserData((prevData) => ({
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
                                value={newUserData.designation}
                                onChange={(e) =>
                                    setNewUserData((prevData) => ({
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
                                value={newUserData.department}
                                onChange={(e) =>
                                    setNewUserData((prevData) => ({
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
                                value={newUserData.base_salary}
                                onChange={(e) =>
                                    setNewUserData((prevData) => ({
                                        ...prevData,
                                        base_salary: e.target.value,
                                    }))
                                }
                                type="number"
                                className="form-control"
                            />
                        </div>

                        {/* Login Name */}
                        <div className="mb-3">
                            <label htmlFor="date" className="form-label">
                                Login Name
                            </label>
                            <input
                                required
                                value={newUserData.name}
                                onChange={(e) =>
                                    setNewUserData((prevData) => ({
                                        ...prevData,
                                        name: e.target.value,
                                    }))
                                }
                                type="text"
                                className="form-control"
                            />
                        </div>

                        {/* Login Password */}
                        <div className="mb-3">
                            <label htmlFor="date" className="form-label">
                                Login Password
                            </label>
                            <input
                                required
                                value={newUserData.password}
                                onChange={(e) =>
                                    setNewUserData((prevData) => ({
                                        ...prevData,
                                        password: e.target.value,
                                    }))
                                }
                                type="text"
                                className="form-control"
                            />
                        </div>

                        {/* Role */}
                        <div className="mb-3">
                            <label htmlFor="date" className="form-label">
                                Role
                            </label>

                            <select
                                className="form-select"
                                id="floatingSelect"
                                required
                                value={newUserData.role}
                                onChange={(e) =>
                                    setNewUserData((prevData) => ({
                                        ...prevData,
                                        role: e.target.value,
                                    }))
                                }
                            >
                                <option value="user">User</option>
                                <option value="admin">Admin</option>
                                <option value="super">Super</option>
                                <option value="manager">Manager</option>
                                <option value="marketer">Marketer</option>
                            </select>
                        </div>

                        {/* Company Provided Name */}
                        {newUserData.role == "marketer" && (
                            <div className="marketr-exclusive">
                                <div className="mb-3">
                                    <label htmlFor="date" className="form-label">
                                        Company Provided Name
                                    </label>
                                    <input
                                        required
                                        value={newUserData.company_provided_name}
                                        onChange={(e) =>
                                            setNewUserData((prevData) => ({
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

                        {/* Note*/}
                        <div className="mb-3">
                            <label htmlFor="date" className="form-label">
                                Note for this user
                            </label>
                            <textarea
                                value={newUserData.note}
                                onChange={(e) =>
                                    setNewUserData((prevData) => ({
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
