import React from "react";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import Navbar from "../../../components/navbar";

export default function Database() {
  // const [list, setList] = useState([]);
  const [files, setFiles] = useState([]);
  const [selectedInvoiceData, setSelectedInvoiceData] = useState({});

  async function fetchApi(url, options) {
    const res = await fetch(url, options);
    const data = await res.json();
    return data;
  }

  function isoDateToDdMmYyyy(isoDate) {
    const date = new Date(isoDate);
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0"); // Months are 0-based
    const year = date.getFullYear().toString();

    return `${day}-${month}-${year}`;
  }
  const convertToDDMMYYYY = (dateString) => {
    const [year, month, day] = dateString.split("-");
    if (year.length != 4) return dateString;
    return `${day}-${month}-${year}`;
  };

  async function getFiles() {
    try {
      const url = `${process.env.NEXT_PUBLIC_BASE_URL}/api/ftp`;
      const options = {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          getfiles: true,
        },
      };

      const list = await fetchApi(url, options);

      if (!list.error) {
        const url = `${process.env.NEXT_PUBLIC_BASE_URL}/api/invoice`;
        const options = {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            getinvoicedetails: true,
          },
        };

        const listDetailed = await fetchApi(url, options);

        if (!listDetailed.error) {
          const mergedList = []; // Initialize a new array for merged items

          list.forEach((item) => {
            // Extract the ID from the name field
            const idMatch = item.name.match(
              /invoice_studioclickhouse_(.*?)\.xlsx/,
            );
            if (idMatch) {
              const id = idMatch[1];
              // Search for the matching object in listDetailed
              const detailedItem = listDetailed.find((d) => d._id === id);
              if (detailedItem) {
                // Merge the two objects
                const mergedItem = { ...item, ...detailedItem };
                // Push the merged item into the new array
                mergedList.push(mergedItem);
              }
            }
          });

          // Update the state with the new merged list
          setFiles(mergedList);
        } else {
          toast.error("Unable to retrieve file list", { toastId: "error1" });
        }
      } else {
        toast.error("Unable to retrieve file list", { toastId: "error2" });
      }
    } catch (error) {
      console.error("Error fetching file list:", error);
      toast.error("Error retrieving file list", { toastId: "error3" });
    }
  }

  async function deleteFile(file_name) {
    try {
      const url = `${process.env.NEXT_PUBLIC_BASE_URL}/api/ftp`;
      const options = {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          deletefile: true,
          filename: file_name,
        },
      };

      const res = await fetchApi(url, options);

      if (!res.error) {
        toast.success("Successfully deleted the invoice", {
          toastId: "success",
        });
        await getFiles();
      } else toast.error("Unable to delete file", { toastId: "error2" });
    } catch (error) {
      console.error("Error deleting file:", error);
      toast.error("Error deleting file list", { toastId: "error3" });
    }
  }

  useEffect(() => {
    getFiles();
  }, []);

  return (
    <>
    <Navbar navFor="dashboard" />
    <div className="my-5">
      <div className="client-list my-5">
        <h5 className="text-center py-4">Invoices List</h5>
        <table className="table p-3 table-hover">
          <thead>
            <tr>
              <th>#</th>
              <th>Time</th>
              <th>Invoice Number</th>
              <th>Client Code</th>
              <th>Created By</th>
              <th>Time Period</th>
              <th>Size (bytes)</th>
              <th>File Name</th>
              <th>Manage</th>
            </tr>
          </thead>
          <tbody>
            {files &&
              files.map((file, index) => (
                <tr key={file._id}>
                  <td>{index + 1}</td>
                  <td>{isoDateToDdMmYyyy(file.createdAt)}</td>
                  <td>{file.invoice_number}</td>
                  <td>{file.client_code}</td>
                  <td>{file.created_by}</td>
                  <td>
                    {convertToDDMMYYYY(file.time_period.fromDate) || "x"} -{" "}
                    {convertToDDMMYYYY(file.time_period.toDate)}
                  </td>
                  <td>{file.size}</td>
                  <td>{file.name}</td>
                  <td>
                    <button
                      // onClick={() => {
                      //   setManageData({
                      //     _id: client._id ?? "",
                      //     client_code: client.client_code ?? "",
                      //     client_name: client.client_name ?? "",
                      //     marketer: client.marketer ?? "",
                      //     contact_person: client.contact_person ?? "",
                      //     designation: client.designation ?? "",
                      //     contact_number: client.contact_number ?? "",
                      //     email: client.email ?? "",
                      //     country: client.country ?? "",
                      //     address: client.address ?? "",
                      //     prices: client.prices ?? "",
                      //     currency: client.currency ?? "",
                      //   })
                      //   setEditedBy(client.updated_by ?? "")
                      // }
                      // }

                      type="button"
                      onClick={() => null}
                      className="btn me-2 btn-sm btn-outline-primary"
                    >
                      Download
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedInvoiceData(file)}
                      data-bs-toggle="modal"
                      data-bs-target="#deleteModal"
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
        id="deleteModal"
        tabIndex="-1"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h1 className="modal-title fs-5" id="staticBackdropLabel">
                Delete Invoice Confirmation
              </h1>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              <p>Do you really want to delete this invoice record?</p>
            </div>
            <div className="modal-footer p-1">
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary"
                data-bs-dismiss="modal"
              >
                No
              </button>
              <button
                onClick={() => deleteFile(selectedInvoiceData.name)}
                type="button"
                className="btn btn-sm btn-outline-danger"
                data-bs-dismiss="modal"
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
