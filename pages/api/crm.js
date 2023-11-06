import User from "../../db/Users";
import dbConnect from "../../db/dbConnect";
dbConnect();
function sendError(res, statusCode, message) {
  res.status(statusCode).json({
    error: true,
    message: message,
  });
}

const handleGetAllMarketers = async (req, res) => {
  try {
    const data = req.headers;

    const userData = await User.find({ role: "marketer" });
    res.status(200).json(userData);
  } catch (e) {
    console.error(e);
    sendError(res, 500, "An error occurred");
  }
};

export default async function handle(req, res) {
  const { method } = req;

  switch (method) {
    case "GET":
      if (req.headers.getallmarketers) {
        await handleGetAllMarketers(req, res);
      } else {
        sendError(res, 400, "Not a valid GET request");
      }
      break;

    case "POST":
      if (req.headers.editorder) {
        //
      } else {
        //
      }

      break;

    default:
      sendError(res, 400, "Unknown request");
  }
}
