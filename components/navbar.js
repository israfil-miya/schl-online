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

            {session.user.role == "admin" || session.user.role == "super" ? (
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
            {session.user.role == "super" ? (
              <li className="nav-item">
                <Link
                  className={navFor == "dashboard" ? "nav-link active" : "nav-link"}
                  href="/dashboard"
                >
                  Dashboard
                </Link>
              </li>
            ) : (
              <></>
            )}
          </ul>
          <div className="navbar-text d-flex me-5 pe-5">
            <div class="btn-group dropdown-center">
              <Link
                className={navFor == "account" ? "nav-link active" : "nav-link"}
                href="/account"
                role="button"
              >
                <em>
                  Welcome {session.user?.name}{" "}
                  <span className="text-body-secondary">
                    ({session.user?.role})
                  </span>
                </em>
              </Link>
              <Link
                role="button"
                href=""
                class="dropdown-toggle dropdown-toggle-split"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                <span class="visually-hidden">Toggle Dropdown</span>
              </Link>
              <ul className="dropdown-menu list-unstyled">
                <div className="text-center">
                  <span className="fw-medium p-1">
                    Interacting as {session.user.role}
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
