import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { toast } from "react-hot-toast";

export default function Tasks() {
  const router = useRouter();
  const [orders, setOrders] = useState(null);
  const [client_code, setClientCode] = useState("");
  const [client_name, setClientName] = useState("");
  const [folder, setFolder] = useState("");
  const [quantity, setQuantity] = useState(false);
  const [download_date, setDownloadDate] = useState("");
  const [delivery_date, setDeliveryDate] = useState("");
  const [delivery_bd_time, setDeliveryBdTime] = useState("");
  const [task, setTask] = useState("");
  const [et, setEt] = useState(false);
  const [production, setProduction] = useState("");
  const [qc1, setQc1] = useState(false);
  const [status, setStatus] = useState("");
  const [comment, setComment] = useState("");

  const [manageData, setManageData] = useState({
    _id: "",
    client_code: "",
    client_name: "",
    folder: "",
    quantity: false,
    download_date: "",
    delivery_date: "",
    delivery_bd_time: "",
    task: "",
    et: false,
    production: "",
    qc1: false,
    comment: "",
    status: "",
  });

  async function fetchOrderData(url, options) {
    const res = await fetch(url, options);
    const data = await res.json();
    return data;
  }

  async function GetAllOrders() {
    try {
      const url = `${process.env.NEXT_PUBLIC_BASE_URL}/api/order`;
      const options = {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          getallorders: true,
        },
      };

      const ordersList = await fetchOrderData(url, options);

      if (!ordersList.error) {
        setOrders(ordersList);
      } else {
        toast.error("Unable to retrieve orders list");
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Error retrieving orders");
    }
  }

  const AddNewOrder = async (e) => {
    e.preventDefault();

    const res = await fetch(process.env.NEXT_PUBLIC_BASE_URL + "/api/order", {
      method: "POST",
      body: JSON.stringify({
        client_code,
        client_name,
        folder,
        quantity,
        download_date,
        delivery_date,
        delivery_bd_time,
        task,
        et,
        production,
        qc1,
        comment,
        status,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    const result = await res.json();
    if (!result.error) {
      toast.success("Added new order");
      await GetAllOrders();
    }

    // console.log(result);

    if (result.error) {
      router.replace("/admin?error=" + result.message);
    }
    setClientCode("");
    setClientName("");
    setFolder("");
    setQuantity(false);
    setDownloadDate("");
    setDeliveryDate("");
    setDeliveryBdTime("");
    setTask("");
    setEt(false);
    setProduction("");
    setQc1(false);
    setComment("");
    setStatus("");
  };

  const FinishOrder = async (finishOrderData) => {
    const url = `${process.env.NEXT_PUBLIC_BASE_URL}/api/order`;
    const options = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        finishorder: true,
        id: finishOrderData._id,
      },
    };

    try {
      const resData = await fetchOrderData(url, options);

      if (!resData.error) {
        toast.success("Changed the status to FINISHED", {
          duration: 3500,
        });
        await GetAllOrders();
      } else {
        toast.error("Unable to change status");
      }
    } catch (error) {
      console.error("Error changing status:", error);
      toast.error("Error changing status");
    }
  };

  async function deleteOrder(deleteOrderData) {
    const url = `${process.env.NEXT_PUBLIC_BASE_URL}/api/order`;
    const options = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        deleteorder: true,
        id: deleteOrderData._id,
      },
    };

    try {
      const resData = await fetchOrderData(url, options);

      if (!resData.error) {
        toast.success("Deleted the order data", {
          duration: 3500,
        });
        await GetAllOrders();
      } else {
        toast.error("Unable to delete order");
      }
    } catch (error) {
      console.error("Error deleting order:", error);
      toast.error("Error deleting order");
    }
  }

  async function editOrder() {
    const url = `${process.env.NEXT_PUBLIC_BASE_URL}/api/order`;
    const options = {
      method: "POST",
      body: JSON.stringify(manageData),
      headers: {
        "Content-Type": "application/json",
        editorder: true,
      },
    };

    try {
      const result = await fetchOrderData(url, options);

      if (!result.error) {
        toast.success("Edited the order data", {
          duration: 3500,
        });
        await GetAllOrders();
      } else {
        router.replace(`/admin?error=${result.message}`);
      }
    } catch (error) {
      console.error("Error editing order:", error);
      toast.error("Error editing order");
    }
  }

  useEffect(() => {
    GetAllOrders();
  }, []);

  return (
    <>
      <div className="container my-5">
        <div className="add-order">
          <h5 className="py-3">Add New Tasks</h5>
          <form onSubmit={AddNewOrder} id="inputForm">
            <div className="mb-3">
              <label htmlFor="clientCode" className="form-label">
                Client Code
              </label>
              <input
                value={client_code}
                onChange={(e) => setClientCode(e.target.value)}
                type="text"
                className="form-control"
                id="clientCode"
                placeholder="Client Code"
              />
            </div>
            <div className="mb-3">
              <label htmlFor="clientName" className="form-label">
                Client Name
              </label>
              <input
                value={client_name}
                onChange={(e) => setClientName(e.target.value)}
                type="text"
                className="form-control"
                id="clientName"
                placeholder="Client Name"
              />
            </div>
            <div className="mb-3">
              <label htmlFor="folder" className="form-label">
                Folder
              </label>
              <input
                value={folder}
                onChange={(e) => setFolder(e.target.value)}
                type="text"
                className="form-control"
                id="folder"
                placeholder="Folder"
              />
            </div>
            <div className="mb-3">
              <label htmlFor="quantity" className="form-label">
                Quantity
              </label>
              <input
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                type="number"
                className="form-control"
                id="quantity"
                placeholder="Quantity"
              />
            </div>
            <div className="mb-3">
              <label htmlFor="downloadDate" className="form-label">
                Download Date
              </label>
              <input
                value={download_date}
                onChange={(e) => setDownloadDate(e.target.value)}
                type="date"
                className="form-control"
                id="downloadDate"
              />
            </div>
            <div className="mb-3">
              <label htmlFor="deliveryDate" className="form-label">
                Delivery Date
              </label>
              <input
                value={delivery_date}
                onChange={(e) => setDeliveryDate(e.target.value)}
                type="date"
                className="form-control"
                id="deliveryDate"
              />
            </div>
            <div className="mb-3">
              <label htmlFor="deliveryBDTime" className="form-label">
                Delivery BD Time
              </label>
              <input
                value={delivery_bd_time}
                onChange={(e) => setDeliveryBdTime(e.target.value)}
                type="time"
                className="form-control"
                id="deliveryBDTime"
              />
            </div>
            <div className="mb-3">
              <label htmlFor="task" className="form-label">
                Task
              </label>
              <input
                value={task}
                onChange={(e) => setTask(e.target.value)}
                type="text"
                className="form-control"
                id="task"
                placeholder="Task"
              />
            </div>
            <div className="mb-3">
              <label htmlFor="et" className="form-label">
                E.T.
              </label>
              <input
                value={et}
                onChange={(e) => setEt(e.target.value)}
                type="number"
                className="form-control"
                id="et"
                placeholder="E.T."
              />
            </div>
            <div className="mb-3">
              <label htmlFor="production" className="form-label">
                Production
              </label>
              <input
                value={production}
                onChange={(e) => setProduction(e.target.value)}
                type="string"
                className="form-control"
                id="production"
                placeholder="Production"
              />
            </div>
            <div className="mb-3">
              <label htmlFor="qc1" className="form-label">
                QC1
              </label>
              <input
                value={qc1}
                onChange={(e) => setQc1(e.target.value)}
                type="number"
                className="form-control"
                id="qc1"
                placeholder="QC1"
              />
            </div>
            <div className="mb-3">
              <label htmlFor="comments" className="form-label">
                Comment
              </label>
              <input
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="form-control"
                id="comments"
                rows="3"
                placeholder="Comments"
              />
            </div>
            <div className="mb-3">
              <label htmlFor="status" className="form-label">
                Status
              </label>
              <input
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                type="text"
                className="form-control"
                id="status"
                placeholder="Status"
              />
            </div>
            <button type="submit" className="btn btn-sm btn-outline-primary">
              Submit
            </button>
          </form>
        </div>
        <div className="order-list my-5">
          <h5 className="py-3">List of Tasks</h5>
          <table className="table p-3 table-hover">
            <thead>
              <tr>
                <th>#</th>
                <th>Added Time</th>
                <th>Client Code</th>
                <th>Client Name</th>
                <th>Folder</th>
                <th>Comment</th>
                <th>Status</th>
                <th>Manage</th>
              </tr>
            </thead>
            <tbody>
              {orders &&
                orders.map((order, index) => {
                  return (
                    <tr key={order._id}>
                      <td>{index + 1}</td>
                      <td className="text-break">
                        <span className="fw-medium">Date:</span>{" "}
                        {order.date_today}
                        <br />
                        <span className="fw-medium">Time:</span>{" "}
                        {order.time_now}
                      </td>
                      <td className="text-break">{order.client_code}</td>
                      <td className="text-break">{order.client_name}</td>
                      <td className="text-break">{order.folder}</td>
                      <td className="text-break">{order.comment}</td>
                      <td className="text-break">{order.status}</td>
                      <td>
                        <button
                          onClick={() =>
                            setManageData({
                              _id: order._id,
                              client_code: order.client_code,
                              client_name: order.client_name,
                              folder: order.folder,
                              quantity: order.quantity,
                              download_date: order.download_date,
                              delivery_date: order.delivery_date,
                              delivery_bd_time: order.delivery_bd_time,
                              task: order.task,
                              et: order.et,
                              production: order.production,
                              qc1: order.qc1,
                              comment: order.comment,
                              status: order.status,
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
                          onClick={() => deleteOrder(order)}
                          className="btn me-2 btn-sm btn-outline-danger"
                        >
                          Delete
                        </button>
                        <button
                          type="button"
                          onClick={() => FinishOrder(order)}
                          className="btn me-2 btn-sm btn-outline-success"
                        >
                          Finish
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
          <div className="modal-dialog modal-dialog-scrollable modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h1 className="modal-title fs-5" id="staticBackdropLabel">
                  Edit task
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
                  <label htmlFor="clientCode" className="form-label">
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
                    id="clientCode"
                    placeholder="Client Code"
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="clientName" className="form-label">
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
                    id="clientName"
                    placeholder="Client Name"
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="folder" className="form-label">
                    Folder
                  </label>
                  <input
                    value={manageData.folder}
                    onChange={(e) =>
                      setManageData((prevData) => ({
                        ...prevData,
                        folder: e.target.value,
                      }))
                    }
                    type="text"
                    className="form-control"
                    id="folder"
                    placeholder="Folder"
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="quantity" className="form-label">
                    Quantity
                  </label>
                  <input
                    value={manageData.quantity}
                    onChange={(e) =>
                      setManageData((prevData) => ({
                        ...prevData,
                        quantity: e.target.value,
                      }))
                    }
                    type="number"
                    className="form-control"
                    id="quantity"
                    placeholder="Quantity"
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="downloadDate" className="form-label">
                    Download Date
                  </label>
                  <input
                    value={manageData.download_date}
                    onChange={(e) =>
                      setManageData((prevData) => ({
                        ...prevData,
                        download_date: e.target.value,
                      }))
                    }
                    type="date"
                    className="form-control"
                    id="downloadDate"
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="deliveryDate" className="form-label">
                    Delivery Date
                  </label>
                  <input
                    value={manageData.delivery_date}
                    onChange={(e) =>
                      setManageData((prevData) => ({
                        ...prevData,
                        delivery_date: e.target.value,
                      }))
                    }
                    type="date"
                    className="form-control"
                    id="deliveryDate"
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="deliveryBDTime" className="form-label">
                    Delivery BD Time
                  </label>
                  <input
                    value={manageData.delivery_bd_time}
                    onChange={(e) =>
                      setManageData((prevData) => ({
                        ...prevData,
                        delivery_bd_time: e.target.value,
                      }))
                    }
                    type="time"
                    className="form-control"
                    id="deliveryBDTime"
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="task" className="form-label">
                    Task
                  </label>
                  <input
                    value={manageData.task}
                    onChange={(e) =>
                      setManageData((prevData) => ({
                        ...prevData,
                        task: e.target.value,
                      }))
                    }
                    type="text"
                    className="form-control"
                    id="task"
                    placeholder="Task"
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="et" className="form-label">
                    E.T.
                  </label>
                  <input
                    value={manageData.et}
                    onChange={(e) =>
                      setManageData((prevData) => ({
                        ...prevData,
                        et: e.target.value,
                      }))
                    }
                    type="number"
                    className="form-control"
                    id="et"
                    placeholder="E.T."
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="production" className="form-label">
                    Production
                  </label>
                  <input
                    value={manageData.production}
                    onChange={(e) =>
                      setManageData((prevData) => ({
                        ...prevData,
                        production: e.target.value,
                      }))
                    }
                    type="string"
                    className="form-control"
                    id="production"
                    placeholder="Production"
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="qc1" className="form-label">
                    QC1
                  </label>
                  <input
                    value={manageData.qc1}
                    onChange={(e) =>
                      setManageData((prevData) => ({
                        ...prevData,
                        qc1: e.target.value,
                      }))
                    }
                    type="number"
                    className="form-control"
                    id="qc1"
                    placeholder="QC1"
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="comments" className="form-label">
                    Comment
                  </label>
                  <input
                    value={manageData.comment}
                    onChange={(e) =>
                      setManageData((prevData) => ({
                        ...prevData,
                        comment: e.target.value,
                      }))
                    }
                    className="form-control"
                    id="comment"
                    rows="3"
                    placeholder="Comment"
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="status" className="form-label">
                    Status
                  </label>
                  <input
                    value={manageData.status}
                    onChange={(e) =>
                      setManageData((prevData) => ({
                        ...prevData,
                        status: e.target.value,
                      }))
                    }
                    type="text"
                    className="form-control"
                    id="status"
                    placeholder="Status"
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
                  onClick={editOrder}
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
    </>
  );
}
