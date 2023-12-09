import dbConnect from "../../db/dbConnect";
import Employee from "../../db/Employees";
dbConnect();

async function handleNewEmployee(req, res) {
  let data = req.body;
  console.log("NEW EMPLOYEE DATA: ", data);
  res.status(200).json({ message: "CREATED NEW EMPLOYEE (FAKE)" });
}

async function handleGetAllEmployees(req, res) {
  res.status(200).json({ message: "RETURNED EMPLOYEES LIST (FAKE)" });
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
      }
      break;

    default:
      sendError(res, 400, "Unknown request");
  }
}
