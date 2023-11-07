import User from "../../db/Users";
import dbConnect from "../../db/dbConnect";
import Report from "../../db/Reports";
dbConnect();
function sendError(res, statusCode, message) {
  res.status(statusCode).json({
    error: true,
    message: message,
  });
}

const handleGetAllMarketers = async (req, res) => {
  try {
    const data = req.body;

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

async function handleGetAllReports(req, res) {
  try {
    const page = req.headers.page || 1;

    let { country, company_name, category, marketer_name } = req.headers;

    const ITEMS_PER_PAGE = 20; // Number of items per page

    let query = {};

    if (country) query.country = country;
    if (company_name) query.company_name = company_name;
    if (category) query.category = category;
    if (marketer_name) query.marketer_name = marketer_name;

    console.log(query);

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
      else reports = await Report.find(query).skip(skip).limit(ITEMS_PER_PAGE);

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
      } else {
        //
      }

      break;

    default:
      sendError(res, 400, "Unknown request");
  }
}
