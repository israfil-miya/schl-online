import React from "react";
import Navbar from "../../components/navbar";
import Link from "next/link";
import { useSession, getSession } from "next-auth/react";
import Image from "next/image";

export default function Page() {
  const { data: session } = useSession();
  return (
    <>
      <Navbar navFor="account" />
      <div className="g-4">
        <div className="row justify-content-between">
          <div className="col-3 bg-light p-4">
            <div className="bg-white me-1 p-3 rounded">
              <div className="container">
                <div class="d-flex justify-content-center mb-2">
                  <div
                    style={{ height: "150px", width: "150px" }}
                    className="rounded-circle p-5 border text-center bg-light"
                  >
                    {session.user.real_name}
                  </div>
                </div>

                <h5 className="mb-1 text-center">
                  <strong>Md Shahmiran Talukder</strong>
                </h5>
                <p class="small mb-0 text-center">(0012)</p>
                <h6 class="mb-0 text-center">Junior Graphic Designer</h6>
                <hr />
                <div class="g-4">
                  <div class="row justify-content-between">
                    <div class="col-6 p-4 text-end text-body-secondary fw-semibold">
                      <p className="lh-sm">Joined On</p>
                      <p className="lh-sm">Department</p>
                      <p className="lh-sm">Branch</p>
                      <p className="lh-sm">Division</p>
                    </div>
                    <div class="col-6 p-4 text-start">
                      <p className="lh-sm">10-11-2024</p>
                      <p className="lh-sm">Admin Assistant</p>
                      <p className="lh-sm">Head Office</p>
                      <p className="lh-sm">Dhaka</p>
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
