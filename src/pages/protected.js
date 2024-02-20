import React from "react";
import { useRouter } from "next/router";
import { toast } from "sonner";
import Navbar from "@/components/navbar";

import { useState } from "react";

export default function Protected() {
  const router = useRouter();
  const { redirect } = router.query;

  const [name, setName] = useState("");
  const [password, setPassword] = useState("");

  const signinSubmit = async (e) => {
    e.preventDefault();

    const res = await fetch(process.env.NEXT_PUBLIC_BASE_URL + "/api/user", {
      method: "POST",
      body: JSON.stringify({
        name,
        password,
      }),
      headers: {
        "Content-Type": "application/json",
        verify_user: true,
        redirect_path: redirect,
      },
    });

    const response = await res.json();

    if (response.error) {
      toast.error("Authentication failed!");
    } else {
      router.push(redirect);
    }
  };

  return (
    <>
      <Navbar />
      <div className="text-center py-1 border bg-light">
        The route <code>/account/profile</code> is protected. Enter your
        credentials to access the page!
      </div>

      <div className="main-wrapper mt-5">
        <div className="card-body">
          <form autoComplete="no-auto-fill" onSubmit={signinSubmit}>
            <div className="form-floating mb-3">
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                type="text"
                className="form-control"
              />
              <label htmlFor="floatingInput">Username</label>
            </div>
            <div className="form-floating mb-3">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-control"
              />
              <label htmlFor="floatingPassword">Password</label>
            </div>
            <button type="submit" className="btn w-100 btn-outline-dark mb-4">
              Login
            </button>
          </form>
        </div>
      </div>

      <style jsx>
        {`
          .main-wrapper {
            overflow: hidden;
            flex: 1;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
          }
          .card-body {
            padding: 10px;
            width: 80ex;
          }
        `}
      </style>
    </>
  );
}
