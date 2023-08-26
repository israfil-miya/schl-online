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
  try {
    const data = req.body;
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

async function handleGetOrdersUnfinished(req, res) {
  try {
    const orders = await Order.find({ status: { $ne: "FINISHED" } }).lean();

    const sortedOrders = orders
      .map((order) => ({
        ...order,
        timeDifference: calculateTimeDifference(
          order.delivery_date,
          order.delivery_bd_time
        ),
      }))
      .sort((a, b) => a.timeDifference - b.timeDifference);

    res.status(200).json(sortedOrders);
  } catch (e) {
    console.error(e);
    sendError(res, 500, "An error occurred");
  }
}

async function handleGetAllOrder(req, res) {
  try {
    const orders = await Order.find().lean();

    res.status(200).json(orders);
  } catch (e) {
    console.error(e);
    sendError(res, 500, "An error occurred");
  }
}

async function handleGetOrdersByFilter(req, res) {
  try {
    const { fromtime, totime, folder, client, task } = req.headers;

    console.log(
      "Received request with parameters:",
      fromtime,
      totime,
      folder,
      client,
      task
    );

    let query = {};
    if (folder) query.folder = folder;
    if (client) query.client_code = client;
    if (task) query.task = task;
    if (fromtime || totime) {
      query.date_today = {};
      if (fromtime) query.date_today.$gte = fromtime;
      if (totime) query.date_today.$lte = totime;
    }

    if (Object.keys(query).length === 0 && query.constructor === Object)
      sendError(res, 400, "No filter applied");
    else {
      const orders = await Order.find(query).lean();

      res.status(200).json(orders);
    }
  } catch (e) {
    console.error(e);
    sendError(res, 500, "An error occurred");
  }
}

async function handleGetOnlyTime(req, res) {
  try {
    const orders = await Order.find(
      { status: { $ne: "FINISHED" } },
      { delivery_date: 1, delivery_bd_time: 1 }
    ).lean();

    const sortedOrders = orders
      .map((order) => ({
        timeDifference: calculateTimeDifference(
          order.delivery_date,
          order.delivery_bd_time
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
  try {
    const data = req.body;
    console.log("Received edit request with data:", data);
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

async function handleDeleteOrder(req, res) {
  try {
    const data = req.headers;
    console.log("Received edit request with data:", data);

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
      } else if (req.headers.getordersbyfilter) {
        await handleGetOrdersByFilter(req, res);
      } else if (req.headers.getordersunfinished) {
        await handleGetOrdersUnfinished(req, res);
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
