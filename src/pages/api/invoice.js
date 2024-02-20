import Invoice from "../../db/Invoices";
import dbConnect from "../../db/dbConnect";
import Client from "../../db/Clients";
dbConnect();
function sendError(res, statusCode, message) {
  res.status(statusCode).json({
    error: true,
    message: message,
  });
}

function ddMmYyyyToIsoDate(ddMmYyyy) {
  try {
    const parts = ddMmYyyy.split("-");
    if (parts.length !== 3) {
      throw new Error("Invalid date format: Incorrect number of parts");
    }

    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10);
    const year = parseInt(parts[2], 10);

    if (isNaN(day) || isNaN(month) || isNaN(year)) {
      throw new Error("Invalid date format: Parts are not numbers");
    }

    // Months are 0-based in JavaScript, so subtract 1 from the month
    const date = new Date(Date.UTC(year, month - 1, day, 0, 0, 0)); // Set time to midnight in UTC

    if (isNaN(date.getTime())) {
      throw new Error("Invalid date: Resulting date is NaN");
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
async function handleGetInvoicesByFilter(req, res) {
  try {
    const { fromtime, totime, client, invoicenumber, filename } = req.headers;
    const page = parseInt(req.headers.page);
    const ITEMS_PER_PAGE = 50; // Number of items per page

    console.log(
      "Received request with parameters:",
      fromtime,
      totime,
      client,
      invoicenumber,
      page,
    );

    let query = {};
    if (client) query.client_code = client;
    if (invoicenumber) query.invoice_number = invoicenumber;

    // currently doesn't actually filter by filename but by the invoice number that is appended after the filename
    if (filename.split("invoice_studioclickhouse_")[1])
      query.invoice_number = filename.split("invoice_studioclickhouse_")[1];

    if (fromtime || totime) {
      query.createdAt = {};
      if (fromtime) {
        // Set the $gte filter for the start of the day
        query.createdAt.$gte = new Date(ddMmYyyyToIsoDate(fromtime));
      }
      if (totime) {
        // Set the $lte filter for the end of the day
        const toTimeDate = new Date(ddMmYyyyToIsoDate(totime));
        toTimeDate.setHours(23, 59, 59, 999); // Set to end of the day
        query.createdAt.$lte = toTimeDate;
      }
    }

    console.log(query);

    if (Object.keys(query).length === 0 && query.constructor === Object)
      sendError(res, 400, "No filter applied");
    else {
      // Calculate the number of documents to skip based on the current page
      const skip = (page - 1) * ITEMS_PER_PAGE;

      let pipeline = [
        { $match: query },
        { $sort: { createdAt: -1 } },
        { $skip: skip }, // Skip items for pagination
        { $limit: ITEMS_PER_PAGE },
      ];

      const count = await Invoice.countDocuments(query); // Count the total matching documents

      const invoices = await Invoice.aggregate(pipeline).exec();

      console.log("FILTERED INVOICES: ", invoices.length);

      const pageCount = Math.ceil(count / ITEMS_PER_PAGE); // Calculate the total number of pages

      if (invoices) {
        res.status(200).json({
          pagination: {
            count,
            pageCount,
          },
          items: invoices,
        });
      } else {
        sendError(res, 400, "Unable to get the invoice data");
      }
    }
  } catch (e) {
    console.error(e);
    sendError(res, 500, "An error occurred");
  }
}
async function handleGetInvoiceDetails(req, res) {
  try {
    const page = parseInt(req.headers.page);
    const ITEMS_PER_PAGE = 50; // Number of items per page

    let query = {};

    const skip = (page - 1) * ITEMS_PER_PAGE;

    let pipeline = [
      { $match: query },
      { $sort: { createdAt: -1 } },
      { $skip: skip }, // Skip items for pagination
      { $limit: ITEMS_PER_PAGE },
    ];

    console.log(pipeline);

    const count = await Invoice.countDocuments(query); // Count the total matching documents

    const invoices = await Invoice.aggregate(pipeline).exec();

    console.log("FILTERED INVOICES: ", invoices.length);

    const pageCount = Math.ceil(count / ITEMS_PER_PAGE); // Calculate the total number of pages

    if (invoices) {
      res.status(200).json({
        pagination: {
          count,
          pageCount,
        },
        items: invoices,
      });
    } else {
      sendError(res, 400, "Unable to get the invoice data");
    }
  } catch (e) {
    console.error(e);
    sendError(res, 500, "An error occurred");
  }
}
async function handleStoreInvoiceDetails(req, res) {
  const data = req.body;

  try {
    const resData = await Invoice.create(data);
    const resData2 = await Client.findByIdAndUpdate(data.client_id, {
      last_invoice_number: data.invoice_number,
    });

    if (resData && resData2) {
      res.status(200).json(resData);
    } else {
      sendError(res, 400, "Unable to insert the invoice data");
    }
  } catch (e) {
    console.error(e);
    sendError(res, 500, "An error occurred");
  }
}

async function handleDeleteInvoice(req, res) {
  try {
    let data = req.headers;

    let resData = await Invoice.findOneAndDelete({
      invoice_number: data.filename
        .split("invoice_studioclickhouse_")[1]
        .replace(".xlsx", ""),
    });
    console.log(resData);

    if (resData) {
      res.status(200).json({ message: "Successfully deleted the invoice" });
    } else {
      sendError(res, 400, "Unable to delete the invoice");
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
      if (req.headers.getinvoicedetails) {
        await handleGetInvoiceDetails(req, res);
      } else if (req.headers.getinvoicesbyfilter) {
        await handleGetInvoicesByFilter(req, res);
      } else if (req.headers.deletefile) {
        await handleDeleteInvoice(req, res);
      } else {
        sendError(res, 400, "Not a valid GET request");
      }
      break;
    case "POST":
      if (req.headers.storeinvoicedetails) {
        await handleStoreInvoiceDetails(req, res);
      }
      break;
    default:
      sendError(res, 400, "Unknown request");
  }
}
