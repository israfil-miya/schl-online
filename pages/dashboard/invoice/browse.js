import React from "react";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import Navbar from "../../../components/navbar";
import { getSession, useSession } from "next-auth/react";

export default function Database() {
  // const [list, setList] = useState([]);
  const [files, setFiles] = useState([]);
  const [selectedInvoiceData, setSelectedInvoiceData] = useState({});

  const [page, setPage] = useState(1);
  const [pageCount, setPageCount] = useState(0);

  const [fromTime, setFromTime] = useState("");
  const [toTime, setToTime] = useState("");
  const [clientFilter, setClientFilter] = useState("");
  const [invoiceNumberFilter, setInvoiceNumberFilter] = useState("");
  const [fileNameFilter, setFileNameFilter] = useState("");
  const [isFiltered, setIsFiltered] = useState(0);

  async function fetchApi(url, options) {
    const res = await fetch(url, options);
    const data = await res.json();
    return data;
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
      const url = `${process.env.NEXT_PUBLIC_BASE_URL}/api/invoice`;
      const options = {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          getinvoicedetails: true,
          page,
        },
      };

      const list = await fetchApi(url, options);

      if (!list.error) {
        setFiles(list);
      } else {
        toast.error("Unable to retrieve file list", { toastId: "error1" });
      }
    } catch (error) {
      console.error("Error fetching file list:", error);
      toast.error("Error retrieving file list", { toastId: "error3" });
    }
  }
  async function filteredData() {
    let adjustedFromTime = fromTime;
    let adjustedToTime = toTime;

    if (fromTime) {
      adjustedFromTime = convertToDDMMYYYY(fromTime);
    }
    if (toTime) {
      adjustedToTime = convertToDDMMYYYY(toTime);
    }

    const url = `${process.env.NEXT_PUBLIC_BASE_URL}/api/invoice`;

    const options = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        getinvoicesbyfilter: true,
        client: clientFilter,
        fromtime: adjustedFromTime,
        totime: adjustedToTime,
        invoicenumber: invoiceNumberFilter,
        filename: fileNameFilter,
        page,
      },
    };

    try {
      const list = await fetchApi(url, options);

      if (!list.error) {
        setIsFiltered(1);
        setFiles(list);
      } else {
        setIsFiltered(0);
        await getFiles();
      }
    } catch (error) {
      console.error("Error fetching filtered files:", error);
    }
  }

  async function deleteFile(file_name) {
    try {
      const url = `${process.env.NEXT_PUBLIC_BASE_URL}/api/invoice`;
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
        const url2 = `${process.env.NEXT_PUBLIC_BASE_URL}/api/ftp`;
        const options2 = {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            deletefile: true,
            filename: file_name,
          },
        };

        const res2 = await fetchApi(url2, options2);

        if (!res2.error) {
          toast.success("Successfully deleted the invoice", {
            toastId: "success",
          });
          await getFiles();
        } else
          toast.error("Unable to delete file from server", {
            toastId: "error2",
          });
      } else toast.error("Unable to delete file", { toastId: "error3" });
    } catch (error) {
      console.error("Error deleting file:", error);
      toast.error("Error deleting file list", { toastId: "error4" });
    }
  }

  async function downloadFile(file_name) {
    try {
      const url = `${process.env.NEXT_PUBLIC_BASE_URL}/api/ftp`;
      const options = {
        method: "GET",
        headers: {
          downloadfile: true,
          filename: file_name,
        },
      };

      const response = await fetch(url, options);

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = file_name;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      } else {
        console.error("Error downloading the file.");
        toast.error("Error downloading the file.");
      }
    } catch (error) {
      console.error("An error occurred:", error);
    }
  }

  useEffect(() => {
    if (!isFiltered) getFiles();
    if (files) setPageCount(files?.pagination?.pageCount);
  }, [files?.pagination?.pageCount]);

  useEffect(() => {
    if (!isFiltered) getFiles();
    else filteredData();
  }, [page]);

  return (
    <>
      <Navbar navFor="dashboard" />

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
            className="filter_client me-3"
          >
            <strong>Client: </strong>
            <input
              type="text"
              placeholder="Client Code"
              className="form-control ms-2 custom-input"
              value={clientFilter}
              onChange={(e) => setClientFilter(e.target.value)}
            />
          </div>

          <div
            style={{ display: "flex", alignItems: "center" }}
            className="filter_invoice_number me-3"
          >
            <strong>Invoice: </strong>
            <input
              type="text"
              placeholder="Invoice Number"
              className="form-control ms-2 custom-input"
              value={invoiceNumberFilter}
              onChange={(e) => setInvoiceNumberFilter(e.target.value)}
            />
          </div>
          <div
            style={{ display: "flex", alignItems: "center" }}
            className="filter_file_name me-3"
          >
            <strong>File: </strong>
            <input
              type="text"
              placeholder="File Name"
              className="form-control ms-2 custom-input"
              value={fileNameFilter}
              onChange={(e) => setFileNameFilter(e.target.value)}
            />
          </div>

          <button
            onClick={filteredData}
            className="btn ms-4 btn-sm btn-outline-primary"
          >
            Search
          </button>
        </div>
      </div>

      {files?.items?.length !== 0 && (
        <div className="container mb-5">
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

          {/* <div className="float-start">
            <div className={`btn-group ${!isFiltered ? "d-none" : ""}`} role="group" aria-label="Basic outlined example">
              <button type="button" className="btn btn-sm btn-outline-success">
                EXCEL EXPORT
              </button>
            </div>
          </div> */}
        </div>
      )}

      <table className="table p-3 table-hover">
        <thead>
          <tr>
            <th>#</th>
            <th>Time</th>
            <th>Invoice Number</th>
            <th>Client Code</th>
            <th>Created By</th>
            <th>Time Period</th>
            <th>File Name</th>
            <th>Manage</th>
          </tr>
        </thead>
        <tbody>
          {files?.items &&
            files?.items.map((file, index) => (
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
                <td>
                  {"invoice_studioclickhouse_" + file.invoice_number + ".xlsx"}
                </td>
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
                    onClick={() =>
                      downloadFile(
                        "invoice_studioclickhouse_" +
                          file.invoice_number +
                          ".xlsx",
                      )
                    }
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
                onClick={() =>
                  deleteFile(
                    "invoice_studioclickhouse_" +
                      selectedInvoiceData.invoice_number +
                      ".xlsx",
                  )
                }
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
    </>
  );
}

export async function getServerSideProps(context) {
  const session = await getSession(context);

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
