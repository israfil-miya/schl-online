import { useEffect, useState } from "react";
import { getSession, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { toast } from "react-hot-toast";
import Link from "next/link";
import Navbar from "../../components/navbar";

export default function ClientDetails() {
  const router = useRouter();
  const { data: session } = useSession();
  const [client, setClient] = useState({});
  const clientId = router.query.clientId;

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
    price: "",
  });

  async function fetchClientData(url, options) {
    const res = await fetch(url, options);
    const data = await res.json();
    return data;
  }

  async function getClientDetails() {
    try {
      const url = `${process.env.NEXT_PUBLIC_BASE_URL}/api/client`;
      const options = {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          getclientsbyid: true,
          id: clientId,
        },
      };

      const clientData = await fetchClientData(url, options);

      if (!clientData.error) {
        setClient(clientData);
        setManageData(clientData);
      } else {
        toast.error("Unable to retrieve client");
      }
    } catch (error) {
      console.error("Error fetching client:", error);
      toast.error("Error retrieving client");
    }
  }

  useEffect(() => {
    getClientDetails();
  }, []);

  return (
    <div>
      <Navbar navFor="admin" />

      <div className="container rounded border shadow-sm my-5">
        <div className="row align-items-start">
          <div className="col-4 border-end rounded-0 p-3">
            <h5 className="py-2">Client Details</h5>
            <div>
              <div>
                <span className="fw-medium">Client Code: </span>
                <span>{client.client_code}</span>
              </div>
              <div>
                <span className="fw-medium">Client Name: </span>
                <span>{client.client_name}</span>
              </div>
              <div>
                <span className="fw-medium">Marketer Name: </span>
                <span>{client.marketer}</span>
              </div>
              <div>
                <span className="fw-medium">Contact Person: </span>
                <span>{client.contact_person}</span>
              </div>
              <div>
                <span className="fw-medium">Designation: </span>
                <span>{client.designation}</span>
              </div>
              <div>
                <span className="fw-medium">Contact Number: </span>
                <span>{client.contact_number}</span>
              </div>
              <div>
                <span className="fw-medium">Email: </span>
                <span>{client.email}</span>
              </div>
              <div>
                <span className="fw-medium">Country: </span>
                <span>{client.country}</span>
              </div>
              <div>
                <span className="fw-medium">Price: </span>
                <span>{client.price}</span>
              </div>
            </div>
          </div>
          <div className="col-6 border-start rounded-0 p-3">
            <h5 className="py-2">Create Invoice</h5>
            <div className="row">

              <div className="col-md-6 mb-3">
                <label htmlFor="date" className="form-label">
                  Company Name (Customer)
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
              <div className="col-md-6 mb-3">
                <label htmlFor="date" className="form-label">
                  Address (Customer)
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
              <div className="col-md-6 mb-3">
                <label htmlFor="date" className="form-label">
                  Contact Person (Customer)
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
              <div className="col-md-6 mb-3">
                <label htmlFor="date" className="form-label">
                  Phone (Customer)
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
              <div className="col-md-6 mb-3">
                <label htmlFor="date" className="form-label">
                  Email (Customer)
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
              <div className="col-md-6 mb-3">
                <label htmlFor="date" className="form-label">
                  Country (Customer)
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
              <div className="mb-3">
                <label htmlFor="date" className="form-label">
                  Prices
                </label>
                <textarea
                  value={manageData.price}
                  onChange={(e) =>
                    setManageData((prevData) => ({
                      ...prevData,
                      price: e.target.value,
                    }))
                  }
                  type="text"
                  className="form-control"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
