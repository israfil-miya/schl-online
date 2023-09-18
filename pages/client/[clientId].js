import { useEffect, useState } from "react";
import { getSession, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { toast } from "react-hot-toast";
import Link from "next/link";
import Navbar from "../../components/navbar";

export default function ClientDetails() {
  const router = useRouter();
  const { data: session } = useSession();
  const [client, setClient] = useState(null);
  const clientId = router.query.clientId;
  const [orders, setOrders] = useState([])
  const [page, setPage] = useState(1);
  const [pageCount, setPageCount] = useState(0);

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


  const [fromTime, setFromTime] = useState("");
  const [toTime, setToTime] = useState("");
  const [foldetFilter, setFolderFilter] = useState("");
  const [taskFilter, setTaskFilter] = useState("");



  const convertToDDMMYYYY = (dateString) => {
    const [year, month, day] = dateString.split("-");
    if (year.length != 4) return dateString;
    return `${day}-${month}-${year}`;
  };
  async function fetchApi(url, options) {
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

      const clientData = await fetchApi(url, options);

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

  async function getAllOrdersOfClient() {
    let adjustedFromTime = fromTime;
    let adjustedToTime = toTime;

    if (fromTime) {
      adjustedFromTime = convertToDDMMYYYY(fromTime);
    }
    if (toTime) {
      adjustedToTime = convertToDDMMYYYY(toTime);
    }

    const url = `${process.env.NEXT_PUBLIC_BASE_URL}/api/order`;
    const options = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        getordersbyfilter: true,
        folder: foldetFilter,
        client: client.client_code,
        task: taskFilter,
        fromtime: adjustedFromTime,
        totime: adjustedToTime,
        page, // Include the current page in the request headers
      },
    };

    try {
      const orders = await fetchApi(url, options);

      if (!orders.error) {
        setOrders(orders);
      }

    } catch (error) {
      console.error("Error fetching filtered orders:", error);
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
      const result = await fetchApi(url, options);

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
    getClientDetails();
  }, []);

  useEffect(() => {

    if (client) {
      getAllOrdersOfClient();
      setPageCount(orders?.pagination?.pageCount);
    }
  }, [page, client, orders?.pagination?.pageCount]);

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
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <div className="my-5 p-3 bg-light rounded border d-flex justify-content-center">
              <div
                className="filter_time me-3"
                style={{ display: "flex", alignItems: "center" }}
              >
                <strong>Date: </strong>
                <input
                  type="date"
                  className="form-control mx-2 custom-input"
                  value={fromTime}
                  onChange={(e) => setFromTime(e.target.value)}
                />
                <span> To </span>
                <input
                  type="date"
                  className="form-control ms-2 custom-input"
                  value={toTime}
                  onChange={(e) => setToTime(e.target.value)}
                />
              </div>

              <div
                style={{ display: "flex", alignItems: "center" }}
                className="filter_folder me-3"
              >
                <strong>Folder: </strong>
                <input
                  type="text"
                  placeholder="Folder"
                  className="form-control ms-2 custom-input"
                  value={foldetFilter}
                  onChange={(e) => setFolderFilter(e.target.value)}
                />
              </div>

              <div
                style={{ display: "flex", alignItems: "center" }}
                className="filter_task me-3"
              >
                <strong>Task: </strong>
                <input
                  type="text"
                  placeholder="Task"
                  className="form-control ms-2 custom-input"
                  value={taskFilter}
                  onChange={(e) => setTaskFilter(e.target.value)}
                />
              </div>

              <button
                onClick={getAllOrdersOfClient}
                className="btn ms-4 btn-sm btn-outline-primary"
              >
                Search
              </button>
            </div>
          </div>
          {orders?.items?.length !== 0 && (
            <div className="container mb-3">
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

            </div>
          )}
          <table
            style={{ overflow: "hidden" }}
            className="table table-bordered mb-5 table-hover"
          >
            <thead>
              <tr>
                <th>#</th>
                <th>Added Time</th>
                <th>Client Code</th>
                <th>Client Name</th>
                <th>Folder</th>
                <th>Quantity</th>
                <th>Download Date</th>
                <th>Delivery Time</th>
                <th>Task</th>
                <th>E.T.</th>
                <th>Production</th>
                <th>QC1</th>
                <th>Comment</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {orders?.items &&
                orders?.items.map((order, index) => (
                  <tr key={order._id}>
                    <td>{index + 1}</td>
                    <td className="text-break">
                      {order.date_today}
                      <span className="text-body-secondary"> | </span>
                      {order.time_now}
                    </td>
                    <td className="text-break">{order.client_code}</td>

                    <td className="text-break">{order.client_name}</td>


                    <td className="text-break">{order.folder}</td>
                    <td className="text-break">{order.quantity}</td>
                    <td className="text-break">{order.download_date}</td>
                    <td className="text-break">
                      {order.delivery_date}
                      <span className="text-body-secondary"> | </span>
                      {order.delivery_bd_time}
                    </td>
                    <td className="text-break">{order.task}</td>
                    <td className="text-break">{order.et}</td>
                    <td className="text-break">{order.production}</td>
                    <td className="text-break">{order.qc1}</td>
                    <td className="text-break">{order.comment}</td>
                    <td className="text-break">{order.status}</td>
                  </tr>
                ))}
            </tbody>
          </table>
          {orders?.items?.length !== 0 && <div className="col border rounded-0 p-3">
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
          </div>}
        </div>
      </div>
    </div>
  );
}
