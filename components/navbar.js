import { getSession, useSession } from "next-auth/react";
import { signOut } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import TimeCard from "./timecard";
import { useState, useEffect } from "react";
import styles from "../styles/NavBar.module.css";

const cities = [
  "Asia/Dhaka",
  "Europe/Paris",
  "Australia/Canberra",
  "America/New_York",
  "Europe/London",
  "Asia/Riyadh",

  // Add more cities as needed
];
export default function Navbar({ navFor }) {
  const { data: session } = useSession();
  const signOutHandle = () => {
    signOut({ callbackUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/login` });
  };

  const [isDesktop, setIsDesktop] = useState(true);

  // Function to handle media query changes
  const handleMediaQueryChange = (mediaQuery) => {
    setIsDesktop(mediaQuery.matches);
  };

  useEffect(() => {
    // Set up the media query
    const mediaQuery = window.matchMedia("(min-width: 992px)");
    setIsDesktop(mediaQuery.matches); // Initial state

    // Attach event listener for media query changes
    mediaQuery.addEventListener("change", handleMediaQueryChange);

    // Clean up by removing event listener
    return () => {
      mediaQuery.removeEventListener("change", handleMediaQueryChange);
    };
  }, []);

  const renderTimeCards = () => {
    // Render time cards only if it's a desktop screen
    if (isDesktop) {
      return (
        <ul className="navbar-nav  m-auto ">
          {cities.map((city, index) => (
            <li className="mx-1" key={index}>
              <TimeCard city={city} />
            </li>
          ))}
        </ul>
      );
    }
    return null; // Return null if not a desktop screen
  };

  return (
    <>
      <nav className="navbar navbar-expand-lg bg-body-tertiary shadow-sm">
        <div className="container-fluid">
          <Link className="navbar-brand d-flex align-items-center" href="/">
            <Image
              priority
              src="/images/NEW-SCH-logo-text-grey.png"
              alt="Logo"
              width="100"
              height="70"
              className="d-inline-block me-2"
            />
            <h4 className="mt-3 fw-semibold">Studio Click House Ltd.</h4>
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
            {renderTimeCards()}

            <div className="navbar-text d-flex me-3">
              <div className="btn-group dropdown-center">
                <Link
                  className={
                    navFor == "account" ? "nav-link active" : "nav-link"
                  }
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
                  className="dropdown-toggle dropdown-toggle-split"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  <span className="visually-hidden">Toggle Dropdown</span>
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

      <div className={`px-5 ${styles.nav}`}>
        <Link
          className={`${styles.navitem} ${
            navFor === "tasks" ? styles.active : ""
          }`}
          href="/"
        >
          Tasks
        </Link>
        {session.user.role !== "user" ? (
          <Link
            className={`${styles.navitem} ${
              navFor === "browse" ? styles.active : ""
            }`}
            href="/browse"
          >
            Browse
          </Link>
        ) : null}
        {session.user.role === "admin" || session.user.role === "super" ? (
          <li
            className={`${styles.navitem} ${
              navFor === "admin" ? styles.active : ""
            } `}
          >
            <a
              href="/admin"
              className="nav-link dropdown-toggle"
              id="navbarDropdownMenuLink"
              data-toggle="dropdown"
              aria-haspopup="true"
              aria-expanded="false"
            >
              Admin
            </a>
            <ul
              className="dropdown-menu"
              aria-labelledby="navbarDropdownMenuLink"
            >
              <li>
                <Link
                  className={`dropdown-item ${styles.dropitem}`}
                  href="/users"
                >
                  Users
                </Link>
              </li>
              <li>
                <Link
                  className={`dropdown-item ${styles.dropitem}`}
                  href="/tasks"
                >
                  Tasks
                </Link>
              </li>
              <li>
                <Link
                  className={`dropdown-item ${styles.dropitem}`}
                  href="/clients"
                >
                  Clients
                </Link>
              </li>
              <li>
                <Link
                  className={`dropdown-item ${styles.dropitem}`}
                  href="/statistics"
                >
                  Statistics
                </Link>
              </li>
            </ul>
          </li>
        ) : null}
        {session.user.role === "super" ? (
          <li
            className={`${styles.navitem} ${
              navFor === "dashboard" ? styles.active : ""
            } `}
          >
            <a
              href="/dashboard"
              className="nav-link dropdown-toggle"
              id="navbarDropdownMenuLink"
              data-toggle="dropdown"
              aria-haspopup="true"
              aria-expanded="false"
            >
              Dashboard
            </a>
            <ul
              className="dropdown-menu"
              aria-labelledby="navbarDropdownMenuLink"
            >
              <li>
                <Link
                  className={`dropdown-item ${styles.dropitem}`}
                  href="/approvals"
                >
                  Approvals
                </Link>
              </li>
              <li className="dropdown-submenu">
                <Link
                  className={`dropdown-item dropdown-toggle ${styles.dropitem}`}
                  href="/invoice"
                >
                  Invoice
                </Link>
                <ul className="dropdown-menu">
                  <li>
                    <Link
                      className={`dropdown-item ${styles.dropitem}`}
                      href="/invoice#create"
                    >
                      Create
                    </Link>
                  </li>
                  <li>
                    <Link
                      className={`dropdown-item ${styles.dropitem}`}
                      href="/invoice#browse"
                    >
                      Browse
                    </Link>
                  </li>
                </ul>
              </li>
            </ul>
          </li>
        ) : null}
      </div>
      <style jsx>
        {`
          @media (min-width: 992px) {
            .navbar-nav.time-cards-list {
              margin: none;
            }
          }

          li:hover > ul.dropdown-menu {
            display: block;
            color: white;
          }
          ul.dropdown-menu {
            background-color: #343a40;
          }
          .dropdown-submenu {
            position: relative;
          }
          .dropdown-submenu > .dropdown-menu {
            top: 0;
            left: 100%;
            margin-top: -6px;
          }

          .dropdown-menu > li > a:hover:after {
            text-decoration: underline;
            transform: rotate(-90deg);
          }
        `}
      </style>
    </>
  );
}
