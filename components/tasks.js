import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { toast } from "react-hot-toast";

export default function Tasks() {
  const router = useRouter();
  const [client_code, setClientCode] = useState("");
  const [client_name, setClientName] = useState("");
  const [folder, setFolder] = useState("");
  const [quantity, setQuantity] = useState(false);
  const [download_date, setDownloadDate] = useState("");
  const [delivery_date, setDeliveryDate] = useState("");
  const [delivery_bd_time, setDeliveryBdTime] = useState("");
  const [et, setEt] = useState(false);
  const [production, setProduction] = useState("");
  const [qc1, setQc1] = useState(false);
  const [status, setStatus] = useState("Running");
  const [comment, setComment] = useState("");

  const [optionsCode, setOptionsCode] = useState([]);
  const [optionsName, setOptionsName] = useState([]);

  const optionsTask = ["Retouch", "Multipath", "Cutout", "Video"];
  const optionsStatus = ["Uploaded", "Client hold", "Paused", "Running", "Test"];
  const [selectedTasks, setSelectedTasks] = useState([]);

  const handleTaskCheckboxChange = (task) => {
    if (selectedTasks.includes(task)) {
      setSelectedTasks(selectedTasks.filter((t) => t !== task));
    } else {
      setSelectedTasks([...selectedTasks, task]);
    }
  };


  const handleStatusRadioChange = (radio_status) => {
    if (status == radio_status) {
      console.log(radio_status)
      return
    } else {
      setStatus(radio_status);
    }
  };


  const handleClientNameFocus = async () => {
    if (!client_code) return
    try {
      const url = `${process.env.NEXT_PUBLIC_BASE_URL}/api/client`;
      const options = {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          getclientnamebycode: true,
          client_code
        },
      };

      const clientData = await fetchApi(url, options);

      if (!clientData.error) {
        console.log(clientData)
        if (!clientData.client_name) return
        else setClientName(clientData.client_name)
      }
      if(!clientData || clientData.error) return
    } catch (error) {
      console.error("Error fetching client:", error);
    }

  }

  async function fetchApi(url, options) {
    const res = await fetch(url, options);
    const data = await res.json();
    return data;
  }

  async function GetAllClients() {
    try {
      const url = `${process.env.NEXT_PUBLIC_BASE_URL}/api/client`;
      const options = {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          getallclients: true,
        },
      };

      const clientsList = await fetchApi(url, options);

      if (!clientsList.error) {
        const clientCodes = clientsList
          .filter((client) => client.client_code != "")
          .map((client) => client.client_code);
        const clientNames = clientsList
          .filter((client) => client.client_name != "")
          .map((client) => client.client_name);

        setOptionsCode(clientCodes);
        setOptionsName(clientNames);
      } else {
        console.log(clientsList.message);
        toast.error("Unable to retrieve clients list");
      }
    } catch (error) {
      console.error("Error fetching clients:", error);
      toast.error("Error retrieving clients");
    }
  }

  const convertToDDMMYYYY = (dateString) => {
    const [year, month, day] = dateString.split("-");
    return `${day}-${month}-${year}`;
  };

  const AddNewOrder = async (e) => {
    e.preventDefault();

    console.log(selectedTasks);

    const res = await fetch(process.env.NEXT_PUBLIC_BASE_URL + "/api/order", {
      method: "POST",
      body: JSON.stringify({
        client_code,
        client_name,
        folder,
        quantity,
        download_date: convertToDDMMYYYY(download_date),
        delivery_date: convertToDDMMYYYY(delivery_date),
        delivery_bd_time,
        task: selectedTasks.join("+"),
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
    setSelectedTasks([]);
    setEt(false);
    setProduction("");
    setQc1(false);
    setComment("");
    setStatus("");
  };


  useEffect(() => {
    GetAllClients();
  }, []);

  return (
    <>
      <div className="container my-5">
        <div className="add-order">
          <h5 className="py-3">Add New Tasks</h5>
          <form onSubmit={AddNewOrder} id="inputForm">
            <label htmlFor="clientCode" className="form-label">
              Client Code
            </label>
            <div id="clientCode" className="input-group mb-3">
              <div className="input-group-prepend">
                <button
                  className="btn btn-light dropdown-toggle"
                  type="button"
                  data-bs-toggle="dropdown"
                  data-bs-target="#formDropdown1"
                  aria-expanded="false"
                >
                  Select an option
                </button>
                <ul className="dropdown-menu dropdown-scroll" aria-labelledby="formDropdown1">
                  {optionsCode.map((option, index) => (
                    <li key={index}>
                      <a
                        href="#"
                        className="dropdown-item"
                        onClick={() => setClientCode(option)}
                      >
                        {option}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              <input
                type="text"
                className="form-control"
                placeholder="Client Code"
                value={client_code}
                onChange={(e) => setClientCode(e.target.value)}
              />
            </div>

            <label htmlFor="clientName" className="form-label">
              Client Name
            </label>
            <div id="clientName" className="input-group mb-3">
              <div className="input-group-prepend">
                <button
                  className="btn btn-light dropdown-toggle"
                  type="button"
                  data-bs-toggle="dropdown"
                  data-bs-target="#formDropdown2"
                  aria-expanded="false"
                >
                  Select an option
                </button>
                <ul className="dropdown-menu" aria-labelledby="formDropdown2">
                  {optionsName.map((option, index) => (
                    <li key={index}>
                      <a
                        href="#"
                        className="dropdown-item"
                        onClick={() => setClientName(option)}
                      >
                        {option}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              <input
                type="text"
                onFocus={handleClientNameFocus}
                className="form-control"
                placeholder="Client Name"
                value={client_name}
                onChange={(e) => setClientName(e.target.value)}
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

            <label htmlFor="task" className="form-label">
              Task
            </label>
            <div id="task" className="input-group mb-3">
              <div className="input-group-prepend">
                <button
                  className="btn btn-light dropdown-toggle"
                  type="button"
                  data-bs-toggle="dropdown"
                  data-bs-target="#formDropdown3"
                  aria-expanded="false"
                >
                  Select tasks
                </button>
                <ul
                  className="dropdown-menu dropdown-scroll list-unstyled"
                  aria-labelledby="formDropdown3"
                >
                  {optionsTask.map((task, index) => (
                    <div key={index} className="m-2 form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        value={task}
                        id={`checkbox${index}`}
                        checked={selectedTasks.includes(task)}
                        onChange={() => handleTaskCheckboxChange(task)}
                      />
                      <label
                        className="form-check-label"
                        htmlFor={`checkbox${index}`}
                      >
                        {task}
                      </label>
                    </div>
                  ))}
                </ul>
              </div>

              <input
                type="text"
                className="form-control"
                placeholder="Client Name"
                value={selectedTasks.join("+")}
                onChange={(e) => setSelectedTasks(e.target.value.split("+"))}
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




            <label htmlFor="status" className="form-label">
              Status
            </label>
            <div id="status" className="input-group mb-3">
              <div className="input-group-prepend">
                <button
                  className="btn btn-light dropdown-toggle"
                  type="button"
                  data-bs-toggle="dropdown"
                  data-bs-target="#formDropdown4"
                  aria-expanded="false"
                >
                  Select status
                </button>
                <ul
                  className="dropdown-menu dropdown-scroll list-unstyled"
                  aria-labelledby="formDropdown4"
                >
                  {optionsStatus.map((radio_status, index) => (
                    <div key={index} className="m-2 form-check">
                      <input
                        className="form-check-input"
                        type="radio"
                        value={radio_status}
                        id={`radio${index}`}
                        checked={status == radio_status}
                        onChange={() => handleStatusRadioChange(radio_status)}
                      />
                      <label
                        className="form-check-label"
                        htmlFor={`radio${index}`}
                      >
                        {radio_status}
                      </label>
                    </div>
                  ))}
                </ul>
              </div>

              <input
                type="text"
                className="form-control"
                placeholder="Client Name"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
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
        .dropdown-menu {
          max-height: 200px;
          overflow-y: auto;
        }
        `}
      </style>
    </>
  );
}
