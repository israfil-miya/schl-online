import dbConnect from "../../db/dbConnect";
import Employee from "../../db/Employees";
import moment from "moment";
dbConnect();

function sendError(res, statusCode, message) {
  res.status(statusCode).json({
    error: true,
    message: message,
  });
}

function getRemainingTimeToBePermenant(joiningDate, today = moment()) {
  // Make sure joiningDate and today are moment objects
  joiningDate = moment(joiningDate);
  today = moment(today);

  // Calculate the difference in months and days
  const monthsDiff = today.diff(joiningDate, "months", true);
  const daysDiff = today.diff(joiningDate, "days");

  // Get the whole months and remaining days
  const wholeMonths = Math.floor(monthsDiff);
  const remainingDays = daysDiff % 30;

  // Build the text string
  let textString = "";
  if (wholeMonths > 0) {
    textString += `${wholeMonths} month${wholeMonths === 1 ? "" : "s"}`;
  }
  if (remainingDays > 0) {
    if (wholeMonths > 0) {
      textString += ", ";
    }

    textString += `${remainingDays} day${remainingDays === 1 ? "" : "s"}`;
  }
  if (joiningDate > today) {
    textString = "Not yet joined";
  } else if (textString) textString += " left";

  console.log(textString, joiningDate);

  return textString || "Yes";
}

async function handleGetAllEmployees(req, res) {
  try {
    let query = {};

    const pipeline = [
      { $match: query }, // Apply the query filter
      {
        $addFields: {
          remainingTime: {
            $cond: {
              if: { $eq: ["$status", "Active"] },
              then: getRemainingTimeToBePermenant("$joining_date"),
              else: "N/A",
            },
          },
          priority: {
            $switch: {
              branches: [
                {
                  case: {
                    $and: [
                      { $eq: ["$status", "Active"] },
                      { $eq: ["$remainingTime", "Yes"] },
                    ],
                  },
                  then: 1,
                },
                {
                  case: {
                    $and: [
                      { $eq: ["$status", "Active"] },
                      { $gt: ["$remainingTime", 0] },
                    ],
                  },
                  then: 2,
                },
                {
                  case: { $eq: ["$status", "Inactive"] },
                  then: {
                    $cond: {
                      if: { $eq: ["$remainingTime", "Yes"] },
                      then: 4,
                      else: 5,
                    },
                  },
                },
                { case: { $eq: ["$status", "Fired"] }, then: 7 },
                { case: { $eq: ["$status", "Resigned"] }, then: 8 },
              ],
              default: 3,
            },
          },
        },
      },
      {
        $sort: { priority: 1 },
      },
    ];

    let usersList = await Employee.aggregate(pipeline).exec();

    console.log(usersList);

    if (usersList) {
      res.status(200).json(usersList);
    } else sendError(res, 400, "Unable to retrieve employees list");
  } catch (e) {
    console.error(e);
    sendError(res, 500, "An error occurred");
  }
}

async function handleNewEmployee(req, res) {
  try {
    let data = req.body;

    if (!data) sendError(res, 400, "No data provided");

    let newUser = await Employee.findOneAndUpdate({ e_id: data.e_id }, data, {
      new: true,
      upsert: true,
    });

    if (newUser) {
      res.status(200).json(newUser);
    } else sendError(res, 400, "Unable to create employee");
  } catch (e) {
    console.error(e);
    sendError(res, 500, "An error occurred");
  }
}

async function handleEditEmployee(req, res) {
  const data = req.body;

  try {
    const resData = await Employee.findByIdAndUpdate(data._id, data, {
      new: true,
    });

    if (resData) {
      res.status(200).json(resData);
    } else {
      sendError(res, 400, "No employee found");
    }
  } catch (e) {
    console.error(e);
    sendError(res, 500, "An error occurred");
  }
}

async function handleGetEmployeeById(req, res) {
  try {
    let data = req.headers;

    const resData = await Employee.findById(data.id).lean();

    if (!resData) sendError(res, 400, "No employee data found with the id");
    else res.status(200).json(resData);
  } catch (e) {
    console.error(e);
    sendError(res, 500, "An error occurred");
  }
}

export default async function handle(req, res) {
  const { method } = req;

  switch (method) {
    case "GET":
      if (req.headers.getallemployees) {
        await handleGetAllEmployees(req, res);
      } else if (req.headers.getemployeebyid) {
        await handleGetEmployeeById(req, res);
      }
      break;

    case "POST":
      if (req.headers.newemployee) {
        await handleNewEmployee(req, res);
      } else if (req.headers.editemployee) {
        await handleEditEmployee(req, res);
      }

      break;

    default:
      sendError(res, 400, "Unknown request");
  }
}
