import Order from "../../db/Orders";
import dbConnect from "../../db/dbConnect";
dbConnect();
function calculateTimeDifference(deliveryDate, deliveryTime) {
  const is12HourFormat = /am|pm/i.test(deliveryTime);
  const [time, meridiem] = deliveryTime.split(/\s+/);
  const [hours, minutes] = time.split(":").map(Number);

  let adjustedHours = hours;
  if (is12HourFormat) {
    if (meridiem.toLowerCase() === "pm" && hours !== 12) {
      adjustedHours = hours + 12;
    }
    if (meridiem.toLowerCase() === "am" && hours === 12) {
      adjustedHours = 0;
    }
  }

  const deliveryDateTime = new Date(deliveryDate);
  deliveryDateTime.setHours(adjustedHours, minutes, 0, 0);

  const currentTime = new Date();
  const timeDifferenceMs = deliveryDateTime - currentTime;

  return timeDifferenceMs;
}

function sendError(res, statusCode, message) {
  res.status(statusCode).json({
    error: true,
    message: message,
  });
}

async function handleNewOrder(req, res) {
  const data = req.body;

  try {
    const resData = await Order.create(data);

    if (resData) {
      res.status(200).json(resData);
    } else {
      sendError(res, 400, "No order found");
    }
  } catch (e) {
    console.error(e);
    sendError(res, 500, "An error occurred");
  }
}

async function handleGetAllOrder(req, res) {
  try {
    const orders = await Order.find().lean();

    const sortedOrders = orders
      .map((order) => ({
        ...order,
        timeDifference: calculateTimeDifference(
          order.delivery_date,
          order.delivery_bd_time,
        ),
      }))
      .sort((a, b) => a.timeDifference - b.timeDifference);

    res.status(200).json(sortedOrders);
  } catch (e) {
    console.error(e);
    sendError(res, 500, "An error occurred");
  }
}

async function handleGetOnlyTime(req, res) {
  try {
    const orders = await Order.find(
      {},
      { delivery_date: 1, delivery_bd_time: 1 },
    ).lean();

    const sortedOrders = orders
      .map((order) => ({
        timeDifference: calculateTimeDifference(
          order.delivery_date,
          order.delivery_bd_time,
        ),
      }))
      .sort((a, b) => a.timeDifference - b.timeDifference);

    res.status(200).json(sortedOrders);
  } catch (e) {
    console.error(e);
    sendError(res, 500, "An error occurred");
  }
}

async function handleEditOrder(req, res) {
  const data = req.body;
  console.log("Received edit request with data:", data);

  try {
    const resData = await Order.findByIdAndUpdate(data._id, data, {
      new: true,
    });

    if (resData) {
      res.status(200).json(resData);
    } else {
      sendError(res, 400, "No order found");
    }
  } catch (e) {
    console.error(e);
    sendError(res, 500, "An error occurred");
  }
}

async function handleGetEntriesByYearAndMonth(req, res) {
  let { year, month, client_code } = req.headers;

  console.log("Received request with parameters:", year, month, client_code);

  try {
    const startDate = new Date(
      Date.UTC(parseInt(year), parseInt(month) - 1, 1),
    );
    const endDate = new Date(startDate);
    endDate.setUTCMonth(endDate.getUTCMonth() + 1);

    console.log("Start Date:", startDate);
    console.log("End Date:", endDate);

    const resData = await Order.find({
      client_code,
      date_today: {
        $gte: `${year}-${month}-01`,
        $lt: `${year}-${month + 1}-01`,
      },
    });

    console.log("RESDATA: ", resData);
    res.status(200).json(resData);
  } catch (e) {
    console.error(e);
    sendError(res, 500, "An error occurred");
  }
}

async function handleDeleteOrder(req, res) {
  const data = req.headers;
  console.log("Received edit request with data:", data);

  try {
    const resData = await Order.findByIdAndDelete(data.id, {
      new: true,
    });

    if (resData) {
      res.status(200).json(resData);
    } else {
      sendError(res, 400, "No order found");
    }
  } catch (e) {
    console.error(e);
    sendError(res, 500, "An error occurred");
  }
}

async function handleGetTimePeriods(req, res) {
  let { client_code } = req.headers;

  console.log("Received request with client code:", client_code);

  try {
    const matchedDocuments = await Order.aggregate([
      {
        $match: { client_code },
      },
      {
        $project: {
          _id: 0,
          year: { $substr: ["$date_today", 0, 4] },
          month: { $substr: ["$date_today", 5, 2] },
        },
      },
      {
        $group: {
          _id: { year: "$year", month: "$month" },
        },
      },
      {
        $match: {
          "_id.year": { $ne: "" }, // Filter out entries with empty year
          "_id.month": { $ne: "" }, // Filter out entries with empty month
        },
      },
      {
        $sort: { "_id.year": -1, "_id.month": -1 }, // Sort by year and month in descending order
      },
      {
        $project: {
          _id: 0,
          year: "$_id.year",
          month: "$_id.month",
        },
      },
    ]);

    console.log("Matched Documents:", matchedDocuments);
    res.status(200).json(matchedDocuments);
  } catch (e) {
    console.error(e);
    sendError(res, 500, "An error occurred");
  }
}

export default async function handle(req, res) {
  const { method } = req;

  switch (method) {
    case "GET":
      if (req.headers.getallorders) {
        await handleGetAllOrder(req, res);
      } else if (req.headers.getonlytime) {
        await handleGetOnlyTime(req, res);
      } else if (req.headers.deleteorder) {
        await handleDeleteOrder(req, res);
      } else if (req.headers.getentriesbyyearandmonth) {
        await handleGetEntriesByYearAndMonth(req, res);
      } else if (req.headers.gettimeperiods) {
        await handleGetTimePeriods(req, res);
      } else {
        sendError(res, 400, "Not a valid GET request");
      }
      break;

    case "POST":
      if (req.headers.editorder) {
        await handleEditOrder(req, res);
      } else {
        await handleNewOrder(req, res);
      }

      break;

    default:
      sendError(res, 400, "Unknown request");
  }
}
