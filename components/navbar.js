import { getSession, useSession } from "next-auth/react";
import { signOut } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
export default function Navbar({ navFor }) {
  const { data: session } = useSession();
  const signOutHandle = () => {
    signOut({ callbackUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/login` });
  };
  return (
    <nav className="navbar navbar-expand-lg bg-body-tertiary shadow-sm">
      <div className="container-fluid">
        <Link
          className="navbar-brand d-flex align-items-center"
          href="https://studioclickhouse.com/"
        >
          <Image
            src="/images/NEW-SCH-logo-text-grey.png"
            alt="Logo"
            width="40"
            height="44"
            className="d-inline-block me-2"
          />
          SCHL PORTAL
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarText"
          aria-controls="navbarText"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarText">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <Link
                className={navFor == "tasks" ? "nav-link active" : "nav-link"}
                href="/"
              >
                Tasks
              </Link>
            </li>

            <li className="nav-item">
              <Link
                className={navFor == "browse" ? "nav-link active" : "nav-link"}
                href="/browse"
              >
                Browse
              </Link>
            </li>

            {(session.user.role != "user" || session.user.role != "manager") ? (
              <li className="nav-item">
                <Link
                  className={navFor == "admin" ? "nav-link active" : "nav-link"}
                  href="/admin"
                >
                  Admin
                </Link>
              </li>
            ) : (
              <></>
            )}
          </ul>
          <div className="navbar-text me-5 pe-5">
            <div className="nav-item dropdown list-unstyled">
              <Link
                className="nav-link dropdown-toggle"
                data-bs-toggle="dropdown"
                href=""
                role="button"
                aria-expanded="false"
              >
                <em>
                  Welcome {session.user?.name}{" "}
                  <span className="text-body-secondary">
                    ({session.user?.role})
                  </span>
                </em>
              </Link>
              <ul className="dropdown-menu list-unstyled">
                <div className="text-center">
                  <span className="fw-medium p-1">
                    Interacting as{" "}
                    {session.user.role}
                  </span>
                  <button
                    onClick={signOutHandle}
                    className="btn mt-3 px-5 btn-sm btn-outline-danger"
                  >
                    Logout
                  </button>
                </div>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
