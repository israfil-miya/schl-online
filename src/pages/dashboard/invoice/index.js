import Navbar from "@/components/navbar";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/router";
import Link from "next/link";

export default function Invoice() {
  const [data, setData] = useState({});
  const router = useRouter();
  const [isFiltered, setIsFiltered] = useState(0);
  const [page, setPage] = useState(1);
  const [pageCount, setPageCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const prevPageCount = useRef(0);
  const prevPage = useRef(1);

  let [filters, setFilters] = useState({
    client_code: "",
  });

  async function fetchApi(url, options) {
    const res = await fetch(url, options);
    const data = await res.json();
    return data;
  }

  async function getClientsOrdersByMonth() {
    setIsLoading(true);
    const url = `${process.env.NEXT_PUBLIC_BASE_URL}/api/order`;
    const options = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        getordersbymonth: true,
        page,
      },
    };

    let res = await fetchApi(url, options);

    if (!res.error) {
      setData(res);
      setIsLoading(false);
    } else {
      toast.error(res.message);
    }
  }
  async function getClientsOrdersByMonthFiltered() {
    setIsLoading(true);
    const url = `${process.env.NEXT_PUBLIC_BASE_URL}/api/order`;
    const options = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        getordersbymonth: true,
        client_code: filters.client_code,
      },
    };

    let res = await fetchApi(url, options);

    if (!res.error) {
      setData(res);
      setIsFiltered(1);
      setIsLoading(false);
    } else {
      setIsFiltered(0);
      await getClientsOrdersByMonth();
    }
  }

  useEffect(() => {
    getClientsOrdersByMonth();
  }, []);

  function handlePrevious() {
    setPage((p) => {
      if (p === 1) return p;
      return p - 1;
    });
  }

  function handleNext() {
    setPage((p) => {
      if (p === pageCount) return p;
      return p + 1;
    });
  }

  useEffect(() => {
    if (prevPage.current !== 1 || page > 1) {
      if (data?.pagination?.pageCount == 1) return;
      if (!isFiltered) getClientsOrdersByMonth();
      else getClientsOrdersByMonthFiltered();
    }
    prevPage.current = page;
  }, [page]);

  useEffect(() => {
    if (data?.pagination?.pageCount !== undefined) {
      setPage(1);
      if (prevPageCount.current !== 0) {
        if (!isFiltered) getClientsOrdersByMonth();
      }
      if (data) setPageCount(data?.pagination?.pageCount);
      prevPageCount.current = data?.pagination?.pageCount;
      prevPage.current = 1;
    }
  }, [data?.pagination?.pageCount]);

  return (
    <>
      <Navbar navFor={"dashboard"} />

      <div className="d-flex mt-3">
        <div className="container">
          <div
            className="float-end"
            style={{ display: "flex", alignItems: "center" }}
          >
            <span className="me-3">
              Page{" "}
              <strong>
                {data?.items?.length !== 0 ? page : 0}/{pageCount}
              </strong>
            </span>
            <div
              className="btn-group"
              role="group"
              aria-label="Basic outlined example"
            >
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary"
                disabled={page === 1 || isLoading}
                onClick={handlePrevious}
              >
                Previous
              </button>
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary"
                disabled={page === pageCount || pageCount === 0 || isLoading}
                onClick={handleNext}
              >
                Next
              </button>
            </div>

            <button
              disabled={(pageCount === 0 && !isFiltered) || isLoading}
              type="button"
              data-bs-toggle="offcanvas"
              data-bs-target="#offcanvasNavbar"
              aria-controls="offcanvasNavbar"
              aria-label="Toggle navigation"
              className="btn m-2 btn-sm btn-outline-primary"
            >
              Filter
            </button>
          </div>
        </div>
      </div>

      {isLoading && <p className="text-center my-3">Loading...</p>}

      {data?.items?.length === 0 && !isLoading && (
        <p className="text-center my-3">No data found</p>
      )}

      {!isLoading && data?.items?.length !== 0 && (
        <table className="table table-responsive table-bordered text-center table-striped">
          <thead>
            <tr>
              <th></th>
              {data?.items?.[0]?.orders.map((order, i) => {
                const month = Object.keys(order)[0];
                // return <td key={i}>{month.split(" ")[0]}</td>; <-- to display only month
                return <td key={month}>{month}</td>; // <-- to display month and year
              })}
            </tr>
          </thead>
          <tbody>
            {data?.items?.map((item, index) => {
              return (
                <tr key={index}>
                  <td className="text-start fit ps-4">{item.client_code}</td>
                  {item.orders.map((order, i) => {
                    const month = Object.keys(order)[0];
                    const orderCount = order[month].count;
                    const fileCount = order[month].totalFiles;
                    const isInvoiced = order[month].invoiced;
                    return (
                      <td
                        className={
                          isInvoiced
                            ? "bg-success text-light"
                            : orderCount > 0
                              ? "bg-danger text-light"
                              : "bg-secondary text-light"
                        }
                        key={`${month} - ${orderCount}`}
                      >
                        <Link
                          href={
                            process.env.NEXT_PUBLIC_BASE_URL +
                            `/dashboard/invoice/create?code=${
                              item.client_code
                            }&month=${month.replace(" ", "-")}`
                          }
                          target="_blank"
                        >
                          {orderCount} {fileCount > 0 && `(${fileCount})`}
                        </Link>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      <div
        className="offcanvas offcanvas-end"
        tabIndex="-1"
        id="offcanvasNavbar"
        aria-labelledby="offcanvasNavbarLabel"
      >
        <div className="offcanvas-header">
          <h5 className="offcanvas-title" id="offcanvasNavbarLabel">
            Filter
          </h5>
          <button
            type="button"
            className="btn-close"
            data-bs-dismiss="offcanvas"
            aria-label="Close"
          ></button>
        </div>
        <div className="offcanvas-body">
          <div className="d-grid gap-2">
            <div className="row">
              <div className="col">
                <label className="fw-semibold" htmlFor="floatingInput">
                  Client Code
                </label>
                <input
                  value={filters.client_code}
                  onChange={(e) =>
                    setFilters({ ...filters, client_code: e.target.value })
                  }
                  type="text"
                  className="form-control"
                  id="floatingInput"
                />
              </div>
            </div>
            <button
              onClick={getClientsOrdersByMonthFiltered}
              className="btn btn-outline-primary"
            >
              Search
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .table td.fit,
        .table th.fit {
          white-space: nowrap;
          width: 1%;
        }
      `}</style>
    </>
  );
}
