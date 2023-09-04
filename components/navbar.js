import { getSession, useSession } from "next-auth/react";
import { signOut } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import TimeCard from "./timecard";
import { useState, useEffect } from "react";

const cities = [
  "America/New_York",
  "Europe/Paris",
  "Europe/London",
  "Asia/Riyadh",
  "Asia/Dhaka",
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
        <ul className="navbar-nav  me-auto ">
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
          <Link
            className="navbar-brand d-flex align-items-center"
            href="/"
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
                  className={
                    navFor == "browse" ? "nav-link active" : "nav-link"
                  }
                  href="/browse"
                >
                  Browse
                </Link>
              </li>

              {session.user.role == "admin" || session.user.role == "super" ? (
                <li className="nav-item">
                  <Link
                    className={
                      navFor == "admin" ? "nav-link active" : "nav-link"
                    }
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
                    className={
                      navFor == "dashboard" ? "nav-link active" : "nav-link"
                    }
                    href="/dashboard"
                  >
                    Dashboard
                  </Link>
                </li>
              ) : (
                <></>
              )}
            </ul>

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
      <style jsx>
        {`
          /* Other styles... */

          @media (min-width: 992px) {
            .navbar-nav.time-cards-list {
              margin: none;
            }
          }
        `}
      </style>
    </>
  );
}
