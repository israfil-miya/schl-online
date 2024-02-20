import { signIn, useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";

import { toast } from "sonner";

export default function Login({ ip }) {
  const ALLOWED_IPS = process.env.NEXT_PUBLIC_ALLOWEDIP?.split(" ");
  const router = useRouter();
  const { data: session } = useSession();
  let { error, success } = router.query;
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (error) {
      toast.error(error, {
        toastId: "error",
      });
      error = undefined;
      router.replace("/login");
    }
    if (success) {
      toast.success(success, {
        toastId: "success",
      });
      success = undefined;
      router.replace("/login");
    }
  }, [error, success, router]);

  const signinSubmit = async (e) => {
    e.preventDefault();
    const result = await signIn("signin", {
      redirect: false,
      name,
      password,
    });

    if (!result.error) {
      const res = await fetch(process.env.NEXT_PUBLIC_BASE_URL + "/api/user", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          name,
          password,
          signin: true,
        },
      });
      const user = await res.json();

      if (
        process.env.NODE_ENV !== "development" &&
        user.role !== "super" &&
        user.role !== "admin" &&
        !ALLOWED_IPS?.includes(ip)
      )
        router.replace("/forbidden");
      else router.replace("/");
    }
    if (result.error) {
      router.replace("/login?error=" + result.error);
    }

    setName("");
    setPassword("");
  };

  return (
    <>
      <div className="main-wrapper">
        <div className="card signin-form rounded">
          <div className="card-header">
            <div className="text-center p-5">
              <h1 className="fw-bold">SCHL WEB PORTAL</h1>
            </div>
          </div>

          <div className="card-body">
            <form onSubmit={signinSubmit}>
              <div className="form-floating mb-3">
                <input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  type="text"
                  className="form-control"
                  id="floatingInput"
                  placeholder="John"
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
                  id="floatingPassword"
                  placeholder="Password"
                />
                <label htmlFor="floatingPassword">Password</label>
              </div>
              <button type="submit" className="btn w-100 btn-outline-dark mb-4">
                Login
              </button>
            </form>
          </div>
        </div>
      </div>

      <style jsx>
        {`
          .main-wrapper {
            overflow: hidden;
            min-height: 100vh;
            flex: 1;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            background: linear-gradient(to bottom, #7ba541, #fff);
          }
          .signin-form {
            width: 60ex;
          }
          .form-outline {
            width: 100%;
          }

          .card-header {
            text-align: center;
            padding: 20px;
            background-image: url("/images/oriental-tiles.png");
            background-position: center center;
            background-size: cover;
            position: relative;
          }
          .card-header::before {
            content: "";
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.2);
          }
          .fw-bold {
            font-size: 35px;
            text-transform: uppercase;
            color: #fff;
          }
          .card-header h1 {
            position: relative;
            z-index: 1;
          }
        `}
      </style>
    </>
  );
}

export async function getServerSideProps(context) {
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

  return {
    props: {
      ip,
    },
  };
}

Login.noAuth = true;
