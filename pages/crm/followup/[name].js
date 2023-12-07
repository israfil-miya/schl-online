import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Navbar from "../../../components/navbar";
import { useSession, SessionProvider, getSession } from "next-auth/react";
import { toast } from "sonner";
import CallingStatusTd from "../../../components/calling-status-td";
import Link from "next/link";

async function fetchApi(url, options) {
  const res = await fetch(url, options);
  const data = await res.json();
  return data;
}

export default function Followup() {
  const router = useRouter();
  const { name } = router.query;
  const { data: session } = useSession();

  const [nearestFollowUps, setNearestFollowUps] = useState([]);

  const [manageData, setManageData] = useState({});
  const [isRecall, setIsRecall] = useState(0);
  const [editedBy, setEditedBy] = useState("");

  const convertToDDMMYYYY = (dateString) => {
    const [year, month, day] = dateString.split("-");
    if (year.length != 4) return dateString;
    return `${day}-${month}-${year}`;
  };

  const handlefinishfollowup = async () => {
    let result;
    const res = await fetch(process.env.NEXT_PUBLIC_BASE_URL + "/api/crm", {
      method: "GET",
      headers: {
        finishfollowup: true,
        updated_by: session.user.name,
        id: manageData._id,
        "Content-Type": "application/json",
      },
    });
    result = await res.json();
    if (!result.error) {
      let listLength = await getReportsForFollowup();
      if (!listLength) {
        router.push(process.env.NEXT_PUBLIC_BASE_URL + "/crm/marketers");
      }
      toast.success("Changed the status of followup");
    }
    setManageData({});
  };

  const getReportsForFollowup = async () => {
    const url1 = `${process.env.NEXT_PUBLIC_BASE_URL}/api/crm`;
    const options1 = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        getnearestfollowups: true,
        marketer_name: name,
      },
    };

    let res1 = await fetchApi(url1, options1);

    if (!res1.error) {
      setNearestFollowUps(res1);
      return res1.length;
    } else {
      toast.error("Unable to fetch the folowup list of " + name);
    }
  };

  async function editReport() {
    try {
      const url = `${process.env.NEXT_PUBLIC_BASE_URL}/api/crm`;
      let options;

      let submitData = manageData;

      if (isRecall) {
        // console.log("|| RECALL CALLED ||");
        const today = moment().utc().format("YYYY-MM-DD");

        options = {
          method: "POST",
          body: JSON.stringify({
            ...manageData,
            calling_date_history: manageData.calling_date_history.includes(
              today,
            )
              ? manageData.calling_date_history
              : [...manageData.calling_date_history, today],
          }),
          headers: {
            "Content-Type": "application/json",
            editreport: true,
            name: session.user?.name,
          },
        };

        if (
          reports.items.find(
            (data) => data.followup_date == today && data._id == submitData._id,
          )
        ) {
          // console.log("RECALL ACCEPTED");
          // console.log(submitData);

          const result = await fetchApi(url, options);

          setManageData({});
          setIsRecall(0);

          if (!result.error) {
            toast.success("Edited the report data");

            if (!isFiltered) await getAllReports();
            else await getAllReportsFiltered();
          } else {
            toast.error("Something gone wrong!");
          }

          // return
        } else {
          // console.log("RECALL REJECTED");

          const submitData = {
            req_type: "Report Edit",
            req_by: session.user.name,
            id: manageData._id,
            ...manageData,
            calling_date_history: manageData.calling_date_history.includes(
              today,
            )
              ? manageData.calling_date_history
              : [...manageData.calling_date_history, today],
            updated_by: session.user?.name,
          };

          delete submitData._id;

          // console.log("THIS IS THE SUBMIT DATA: ", submitData);

          const result = await fetch(
            process.env.NEXT_PUBLIC_BASE_URL + "/api/approval",
            {
              method: "POST",
              body: JSON.stringify(submitData),
              headers: {
                "Content-Type": "application/json",
              },
            },
          );

          setManageData({});
          setIsRecall(0);

          if (!result.error) {
            toast.success(
              "Today is not the followup date of the report to recall, an approval request has been sent to admin",
            );
          } else {
            toast.error("Something gone wrong!");
          }
        }

        return;
      }

      options = {
        method: "POST",
        body: JSON.stringify(submitData),
        headers: {
          "Content-Type": "application/json",
          editreport: true,
          name: session.user?.name,
        },
      };

      const result = await fetchApi(url, options);

      if (!result.error) {
        toast.success("Edited the report data");

        // if (!isFiltered)
        await getReportsForFollowup();
        // else
        // await getAllReportsFiltered();
      } else {
        toast.error("Something gone wrong!");
      }
    } catch (error) {
      console.error("Error editing report:", error);
      toast.error("Error editing report");
    }
    setManageData({});
  }

  useEffect(() => {
    getReportsForFollowup();
  }, []);

  return (
    <>
      <Navbar navFor="crm" shortNote={name + " - FOLLOWUP"} />
      <div className="followup-list my-5 text-nowrap">
        <h5 className="bg-light text-center p-2 mb-3 border">
          Available Followups
        </h5>
        <div style={{ overflowX: "auto" }} className="text-nowrap">
          <table className="table table-hover">
            <thead>
              <tr className="table-dark">
                <th>#</th>
                <th>Calling Date</th>
                <th>Followup Date</th>
                <th>Country</th>
                <th>Website</th>
                <th>Category</th>
                <th>Company Name</th>
                <th>Contact Person</th>
                <th>Designation</th>
                <th>Contact Number</th>
                <th>Email Address</th>
                <th>Calling Status</th>
                <th>LinkedIn</th>
                <th>Test</th>
                <th>Prospected</th>
                <th>Finish</th>
              </tr>
            </thead>
            <tbody>
              {nearestFollowUps?.length !== 0 ? (
                nearestFollowUps?.map((item, index) => {
                  return (
                    <tr key={index}>
                      <td>{index + 1}</td>
                      <td>
                        {item.calling_date
                          ? convertToDDMMYYYY(item.calling_date)
                          : ""}
                      </td>
                      <td>
                        {item.followup_date
                          ? convertToDDMMYYYY(item.followup_date)
                          : ""}
                      </td>

                      <td>{item.country}</td>
                      <td>
                        {item.website.length
                          ? item.website
                              .split(" ")
                              .filter((item) => item.length)
                              .map((websiteLink, link) => (
                                <p
                                  key={index}
                                  className="text-primary m-0 p-0 link"
                                >
                                  <Link target="_blank" href={websiteLink}>
                                    Click here to visit
                                  </Link>
                                </p>
                              ))
                          : "No link provided"}
                      </td>
                      <td>{item.category}</td>
                      <td className="text-wrap">{item.company_name}</td>
                      <td className="text-wrap">{item.contact_person}</td>
                      <td>{item.designation}</td>
                      <td className="text-wrap">{item.contact_number}</td>
                      <td className="text-wrap">{item.email_address}</td>
                      <CallingStatusTd data={item.calling_status} />
                      <td>
                        {item.linkedin.length
                          ? item.linkedin
                              .split(" ")
                              .filter((item) => item.length)
                              .map((linkedinLink, index) => (
                                <p
                                  key={index}
                                  className="text-primary m-0 p-0 link"
                                >
                                  <Link target="_blank" href={linkedinLink}>
                                    Click here to visit
                                  </Link>
                                </p>
                              ))
                          : "No link provided"}
                      </td>
                      <td>{item.is_test ? "Yes" : "No"}</td>
                      <td>
                        {item.is_prospected
                          ? `Yes (${item.followup_done ? "Done" : "Pending"})`
                          : "No"}
                      </td>

                      <td
                        className="align-middle"
                        style={{ textAlign: "center" }}
                      >
                        <button
                          onClick={() => setManageData(item)}
                          className="btn btn-sm mx-2 btn-outline-success"
                          data-bs-toggle="modal"
                          data-bs-target="#finishModal"
                        >
                          Finish
                        </button>
                        <button
                          onClick={() => {
                            setIsRecall(0);
                            setManageData(item);
                            setEditedBy(item.updated_by || "");
                          }}
                          className="btn btn-sm btn-outline-primary mx-2"
                          data-bs-toggle="modal"
                          data-bs-target="#editModal"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr key={0}>
                  <td colSpan="13" className=" align-center text-center">
                    No Followups To Show.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div
        className="modal fade"
        id="finishModal"
        tabIndex="-1"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h1 className="modal-title fs-5" id="staticBackdropLabel">
                Finish Confirmation
              </h1>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              <p>Are you sure?</p>
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
                onClick={handlefinishfollowup}
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

      <div
        className="modal fade"
        id="editModal"
        tabIndex="-1"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
          <div className="modal-content">
            <div className="modal-header">
              <h1 className="modal-title fs-5" id="staticBackdropLabel">
                Edit Report Data
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
                <label htmlFor="calling_date" className="form-label">
                  First Calling Date
                </label>
                <input
                  disabled
                  value={manageData.calling_date}
                  type="date"
                  className="form-control"
                  id="calling_date"
                />
              </div>
              <div className="mb-1">
                <label htmlFor="calling_date" className="form-label">
                  Calling Date History
                </label>
                <textarea
                  disabled
                  value={manageData.calling_date_history
                    ?.map((date) => `${convertToDDMMYYYY(date)}`)
                    .join("\n")}
                  type="date"
                  className="form-control"
                  id="calling_date"
                />
              </div>
              <div className="mb-3">
                <div className="form-check">
                  <input
                    type="checkbox"
                    id="myCheckbox"
                    className="form-check-input"
                    checked={isRecall}
                    onChange={(e) => setIsRecall((prevData) => !prevData)}
                  />

                  <label htmlFor="myCheckbox" className="form-check-label">
                    Recall
                  </label>
                </div>
              </div>
              <div className="mb-3">
                <label htmlFor="followup_date" className="form-label">
                  Followup Date
                </label>
                <input
                  value={manageData.followup_date}
                  onChange={(e) =>
                    setManageData((prevData) => ({
                      ...prevData,
                      followup_date: e.target.value,
                    }))
                  }
                  type="date"
                  className="form-control"
                  id="followup_date"
                />
              </div>
              <div className="mb-3">
                <label htmlFor="country" className="form-label">
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
                  id="country"
                />
              </div>
              <div className="mb-3">
                <label htmlFor="website" className="form-label">
                  Website
                </label>
                <input
                  value={manageData.website}
                  onChange={(e) =>
                    setManageData((prevData) => ({
                      ...prevData,
                      website: e.target.value,
                    }))
                  }
                  type="text"
                  className="form-control"
                  id="website"
                />
              </div>
              <div className="mb-3">
                <label htmlFor="category" className="form-label">
                  Category
                </label>
                <input
                  value={manageData.category}
                  onChange={(e) =>
                    setManageData((prevData) => ({
                      ...prevData,
                      category: e.target.value,
                    }))
                  }
                  type="text"
                  className="form-control"
                  id="category"
                />
              </div>
              <div className="mb-3">
                <label htmlFor="company_name" className="form-label">
                  Company Name
                </label>
                <input
                  value={manageData.company_name}
                  onChange={(e) =>
                    setManageData((prevData) => ({
                      ...prevData,
                      company_name: e.target.value,
                    }))
                  }
                  type="text"
                  className="form-control"
                  id="company_name"
                />
              </div>
              <div className="mb-3">
                <label htmlFor="contact_person" className="form-label">
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
                  id="contact_person"
                />
              </div>
              <div className="mb-3">
                <label htmlFor="designation" className="form-label">
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
                  id="designation"
                />
              </div>
              <div className="mb-3">
                <label htmlFor="contact_number" className="form-label">
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
                  id="contact_number"
                />
              </div>
              <div className="mb-3">
                <label htmlFor="email_address" className="form-label">
                  Email Address
                </label>
                <input
                  value={manageData.email_address}
                  onChange={(e) =>
                    setManageData((prevData) => ({
                      ...prevData,
                      email_address: e.target.value,
                    }))
                  }
                  type="email"
                  className="form-control"
                  id="email_address"
                />
              </div>
              <div className="mb-3">
                <label htmlFor="calling_status" className="form-label">
                  Calling Status
                </label>
                <textarea
                  value={manageData.calling_status}
                  onChange={(e) =>
                    setManageData((prevData) => ({
                      ...prevData,
                      calling_status: e.target.value,
                    }))
                  }
                  type="text"
                  className="form-control"
                  id="calling_status"
                />
              </div>
              <div className="mb-3">
                <label htmlFor="linkedin" className="form-label">
                  LinkedIn
                </label>
                <input
                  value={manageData.linkedin}
                  onChange={(e) =>
                    setManageData((prevData) => ({
                      ...prevData,
                      linkedin: e.target.value,
                    }))
                  }
                  type="text"
                  className="form-control"
                  id="linkedin"
                />
              </div>

              <div className="">
                <div className="form-check">
                  <input
                    type="checkbox"
                    id="myCheckbox"
                    className="form-check-input"
                    checked={manageData.is_test}
                    onChange={(e) =>
                      setManageData({
                        ...manageData,
                        is_test: !manageData.is_test,
                      })
                    }
                  />

                  <label htmlFor="myCheckbox" className="form-check-label">
                    Test Job
                  </label>
                </div>
              </div>
              <div className="mb-3">
                <div className="form-check">
                  <input
                    type="checkbox"
                    id="myCheckbox2"
                    className="form-check-input"
                    checked={manageData.is_prospected}
                    onChange={(e) =>
                      setManageData({
                        ...manageData,
                        is_prospected: !manageData.is_prospected,
                      })
                    }
                  />

                  <label htmlFor="myCheckbox" className="form-check-label">
                    Prospecting
                  </label>
                </div>
              </div>
            </div>
            <div className="modal-footer p-1">
              {editedBy ? (
                <div className="d-flex justify-content-start align-items-center me-auto text-body-secondary">
                  <span className="me-1">Last updated by </span>

                  <span className="fw-medium">{editedBy}</span>
                </div>
              ) : null}

              <button
                type="button"
                className="btn btn-sm btn-outline-secondary"
                data-bs-dismiss="modal"
              >
                Close
              </button>
              <button
                onClick={editReport}
                type="button"
                data-bs-dismiss="modal"
                className="btn btn-sm btn-outline-primary"
              >
                Update
              </button>
            </div>
          </div>
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
  const session = await getSession(context);
  const { name } = context.query;

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
    (session.user.role != "marketer" &&
      session.user.role != "admin" &&
      session.user.role != "super")
  ) {
    return {
      redirect: {
        destination:
          "/?error=You need Marketer/Admin/Super role to access the page",
        permanent: true,
      },
    };
  } else {
    return {
      props: {},
    };
  }
}
