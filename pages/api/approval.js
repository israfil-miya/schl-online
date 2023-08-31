import Approval from "../../db/Approvals"
import dbConnect from "../../db/dbConnect";
dbConnect();
function sendError(res, statusCode, message) {
  res.status(statusCode).json({
    error: true,
    message: message,
  });
}

async function handleSignIn(req, res) {
  const { name, password } = req.headers;

  try {
    const userData = await User.findOne({
      name: name,
      password: password,
    });

    if (userData) {
      res.status(200).json(userData);
    } else {
      sendError(res, 400, "No account found");
    }
  } catch (e) {
    console.error(e);
    sendError(res, 500, "An error occurred");
  }
}

async function handleNewReq(req, res) {
  const data = req.body;

  try {
    const resData = await Approval.create(data, {
      new: true,
    });

    if (resData) {
      res.status(200).json(resData);
    } else {
      sendError(res, 400, "Unable to send request");
    }
  } catch (e) {
    console.error(e);
    sendError(res, 500, "An error occurred");
  }
}



async function handleGetAllOrdersNonApproved(req, res) {
  try {
    const resData = await Approval.find({req_approved: false});
    res.status(200).json(resData);
  } catch (e) {
    console.error(e);
    sendError(res, 500, "An error occurred");
  }
}

async function handleEditUser(req, res) {
  const data = req.body;
  // console.log("Received edit request with data:", data);

  try {
    const resData = await User.findByIdAndUpdate(data._id, data, {
      new: true,
    });

    if (resData) {
      res.status(200).json(resData);
    } else {
      sendError(res, 400, "No user found");
    }
  } catch (e) {
    console.error(e);
    if (e.code === 11000)
      sendError(res, 500, "A user with this name already exists");
    else sendError(res, 500, "An error occurred");
  }
}

async function handleDeleteUser(req, res) {
  let data = req.headers;

  try {
    const resData = await User.findByIdAndDelete(data.id);
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
      if (req.headers.signin) {
        await handleSignIn(req, res);
      } else if (req.headers.getallordersnonapproved) {
        await handleGetAllOrdersNonApproved(req, res);
      } else if (req.headers.deleteuser) {
        await handleDeleteUser(req, res);
      } else {
        sendError(res, 400, "Not a valid GET request");
      }
      break;

    case "POST":
      if (req.headers.edituser) {
        await handleEditUser(req, res);
      } else {
        await handleNewReq(req, res);
      }

      break;

    default:
      sendError(res, 400, "Unknown request");
  }
}
