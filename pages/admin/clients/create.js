import { useEffect, useState } from "react";
import { getSession, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { toast } from "sonner";
import Navbar from "../../../components/navbar";

export default function Clients_Create() {
  const [newClientData, setNewClientData] = useState({
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

  const [marketers, setMarketers] = useState([]);

  async function fetchApi(url, options) {
    const res = await fetch(url, options);
    const data = await res.json();
    return data;
  }

  const getMarketersList = async () => {
    try {
      const url = `${process.env.NEXT_PUBLIC_BASE_URL}/api/crm`;
      const options = {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          getallmarketers: true,
        },
      };

      const list = await fetchApi(url, options);

      if (!list.error) {
        let marketersName = [];
        list.forEach((marketer, index) => {
          marketersName.push({
            _id: marketer._id,
            marketer_name: marketer.real_name,
          });
        });

        setMarketers(marketersName);
      } else {
        toast.error("Unable to retrieve file list", { toastId: "error1" });
      }
    } catch (error) {
      console.error("Error fetching file list:", error);
      toast.error("Error retrieving file list", { toastId: "error3" });
    }
  };

  async function addNewClient(e) {
    e.preventDefault();

    const url = `${process.env.NEXT_PUBLIC_BASE_URL}/api/client`;
    const options = {
      method: "POST",
      body: JSON.stringify(newClientData),
      headers: {
        "Content-Type": "application/json",
      },
    };

    try {
      const result = await fetchApi(url, options);

      if (!result.error) {
        toast.success("Added new client");
        setNewClientData({
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
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error("Error adding new client:", error);
      toast.error("Error adding new client");
    }
  }

  useEffect(() => {
    getMarketersList();
  }, []);

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
                value={newClientData.client_code}
                onChange={(e) =>
                  setNewClientData((prevData) => ({
                    ...prevData,
                    client_code: e.target.value,
                  }))
                }
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
                value={newClientData.client_name}
                onChange={(e) =>
                  setNewClientData((prevData) => ({
                    ...prevData,
                    client_name: e.target.value,
                  }))
                }
                type="text"
                className="form-control"
                id="clientName"
              />
            </div>
            <div className="mb-3">
              <label htmlFor="floatingSelectGrid">Marketer name</label>
              <select
                required
                onChange={(e) =>
                  setNewClientData((prevData) => ({
                    ...prevData,
                    marketer: e.target.value,
                  }))
                }
                className="form-select"
                id="floatingSelectGrid"
              >
                <option
                  value={""}
                  defaultValue={true}
                  className="text-body-secondary"
                >
                  Select a marketer
                </option>
                {marketers?.map((marketer, index) => {
                  return (
                    <>
                      <option key={index} value={marketer?.marketer_name}>
                        {marketer?.marketer_name}
                      </option>
                    </>
                  );
                })}
              </select>
            </div>
            <div className="mb-3">
              <label htmlFor="clientName" className="form-label">
                Contact Person
              </label>
              <input
                value={newClientData.contact_person}
                onChange={(e) =>
                  setNewClientData((prevData) => ({
                    ...prevData,
                    contact_person: e.target.value,
                  }))
                }
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
                value={newClientData.designation}
                onChange={(e) =>
                  setNewClientData((prevData) => ({
                    ...prevData,
                    designation: e.target.value,
                  }))
                }
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
                value={newClientData.contact_number}
                onChange={(e) =>
                  setNewClientData((prevData) => ({
                    ...prevData,
                    contact_number: e.target.value,
                  }))
                }
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
                value={newClientData.email}
                onChange={(e) =>
                  setNewClientData((prevData) => ({
                    ...prevData,
                    email: e.target.value,
                  }))
                }
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
                value={newClientData.country}
                onChange={(e) =>
                  setNewClientData((prevData) => ({
                    ...prevData,
                    country: e.target.value,
                  }))
                }
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
                value={newClientData.address}
                onChange={(e) =>
                  setNewClientData((prevData) => ({
                    ...prevData,
                    address: e.target.value,
                  }))
                }
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
                value={newClientData.prices}
                onChange={(e) =>
                  setNewClientData((prevData) => ({
                    ...prevData,
                    prices: e.target.value,
                  }))
                }
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
                value={newClientData.currency}
                onChange={(e) =>
                  setNewClientData((prevData) => ({
                    ...prevData,
                    currency: e.target.value,
                  }))
                }
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
