import { getSession, useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { toast } from "sonner";
import Navbar from "../../components/navbar";

export default function Users() {
  const { data: session } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState(null);
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [companyProvidedName, setCompanyProvidedName] = useState("");
  const [joiningDate, setJoiningDate] = useState("");
  const [editUserData, setEditUserData] = useState({});
  const [manageData, setManageData] = useState({
    _id: "",
    name: "",
    password: "",
    role: "",
    phone: "",
    email: "",
    company_provided_name: "",
    joining_date: "",
  });

  async function fetchUserData(url, options) {
    const res = await fetch(url, options);
    const data = await res.json();
    return data;
  }

  async function GetAllUsers() {
    try {
      const url = `${process.env.NEXT_PUBLIC_BASE_URL}/api/user`;
      const options = {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          getalluser: true,
        },
      };

      const usersList = await fetchUserData(url, options);

      if (!usersList.error) {
        setUsers(usersList);
      } else {
        toast.error("Unable to retrieve users list");
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Error retrieving users");
    }
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
        await GetAllUsers();
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

    // console.log(result);

    if (result.error) {
      router.replace("/admin?error=" + result.message);
    }

    setName("");
    setPassword("");
    setJoiningDate("");
    setPhone("");
    setEmail("");
    setRole("");
    setCompanyProvidedName("");
  };

  const convertToDDMMYYYY = (dateString) => {
    const [year, month, day] = dateString.split("-");
    if (year.length != 4) return dateString;
    return `${day}-${month}-${year}`;
  };

  async function deleteUser(deleteUserData) {
    if (
      (session.user.role == "admin" &&
        (deleteUserData.role == "super" || deleteUserData.role == "admin")) ||
      session.user._id == deleteUserData._id
    ) {
      toast.error("You don't have the permission");
      return;
    }

    let result;

    console.log("Delete User Data: ", deleteUserData);

    const res = await fetch(
      process.env.NEXT_PUBLIC_BASE_URL + "/api/approval",
      {
        method: "POST",
        body: JSON.stringify({
          req_type: "User Delete",
          req_by: session.user.name,
          id: deleteUserData._id,
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

    // console.log(result);

    if (result.error) {
      router.replace("/admin?error=" + result.message);
    }
  }

  async function editUser() {
    if (
      (session.user.role == "admin" &&
        (manageData.role == "super" ||
          manageData.role == "admin" ||
          editUserData.role == "super" ||
          editUserData.role == "admin")) ||
      (session.user._id == editUserData._id &&
        session.user.role != manageData.role)
    ) {
      toast.error("You don't have the permission");
      return;
    }

    const url = `${process.env.NEXT_PUBLIC_BASE_URL}/api/user`;
    const options = {
      method: "POST",
      body: JSON.stringify(manageData),
      headers: {
        "Content-Type": "application/json",
        edituser: true,
      },
    };

    try {
      const result = await fetchUserData(url, options);

      if (!result.error) {
        toast.success("Edited the user data");
        await GetAllUsers();
      } else {
        router.replace(`/admin?error=${result.message}`);
      }
    } catch (error) {
      console.error("Error editing user:", error);
      toast.error("Error editing user");
    }
  }

  useEffect(() => {
    GetAllUsers();
  }, []);

  return (
    <>
      <Navbar navFor="admin" />
      <div className="container my-5">
        <div className="add-user">
          <h5 className="py-3">Add New User</h5>
          <form onSubmit={AddNewUser} id="inputForm">
            <div className="mb-3">
              <label htmlFor="date" className="form-label">
                Name
              </label>
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                type="text"
                className="form-control"
              />
            </div>
            <div className="mb-3">
              <label htmlFor="date" className="form-label">
                Password
              </label>
              <input
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="text"
                className="form-control"
              />
            </div>
            <div className="mb-3">
              <label htmlFor="date" className="form-label">
                Role
              </label>

              <select
                className="form-select"
                id="floatingSelect"
                required
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
                <option value="super">Super</option>
                <option value="manager">Manager</option>
                <option value="marketer">Marketer</option>
              </select>
            </div>
            <div className="mb-3">
              <label htmlFor="date" className="form-label">
                Joining Date
              </label>
              <input
                value={joiningDate}
                onChange={(e) => setJoiningDate(e.target.value)}
                type="date"
                className="form-control"
              />
            </div>
            <div className="mb-3">
              <label htmlFor="date" className="form-label">
                Phone
              </label>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                type="text"
                assword
                className="form-control"
              />
            </div>
            <div className="mb-3">
              <label htmlFor="date" className="form-label">
                Email
              </label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                className="form-control"
              />
            </div>

            {role == "marketer" && (
              <div className="marketr-exclusive">
                <div className="mb-3">
                  <label htmlFor="date" className="form-label">
                    Company Provided Name
                  </label>
                  <input
                    required
                    value={companyProvidedName}
                    onChange={(e) => setCompanyProvidedName(e.target.value)}
                    type="text"
                    className="form-control"
                  />
                </div>
              </div>
            )}

            <button type="submit" className="btn btn-sm btn-outline-primary">
              Submit
            </button>
          </form>
        </div>
        <div className="user-list my-5">
          <h5 className="py-3">List of User</h5>
          <table className="table p-3 table-hover">
            <thead>
              <tr className="table-dark">
                <th>#</th>
                <th>Name</th>
                <th>Password</th>
                <th>Role</th>
                <th>Joining Date</th>
                <th>Phone</th>
                <th>Email</th>
                <th>Manage</th>
              </tr>
            </thead>
            <tbody>
              {users &&
                users.map((user, index) => {
                  return (
                    <tr key={user._id}>
                      <td>{index + 1}</td>
                      <td>{user.name}</td>
                      <td>
                        {(user.role == "super" || user.role == "admin") &&
                        session.user.role != "super"
                          ? "XXXXXX"
                          : user.password}
                      </td>
                      <td>{user.role}</td>
                      <td>
                        {user.joining_date
                          ? convertToDDMMYYYY(user.joining_date)
                          : ""}
                      </td>
                      <td>{user.phone}</td>
                      <td>{user.email}</td>
                      <td>
                        <button
                          onClick={() => {
                            setManageData(user);
                            setEditUserData(user);
                          }}
                          data-bs-toggle="modal"
                          data-bs-target="#editModal"
                          type="button"
                          className="btn me-2 btn-sm btn-outline-primary"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteUser(user)}
                          className="btn me-2 btn-sm btn-outline-danger"
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
        <div
          className="modal fade"
          id="editModal"
          tabIndex="-1"
          aria-hidden="true"
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h1 className="modal-title fs-5" id="staticBackdropLabel">
                  Edit user
                </h1>
                <button
                  type="button"
                  className="btn-close"
                  data-bs-dismiss="modal"
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label htmlFor="date" className="form-label">
                    Name
                  </label>
                  <input
                    required
                    value={manageData.name}
                    onChange={(e) =>
                      setManageData((prevData) => ({
                        ...prevData,
                        name: e.target.value,
                      }))
                    }
                    type="text"
                    className="form-control"
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="date" className="form-label">
                    Password
                  </label>
                  <input
                    required
                    value={manageData.password}
                    onChange={(e) =>
                      setManageData((prevData) => ({
                        ...prevData,
                        password: e.target.value,
                      }))
                    }
                    type="text"
                    className="form-control"
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="date" className="form-label">
                    Role
                  </label>

                  <select
                    className="form-select"
                    id="floatingSelect"
                    required
                    value={manageData.role}
                    onChange={(e) =>
                      setManageData((prevData) => ({
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
                    assword
                    className="form-control"
                  />
                </div>
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

                {manageData.role == "marketer" && (
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
                  onClick={editUser}
                  type="button"
                  className="btn btn-sm btn-outline-primary"
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <style jsx>
        {`
          .table {
            font-size: 15px;
          }

          th,
          td {
            padding: 10px 5px;
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
