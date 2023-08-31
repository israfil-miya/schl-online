import React from "react";
import { getSession, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

import Navbar from "../components/navbar";

export default function Browse() {
  const { data: session } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState(null);
  const [fromTime, setFromTime] = useState("");
  const [toTime, setToTime] = useState("");
  const [foldetFilter, setFolderFilter] = useState("");
  const [clientFilter, setClientFilter] = useState("");
  const [taskFilter, setTaskFilter] = useState("");
  const [isFiltered, setIsFiltered] = useState(0);
  const [manageData, setManageData] = useState({
    _id: "",
    client_code: "",
    client_name: "",
    folder: "",
    quantity: false,
    download_date: "",
    delivery_date: "",
    delivery_bd_time: "",
    task: "",
    et: false,
    production: "",
    qc1: false,
    comment: "",
    status: "",
  });

  async function fetchOrderData(url, options) {
    const res = await fetch(url, options);
    const data = await res.json();
    return data;
  }

  async function GetAllOrders() {
    try {
      const url = `${process.env.NEXT_PUBLIC_BASE_URL}/api/order`;
      const options = {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          getallorders: true,
        },
      };

      const ordersList = await fetchOrderData(url, options);

      if (!ordersList.error) {
        setOrders(ordersList);
      } else {
        toast.error("Unable to retrieve orders list");
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Error retrieving orders");
    }
  }

  const convertToDDMMYYYY = (dateString) => {
    const [year, month, day] = dateString.split("-");
    return `${day}-${month}-${year}`;
  };

  async function filteredData() {
    let adjustedFromTime = fromTime;
    let adjustedToTime = toTime;

    if (fromTime) {
      adjustedFromTime = convertToDDMMYYYY(fromTime);
    }
    if (toTime) {
      adjustedToTime = convertToDDMMYYYY(toTime);
    }

    const url = `${process.env.NEXT_PUBLIC_BASE_URL}/api/order`;
    const options = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        getordersbyfilter: true,
        folder: foldetFilter,
        client: clientFilter,
        task: taskFilter,
        fromtime: adjustedFromTime,
        totime: adjustedToTime,
      },
    };

    try {
      const orders = await fetchOrderData(url, options);

      if (!orders.error) {
        setIsFiltered(1);
        setOrders(orders);
      } else {
        setIsFiltered(0);
        await GetAllOrders();
      }
    } catch (error) {
      console.error("Error fetching filtered orders:", error);
    }
  }

  const FinishOrder = async (finishOrderData) => {
    const url = `${process.env.NEXT_PUBLIC_BASE_URL}/api/order`;
    const options = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        finishorder: true,
        id: finishOrderData._id,
      },
    };

    try {
      const resData = await fetchOrderData(url, options);

      if (!resData.error) {
        toast.success("Changed the status to FINISHED", {
          duration: 3500,
        });
        if (!isFiltered) await GetAllOrders();
        else await filteredData();
      } else {
        toast.error("Unable to change status");
      }
    } catch (error) {
      console.error("Error changing status:", error);
      toast.error("Error changing status");
    }
  };

  const RedoOrder = async (redoOrderData) => {
    const url = `${process.env.NEXT_PUBLIC_BASE_URL}/api/order`;
    const options = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        redoorder: true,
        id: redoOrderData._id,
      },
    };

    try {
      const resData = await fetchOrderData(url, options);

      if (!resData.error) {
        toast.success("Changed the status to CORRECTION", {
          duration: 3500,
        });
        if (!isFiltered) await GetAllOrders();
        else await filteredData();
      } else {
        toast.error("Unable to change status");
      }
    } catch (error) {
      console.error("Error changing status:", error);
      toast.error("Error changing status");
    }
  };

  async function deleteOrder() {
    const url = `${process.env.NEXT_PUBLIC_BASE_URL}/api/order`;
    const options = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        deleteorder: true,
        id: manageData._id,
      },
    };

    try {
      const resData = await fetchOrderData(url, options);

      if (!resData.error) {
        toast.success("Deleted the order data", {
          duration: 3500,
        });
        if (!isFiltered) await GetAllOrders();
        else await filteredData();
      } else {
        toast.error("Unable to delete order");
      }
    } catch (error) {
      console.error("Error deleting order:", error);
      toast.error("Error deleting order");
    }
  }

  async function editOrder() {
    if (manageData.download_date) {
      manageData.download_date = convertToDDMMYYYY(manageData.download_date);
    }
    if (manageData.delivery_date) {
      manageData.delivery_date = convertToDDMMYYYY(manageData.delivery_date);
    }

    const url = `${process.env.NEXT_PUBLIC_BASE_URL}/api/order`;
    const options = {
      method: "POST",
      body: JSON.stringify(manageData),
      headers: {
        "Content-Type": "application/json",
        editorder: true,
      },
    };

    try {
      const result = await fetchOrderData(url, options);

      if (!result.error) {
        toast.success("Edited the order data", {
          duration: 3500,
        });

        if (!isFiltered) await GetAllOrders();
        else await filteredData();
      } else {
        router.replace(`/admin?error=${result.message}`);
      }
    } catch (error) {
      console.error("Error editing order:", error);
      toast.error("Error editing order");
    }
  }

  useEffect(() => {
    GetAllOrders();
  }, []);


  return (
  <>
<Navbar navFor="dashboard" />





  </>)
}