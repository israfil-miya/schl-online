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
      <div className="main-wrapper container">
        <div className="signin-form rounded shadow border bg-light fw-bold py-1">
          <form onSubmit={signinSubmit}>
            <div className="text-center my-3">
              <p className="fw-medium">LOGIN PANEL</p>
            </div>

            <div className="form-outline mb-4">
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                type="text"
                id="loginName"
                className="form-control"
              />
              <label className="form-label" htmlFor="loginName">
                Name
              </label>
            </div>

            <div className="form-outline mb-4">
              <input
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                id="loginPassword"
                className="form-control"
              />
              <label className="form-label" htmlFor="loginPassword">
                Password
              </label>
            </div>

            <button
              type="submit"
              className="btn btn-outline-primary btn-block mb-4"
            >
              Login
            </button>
          </form>
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
          }
          .signin-form {
            padding: 50px;
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
