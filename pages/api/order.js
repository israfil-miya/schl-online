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

  function getCurrentAsiaDhakaTime() {
    const now = new Date();
    const asiaDhakaTime = new Date(
      now.toLocaleString("en-US", { timeZone: "Asia/Dhaka" })
    );
    return asiaDhakaTime;
  }

  const asiaDhakaTime = getCurrentAsiaDhakaTime();

  // Convert deliveryDate to a valid JavaScript Date object
  const [day, month, year] = deliveryDate.split("-").map(Number);
  const deliveryDateTime = new Date(
    year,
    month - 1,
    day,
    adjustedHours,
    minutes,
    0,
    0
  );

  const timeDifferenceMs = deliveryDateTime - asiaDhakaTime;

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

async function handleGetOrdersUnFinished(req, res) {
  try {
    const orders = await Order.find({
      status: { $nin: ["Finished", "Correction", "Test"] },
    }).lean();

    if (!orders) res.status(200).json([]);

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
    sendError(res, 500, ["An error occurred"]);
  }
}

async function handleGetOrdersRedo(req, res) {
  try {
    const orders = await Order.find({
      status: { $in: ["Correction", "Test"], $ne: "Finished" },
    }).lean();

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

async function handleGetAllOrderPaginated(req, res) {
  const ITEMS_PER_PAGE = 20;
  const page = req.headers.page || 1;

  // Put all your query params in here
  const query = {};

  try {
    const skip = (page - 1) * ITEMS_PER_PAGE; // Calculate the number of items to skip

    // Add a new field "customSortField" based on your custom sorting criteria
    const pipeline = [
      { $match: query }, // Apply the query filter
      {
        $addFields: {
          customSortField: {
            $cond: {
              if: {
                $or: [
                  { $eq: ["$status", "Correction"] },
                  { $eq: ["$status", "Test"] },
                ],
              },
              then: 0,
              else: {
                $cond: {
                  if: { $ne: ["$status", "Finished"] },
                  then: 1,
                  else: 2,
                },
              },
            },
          },
        },
      },
      { $sort: { customSortField: 1 } }, // Sort the documents based on "customSortField"
      { $skip: skip }, // Skip items for pagination
      { $limit: ITEMS_PER_PAGE }, // Limit the number of items per page
    ];

    const count = await Order.estimatedDocumentCount(query);

    // Execute the aggregation pipeline and convert the result to an array
    const orders = await Order.aggregate(pipeline).exec();

    const pageCount = Math.ceil(count / ITEMS_PER_PAGE); // Calculate the total number of pages

    // Send the response with pagination information and sorted, paginated data
    res.status(200).json({
      pagination: {
        count,
        pageCount,
      },
      items: orders,
    });
  } catch (e) {
    console.error(e);
    sendError(res, 500, "An error occurred");
  }
}

async function handleGetOrdersById(req, res) {
  try {
    let data = req.headers;
    const orders = await Order.findById(data.id).lean();

    if (!orders) sendError(res, 400, "No order found with the id");
    else res.status(200).json(orders);
  } catch (e) {
    console.error(e);
    sendError(res, 500, "An error occurred");
  }
}

// async function handleGetOrdersByFilter(req, res) {
//   try {
//     const { fromtime, totime, folder, client, task } = req.headers;

//     const pipeline = [];

//     if (folder) pipeline.push({ $match: { folder } });
//     if (client) pipeline.push({ $match: { client_code: client } });
//     if (task) pipeline.push({ $match: { task } });

//     if (fromtime || totime) {
//       const dateFilter = {};
//       if (fromtime) dateFilter.$gte = new Date(fromtime);
//       if (totime) dateFilter.$lte = new Date(totime);

//       // Add checks to ensure dates are not undefined before conversion
//       if (dateFilter.$gte) {
//         dateFilter.$gte = dateFilter.$gte.toISOString();
//       }
//       if (dateFilter.$lte) {
//         dateFilter.$lte = dateFilter.$lte.toISOString();
//       }

//       pipeline.push({
//         $match: {
//           date_today: dateFilter, // No need to use $gte and $lte here
//         },
//       });
//     }

//     pipeline.push({ $project: { _id: 0 } }); // Exclude _id field if needed

//     const orders = await Order.aggregate(pipeline);

//     orders?.map((order, index) => {
//       console.log(`${index}| ${order.date_today}`);
//     });
//     console.log(orders.length)

//     res.status(200).json(orders);
//   } catch (e) {
//     console.error(e);
//     sendError(res, 500, "An error occurred");
//   }
// }




function ddMmYyyyToIsoDate(ddMmYyyy) {
  try {
    const parts = ddMmYyyy.split('-');
    if (parts.length !== 3) {
      throw new Error('Invalid date format: Incorrect number of parts');
    }

    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10);
    const year = parseInt(parts[2], 10);

    if (isNaN(day) || isNaN(month) || isNaN(year)) {
      throw new Error('Invalid date format: Parts are not numbers');
    }

    // Months are 0-based in JavaScript, so subtract 1 from the month
    const date = new Date(year, month - 1, day);

    if (isNaN(date.getTime())) {
      throw new Error('Invalid date: Resulting date is NaN');
    }

    // Convert to ISODate format
    const isoDate = date.toISOString();
    console.log(`Converted ${ddMmYyyy} to ISODate: ${isoDate}`);
    return isoDate;
  } catch (error) {
    console.error(`Error converting ${ddMmYyyy} to ISODate: ${error.message}`);
    throw error;
  }
}




// async function handleGetOrdersyFilter(req, res) {
//   try {
//     const { fromtime, totime, folder, client, task } = req.headers;
//     const page = req.headers.page || 1;
//     const ITEMS_PER_PAGE = 20; // Number of items per page

//     console.log(`Received fromtime: ${fromtime}, totime: ${totime}`);

//     // Convert fromtime and totime to ISODate format directly
//     const adjustedFromtime = ddMmYyyyToIsoDate(fromtime);
//     const adjustedTotime = ddMmYyyyToIsoDate(totime);

//     console.log(`Adjusted fromtime: ${adjustedFromtime}, totime: ${adjustedTotime}`);

//     let query = {
//       createdAt: { $gte: adjustedFromtime, $lte: adjustedTotime }
//     };

//     console.log(query);

//     const count = await Order.countDocuments(query); // Count the total matching documents

//     const orders = await Order.find(query);

//     orders?.map((order, index) => {
//       console.log(`${index}| ${order.date_today}`);
//     });
//     console.log(`Total orders found: ${orders.length}`);

//     const pageCount = Math.ceil(count / ITEMS_PER_PAGE); // Calculate the total number of pages

//     // Calculate the number of documents to skip based on the current page
//     const skip = (page - 1) * ITEMS_PER_PAGE;

//     res.status(200).json({
//       pagination: {
//         count,
//         pageCount,
//       },
//       items: orders,
//     });
//   } catch (e) {
//     console.error(e);
//     sendError(res, 500, "An error occurred");
//   }
// }








async function handleGetOrdersByFilter (req, res) {
  try {
    const { fromtime, totime, folder, client, task } = req.headers;
    const page = req.headers.page || 1;
    const ITEMS_PER_PAGE = 20; // Number of items per page

    console.log(
      "Received request with parameters:",
      fromtime,
      totime,
      folder,
      client,
      task,
      page
    );




    let query = {};
    if (folder) query.folder = folder;
    if (client) query.client_code = client;
    if (task) query.task = task;
    if (fromtime || totime) {
      query.createdAt = {}
      if (fromtime) query.createdAt.$gte= ddMmYyyyToIsoDate(fromtime);
      if (totime) query.createdAt.$lte= ddMmYyyyToIsoDate(totime);
    }

    console.log(query);

    if (Object.keys(query).length === 0 && query.constructor === Object)
      sendError(res, 400, "No filter applied");
    else {
      // Calculate the number of documents to skip based on the current page
    const skip = (page - 1) * ITEMS_PER_PAGE;
    
    const pipeline = [ { $match: query } ];

    
      const count = await Order.countDocuments(query); // Count the total matching documents

      const orders = await Order.aggregate(pipeline).exec()

      console.log("FILTERED ORDERS: ", orders)

      const pageCount = Math.ceil(count / ITEMS_PER_PAGE); // Calculate the total number of pages

      res.status(200).json({
        pagination: {
          count,
          pageCount,
        },
        items: orders,
      });
    }
  } catch (e) {
    console.error(e);
    sendError(res, 500, "An error occurred");
  }
}




async function handleGetOnlyTime(req, res) {
  try {
    const orders = await Order.find(
      { status: { $nin: ["Finished", "Correction", "Test"] } },
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

async function handleFinishOrder(req, res) {
  try {
    const data = req.headers;
    console.log("Received edit request with data:", data);

    const resData = await Order.findByIdAndUpdate(
      data.id,
      { status: "Finished" },
      {
        new: true,
      }
    );

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

async function handleRedoOrder(req, res) {
  try {
    const data = req.headers;
    console.log("Received edit request with data:", data);

    const resData = await Order.findByIdAndUpdate(
      data.id,
      { status: "Correction" },
      {
        new: true,
      }
    );

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
        await handleGetAllOrderPaginated(req, res);
      } else if (req.headers.getonlytime) {
        await handleGetOnlyTime(req, res);
      } else if (req.headers.deleteorder) {
        await handleDeleteOrder(req, res);
      } else if (req.headers.getordersbyfilter) {
        await handleGetOrdersByFilter(req, res);
      } else if (req.headers.getordersunfinished) {
        await handleGetOrdersUnFinished(req, res);
      } else if (req.headers.getordersredo) {
        await handleGetOrdersRedo(req, res);
      } else if (req.headers.finishorder) {
        await handleFinishOrder(req, res);
      } else if (req.headers.redoorder) {
        await handleRedoOrder(req, res);
      } else if (req.headers.getordersbyid) {
        await handleGetOrdersById(req, res);
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
