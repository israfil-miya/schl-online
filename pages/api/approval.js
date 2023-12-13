import Approval from "../../db/Approvals";
import User from "../../db/Users";
import Order from "../../db/Orders";
import Client from "../../db/Clients";
import Report from "../../db/Reports";
import Employee from "../../db/Employees";
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
      console.log("CLIENT CREATE DATA: ", data);

      let insertdata = {
        name: data.name,
        password: data.password,
        role: data.role,
      };

      if (data.company_provided_name)
        insertdata.company_provided_name = data.company_provided_name;

      console.log("CLIENT CREATE DATA: ", insertdata);

      const resData = await User.findOneAndUpdate(
        { name: data.name },
        insertdata,
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
    if (data.req_type == "Report Delete") {
      const resData = await Report.findByIdAndDelete(data.id);
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
    if (data.req_type == "Employee Delete") {
      const resData = await Employee.findByIdAndDelete(data.id);
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
    if (data.req_type == "Report Edit") {
      let editData = { ...data };
      delete editData.id;
      delete editData.req_by;
      delete editData.req_type;
      delete editData._id;

      const resData = await Report.findByIdAndUpdate(data.id, editData, {
        new: true,
      });

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
}

async function handleGetAllApprovals(req, res) {
  try {
    const resData = await Approval.find({}).lean().sort({
      updatedAt: -1,
      checked_by: 1,
    }); // Sort by "checked_by" ascending, "_id" as tiebreaker
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
      if (req.headers.getallapprovals) {
        await handleGetAllApprovals(req, res);
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
