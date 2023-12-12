import dbConnect from "../../db/dbConnect";
import Employee from "../../db/Employees";
dbConnect();

function sendError(res, statusCode, message) {
  res.status(statusCode).json({
    error: true,
    message: message,
  });
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

async function handleGetAllEmployees(req, res) {
  try {
    let usersList = await Employee.find({}).lean();

    if (usersList) {
      res.status(200).json(usersList);
    } else sendError(res, 400, "Unable to retrieve employees list");
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
