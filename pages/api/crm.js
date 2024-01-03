import User from "../../db/Users";
import dbConnect from "../../db/dbConnect";
import Report from "../../db/Reports";
import Employee from "../../db/Employees";
const moment = require("moment-timezone");

dbConnect();
function sendError(res, statusCode, message) {
  res.status(statusCode).json({
    error: true,
    message: message,
  });
}

const handleGetAllMarketers = async (req, res) => {
  try {
    const userData = await Employee.find({
      department: "Marketing",
      status: "Active",
    });
    res.status(200).json(userData);
  } catch (e) {
    console.error(e);
    sendError(res, 500, "An error occurred");
  }
};

const handleNewReport = async (req, res) => {
  try {
    let data = req.body;
    data = { ...data, calling_date_history: [data.calling_date] };

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
    const ITEMS_PER_PAGE = parseInt(req.headers.item_per_page) || 30;

    let {
      country,
      company_name,
      category,
      marketer_name,
      fromdate,
      todate,
      test,
      prospect,
      generalsearchstring,
    } = req.headers;

    test = test === "true" ? true : false;
    prospect = prospect === "true" ? true : false;

    // Number of items per page

    let query = {};

    if (country) query.country = { $regex: country, $options: "i" };
    if (company_name)
      query.company_name = { $regex: company_name, $options: "i" };
    if (category) query.category = { $regex: category, $options: "i" };
    if (marketer_name)
      query.marketer_name = { $regex: marketer_name, $options: "i" };
    if (test) query.is_test = test;
    if (prospect) query.is_prospected = prospect;

    if (fromdate || todate) {
      query.calling_date = {};
      if (fromdate) {
        query.calling_date.$gte = fromdate;
      }
      if (todate) {
        query.calling_date.$lte = todate;
      }
    }

    let searchQuery = { ...query };

    if (!query && req.headers.isfilter == true && !generalsearchstring) {
      sendError(res, 400, "No filter applied");
    } else {
      const skip = (page - 1) * ITEMS_PER_PAGE;

      if (generalsearchstring) {
        searchQuery = {
          $or: [
            { country: { $regex: generalsearchstring, $options: "i" } },
            { company_name: { $regex: generalsearchstring, $options: "i" } },
            { category: { $regex: generalsearchstring, $options: "i" } },
            { marketer_name: { $regex: generalsearchstring, $options: "i" } },
            { designation: { $regex: generalsearchstring, $options: "i" } },
            { website: { $regex: generalsearchstring, $options: "i" } },
            { contact_person: { $regex: generalsearchstring, $options: "i" } },
            { contact_number: { $regex: generalsearchstring, $options: "i" } },
            { calling_status: { $regex: generalsearchstring, $options: "i" } },
            { email_address: { $regex: generalsearchstring, $options: "i" } },
            { linkedin: { $regex: generalsearchstring, $options: "i" } },
          ],
        };
      }

      const countPromise = Report.countDocuments(searchQuery);
      const reportsPromise = req.headers.notpaginated
        ? Report.find({}).lean()
        : Report.aggregate([
            { $match: searchQuery },
            { $sort: { calling_date: -1 } },
            { $skip: skip },
            { $limit: ITEMS_PER_PAGE },
          ]);

      const [count, reports] = await Promise.all([
        countPromise,
        reportsPromise,
      ]);

      const pageCount = Math.ceil(count / ITEMS_PER_PAGE);

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

const isWeekend = (date) => {
  const dayOfWeek = date.getDay();
  return dayOfWeek === 0 /* Sunday */ || dayOfWeek === 6 /* Saturday */;
};

const getValidWeekDays = (days) => {
  const today = moment().utc();

  const fiveDaysAgo = moment().subtract(days, "days").utc();

  const validWeekdays = [];

  for (let d = moment(fiveDaysAgo); d.isSameOrBefore(today); d.add(1, "day")) {
    if (!isWeekend(d.toDate())) {
      validWeekdays.push({
        calling_date_history: d.utc().format("YYYY-MM-DD"),
      }); // Store valid weekdays
    }
  }
  return validWeekdays;
};

async function handleGetDailyReportsLast5Days(req, res) {
  try {
    let validWeekdays = getValidWeekDays(parseInt(req.headers.days));

    const validDates = validWeekdays.map((day) => day.calling_date_history);

    let resDataPromises = validDates.map((date) =>
      Report.find(
        { calling_date_history: date },
        { marketer_name: 1, is_prospected: 1, is_test: 1 },
      ).lean(),
    );

    let resData = await Promise.all(resDataPromises);
    resData = resData.flat();

    let returnData = resData.reduce((acc, entry) => {
      // Find existing entry for the marketer
      const existingEntry = acc.find(
        (item) => item.marketer_name === entry.marketer_name,
      );

      if (existingEntry) {
        // Update existing entry with new data
        existingEntry.data.total_calls_made += 1;
        if (entry.is_prospected) existingEntry.data.total_prospects += 1;
        if (entry.is_test) existingEntry.data.total_test_jobs += 1;
      } else {
        // Create a new entry if the marketer doesn't exist in the result array
        acc.push({
          marketer_name: entry.marketer_name,
          data: {
            total_calls_made: 1,
            total_prospects: entry.is_prospected ? 1 : 0,
            total_test_jobs: entry.is_test ? 1 : 0,
          },
        });
      }

      return acc;
    }, []);

    if (resData && returnData) {
      res.status(200).json(returnData);
    } else sendError(res, 500, "No data found");
  } catch (e) {
    console.error(e);
    sendError(res, 500, "An error occurred");
  }
}

async function handleGetNearestFollowUps(req, res) {
  try {
    let marketer_name = req.headers.marketer_name;
    let query = {
      followup_done: false,
      followup_date: { $ne: "" },
    };

    if (marketer_name) {
      query.marketer_name = marketer_name;
    }

    let resData = await Report.find(query).sort({ followup_date: 1 }).lean();

    if (marketer_name) {
      res.status(200).json(resData);
    } else {
      let returnData = resData.reduce((acc, entry) => {
        const existingEntry = acc.find(
          (item) => item.marketer_name === entry.marketer_name,
        );

        if (existingEntry) {
          existingEntry.followups_count += 1;
        } else {
          acc.push({
            marketer_name: entry.marketer_name,
            followup_date: entry.followup_date,
            followups_count: 1,
          });
        }

        return acc;
      }, []);

      if (returnData) {
        res.status(200).json(returnData);
      } else {
        sendError(res, 500, "No data found");
      }
    }
  } catch (e) {
    console.error(e);
    sendError(res, 500, "An error occurred");
  }
}

async function handleFinishFollowup(req, res) {
  try {
    let followupDataId = req.headers.id;
    let updatedByName = req.headers.updated_by || null;

    let resData = await Report.findByIdAndUpdate(
      followupDataId,
      {
        updated_by: updatedByName,
        followup_done: true,
      },
      {
        new: true,
      },
    );

    if (resData) {
      res
        .status(200)
        .json({ message: "Succesfully updated the followup status" });
    } else {
      sendError(res, 500, "Unable to update the followup status");
    }
  } catch (e) {
    sendError(res, 500, e.message);
  }
}

async function handleEditReport(req, res) {
  try {
    let data = req.body;
    const updated_by = req.headers.name;
    data = { ...data, updated_by };

    console.log(data);

    const resData = await Report.findByIdAndUpdate(data._id, data, {
      new: true,
    });

    if (resData) {
      res.status(200).json(resData);
    } else {
      sendError(res, 400, "No report found");
    }
  } catch (e) {
    console.error(e);
    sendError(res, 500, "An error occurred");
  }
}

async function handleGetReportById(req, res) {
  try {
    let data = req.headers;

    const resData = await Report.findById(data.id).lean();

    if (!resData) sendError(res, 400, "No report found with the id");
    else res.status(200).json(resData);
  } catch (e) {
    console.error(e);
    sendError(res, 500, "An error occurred");
  }
}

async function handleGetDailyReportsToday(req, res) {
  try {
    const today = moment().utc().format("YYYY-MM-DD");

    let resData = await Report.find({ calling_date_history: today });

    let returnData = resData.reduce((acc, entry) => {
      // Find existing entry for the marketer
      const existingEntry = acc.find(
        (item) => item.marketer_name === entry.marketer_name,
      );

      if (existingEntry) {
        // Update existing entry with new data
        existingEntry.data.total_calls_made += 1;
        if (entry.is_prospected) existingEntry.data.total_prospects += 1;
        if (entry.is_test) existingEntry.data.total_test_jobs += 1;
      } else {
        // Create a new entry if the marketer doesn't exist in the result array
        acc.push({
          marketer_name: entry.marketer_name,
          data: {
            total_calls_made: 1,
            total_prospects: entry.is_prospected ? 1 : 0,
            total_test_jobs: entry.is_test ? 1 : 0,
          },
        });
      }

      return acc;
    }, []);

    if (resData && returnData) {
      res.status(200).json(returnData);
    } else sendError(res, 500, "No data found");
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
      } else if (req.headers.getdailyreportslast5days) {
        await handleGetDailyReportsLast5Days(req, res);
      } else if (req.headers.getnearestfollowups) {
        await handleGetNearestFollowUps(req, res);
      } else if (req.headers.finishfollowup) {
        await handleFinishFollowup(req, res);
      } else if (req.headers.getreportbyid) {
        await handleGetReportById(req, res);
      } else if (req.headers.getdailyreportstoday) {
        await handleGetDailyReportsToday(req, res);
      } else {
        sendError(res, 400, "Not a valid GET request");
      }
      break;

    case "POST":
      if (req.headers.newreport) {
        await handleNewReport(req, res);
      } else if (req.headers.editreport) {
        await handleEditReport(req, res);
      } else {
        sendError(res, 400, "Not a valid POST request");
      }

      break;

    default:
      sendError(res, 400, "Unknown request");
  }
}
