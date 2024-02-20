import User from "@/db/Users";
import dbConnect from "@/db/dbConnect";
import Report from "@/db/Reports";
import Employee from "@/db/Employees";
const moment = require("moment-timezone");

dbConnect();
function sendError(res, statusCode, message) {
  res.status(statusCode).json({
    error: true,
    message: message,
  });
}

const isWeekend = (date) => {
  const dayOfWeek = date.getDay();
  return dayOfWeek === 0 /* Sunday */ || dayOfWeek === 6 /* Saturday */;
};

const getValidWeekDays = (startDate, endDate) => {
  const start = moment(startDate, "YYYY-MM-DD");
  const end = moment(endDate, "YYYY-MM-DD");

  const validWeekdays = [];

  for (let d = moment(start); d.isSameOrBefore(end); d.add(1, "day")) {
    if (!isWeekend(d.toDate())) {
      validWeekdays.push({
        calling_date_history: d.format("YYYY-MM-DD"),
      }); // Store valid weekdays
    }
  }
  return validWeekdays;
};

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

    if (data.is_lead) {
      let existingReportData = await Report.findOne({
        company_name: data.company_name,
      });

      if (!existingReportData) {
        let newReportData = await Report.create(data);

        if (newReportData) {
          res.status(200).json(newReportData);
        } else {
          sendError(res, 400, "Unable to create a new report");
        }
      } else {
        sendError(res, 400, "This lead already exists in database");
      }
    } else {
      let newReportData = await Report.create(data);

      if (newReportData) {
        res.status(200).json(newReportData);
      } else {
        sendError(res, 400, "Unable to create a new report");
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
      onlylead,
    } = req.headers;

    test = test === "true" ? true : false;
    prospect = prospect === "true" ? true : false;
    onlylead = onlylead === "true" ? true : false;

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
    query.is_lead = onlylead || false;

    // Only recalls are being excluded if no new call was made in the time period, only recalls were made.
    // Need to work here!

    if (fromdate || todate) {
      if (fromdate && todate) {
        // Both fromdate and todate are specified
        query.calling_date_history = {
          $elemMatch: {
            $gte: fromdate,
            $lte: todate,
          },
        };
      } else if (fromdate) {
        // Only fromdate is specified
        query.calling_date_history = {
          $elemMatch: {
            $gte: fromdate,
          },
        };
      } else if (todate) {
        // Only todate is specified
        query.calling_date_history = {
          $elemMatch: {
            $lte: todate,
          },
        };
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
          is_lead: onlylead,
        };
      }

      const countPromise = Report.countDocuments(searchQuery);
      const reportsPromise = req.headers.notpaginated
        ? Report.find({}).lean()
        : Report.aggregate([
            { $match: searchQuery },
            {
              $sort: {
                createdAt: -1,
              },
            },
            { $skip: skip },
            { $limit: ITEMS_PER_PAGE },
          ]);

      console.log("SEARCH Query:", searchQuery);

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

const getTodayDate = () => {
  const today = new Date();

  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  return formatDate(today);
};

async function handleFinishLead(req, res) {
  try {
    let leadDataId = req.headers.id;
    let updatedByName = req.headers.updated_by || null;

    let leadData = await Report.findByIdAndUpdate(
      leadDataId,
      {
        updated_by: updatedByName,
        is_lead: true,
        lead_withdrawn: true,
      },
      {
        new: true,
      },
    );

    if (leadData) {
      let callReportData = await Report.create({
        calling_date: getTodayDate(),
        followup_date: leadData.followup_date,
        country: leadData.country,
        website: leadData.website,
        category: leadData.category,
        company_name: leadData.company_name,
        contact_person: leadData.contact_person,
        designation: leadData.designation,
        contact_number: leadData.contact_number,
        email_address: leadData.email_address,
        calling_status: leadData.calling_status,
        calling_date_history: [getTodayDate()],
        linkedin: leadData.linkedin,
        marketer_id: leadData.marketer_id,
        marketer_name: leadData.marketer_name,
        is_test: leadData.is_test,
        is_prospected: leadData.is_prospected,
        is_lead: false,
        lead_withdrawn: true,
      });

      if (callReportData) {
        res.status(200).json({ message: "Succesfully withdrawn the lead" });
      } else {
        sendError(res, 500, "Unable to withdraw the lead");
      }
    } else {
      sendError(res, 500, "Unable to update the lead status");
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

async function handleGetNearestFollowUps(req, res) {
  try {
    let marketer_name = req.headers.marketer_name;
    let query = {
      is_lead: false,
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

async function handleGetDailyReportsLastDays(req, res) {
  try {
    // Get valid weekdays from headers
    let validWeekdays = getValidWeekDays(
      req.headers.fromtime,
      req.headers.totime,
    );
    // Extract calling dates from valid weekdays
    const validDates = validWeekdays.map((day) => day.calling_date_history);

    // // Fetch reports for each valid date
    // let resDataPromises = validDates.map((date) =>
    //   Report.find(
    //     { calling_date_history: date },
    //     {
    //       marketer_name: 1,
    //       is_prospected: 1,
    //       is_test: 1,
    //       is_lead: 1,
    //       calling_date_history: 1,
    //     },
    //   ).lean(),
    // );

    // // Execute promises in parallel
    // let resData = await Promise.all(resDataPromises);
    // // Flatten the array of results
    // resData = resData.flat();

    let resData = await Report.find(
      { calling_date_history: { $elemMatch: { $in: validDates } } },
      {
        marketer_name: 1,
        is_prospected: 1,
        is_test: 1,
        is_lead: 1,
        calling_date_history: 1,
      },
    ).lean();

    // Track which documents have already been counted
    let countedDocuments = new Set();

    // Aggregate data for each marketer
    let returnData = resData.reduce((acc, entry) => {
      // Skip counting if this document has already been counted
      if (countedDocuments.has(entry._id)) {
        return acc;
      }

      // Add this document to the set of counted documents
      countedDocuments.add(entry._id);

      // Count total calls made considering all dates in calling_date_history
      const totalCallsMade = validDates.reduce((total, date) => {
        if (entry.calling_date_history.includes(date)) {
          return total + 1;
        }
        return total;
      }, 0);

      // Find existing entry for the marketer
      const existingEntry = acc.find(
        (item) => item.marketer_name === entry.marketer_name,
      );

      if (existingEntry) {
        if (!entry.is_lead) {
          existingEntry.data.total_calls_made += totalCallsMade;
          if (entry.is_prospected) existingEntry.data.total_prospects++;
          if (entry.is_test) existingEntry.data.total_test_jobs++;
        } else {
          existingEntry.data.total_leads++;
        }
      } else {
        if (!entry.is_lead) {
          acc.push({
            marketer_name: entry.marketer_name,
            data: {
              total_calls_made: totalCallsMade,
              total_prospects: entry.is_prospected ? 1 : 0,
              total_test_jobs: entry.is_test ? 1 : 0,
              total_leads: 0,
            },
          });
        } else {
          acc.push({
            marketer_name: entry.marketer_name,
            data: {
              total_calls_made: 0,
              total_prospects: 0,
              total_test_jobs: 0,
              total_leads: 1,
            },
          });
        }
      }

      return acc;
    }, []);

    // Send the aggregated data as response
    if (resData && returnData) {
      res.status(200).json(returnData);
    } else {
      sendError(res, 500, "No data found");
    }
  } catch (e) {
    console.error(e);
    sendError(res, 500, "An error occurred");
  }
}

const handleGetDailyReportsToday = async (req, res) => {
  try {
    const date = moment().tz("Asia/Dhaka").format("YYYY-MM-DD");

    // Fetch reports for the specified date
    const resData = await Report.find(
      { calling_date_history: { $elemMatch: { $gte: date, $lte: date } } },
      { marketer_name: 1, is_prospected: 1, is_test: 1, is_lead: 1 },
    ).lean();

    // console.log(resData.length, { calling_date_history: { $elemMatch: { $gte: date, $lte: date } } })

    // Calculate aggregated metrics for the reports
    const aggregatedData = resData.reduce((acc, entry) => {
      const existingEntry = acc.find(
        (item) => item.marketer_name === entry.marketer_name,
      );

      if (existingEntry) {
        if (!entry.is_lead) {
          existingEntry.data.total_calls_made++;
          if (entry.is_prospected) existingEntry.data.total_prospects++;
          if (entry.is_test) existingEntry.data.total_test_jobs++;
        } else {
          existingEntry.data.total_leads++;
        }
      } else {
        if (!entry.is_lead) {
          acc.push({
            marketer_name: entry.marketer_name,
            data: {
              total_calls_made: 1,
              total_prospects: entry.is_prospected ? 1 : 0,
              total_test_jobs: entry.is_test ? 1 : 0,
              total_leads: 0,
            },
          });
        } else {
          acc.push({
            marketer_name: entry.marketer_name,
            data: {
              total_calls_made: 0,
              total_prospects: 0,
              total_test_jobs: 0,
              total_leads: 1,
            },
          });
        }
      }
      return acc;
    }, []);

    res.status(200).json(aggregatedData);
  } catch (error) {
    console.error("Error fetching daily reports:", error);
    sendError(res, 400, "An error occurred while fetching daily reports");
  }
};

export default async function handle(req, res) {
  const { method } = req;

  switch (method) {
    case "GET":
      if (req.headers.getallmarketers) {
        await handleGetAllMarketers(req, res);
      } else if (req.headers.getallreports) {
        await handleGetAllReports(req, res);
      } else if (req.headers.getdailyreportslastdays) {
        await handleGetDailyReportsLastDays(req, res);
      } else if (req.headers.getnearestfollowups) {
        await handleGetNearestFollowUps(req, res);
      } else if (req.headers.finishfollowup) {
        await handleFinishFollowup(req, res);
      } else if (req.headers.finishlead) {
        await handleFinishLead(req, res);
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
