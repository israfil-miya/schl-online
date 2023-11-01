import { useEffect, useState } from "react";
import { getSession, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { toast } from "react-hot-toast";
import Link from "next/link";
import Navbar from "../../components/navbar";

export default function Clients() {
  const router = useRouter();
  const { data: session } = useSession();

  const [page, setPage] = useState(1);
  const [pageCount, setPageCount] = useState(0);

  const [isFiltered, setIsFiltered] = useState(0);

  const [clients, setClients] = useState([]);
  const [clientCode, setClientCode] = useState("");
  const [clientName, setClientName] = useState("");
  const [marketer, setMarketer] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [designation, setDesignation] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [email, setEmail] = useState("");
  const [country, setCountry] = useState("");
  const [address, setAddress] = useState("");
  const [prices, setPrices] = useState("");
  const [currency, setCurrency] = useState("");
  const [clientCodeFilter, setClientCodeFilter] = useState("");
  const [countryFilter, setCountryFilter] = useState("");
  const [contactPersonFilter, setContactPersonFilter] = useState("");

  const [editedBy, setEditedBy] = useState("");

  const [manageData, setManageData] = useState({
    _id: "",
    client_code: "",
    client_name: "",
    marketer: "",
    contact_person: "",
    designation: "",
    contact_number: "",
    email: "",
    country: "",
    address: "",
    prices: "",
    currency: "",
  });

  async function fetchClientData(url, options) {
    const res = await fetch(url, options);
    const data = await res.json();
    return data;
  }

  async function getAllClients() {
    try {
      const url = `${process.env.NEXT_PUBLIC_BASE_URL}/api/client`;
      const options = {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          getallclients: true,
          page,
        },
      };

      const clientsList = await fetchClientData(url, options);

      if (!clientsList.error) {
        setClients(clientsList);
      } else {
        toast.error("Unable to retrieve clients list");
      }
    } catch (error) {
      console.error("Error fetching clients:", error);
      toast.error("Error retrieving clients");
    }
  }
  async function getAllClientsFiltered() {
    try {
      const url = `${process.env.NEXT_PUBLIC_BASE_URL}/api/client`;
      const options = {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          getallclients: true,
          isfilter: true,
          page,
          country: countryFilter,
          clientcode: clientCodeFilter,
          contactperson: contactPersonFilter,
        },
      };

      const clientsList = await fetchClientData(url, options);

      if (!clientsList.error) {
        setClients(clientsList);
        setIsFiltered(1);
      } else {
        setIsFiltered(0);
        await getAllClients();
      }
    } catch (error) {
      console.error("Error fetching clients:", error);
      toast.error("Error retrieving clients");
    }
  }
  async function addNewClient(e) {
    e.preventDefault();

    const url = `${process.env.NEXT_PUBLIC_BASE_URL}/api/client`;
    const options = {
      method: "POST",
      body: JSON.stringify({
        client_code: clientCode,
        client_name: clientName,
        marketer,
        contact_person: contactPerson,
        designation,
        contact_number: contactNumber,
        email,
        country,
        address,
        prices,
        currency,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    };

    try {
      const result = await fetchClientData(url, options);

      if (!result.error) {
        toast.success("Added new client");
        await getAllClients();
      } else {
        router.replace(`/admin?error=${result.message}`);
      }
    } catch (error) {
      console.error("Error adding new client:", error);
      toast.error("Error adding new client");
    }

    setClientCode("");
    setClientName("");
  }

  async function deleteClient(deleteClientData) {
    let result;

    const res = await fetch(
      process.env.NEXT_PUBLIC_BASE_URL + "/api/approval",
      {
        method: "POST",
        body: JSON.stringify({
          req_type: "Client Delete",
          req_by: session.user.name,
          id: deleteClientData._id,
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

  async function editClient() {
    const url = `${process.env.NEXT_PUBLIC_BASE_URL}/api/client`;
    const options = {
      method: "POST",
      body: JSON.stringify(manageData),
      headers: {
        "Content-Type": "application/json",
        editclient: true,
        name: session.user?.name,
      },
    };

    try {
      const result = await fetchClientData(url, options);

      if (!result.error) {
        toast.success("Edited the client data", {
          duration: 3500,
        });
        await getAllClients();
      } else {
        router.replace(`/admin?error=${result.message}`);
      }
    } catch (error) {
      console.error("Error editing client:", error);
      toast.error("Error editing client");
    }
    setManageData({});
  }

  function handlePrevious() {
    setPage((p) => {
      if (p === 1) return p;
      return p - 1;
    });
  }

  function handleNext() {
    setPage((p) => {
      if (p === pageCount) return p;
      return p + 1;
    });
  }

  useEffect(() => {
    if (!isFiltered) getAllClients();
    if (clients) setPageCount(clients?.pagination?.pageCount);
  }, [clients?.pagination?.pageCount]);

  useEffect(() => {
    if (!isFiltered) getAllClients();
    else getAllClientsFiltered();
  }, [page]);

  return (
    <>
      <Navbar navFor="admin" />
      <div className="my-5">
        <div className="container add-client">
          <h5 className="py-3">Add New Client</h5>
          <form onSubmit={addNewClient} id="inputForm">
            <div className="mb-3">
              <label htmlFor="clientCode" className="form-label">
                Client Code
              </label>
              <input
                value={clientCode}
                onChange={(e) => setClientCode(e.target.value)}
                type="text"
                className="form-control"
                id="clientCode"
              />
            </div>
            <div className="mb-3">
              <label htmlFor="clientName" className="form-label">
                Client Name
              </label>
              <input
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                type="text"
                className="form-control"
                id="clientName"
              />
            </div>
            <div className="mb-3">
              <label htmlFor="clientName" className="form-label">
                Marketer Name
              </label>
              <input
                value={marketer}
                onChange={(e) => setMarketer(e.target.value)}
                type="text"
                className="form-control"
                id="clientName"
              />
            </div>
            <div className="mb-3">
              <label htmlFor="clientName" className="form-label">
                Contact Person
              </label>
              <input
                value={contactPerson}
                onChange={(e) => setContactPerson(e.target.value)}
                type="text"
                className="form-control"
                id="clientName"
              />
            </div>
            <div className="mb-3">
              <label htmlFor="clientName" className="form-label">
                Designation
              </label>
              <input
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                type="text"
                className="form-control"
                id="clientName"
              />
            </div>
            <div className="mb-3">
              <label htmlFor="clientName" className="form-label">
                Contact Number
              </label>
              <input
                value={contactNumber}
                onChange={(e) => setContactNumber(e.target.value)}
                type="text"
                className="form-control"
                id="clientName"
              />
            </div>
            <div className="mb-3">
              <label htmlFor="clientName" className="form-label">
                Email
              </label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="text"
                className="form-control"
                id="clientName"
              />
            </div>
            <div className="mb-3">
              <label htmlFor="clientName" className="form-label">
                Country
              </label>
              <input
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                type="text"
                className="form-control"
                id="clientName"
              />
            </div>
            <div className="mb-3">
              <label htmlFor="clientName" className="form-label">
                Address
              </label>
              <input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                type="text"
                className="form-control"
                id="clientName"
              />
            </div>
            <div className="mb-3">
              <label htmlFor="clientName" className="form-label">
                Prices
              </label>
              <textarea
                value={prices}
                onChange={(e) => setPrices(e.target.value)}
                type="text"
                className="form-control"
                id="clientName"
              />
            </div>
            <div className="mb-3">
              <label htmlFor="clientName" className="form-label">
                Currency
              </label>
              <input
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                type="text"
                className="form-control"
                id="clientName"
              />
            </div>

            <button type="submit" className="btn btn-sm btn-outline-primary">
              Submit
            </button>
          </form>
        </div>
        <div
          style={{ overflowX: "auto" }}
          className="text-nowrap client-list my-5"
        >
          <h5 className="text-center py-4">Clients List</h5>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <div className="mb-3 p-3 bg-light rounded border d-flex justify-content-center">
              <div
                style={{ display: "flex", alignItems: "center" }}
                className="filter_folder me-3"
              >
                <strong>Client Code: </strong>
                <input
                  type="text"
                  placeholder="Folder"
                  className="form-control ms-2 custom-input"
                  value={clientCodeFilter}
                  onChange={(e) => setClientCodeFilter(e.target.value)}
                />
              </div>

              <div
                style={{ display: "flex", alignItems: "center" }}
                className="filter_task me-3"
              >
                <strong>Contact Person: </strong>
                <input
                  type="text"
                  placeholder="Task"
                  className="form-control ms-2 custom-input"
                  value={contactPersonFilter}
                  onChange={(e) => setContactPersonFilter(e.target.value)}
                />
              </div>

              <div
                style={{ display: "flex", alignItems: "center" }}
                className="filter_task me-3"
              >
                <strong>Country: </strong>
                <input
                  type="text"
                  placeholder="Task"
                  className="form-control ms-2 custom-input"
                  value={countryFilter}
                  onChange={(e) => setCountryFilter(e.target.value)}
                />
              </div>

              <button
                onClick={getAllClientsFiltered}
                className="btn ms-4 btn-sm btn-outline-primary"
              >
                Search
              </button>
            </div>
          </div>

          {clients?.items?.length !== 0 && (
            <div className="container mb-5">
              <div
                className="float-end"
                style={{ display: "flex", alignItems: "center" }}
              >
                <span className="me-3">
                  Page{" "}
                  <strong>
                    {page}/{pageCount}
                  </strong>
                </span>
                <div
                  className="btn-group"
                  role="group"
                  aria-label="Basic outlined example"
                >
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-secondary"
                    disabled={page === 1}
                    onClick={handlePrevious}
                  >
                    Previous
                  </button>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-secondary"
                    disabled={page === pageCount}
                    onClick={handleNext}
                  >
                    Next
                  </button>
                </div>
              </div>

              {/* <div className="float-start">
            <div className={`btn-group ${!isFiltered ? "d-none" : ""}`} role="group" aria-label="Basic outlined example">
              <button type="button" className="btn btn-sm btn-outline-success">
                EXCEL EXPORT
              </button>
            </div>
          </div> */}
            </div>
          )}

          <table className="table p-3 table-hover">
            <thead>
              <tr className="table-dark">
                <th>#</th>
                <th>Client Code</th>
                <th>Client Name</th>
                <th>Marketer Name</th>
                <th>Contact Person</th>
                <th>Email</th>
                <th>Country</th>
                <th>Manage</th>
              </tr>
            </thead>
            <tbody>
              {clients?.items?.map((client, index) => (
                <tr key={client._id}>
                  <td>{index + 1}</td>
                  <td>{client.client_code}</td>
                  <td>{client.client_name}</td>
                  <td>{client.marketer}</td>
                  <td>{client.contact_person}</td>
                  <td>{client.email}</td>
                  <td>{client.country}</td>
                  <td>
                    <button
                      onClick={() => {
                        setManageData({
                          _id: client._id ?? "",
                          client_code: client.client_code ?? "",
                          client_name: client.client_name ?? "",
                          marketer: client.marketer ?? "",
                          contact_person: client.contact_person ?? "",
                          designation: client.designation ?? "",
                          contact_number: client.contact_number ?? "",
                          email: client.email ?? "",
                          country: client.country ?? "",
                          address: client.address ?? "",
                          prices: client.prices ?? "",
                          currency: client.currency ?? "",
                        });
                        setEditedBy(client.updated_by ?? "");
                      }}
                      data-bs-toggle="modal"
                      data-bs-target="#editModal"
                      type="button"
                      className="btn me-2 btn-sm btn-outline-primary"
                    >
                      Edit
                    </button>

                    {/* {session?.user?.role == "super" && <Link
                    type="button"
                    href={`/client/${client._id}`}
                    className="btn me-2 btn-sm btn-outline-warning"
                  >
                    View
                  </Link> } */}
                    <button
                      type="button"
                      onClick={() => deleteClient(client)}
                      className="btn me-2 btn-sm btn-outline-danger"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div
          className="modal fade"
          id="editModal"
          tabIndex="-1"
          aria-hidden="true"
        >
          <div className="modal-dialog modal-dialog-scrollable modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h1 className="modal-title fs-5" id="staticBackdropLabel">
                  Edit client
                </h1>
                <button
                  type="button"
                  className="btn-close"
                  data-bs-dismiss="modal"
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body">
                <div className="m-3">
                  <label htmlFor="date" className="form-label">
                    Client Code
                  </label>
                  <input
                    value={manageData.client_code}
                    onChange={(e) =>
                      setManageData((prevData) => ({
                        ...prevData,
                        client_code: e.target.value,
                      }))
                    }
                    type="text"
                    className="form-control"
                  />
                </div>
                <div className="m-3">
                  <label htmlFor="date" className="form-label">
                    Client Name
                  </label>
                  <input
                    value={manageData.client_name}
                    onChange={(e) =>
                      setManageData((prevData) => ({
                        ...prevData,
                        client_name: e.target.value,
                      }))
                    }
                    type="text"
                    className="form-control"
                  />
                </div>
                <div className="m-3">
                  <label htmlFor="date" className="form-label">
                    Marketer Name
                  </label>
                  <input
                    value={manageData.marketer}
                    onChange={(e) =>
                      setManageData((prevData) => ({
                        ...prevData,
                        marketer: e.target.value,
                      }))
                    }
                    type="text"
                    className="form-control"
                  />
                </div>
                <div className="m-3">
                  <label htmlFor="date" className="form-label">
                    Contact Person
                  </label>
                  <input
                    value={manageData.contact_person}
                    onChange={(e) =>
                      setManageData((prevData) => ({
                        ...prevData,
                        contact_person: e.target.value,
                      }))
                    }
                    type="text"
                    className="form-control"
                  />
                </div>
                <div className="m-3">
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
                <div className="m-3">
                  <label htmlFor="date" className="form-label">
                    Contact Number
                  </label>
                  <input
                    value={manageData.contact_number}
                    onChange={(e) =>
                      setManageData((prevData) => ({
                        ...prevData,
                        contact_number: e.target.value,
                      }))
                    }
                    type="text"
                    className="form-control"
                  />
                </div>
                <div className="m-3">
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
                    type="text"
                    className="form-control"
                  />
                </div>
                <div className="m-3">
                  <label htmlFor="date" className="form-label">
                    Country
                  </label>
                  <input
                    value={manageData.country}
                    onChange={(e) =>
                      setManageData((prevData) => ({
                        ...prevData,
                        country: e.target.value,
                      }))
                    }
                    type="text"
                    className="form-control"
                  />
                </div>
                <div className="m-3">
                  <label htmlFor="date" className="form-label">
                    Address
                  </label>
                  <input
                    value={manageData.address}
                    onChange={(e) =>
                      setManageData((prevData) => ({
                        ...prevData,
                        address: e.target.value,
                      }))
                    }
                    type="text"
                    className="form-control"
                  />
                </div>
                <div className="m-3">
                  <label htmlFor="date" className="form-label">
                    Prices
                  </label>
                  <textarea
                    value={manageData.prices}
                    onChange={(e) =>
                      setManageData((prevData) => ({
                        ...prevData,
                        prices: e.target.value,
                      }))
                    }
                    type="text"
                    className="form-control"
                  />
                </div>
                <div className="m-3">
                  <label htmlFor="date" className="form-label">
                    Currency
                  </label>
                  <input
                    value={manageData.currency}
                    onChange={(e) =>
                      setManageData((prevData) => ({
                        ...prevData,
                        currency: e.target.value,
                      }))
                    }
                    type="text"
                    className="form-control"
                  />
                </div>
              </div>
              <div className="modal-footer p-1">
                {editedBy ? (
                  <div className="d-flex justify-content-start align-items-center me-auto text-body-secondary">
                    <span className="me-1">Last updated by </span>

                    <span className="fw-medium">{editedBy}</span>
                  </div>
                ) : null}
                <button
                  type="button"
                  className="btn btn-sm btn-outline-secondary"
                  data-bs-dismiss="modal"
                >
                  Close
                </button>
                <button
                  onClick={editClient}
                  type="button"
                  data-bs-dismiss="modal"
                  className="btn btn-sm btn-outline-primary"
                >
                  Update
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
            padding: 5px 2.5px;
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
