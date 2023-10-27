import React from "react";

export default function ForbiddenPage() {
  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card">
            <div className="card-header bg-danger text-white">
              <h1>403 Forbidden</h1>
            </div>
            <div className="card-body">
              <p className="lead">
                This website can be accessed only from the office!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

ForbiddenPage.noAuth = true;
