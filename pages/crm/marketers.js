import React, { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "../../components/navbar";
import toast from "react-hot-toast";

export default function Marketers() {
  const [marketersList, setMarketersList] = useState([]);

  async function fetchApi(url, options) {
    const res = await fetch(url, options);
    const data = await res.json();
    return data;
  }

  const getMarketers = async () => {
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
        setMarketersList(list);
      } else {
        toast.error("Unable to retrieve file list", { toastId: "error1" });
      }
    } catch (error) {
      console.error("Error fetching file list:", error);
      toast.error("Error retrieving file list", { toastId: "error3" });
    }
  };

  useEffect(() => {
    getMarketers();
  }, []);
  return (
    <>
      <Navbar navFor="crm" />
      <div className="container">
        <div className="markers-list my-5">
          <h5 className="py-3">Marketers List</h5>

          <table className="table table-hover">
            <thead>
              <tr className="table-dark">
                <th>#</th>
                <th>Real Name</th>
                <th>Company Name</th>
                <th>Joining Date</th>
                <th>Phone</th>
                <th>Email</th>
              </tr>
            </thead>
            <tbody>
              {marketersList?.length !== 0 &&
                marketersList?.map((marketer, index) => {
                  return (
                    <tr key={index}>
                      <td>{index + 1}</td>
                      <td className="marketer_name text-decoration-underline">
                        <Link
                          href={`/crm/marketer/stats?name=${marketer.name}`}
                        >
                          {marketer.name}
                        </Link>
                      </td>
                      <td>{marketer.company_provided_name}</td>
                      <td>{marketer.joining_date}</td>
                      <td>{marketer.phone}</td>
                      <td>{marketer.email}</td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>

      <style jsx>
        {`
          .marketer_name:hover {
            color: rgba(0, 0, 0, 0.7);
          }
        `}
      </style>
    </>
  );
}
