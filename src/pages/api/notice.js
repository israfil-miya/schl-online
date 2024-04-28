import dbConnect from "@/db/dbConnect";
import Notice from "@/db/Notices";
dbConnect();

function sendError(res, statusCode, message) {
  res.status(statusCode).json({
    error: true,
    message: message,
  });
}

async function handleGetNotices(req, res) {
  try {
    const page = req.headers.page || 1;
    const ITEMS_PER_PAGE = parseInt(req.headers.item_per_page) || 30;

    let query = {};

    const skip = (page - 1) * ITEMS_PER_PAGE;

    let pipeline = [
      { $match: query },
      { $sort: { createdAt: -1 } },
      { $skip: skip }, // Skip items for pagination
      { $limit: ITEMS_PER_PAGE },
      {
        $project: {
          notice_no: 1,
          title: 1,
          createdAt: 1,
          updatedAt: 1,
          _id: 1,
        },
      },
    ];

    //   console.log(pipeline);

    const count = await Notice.countDocuments(query); // Count the total matching documents

    const notices = await Notice.aggregate(pipeline).exec();

    //   console.log("FILTERED INVOICES: ", invoices.length);

    const pageCount = Math.ceil(count / ITEMS_PER_PAGE); // Calculate the total number of pages

    if (notices) {
      res.status(200).json({
        pagination: {
          count,
          pageCount,
        },
        items: notices,
      });
    } else {
      sendError(res, 400, "Unable to get the invoice data");
    }
  } catch (e) {
    console.error(e);
    sendError(res, 500, "An error occurred");
  }
}

async function handleGetNotice(req, res) {
  try {
    const notices = await Notice.find({ notice_no: req.headers.notice_no });

    if (notices) {
      res.status(200).json(notices);
    } else {
      sendError(res, 400, "Unable to get the invoice data");
    }
  } catch (e) {
    console.error(e);
    sendError(res, 500, "An error occurred");
  }
}

async function handleDeleteNotice(req, res) {
  try {
    let data = req.headers;

    let resData = await Invoice.findByIdAndDelete(data.id);
    console.log(resData);

    if (resData) {
      res.status(200).json({ message: "Successfully deleted the notice" });
    } else {
      sendError(res, 400, "Unable to delete the invoice");
    }
  } catch (e) {
    console.error(e);
    sendError(res, 500, "An error occurred");
  }
}

async function handleStoreNotice(req, res) {
  const data = req.body;

  try {
    const existingNotice = await Notice.findOne({ notice_no: data.notice_no });

    if (existingNotice) {
      sendError(
        res,
        400,
        "A notice with the same notice number already exists."
      );
      return;
    }
    const resData = await Notice.create(data);

    console.log(resData);

    if (resData) {
      res.status(200).json(resData);
    } else {
      sendError(res, 400, "Unable to insert the notice data");
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
      if (req.headers.getnotices) {
        await handleGetNotices(req, res);
      } else if (req.headers.getnotice) {
        await handleGetNotice(req, res);
      } else if (req.headers.deletenotice) {
        await handleDeleteNotice(req, res);
      } else {
        sendError(res, 400, "Not a valid GET request");
      }
      break;
    case "POST":
      if (req.headers.storenotice) {
        await handleStoreNotice(req, res);
      }
      break;
    default:
      sendError(res, 400, "Unknown request");
  }
}
