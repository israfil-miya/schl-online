import { getSession, useSession } from "next-auth/react";
import { signOut } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import TimeCard from "./timecard";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import styles from "../styles/NavBar.module.css";
import { UilSignOutAlt, UilUserCircle } from "@iconscout/react-unicons";

const cities = [
  "Asia/Dhaka",
  "Europe/Paris",
  "Australia/Canberra",
  "America/New_York",
  "Europe/London",
  "Asia/Riyadh",

  // Add more cities as needed
];
export default function Navbar({ navFor, shortNote }) {
  const { data: session } = useSession();
  const router = useRouter();
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
              <Link href={"/protected?redirect=" + "/account/profile"} target="_blank">
                <button
                  className="btn btn-outline-primary btn-sm me-2"
                >
                  Account <UilUserCircle />
                </button>
              </Link>

              <button
                onClick={signOutHandle}
                className="btn btn-sm btn-outline-danger"
              >
                Logout <UilSignOutAlt />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className={`px-5 navigation ${styles.nav}`}>
        {session.user.role !== "marketer" ? (
          <Link
            className={`${styles.navitem} ${navFor === "tasks" ? styles.active : ""
              }`}
            href="/"
          >
            Tasks
          </Link>
        ) : null}
        {session.user.role !== "user" && session.user.role !== "marketer" ? (
          <Link
            className={`${styles.navitem} ${navFor === "browse" ? styles.active : ""
              }`}
            href="/browse"
          >
            Browse
          </Link>
        ) : null}

        {session.user.role === "admin" || session.user.role === "super" ? (
          <li
            className={`${styles.navitem} ${navFor === "admin" ? styles.active : ""
              } `}
          >
            <li
              className="nav-link dropdown-toggle"
              id="navbarDropdownMenuLink"
              data-toggle="dropdown"
              aria-haspopup="true"
              aria-expanded="false"
            >
              Admin
            </li>
            <ul
              className="dropdown-menu"
              aria-labelledby="navbarDropdownMenuLink"
            >
              <li>
                <Link
                  className={`dropdown-item ${styles.dropitem}`}
                  href="/admin/users"
                >
                  Users
                </Link>
              </li>

              <li>
                <Link
                  className={`dropdown-item ${styles.dropitem}`}
                  href="/admin/employees"
                  target="_blank"
                >
                  Employees
                </Link>
              </li>

              <li>
                <Link
                  className={`dropdown-item ${styles.dropitem}`}
                  href="/admin/tasks"
                >
                  Tasks
                </Link>
              </li>
              <li className="dropdown-submenu">
                <li
                  className={`dropdown-item dropdown-toggle ${styles.dropitem}`}
                >
                  Clients
                </li>
                <ul className="dropdown-menu">
                  <li>
                    <Link
                      className={`dropdown-item ${styles.dropitem}`}
                      href="/admin/clients/create"
                    >
                      Create
                    </Link>
                  </li>
                  <li>
                    <Link
                      className={`dropdown-item ${styles.dropitem}`}
                      href="/admin/clients/client-database"
                    >
                      View
                    </Link>
                  </li>
                </ul>
              </li>
            </ul>
          </li>
        ) : null}
        {session.user.role === "super" ? (
          <li
            className={`${styles.navitem} ${navFor === "dashboard" ? styles.active : ""
              } `}
          >
            <li
              className="nav-link dropdown-toggle"
              id="navbarDropdownMenuLink"
              data-toggle="dropdown"
              aria-haspopup="true"
              aria-expanded="false"
            >
              Dashboard
            </li>
            <ul
              className="dropdown-menu"
              aria-labelledby="navbarDropdownMenuLink"
            >
              <li>
                <Link
                  className={`dropdown-item ${styles.dropitem}`}
                  href="/dashboard/approvals"
                >
                  Approvals
                </Link>
              </li>

              <li>
                <Link
                  className={`dropdown-item ${styles.dropitem}`}
                  href="/dashboard/employee/database"
                >
                  Employees
                </Link>
              </li>

              <li className="dropdown-submenu">
                <li
                  className={`dropdown-item dropdown-toggle ${styles.dropitem}`}
                >
                  Invoice
                </li>
                <ul className="dropdown-menu">
                  <li>
                    <Link
                      className={`dropdown-item ${styles.dropitem}`}
                      href="/dashboard/invoice/create"
                      target="_blank"
                    >
                      Create
                    </Link>
                  </li>
                  <li>
                    <Link
                      className={`dropdown-item ${styles.dropitem}`}
                      href="/dashboard/invoice/browse"
                    >
                      View
                    </Link>
                  </li>
                </ul>
              </li>
            </ul>
          </li>
        ) : null}

        {session.user.role === "admin" || session.user.role === "super" ? (
          <Link
            className={`${styles.navitem} ${navFor === "fileflow" ? styles.active : ""
              }`}
            href="/file-flow"
          >
            File Flow
          </Link>
        ) : null}

        {session.user.role === "admin" || session.user.role === "super" ? (
          <li
            className={`${styles.navitem} ${navFor === "crm" ? styles.active : ""
              } `}
          >
            <li
              className="nav-link dropdown-toggle"
              id="navbarDropdownMenuLink"
              data-toggle="dropdown"
              aria-haspopup="true"
              aria-expanded="false"
            >
              <Link
                target="_blank"
                href={
                  session.user.role === "marketer"
                    ? `/crm/marketers`
                    : "/crm/marketers"
                }
              >
                CRM
              </Link>
            </li>

            <ul
              className="dropdown-menu"
              aria-labelledby="navbarDropdownMenuLink"
            >
              <li>
                <Link
                  className={`dropdown-item ${styles.dropitem}`}
                  href="/crm/marketers"
                  target="_blank"
                >
                  Marketers
                </Link>
              </li>
              <li>
                <Link
                  className={`dropdown-item ${styles.dropitem}`}
                  href="/crm/reports-database"
                  target="_blank"
                >
                  Call Reports
                </Link>
              </li>
              <li>
                <Link
                  className={`dropdown-item ${styles.dropitem}`}
                  href="/crm/lead-mine"
                  target="_blank"
                >
                  Lead Mine
                </Link>
              </li>
            </ul>
          </li>
        ) : null}

        {session.user.role === "marketer" ? (
          <>
            <Link
              className={`${styles.navitem} ${navFor === "marketers" ? styles.active : ""
                }`}
              href="/crm/marketers"
            >
              Marketers
            </Link>
            <Link
              className={`${styles.navitem} ${navFor === "call-reports" ? styles.active : ""
                }`}
              href="/crm/reports-database"
            >
              Call Reports
            </Link>

            <Link
              className={`${styles.navitem} ${navFor === "report-submition" ? styles.active : ""
                }`}
              href={`/crm/marketer/report`}
            >
              Report Submition
            </Link>
            <Link
              className={`${styles.navitem} ${navFor === "lead-mine" ? styles.active : ""
                }`}
              href={`/crm/lead-mine`}
            >
              Lead Mine
            </Link>
          </>
        ) : null}

        {shortNote ? (
          <div style={{ color: "white" }} className="pt-2 ms-auto">
            {shortNote}
          </div>
        ) : (
          <div style={{ color: "white" }} className="pt-2 ms-auto">
            Have a good day!
          </div>
        )}
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
          div.navigation ul.dropdown-menu {
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
