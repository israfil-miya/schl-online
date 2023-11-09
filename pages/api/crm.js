import User from "../../db/Users";
import dbConnect from "../../db/dbConnect";
import Report from "../../db/Reports";
import DailyReport from "../../db/DailyReports";

dbConnect();
function sendError(res, statusCode, message) {
  res.status(statusCode).json({
    error: true,
    message: message,
  });
}

function yyyyMmDdtoISODate(yyyyMmDd) {
  try {
    const parts = yyyyMmDd.split("-");
    if (parts.length !== 3) {
      throw new Error("Invalid date format: Incorrect number of parts");
    }

    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10);
    const day = parseInt(parts[2], 10);

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
    // console.log(`Converted ${ddMmYyyy} to ISODate: ${isoDate}`);
    return isoDate;
  } catch (error) {
    console.error(`Error converting ${ddMmYyyy} to ISODate: ${error.message}`);
    throw error;
  }
}

const handleGetAllMarketers = async (req, res) => {
  try {
    const userData = await User.find({ role: "marketer" });
    res.status(200).json(userData);
  } catch (e) {
    console.error(e);
    sendError(res, 500, "An error occurred");
  }
};

const handleNewReport = async (req, res) => {
  try {
    const data = req.body;
    const resData = await Report.create(data);

    if (resData) {
      res.status(200).json(resData);
    } else {
      sendError(res, 400, "No order found");
    }
  } catch (e) {
    console.error(e);
    sendError(res, 500, "An error occurred");
  }
};

const handleDailyReport = async (req, res) => {
  try {
    const data = req.body;

    const prevData = await DailyReport.findOne({
      $and: [
        { marketer_name: { $eq: data.marketer_name } },
        { report_date: { $eq: data.report_date } },
      ],
    });

    if (prevData) res.status(200).json({ newReport: false, prevData });
    else {
      const resData = await DailyReport.create(data);
      if (resData) {
        res.status(200).json({ newReport: true, resData });
      } else {
        sendError(res, 400, "Unable to submit");
      }
    }
  } catch (e) {
    console.error(e);
    sendError(res, 500, "An error occurred");
  }
};

async function handleGetAllReports(req, res) {
  try {
    const page = req.headers.page || 1;

    let { country, company_name, category, marketer_name, fromdate, todate } =
      req.headers;

    const ITEMS_PER_PAGE = 20; // Number of items per page

    let query = {};

    if (country) query.country = country;
    if (company_name) query.company_name = company_name;
    if (category) query.category = category;
    if (marketer_name) query.marketer_name = marketer_name;
    if (fromdate || todate) {
      query.createdAt = {};
      if (fromdate) {
        // Set the $gte filter for the start of the day
        query.createdAt.$gte = new Date(yyyyMmDdtoISODate(fromdate));
      }
      if (todate) {
        // Set the $lte filter for the end of the day
        const toTimeDate = new Date(yyyyMmDdtoISODate(todate));
        toTimeDate.setHours(23, 59, 59, 999); // Set to end of the day
        query.createdAt.$lte = toTimeDate;
      }
    }

    if (
      Object.keys(query).length === 0 &&
      query.constructor === Object &&
      req.headers.isfilter == true
    )
      sendError(res, 400, "No filter applied");
    else {
      const skip = (page - 1) * ITEMS_PER_PAGE;

      const count = await Report.countDocuments(query);

      let reports;

      if (req.headers.notpaginated) reports = await Report.find({});
      else
        reports = await Report.find(query)
          .skip(skip)
          .limit(ITEMS_PER_PAGE)
          .sort({ updatedAt: -1 });

      const pageCount = Math.ceil(count / ITEMS_PER_PAGE); // Calculate the total number of pages

      res.status(200).json({
        pagination: {
          count,
          pageCount,
        },
        items: reports,
      });
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
      if (req.headers.getallmarketers) {
        await handleGetAllMarketers(req, res);
      } else if (req.headers.getallreports) {
        await handleGetAllReports(req, res);
      } else {
        sendError(res, 400, "Not a valid GET request");
      }
      break;

    case "POST":
      if (req.headers.newreport) {
        await handleNewReport(req, res);
      } else if (req.headers.dailyreport) {
        await handleDailyReport(req, res);
      } else {
        sendError(res, 400, "Not a valid POST request");
      }

      break;

    default:
      sendError(res, 400, "Unknown request");
  }
}
