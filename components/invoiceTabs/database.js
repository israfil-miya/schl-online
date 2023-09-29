import React from "react";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
export default function Database() {
  const [list, setList] = useState([]);

  async function fetchApi(url, options) {
    const res = await fetch(url, options);
    const data = await res.json();
    return data;
  }

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

      const List = await fetchApi(url, options);

      if (!List.error) {
        setList(List);
      } else {
        toast.error("Unable to retrieve file list", { toastId: "error1" });
      }
    } catch (error) {
      console.error("Error fetching file list:", error);
      toast.error("Error retrieving file list", { toastId: "error2" });
    }
  }

  useEffect(() => {
    getFiles();
  }, []);

  return (
    <div className="my-5">
      <div className="client-list my-5">
        <h5 className="text-center py-4">Invoices List</h5>
        <table className="table p-3 table-hover">
          <thead>
            <tr>
              <th>#</th>
              <th>Time</th>
              <th>Client Code</th>
              <th>Created By</th>
              <th>Time Period</th>
              <th>Manage</th>
            </tr>
          </thead>
          <tbody>
            {list.map((file, index) => (
              <tr key={file._id}>
                <td>{index + 1}</td>
                <td>{file.client_code}</td>
                <td>{file.client_name}</td>
                <td>{file.marketer}</td>
                <td>{file.contact_person}</td>
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
                    onClick={() => null}
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
                onClick={null}
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
  );
}
