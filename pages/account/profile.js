import React, { useState, useEffect } from "react";
import Navbar from "../../components/navbar";
import Link from "next/link";
import { useSession, getSession } from "next-auth/react";
import Image from "next/image";

export default function Page() {
  const { data: session } = useSession();
  const [employeeData, setEmployeeData] = useState({});

  async function fetchApi(url, options) {
    const res = await fetch(url, options);
    const data = await res.json();
    return data;
  }

  const convertToDDMMYYYY = (dateString) => {
    const [year, month, day] = dateString.split("-");
    if (year.length != 4) return dateString;
    return `${day}-${month}-${year}`;
  };

  async function GetEmployeeByName(id) {
    try {
      const url = `${process.env.NEXT_PUBLIC_BASE_URL}/api/employee`;
      const options = {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          getmarkernamebyrealname: true,
          real_name: session.user.real_name,
        },
      };

      const resData = await fetchApi(url, options);

      if (!resData.error) {
        setEmployeeData(resData);
        console.log(employeeData);
      } else {
        toast.error("Unable to retrieve employee data");
      }
    } catch (error) {
      console.error("Error fetching employee data:", error);
      toast.error("Error retrieving employee data");
    }
  }

  useEffect(() => {
    GetEmployeeByName();
  }, []);

  return (
    <>
      <Navbar navFor="account" />
      <div className="overflow-hidden g-4">
        <div className="row justify-content-between">
          <div className="col-3 bg-light p-4">
            <div className="bg-white me-1 p-3 rounded">
              <div className="container">
                <div className="d-flex justify-content-center mb-2">
                  {
                    // TEMPORARY: Only for Shahmiran. Will be removed later!
                    employeeData.real_name == "Md. Shahmiran Talukdar" ? (
                      <Image
                        width={150}
                        height={150}
                        className="rounded-circle border"
                        src={
                          "https://scontent.fdac22-1.fna.fbcdn.net/v/t39.30808-6/411997314_375669695124369_3799214682215955933_n.jpg?_nc_cat=108&ccb=1-7&_nc_sid=efb6e6&_nc_ohc=pSl-kEAMf0AAX_n0ENx&_nc_ht=scontent.fdac22-1.fna&oh=00_AfC4fs6S21TxxxS3GBOFdUpgCed6Hu7tQU_6RnUTCKuQ0Q&oe=65A2AE44"
                        }
                      />
                    ) : (
                      <div
                        style={{ height: "150px", width: "150px" }}
                        className="rounded-circle text-body-secondary p-5 border text-center bg-light"
                      >
                        {employeeData.real_name}
                      </div>
                    )
                  }
                </div>

                <h5 className="mb-1 text-center">
                  <strong>{employeeData.real_name}</strong>
                </h5>
                <p className="small mb-0 text-center">({employeeData.e_id})</p>
                <h6 className="mb-0 text-center">{employeeData.designation}</h6>
                <hr />
                <div className="g-4">
                  <div className="row justify-content-between">
                    <div className="col-6 p-4 text-end text-body-secondary fw-semibold">
                      <p className="lh-sm">Joined On</p>
                      <p className="lh-sm">Department</p>
                      <p className="lh-sm">Branch</p>
                      <p className="lh-sm">Division</p>
                    </div>
                    <div className="col-6 p-4 text-start">
                      <p className="lh-sm">
                        {employeeData?.joining_date &&
                          convertToDDMMYYYY(employeeData.joining_date)}
                      </p>
                      <p className="lh-sm">{employeeData.department}</p>
                      <p className="lh-sm">{employeeData.branch}</p>
                      <p className="lh-sm">{employeeData.division}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-9 bg-light p-4">
            <div className="bg-white p-3 rounded">
              <p>Under Construction!</p>
              <Link className="text-primary" href={"/account/change-password"}>
                Change your password
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
