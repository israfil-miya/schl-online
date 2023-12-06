import React from "react";
import Link from "next/link";

export default function ForbiddenPage() {
  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card">
            <div className="card-header bg-danger text-white">
              <h1 className="mb-0">403 Forbidden</h1>
            </div>
            <div className="card-body">
              <p className="lead">
                This website can only be accessed from the office.
              </p>
              <p>Go to <Link className="text-primary" href="/login">Login Page</Link></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

ForbiddenPage.noAuth = true;
