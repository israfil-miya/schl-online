import Approval from "../../db/Approvals";
import User from "../../db/Users";
import Order from "../../db/Orders";
import Client from "../../db/Clients";
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
    console.log("data: ", data);
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

  console.log("THE DATA ON HANDLE RESPONSE: ", data);

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

  if (data.response == "approve") {
    if (data.req_type == "User Delete") {
      const resData = await User.findByIdAndDelete(data.id);
      const updateApprovaL = await Approval.findByIdAndUpdate(
        data._id,
        {
          checked_by: data.checked_by,
          is_rejected: false,
        },
        { new: true },
      );

      if (resData) {
        console.log(resData);
        res.status(200).json(updateApprovaL);
      } else {
        sendError(res, 400, "Unable to send request");
      }
    }

    if (data.req_type == "User Create") {
      const resData = await User.findOneAndUpdate(
        { name: data.name },
        {
          name: data.name,
          password: data.password,
          role: data.role,
        },
        {
          new: true,
          upsert: true,
        },
      );

      const updateApprovaL = await Approval.findByIdAndUpdate(
        data._id,
        {
          checked_by: data.checked_by,
          is_rejected: false,
        },
        { new: true },
      );

      if (resData) {
        console.log(resData);
        res.status(200).json(updateApprovaL);
      } else {
        sendError(res, 400, "Unable to send request");
      }
    }

    if (data.req_type == "Task Delete") {
      const resData = await Order.findByIdAndDelete(data.id);

      const updateApprovaL = await Approval.findByIdAndUpdate(
        data._id,
        {
          checked_by: data.checked_by,
          is_rejected: false,
        },
        { new: true },
      );

      if (resData) {
        console.log(resData);
        res.status(200).json(updateApprovaL);
      } else {
        sendError(res, 400, "Unable to send request");
      }
    }

    if (data.req_type == "Client Delete") {
      const resData = await Client.findByIdAndDelete(data.id);
      const updateApprovaL = await Approval.findByIdAndUpdate(
        data._id,
        {
          checked_by: data.checked_by,
          is_rejected: false,
        },
        { new: true },
      );

      if (resData) {
        console.log(resData);
        res.status(200).json(updateApprovaL);
      } else {
        sendError(res, 400, "Unable to send request");
      }
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
    }).sort({ checked_by: 1, _id: 1 }); // Sort by "checked_by" ascending, "_id" as tiebreaker
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
    }).sort({ checked_by: 1, _id: 1 }); // Sort by "checked_by" ascending, "_id" as tiebreaker
    res.status(200).json(resData);
  } catch (e) {
    console.error(e);
    sendError(res, 500, "An error occurred");
  }
}

async function handleGetAllClientsForApproval(req, res) {
  try {
    const resData = await Approval.find({
      req_type: {
        $regex: /^Client/i, // (case-insensitive)
      },
    }).sort({ checked_by: 1, _id: 1 }); // Sort by "checked_by" ascending, "_id" as tiebreaker
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
      } else if (req.headers.getallclientsforapproval) {
        await handleGetAllClientsForApproval(req, res);
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
