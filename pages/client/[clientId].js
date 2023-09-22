import { useEffect, useState } from "react";
import { getSession, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { toast } from "react-hot-toast";
import Link from "next/link";
import Navbar from "../../components/navbar";

import generateInvoice from "../../components/generateInvoice"

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

  const [invoiceCustomerData, setInvoiceCustomerData] = useState({
    _id: "",
    client_name: "",
    contact_person: "",
    address: "",
    contact_number: "",
    email: "",
    price: "",
    invoice_number: "",
    currency: ""

  });
  const [invoiceVendorData, setInvoiceVendorData] = useState({
    comapny_name: "Studio Click House",
    contact_person: session?.user?.name,
    street_address: "Ma Holycity Tower, Level 2",
    city: "Demra, Dhaka-1361, Bangladesh",
    contact_number: "+46855924212, +8801819727117",
    email: "info@studioclickhouse.com",
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
  };

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
        setInvoiceCustomerData({

          _id: clientData?._id,
          client_name: clientData?.client_name,
          contact_person: clientData?.contact_person,
          contact_number: clientData?.contact_number,
          email: clientData?.email,
          price: clientData?.price,
          address: clientData?.country,
          invoice_number: clientData?.client_code.split("_")?.[1]+"00XX"
        });
      } else {
        toast.error("Unable to retrieve client");
      }
    } catch (error) {
      console.error("Error fetching client:", error);
      toast.error("Error retrieving client");
    }
  };

  async function getAllOrdersOfClientPaginated() {
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
  };

  async function getAllOrdersOfClientInvoice() {
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
        not_paginated: true // Include the current page in the request headers
      },
    };

    try {
      const orders = await fetchApi(url, options);

      if (!orders.error) {
        return orders?.items
      }

    } catch (error) {
      console.error("Error fetching filtered orders:", error);
    }
  };







  function extractTaskPrices(taskPriceString) {
    const taskPrices = {};

    // Split the task price string into lines
    const lines = taskPriceString.trim().split("\n");

    // Iterate through each line
    lines.forEach((line) => {
      const [task, priceStr] = line.split(" - ");
      const taskName = task.trim().toLowerCase();
      const price = parseFloat(priceStr);

      if (!isNaN(price)) {
        taskPrices[taskName] = price;
      } else {
        console.warn(`Invalid price for task: ${taskName}`);
      }
    });

    return taskPrices;
  }

  const calculateUnitPrice = (taskString, taskPrices) => {
    // Split the task string by '+' to get individual tasks
    const tasks = taskString.split("+").map((task) => task.trim().toLowerCase());

    // Debug: Log the tasks to see if they are parsed correctly
    console.log("Tasks:", tasks);

    // Calculate the total unit price based on task prices
    const unitPrice = tasks.reduce((totalPrice, task) => {
      const taskPrice = taskPrices[task];
      if (taskPrice !== undefined) {
        return totalPrice + taskPrice;
      } else {
        // Debug: Log tasks with no defined price
        console.warn(`No price defined for task: ${task}`);
        return totalPrice;
      }
    }, 0);

    return unitPrice;
  };

  async function createInvoice() {



    if (!invoiceCustomerData.invoice_number) {
      toast.error("Please enter an Invoie Number")
      return
    }

    // Extract taskPrices from invoiceCustomerData.price
    const taskPrices = extractTaskPrices(invoiceCustomerData.price);


    try {
      // Fetch orders and wait for them to be retrieved
      const orders = await getAllOrdersOfClientInvoice();

      // Check if orders is not undefined or empty before mapping
      if (orders && orders.length > 0) {
        const billData = orders.map((order, index) => {
          const unitPrice = order.task ? calculateUnitPrice(order.task, taskPrices) : 0;
          return {
            date: order.date_today,
            job_name: order.folder,
            quantity: order.quantity,
            unit_price: unitPrice,
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

        await generateInvoice(InvoiceData, billData);
        console.log("Bill Data: ", billData);
        etInvoiceCustomerData({ ...invoiceCustomerData, invoice_number: invoiceCustomerData.client_code.split("_")?.[1]+"00XX" })
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
    getClientDetails();
  }, []);

  useEffect(() => {

    if (client) {
      getAllOrdersOfClientPaginated();
      setPageCount(orders?.pagination?.pageCount);
    }
  }, [page, client, orders?.pagination?.pageCount]);

  return (
    <div>
      <Navbar navFor="admin" />

      <div className="m-5">

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
              <tr>
                <th>#</th>
                <th>Added Time</th>
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
                  value={invoiceCustomerData?.price}
                  onChange={(e) =>
                    setInvoiceCustomerData((prevData) => ({

                      ...prevData,
                      price: e.target.value,

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
          </div>}
        </div>
      </div>





    </div>
  );
}
