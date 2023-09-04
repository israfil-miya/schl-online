import Approval from "../../db/Approvals";
import dbConnect from "../../db/dbConnect";
dbConnect();
function sendError(res, statusCode, message) {
  res.status(statusCode).json({
    error: true,
    message: message,
  });
}

async function handleNewReq(req, res) {
  const data = req.body;

  try {

    console.log("data: ", data)
    const resData = await Approval.create(data);

    if (resData) {
      console.log(resData);
      res.status(200).json(resData);
    } else {
      sendError(res, 400, "Unable to send request");
    }
  } catch (e) {
    console.error(e);
    sendError(res, 500, "An error occurred");
  }
}

async function handleResponse(req, res) {
  const data = req.body;


  if (data.response == "reject") {
    const resData = await Approval.findByIdAndUpdate(data._id, {
      checked_by: data.checked_by,
      is_rejected: true,
    });

    if (resData) {
      console.log(resData);
      res.status(200).json(resData);
    } else {
      sendError(res, 400, "Unable to send request");
    }
  }

  // try {
  //   const resData = await Approval.create(data);

  //   if (resData) {
  //     console.log(resData)
  //     res.status(200).json(resData);
  //   } else {
  //     sendError(res, 400, "Unable to send request");
  //   }
  // } catch (e) {
  //   console.error(e);
  //   sendError(res, 500, "An error occurred");
  // }
}

async function handleGetAllOrdersForApproval(req, res) {
  try {
    const resData = await Approval.find({
      req_type: {
        $regex: /^Task/i, // (case-insensitive)
      },
    });
    res.status(200).json(resData);
  } catch (e) {
    console.error(e);
    sendError(res, 500, "An error occurred");
  }
}

async function handleGetAllUsersForApproval(req, res) {
  try {
    const resData = await Approval.find({
      req_type: {
        $regex: /^User/i, // (case-insensitive)
      },
    });
    res.status(200).json(resData);
  } catch (e) {
    console.error(e);
    sendError(res, 500, "An error occurred");
  }
}

export default async function handle(req, res) {
  const { method } = req;

  switch (method) {
    case "GET":
      if (req.headers.getallordersforapproval) {
        await handleGetAllOrdersForApproval(req, res);
      } else if (req.headers.getallusersforapproval) {
        await handleGetAllUsersForApproval(req, res);
      } else {
        sendError(res, 400, "Not a valid GET request");
      }
      break;

    case "POST":
      if (req.body.response) {
        await handleResponse(req, res);
      } else await handleNewReq(req, res);

      break;

    default:
      sendError(res, 400, "Unknown request");
  }
}
