import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { toast } from "react-hot-toast";
import Link from "next/link";

export default function Clients() {
  const router = useRouter();
  const [clients, setClients] = useState([]);
  const [clientCode, setClientCode] = useState("");
  const [manageData, setManageData] = useState({ _id: "", client_code: "" });

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

  async function addNewClient(e) {
    e.preventDefault();

    const url = `${process.env.NEXT_PUBLIC_BASE_URL}/api/client`;
    const options = {
      method: "POST",
      body: JSON.stringify({ client_code: clientCode }),
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
  }

  async function deleteClient(deleteClientData) {
    const url = `${process.env.NEXT_PUBLIC_BASE_URL}/api/client`;
    const options = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        deleteclient: true,
        id: deleteClientData._id,
      },
    };

    try {
      const resData = await fetchClientData(url, options);

      if (!resData.error) {
        toast.success("Deleted the client data", {
          duration: 3500,
        });
        await getAllClients();
      } else {
        toast.error("Unable to delete client");
      }
    } catch (error) {
      console.error("Error deleting client:", error);
      toast.error("Error deleting client");
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
  }

  useEffect(() => {
    getAllClients();
  }, []);

  return (
    <div className="container my-5">
      <div className="add-client">
        <h5 className="py-3">Add New Client</h5>
        <form onSubmit={addNewClient} id="inputForm">
          <div className="mb-3">
            <label htmlFor="date" className="form-label">
              Client Code
            </label>
            <input
              required
              value={clientCode}
              onChange={(e) => setClientCode(e.target.value)}
              type="text"
              className="form-control"
              id="clientCode"
            />
          </div>
          <button type="submit" className="btn btn-sm btn-outline-primary">
            Submit
          </button>
        </form>
      </div>
      <div className="client-list my-5">
        <h5 className="py-3">List of Client</h5>
        <table className="table p-3 table-hover">
          <thead>
            <tr>
              <th>#</th>
              <th>Client Code</th>
              <th>Manage</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((client, index) => (
              <tr key={client._id}>
                <td>{index + 1}</td>
                <td>{client.client_code}</td>
                <td>
                  <button
                    onClick={() =>
                      setManageData({
                        _id: client._id,
                        client_code: client.client_code,
                      })
                    }
                    data-bs-toggle="modal"
                    data-bs-target="#editModal"
                    type="button"
                    className="btn me-2 btn-sm btn-outline-primary"
                  >
                    Edit
                  </button>
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
        <div className="modal-dialog modal-dialog-centered">
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
                  required
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
                onClick={editClient}
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
  );
}
