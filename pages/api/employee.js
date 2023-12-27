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
  const probationEndDate = new Date(
    joinDate.getFullYear(),
    joinDate.getMonth() + 6,
    joinDate.getDate(),
  );
  const today = new Date();
  const isPermanent = today >= probationEndDate;

  // Calculate remaining time if not permanent
  if (!isPermanent) {
    const remainingDays = Math.floor(
      (probationEndDate - today) / (1000 * 60 * 60 * 24),
    );
    return {
      isPermanent: false,
      remainingTimeInDays: remainingDays, // Return raw days
    };
  }

  // Calculate job age/service time if permanent
  const jobAgeInDays = Math.floor((today - joinDate) / (1000 * 60 * 60 * 24));
  return {
    isPermanent: true,
    jobAgeInDays: jobAgeInDays, // Return raw days
  };
}

async function handleGetAllEmployees(req, res) {
  try {
    let query = {};
    let employees = await Employee.find(query).sort({ e_id: 1 }).exec();
    const processedEmployees = employees.map((employee) => {
      const permanentInfo = isEmployeePermanent(employee.joining_date);
      let priority = 0;

      switch (true) {
        case employee.status === "Active":
          priority = 1;
          break;
        case employee.status === "Inactive":
          priority = 2;
          break;
        case employee.status === "Fired":
          priority = 3;
          break;
        case employee.status === "Resigned":
          priority = 4;
          break;
      }

      return {
        ...employee.toObject(),
        permanentInfo,
        priority,
      };
    });
    const sortedEmployees = processedEmployees.sort(
      (a, b) => a.priority - b.priority,
    );
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

async function handleGetEmployeeByCode(req, res) {
  try {
    let data = req.headers;

    const employee = await Employee.findOne({
      e_id: data.e_id,
    }).lean();

    if (!employee) sendError(res, 400, "No employee found with the code");
    else res.status(200).json(employee);
  } catch (e) {
    console.error(e);
    sendError(res, 500, "An error occurred");
  }
}
async function handleGetMarkerNameByRealName(req, res) {
  try {
    let data = req.headers;

    const employee = await Employee.findOne({
      real_name: data.real_name,
    }).lean();

    if (!employee) sendError(res, 400, "No employee found with the name");
    else res.status(200).json(employee);
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
      } else if (req.headers.getemployeebycode) {
        await handleGetEmployeeByCode(req, res);
      } else if (req.headers.getmarkernamebyrealname) {
        await handleGetMarkerNameByRealName(req, res);
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