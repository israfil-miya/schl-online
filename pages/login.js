import { signIn } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { getSession } from "next-auth/react";

import toast from "react-hot-toast";

export default function Login() {
  const router = useRouter();
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
      router.replace("/");
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
            background: linear-gradient(
              to bottom,
              #7ba541,
              #fff
            ); /* Define the gradient colors */
          }
          .signin-form {
            width: 60ex;
          }
          .form-outline {
            width: 100%; /* Make the form inputs take full width */
          }

          .card-header {
            text-align: center; /* Center-align the text */
            padding: 20px; /* Add some padding for spacing */
            background-image: url("https://amymhaddad.s3.amazonaws.com/oriental-tiles.png");
            background-position: center center; /* Center the background image */
            background-size: cover; /* Ensure the image covers the entire header */
            position: relative; /* Make the header relative to add pseudo-element */
          }
          .card-header::before {
            content: "";
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(
              0,
              0,
              0,
              0.2
            ); /* Dark overlay color with 50% opacity */
          }
          .fw-bold {
            font-size: 35px; /* Adjust font size for a proper heading title */
            text-transform: uppercase; /* Optionally, make the text uppercase */
            color: #fff; /* Set the text color to white for better visibility */
          }
          .card-header h1 {
            position: relative; /* Make sure the name text stays above the overlay */
            z-index: 1; /* Bring the name text to the front */
          }
        `}
      </style>
    </>
  );
}

export async function getServerSideProps(context) {
  const session = await getSession(context);

  // code for redirect if not logged in
  if (session) {
    return {
      redirect: {
        destination: "/?error=You are already logged in",
        permanent: true,
      },
    };
  } else
    return {
      props: {},
    };
}
Login.noAuth = true;
