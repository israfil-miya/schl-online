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

  const [invoiceData, setInvoiceData] = useState({
    customer: {
      _id: "",
      client_name: "",
      contact_person: "",
      contact_number: "",
      email: "",
      price: "",
      address: "",
    },
    vendor: {
      comapny_name: "Studio Click House",
      contact_person: session?.user?.name,
      contact_number: "+46855924212, +8801819727117",
      email: "info@studioclickhouse.com",
      street_address: "Ma Holycity Tower, Level 2",
      city: "Demra, Dhaka-1361, Bangladesh",
    },
    time: {
      fromTime: "",
      toTime: "",
    },
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
        setInvoiceData({
          customer: {
            _id: clientData?._id,
            client_name: clientData?.client_name,
            contact_person: clientData?.contact_person,
            contact_number: clientData?.contact_number,
            email: clientData?.email,
            price: clientData?.price,
            address: clientData?.country,
          },
        });
      } else {
        toast.error("Unable to retrieve client");
      }
    } catch (error) {
      console.error("Error fetching client:", error);
      toast.error("Error retrieving client");
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
        await getClientDetails();
      } else {
        router.replace(`/admin?error=${result.message}`);
      }
    } catch (error) {
      console.error("Error editing client:", error);
      toast.error("Error editing client");
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
          <div className="col border rounded-0 p-3">
            <h5 className="py-2">Client Details</h5>

            <div className="row">
              <div className="col-md-6 mb-3">
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
              <div className="col-md-6 mb-3">
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
              <div className="col-md-6 mb-3">
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
              <div className="col-md-6 mb-3">
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
              <div className="col-md-6 mb-3">
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
              <div className="col-md-6 mb-3">
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
              <div className="col-md-6 mb-3">
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
              <div className="col-md-6 mb-3">
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

            <button
              onClick={editClient}
              type="button"
              className="btn float-end btn-outline-primary"
            >
              Update client details
            </button>
          </div>
        </div>
        <div className="row align-items-start">
          <div className="col border rounded-0 p-3">
            <h5 className="py-2">Create Invoice</h5>
            <div className="row">
              <div className="col-md-6 mb-3">
                <label htmlFor="date" className="form-label">
                  Company Name (Customer)
                </label>
                <input
                  value={invoiceData?.customer?.client_name}
                  onChange={(e) =>
                    setInvoiceData((prevData) => ({
                      customer: {
                        ...prevData,
                        client_name: e.target.value,
                      },
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
                  value={invoiceData?.customer?.contact_person}
                  onChange={(e) =>
                    setInvoiceData((prevData) => ({
                      customer: {
                        ...prevData,
                        contact_person: e.target.value,
                      },
                    }))
                  }
                  type="text"
                  className="form-control"
                />
              </div>
              <div className="col-md-6 mb-3">
                <label htmlFor="date" className="form-label">
                  Contact Number (Customer)
                </label>
                <input
                  value={invoiceData?.customer?.contact_number}
                  onChange={(e) =>
                    setInvoiceData((prevData) => ({
                      customer: {
                        ...prevData,
                        contact_number: e.target.value,
                      },
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
                  value={invoiceData?.customer?.address}
                  onChange={(e) =>
                    setInvoiceData((prevData) => ({
                      customer: {
                        ...prevData,
                        address: e.target.value,
                      },
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
                  value={invoiceData?.customer?.email}
                  onChange={(e) =>
                    setInvoiceData((prevData) => ({
                      customer: {
                        ...prevData,
                        email: e.target.value,
                      },
                    }))
                  }
                  type="text"
                  className="form-control"
                />
              </div>
              <div className=" col-md-6 mb-3">
                <label htmlFor="date" className="form-label">
                  Time Period
                </label>
                <div
                  className="filter_time"
                  style={{ display: "flex", alignItems: "center" }}
                >
                  <input
                    type="date"
                    className="form-control me-2 custom-input"
                    value={invoiceData?.time?.fromTime}
                    onChange={(e) =>
                      setInvoiceData({ time: { fromTime: e.target.value } })
                    }
                  />
                  <span> To </span>
                  <input
                    type="date"
                    className="form-control ms-2 custom-input"
                    value={invoiceData?.time?.toTime}
                    onChange={(e) =>
                      setInvoiceData({ time: { toTime: e.target.value } })
                    }
                  />
                </div>
              </div>

              <div className="mb-3">
                <label htmlFor="date" className="form-label">
                  Prices
                </label>
                <textarea
                  value={invoiceData?.customer?.price}
                  onChange={(e) =>
                    setInvoiceData((prevData) => ({
                      customer: {
                        ...prevData,
                        price: e.target.value,
                      },
                    }))
                  }
                  type="text"
                  className="form-control"
                />
              </div>
            </div>
            <button
              onClick={null}
              type="button"
              className="btn float-end btn-outline-success"
            >
              Create an Invoice
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
