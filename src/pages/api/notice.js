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

    if (req.headers.channel) query.channel = req.headers.channel;

    const skip = (page - 1) * ITEMS_PER_PAGE;

    let pipeline = [
      { $match: query },
      { $sort: { createdAt: -1 } },
      { $skip: skip }, // Skip items for pagination
      { $limit: ITEMS_PER_PAGE },
      // {
      //   $project: {
      //     notice_no: 1,
      //     title: 1,
      //     createdAt: 1,
      //     updatedAt: 1,
      //     _id: 1,
      //   },
      // },
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

async function handleGetNoticesByFilter(req, res) {
  try {
    const page = req.headers.page || 1;
    const ITEMS_PER_PAGE = parseInt(req.headers.item_per_page) || 30;

    let { fromtime, totime, notice_no, title } = req.headers;

    let query = {};

    if (req.headers.channel) query.channel = req.headers.channel;
    if (notice_no)
      query.notice_no = { $regex: `^${notice_no}$`, $options: "i" };
    if (title) query.title = { $regex: title, $options: "i" };

    if (fromtime || totime) {
      if (fromtime && totime) {
        query.updatedAt = {
          $gte: fromtime,
          $lte: totime,
        };
      } else if (fromtime) {
        query.updatedAt = {
          $gte: fromtime,
        };
      } else if (todate) {
        query.updatedAt = {
          $lte: totime,
        };
      }
    }

    if (!query) {
      sendError(res, 400, "No filter applied");
    } else {
      const skip = (page - 1) * ITEMS_PER_PAGE;

      const count = await Notice.countDocuments(query);
      const notices = await Notice.aggregate([
        { $match: query },
        {
          $sort: {
            updatedAt: -1,
          },
        },
        { $skip: skip },
        { $limit: ITEMS_PER_PAGE },
      ]);

      const pageCount = Math.ceil(count / ITEMS_PER_PAGE);

      res.status(200).json({
        pagination: {
          count,
          pageCount,
        },
        items: notices,
      });
    }
  } catch (e) {
    console.error(e);
    sendError(res, 500, "An error occurred");
  }
}

async function handleGetNotice(req, res) {
  try {
    const notice = await Notice.findOne({ notice_no: req.headers.notice_no });

    if (notice) {
      res.status(200).json(notice);
    } else {
      sendError(res, 400, "Unable to get the notie from notice number");
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
        "A notice with the same notice number already exists.",
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

async function handleDeleteNotice(req, res) {
  try {
    let data = req.headers;

    let resData = await Notice.findByIdAndDelete(data._id);
    console.log(resData);

    if (resData) {
      res.status(200).json({ message: "Successfully deleted the notice" });
    } else {
      sendError(res, 400, "Unable to delete the notice");
    }
  } catch (e) {
    console.error(e);
    sendError(res, 500, "An error occurred");
  }
}

async function handleEditNotice(req, res) {
  try {
    console.log("HERE");
    let data = req.body;
    const updated_by = req.headers.name;
    data = { ...data, updated_by };

    console.log(data);

    const resData = await Notice.findByIdAndUpdate(data._id, data, {
      new: true,
    });

    if (resData) {
      res.status(200).json(resData);
    } else {
      sendError(res, 400, "No Notice found");
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
      } else if (req.headers.getnoticesbyfilter) {
        await handleGetNoticesByFilter(req, res);
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
        break;
      } else if (req.headers.editnotice) {
        await handleEditNotice(req, res);
        break;
      } else {
        sendError(res, 400, "Not a valid GET request");
      }
    default:
      sendError(res, 400, "Unknown request");
  }
}
