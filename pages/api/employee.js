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


function isEmployeePermanent(joiningDate) {
  // Existing logic to check if permanent
  const joinDate = new Date(joiningDate);
  const probationEndDate = new Date(joinDate.getFullYear(), joinDate.getMonth() + 6, joinDate.getDate());
  const today = new Date();
  const isPermanent = today >= probationEndDate;

  // Calculate remaining time if not permanent
  if (!isPermanent) {
    const remainingDays = Math.floor((probationEndDate - today) / (1000 * 60 * 60 * 24));
    return {
      isPermanent: false,
      remainingTime: remainingDays
    };
  }

  // Return permanent status if permanent
  return { isPermanent: true };
}


async function handleGetAllEmployees(req, res) {
  try {
    let query = {};
    let employees = await Employee.find().exec();
    const processedEmployees = employees.map(employee => {
      const permanentInfo = isEmployeePermanent(employee.joining_date);
      let priority = 0;

      switch (true) {
        case employee.status === 'Active' && permanentInfo.isPermanent:
          priority = 1;
          break;
        case employee.status === 'Active' && !permanentInfo.isPermanent:
          priority = 2;
          break;
        case employee.status === 'Inactive' && permanentInfo.isPermanent:
          priority = 4;
          break;
        case employee.status === 'Inactive' && !permanentInfo.isPermanent:
          priority = 5;
          break;
        case employee.status === 'Fired':
          priority = 7;
          break;
        case employee.status === 'Resigned':
          priority = 8;
          break;
      }

      return {
        ...employee.toObject(),
        permanentInfo,
        priority,
      };
    });
    const sortedEmployees = processedEmployees.sort((a, b) => a.priority - b.priority);
    if (sortedEmployees) {
      res.status(200).json(sortedEmployees);
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
