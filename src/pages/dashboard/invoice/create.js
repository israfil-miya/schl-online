import { useEffect, useState } from "react";
import { toast } from "sonner";
import generateInvoice from "@/lib/invoice";
import Navbar from "@/components/navbar";
import { useSession, getSession } from "next-auth/react";

export default function ClientDetails() {
  const [client, setClient] = useState(null);
  const [orders, setOrders] = useState([]);
  const [page, setPage] = useState(1);
  const [pageCount, setPageCount] = useState(0);
  const [clients, setClients] = useState([]);
  const [selectedClientCode, setSelectedClientCode] = useState();
  const { data: session } = useSession();

  const [invoiceCustomerData, setInvoiceCustomerData] = useState({
    _id: "",
    client_name: "",
    client_code: "",
    contact_person: "",
    address: "",
    contact_number: "",
    email: "",
    prices: "",
    invoice_number: "",
    currency: "",
  });
  const [invoiceVendorData, setInvoiceVendorData] = useState({
    comapny_name: "Studio Click House Ltd.",
    contact_person: "Raiyan Abrar",
    street_address: "Tengra Road, Ma Holycity Tower, Level 2",
    city: "Demra, Dhaka-1361, Bangladesh",
    contact_number: "+46855924212, +8801819727117",
    email: "info@studioclickhouse.com",
  });

  const [fromTime, setFromTime] = useState("");
  const [toTime, setToTime] = useState("");
  const [foldetFilter, setFolderFilter] = useState("");
  const [taskFilter, setTaskFilter] = useState("");

  Number.prototype.pad = function (size) {
    var s = String(this);
    while (s.length < (size || 2)) {
      s = "0" + s;
    }
    return s;
  };

  async function fetchApi(url, options) {
    const res = await fetch(url, options);
    const data = await res.json();
    return data;
  }

  const convertToDDMMYYYY = (dateString) => {
    if (!dateString) return "";
    const [year, month, day] = dateString.split("-");
    if (year.length !== 4) return dateString;
    return `${day}-${month}-${year}`;
  };

  async function getClientDetails() {
    try {
      const url = `${process.env.NEXT_PUBLIC_BASE_URL}/api/client`;

      console.log(selectedClientCode);
      const options = {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          getclientsbycode: true,
          client_code: selectedClientCode,
        },
      };

      const clientData = await fetchApi(url, options);

      console.log(" CLIENTDATA: ", clientData);

      if (!clientData.error) {
        setClient(clientData);

        console.log(clientData.currency ?? "No currency");
        setInvoiceCustomerData({
          _id: clientData._id,
          client_name: clientData.client_name ?? "",
          client_code: clientData.client_code ?? "",
          contact_person: clientData.contact_person ?? "",
          contact_number: clientData.contact_number ?? "",
          email: clientData.email ?? "",
          prices: clientData.prices ?? "",
          address: clientData.address
            ? clientData.address.trim().endsWith(",")
              ? `${clientData.address} ${clientData.country}`
              : `${clientData.address}, ${clientData.country}`
            : clientData.country ?? "",
          currency: clientData.currency ?? "",
          invoice_number: !clientData.last_invoice_number
            ? clientData.client_code?.split("_")?.[1] + "00XX"
            : clientData.client_code?.split("_")?.[1] +
              `${(
                parseInt(clientData.last_invoice_number?.match(/\d+/g)[0]) + 1
              ).pad(4)}`,
        });

        await getAllOrdersOfClientPaginated();
      } else {
        toast.error("Unable to retrieve client");
      }
    } catch (error) {
      console.error("Error fetching client:", error);
      toast.error("Error retrieving client");
    }
  }

  async function getAllOrdersOfClientInvoice() {
    const url = `${process.env.NEXT_PUBLIC_BASE_URL}/api/order`;
    const options = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        forinvoice: true,
        getordersbyfilter: true,
        folder: foldetFilter,
        client_code: client.client_code,
        task: taskFilter,

        fromtime: fromTime,
        totime: toTime,

        not_paginated: true, // Include the current page in the request headers
      },
    };

    try {
      const orders = await fetchApi(url, options);

      if (!orders.error) {
        return orders?.items;
      }
    } catch (error) {
      console.error("Error fetching filtered orders:", error);
    }
  }

  async function getAllOrdersOfClientPaginated() {
    const url = `${process.env.NEXT_PUBLIC_BASE_URL}/api/order`;
    const options = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        forinvoice: true,
        ordersnumber: 5,
        getordersbyfilter: true,
        folder: foldetFilter,
        client_code: selectedClientCode,
        task: taskFilter,
        fromtime: fromTime,
        totime: toTime,
        page, // Include the current page in the request headers
      },
    };

    try {
      const orders = await fetchApi(url, options);

      console.log(orders);

      if (!orders.error) {
        setOrders(orders);
      }
    } catch (error) {
      console.error("Error fetching filtered orders:", error);
    }
  }

  async function getAllClients() {
    try {
      const url = `${process.env.NEXT_PUBLIC_BASE_URL}/api/client`;
      const options = {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          getallclients: true,
          notpaginated: true,
        },
      };

      const clientsList = await fetchApi(url, options);

      if (!clientsList.error) {
        let clientsCodeAndId = [];
        clientsList.items.forEach((client, index) => {
          clientsCodeAndId.push({
            _id: client._id,
            client_code: client.client_code,
          });
        });

        console.log(clientsCodeAndId);

        setClients(clientsCodeAndId);
      } else {
        toast.error("Unable to retrieve clients list");
      }
    } catch (error) {
      console.error("Error fetching clients:", error);
      toast.error("Error retrieving clients");
    }
  }

  function getFormattedDate() {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, "0");
    const month = String(today.getMonth() + 1).padStart(2, "0"); // Month is zero-based, so we add 1
    const year = today.getFullYear();

    return `${year}-${month}-${day}`;
  }

  function isoDateToDdMmYyyy(isoDate) {
    const date = new Date(isoDate);
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0"); // Months are 0-based
    const year = date.getFullYear().toString();

    return `${day}-${month}-${year}`;
  }

  async function createInvoice() {
    if (!invoiceCustomerData.invoice_number) {
      toast.error("Please enter an Invoie Number");
      return;
    }

    if (!invoiceCustomerData.currency) {
      toast.error("Please enter a currency symbol/code");
      return;
    }

    try {
      // Fetch orders and wait for them to be retrieved
      const orders = await getAllOrdersOfClientInvoice();

      // Check if orders is not undefined or empty before mapping
      if (orders && orders.length > 0) {
        const billData = orders.map((order, index) => {
          return {
            date: isoDateToDdMmYyyy(order.createdAt),
            job_name: order.folder,
            quantity: order.quantity,
            unit_price: 0,
            total: function () {
              return this.quantity * this.unit_price;
            },
          };
        });

        // Generate the invoice using billData
        const InvoiceData = {
          customer: invoiceCustomerData,
          vendor: invoiceVendorData,
        };

        // insert client invoice details on mongodb
        const url = `${process.env.NEXT_PUBLIC_BASE_URL}/api/invoice`;
        const options = {
          method: "POST",
          body: JSON.stringify({
            client_id: InvoiceData.customer._id,
            client_code: InvoiceData.customer.client_code,
            created_by: session.user.real_name,
            time_period: {
              fromDate: fromTime,
              toDate: toTime || getFormattedDate(),
            },
            total_orders: orders.length,
            invoice_number: InvoiceData.customer.invoice_number,
          }),
          headers: {
            "Content-Type": "application/json",
            storeinvoicedetails: true,
          },
        };

        try {
          const result = await fetchApi(url, options);

          if (!result.error) {
            let res = generateInvoice(InvoiceData, billData);
            res.then((file) => {
              const formData = new FormData();
              formData.append("file", file);
              let url = `${process.env.NEXT_PUBLIC_BASE_URL}/api/ftp`;
              let options = {
                method: "POST",
                body: formData,
                headers: {
                  insertfile: true,
                },
              };

              toast.promise(fetchApi(url, options), {
                loading: "Uploading the invoice to ftp...",
                success: <span>Successfully uploaded the invoice</span>,
                error: <span>Unable to upload the invoice</span>,
              });
            });

            toast.promise(res, {
              loading: "Creating invoice...",
              success: <span>Successfully created the invoice</span>,
              error: <span>Unable to create the invoice</span>,
            });
          } else {
            toast.error(result.message);
          }
        } catch (error) {
          console.error("Error adding new client:", error);
          toast.error("Error adding new client");
        }

        console.log("Bill Data: ", billData);
        setInvoiceCustomerData((prevData) => ({
          ...prevData,
          invoice_number: prevData?.client_code?.split("_")?.[1] + "00XX",
          invoice_number: !prevData?.invoice_number.match(/\d+/g)[0]
            ? prevData?.client_code?.split("_")?.[1] + "0001"
            : prevData?.client_code?.split("_")?.[1] +
              `${(parseInt(prevData?.invoice_number.match(/\d+/g)[0]) + 1).pad(
                4,
              )}`,
        }));
      } else {
        console.warn("No orders found.");
      }
    } catch (error) {
      console.error("Error generating Invoice:", error);
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
    if (clients?.length) getClientDetails();
  }, [selectedClientCode]);

  useEffect(() => {
    if (clients?.length) setSelectedClientCode(clients?.[0].client_code);
  }, [clients]);

  useEffect(() => {
    getAllClients();
  }, []);

  useEffect(() => {
    if (client) {
      getAllOrdersOfClientPaginated();
      setPageCount(orders?.pagination?.pageCount);
    }
  }, [page, client, orders?.pagination?.pageCount]);

  return (
    <>
      <Navbar navFor="dashboard" />
      <div>
        <div className="m-5">
          <div className="row align-items-start">
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <div className=" mx-2 form-floating">
                <select
                  required
                  onChange={(e) => setSelectedClientCode(e.target.value)}
                  className="form-select"
                  id="floatingSelectGrid"
                >
                  {clients?.map((client, index) => {
                    return (
                      <>
                        <option key={index} defaultValue={index == 0}>
                          {client?.client_code}
                        </option>
                      </>
                    );
                  })}
                </select>
                <label htmlFor="floatingSelectGrid">Select a client</label>
              </div>
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
                  onClick={getAllOrdersOfClientPaginated}
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
                <tr className="table-dark">
                  <th>#</th>
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
                {orders?.items?.length ? (
                  orders?.items?.map((order, index) => (
                    <tr key={index}>
                      <td>{index + 1}</td>
                      <td className="text-break">{order.folder}</td>
                      <td className="text-break">{order.quantity}</td>
                      <td className="text-break">
                        {order.download_date &&
                          convertToDDMMYYYY(order.download_date)}
                      </td>
                      <td className="text-break">
                        {order.delivery_date &&
                          convertToDDMMYYYY(order.delivery_date)}
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
                  ))
                ) : (
                  <tr key={0}>
                    <td colSpan="12" className=" align-center text-center">
                      No Orders To Show.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            {orders?.items?.length !== 0 && (
              <div className="col border rounded-0 p-3">
                <h4 className="py-2 text-center">Create Invoice</h4>

                <h5>Customer details</h5>
                <div className="row mb-4">
                  <div className="col-md-6 mb-3">
                    <label htmlFor="date" className="form-label">
                      Company Name
                    </label>
                    <input
                      value={invoiceCustomerData?.client_name}
                      onChange={(e) =>
                        setInvoiceCustomerData((prevData) => ({
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
                      Contact Person
                    </label>
                    <input
                      value={invoiceCustomerData?.contact_person}
                      onChange={(e) =>
                        setInvoiceCustomerData((prevData) => ({
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
                      Contact Number
                    </label>
                    <input
                      value={invoiceCustomerData?.contact_number}
                      onChange={(e) =>
                        setInvoiceCustomerData((prevData) => ({
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
                      Address
                    </label>
                    <input
                      value={invoiceCustomerData?.address}
                      onChange={(e) =>
                        setInvoiceCustomerData((prevData) => ({
                          ...prevData,
                          address: e.target.value,
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
                      value={invoiceCustomerData?.email}
                      onChange={(e) =>
                        setInvoiceCustomerData((prevData) => ({
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
                      Invoice Number
                    </label>
                    <input
                      required
                      value={invoiceCustomerData?.invoice_number}
                      onChange={(e) =>
                        setInvoiceCustomerData((prevData) => ({
                          ...prevData,
                          invoice_number: e.target.value,
                        }))
                      }
                      type="text"
                      className="form-control"
                    />
                  </div>

                  <div className="col-md-6 mb-3">
                    <label htmlFor="date" className="form-label">
                      Prices
                    </label>
                    <textarea
                      value={invoiceCustomerData?.prices}
                      onChange={(e) =>
                        setInvoiceCustomerData((prevData) => ({
                          ...prevData,
                          prices: e.target.value,
                        }))
                      }
                      type="text"
                      className="form-control"
                    />
                  </div>

                  <div className="col-md-6 mb-3">
                    <label htmlFor="date" className="form-label">
                      Currency
                    </label>
                    <input
                      required
                      value={invoiceCustomerData?.currency}
                      onChange={(e) =>
                        setInvoiceCustomerData((prevData) => ({
                          ...prevData,
                          currency: e.target.value,
                        }))
                      }
                      type="text"
                      className="form-control"
                    />
                  </div>
                </div>

                <h5 className="mt-4">Vendor details</h5>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label htmlFor="date" className="form-label">
                      Company Name
                    </label>
                    <input
                      value={invoiceVendorData?.comapny_name}
                      onChange={(e) =>
                        setInvoiceVendorData((prevData) => ({
                          ...prevData,
                          comapny_name: e.target.value,
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
                      value={invoiceVendorData?.contact_person}
                      onChange={(e) =>
                        setInvoiceVendorData((prevData) => ({
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
                      Contact Number
                    </label>
                    <input
                      value={invoiceVendorData?.contact_number}
                      onChange={(e) =>
                        setInvoiceVendorData((prevData) => ({
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
                      Street Address
                    </label>
                    <input
                      value={invoiceVendorData?.street_address}
                      onChange={(e) =>
                        setInvoiceVendorData((prevData) => ({
                          ...prevData,
                          street_address: e.target.value,
                        }))
                      }
                      type="text"
                      className="form-control"
                    />
                  </div>

                  <div className="col-md-6 mb-3">
                    <label htmlFor="date" className="form-label">
                      City
                    </label>
                    <input
                      value={invoiceVendorData?.city}
                      onChange={(e) =>
                        setInvoiceVendorData((prevData) => ({
                          ...prevData,
                          city: e.target.value,
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
                      value={invoiceVendorData?.email}
                      onChange={(e) =>
                        setInvoiceVendorData((prevData) => ({
                          ...prevData,
                          email: e.target.value,
                        }))
                      }
                      type="text"
                      className="form-control"
                    />
                  </div>
                </div>

                <button
                  onClick={createInvoice}
                  type="button"
                  className="btn float-end btn-outline-success"
                >
                  Create an Invoice
                </button>
              </div>
            )}
          </div>
        </div>

        <style jsx>
          {`
            #floatingSelectGrid {
              max-height: 150px;
              overflow-y: auto;
            }

            .table {
              font-size: 15px;
            }

            th,
            td {
              padding: 5px 2.5px;
            }
          `}
        </style>
      </div>
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
  if (!session || session.user.role != "super") {
    return {
      redirect: {
        destination: "/?error=You need Super role to access the page",
        permanent: true,
      },
    };
  } else
    return {
      props: {},
    };
}
