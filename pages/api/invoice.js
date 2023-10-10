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

async function handleGetInvoiceDetails(req, res) {
  try {
    const resData = await Invoice.find({});

    if (resData) {
      res.status(200).json(resData);
    } else {
      sendError(res, 400, "Unable to insert the invoice data");
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

export default async function handle(req, res) {
  const { method } = req;

  switch (method) {
    case "GET":
      if (req.headers.getinvoicedetails) {
        await handleGetInvoiceDetails(req, res);
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
