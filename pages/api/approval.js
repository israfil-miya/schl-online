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
      let insertdata = {
        real_name: data.real_name,
        name: data.name,
        password: data.password,
        role: data.role,
      };

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
    const page = req.headers.page || 1;

    let {
      request_by,
      request_type,
      approved_check,
      rejected_check,
      waiting_check,
    } = req.headers;

    const ITEMS_PER_PAGE = parseInt(req.headers.item_per_page) || 30;

    let query = {};
    if (request_by) query.req_by = { $regex: request_by, $options: "i" };
    if (request_type) query.req_type = { $regex: request_type, $options: "i" };

    approved_check = approved_check === "true";
    rejected_check = rejected_check === "true";
    waiting_check = waiting_check === "true";

    if (approved_check) {
      query.is_rejected = { $eq: false };
      query.checked_by = { $ne: "None" };
    }
    if (rejected_check) {
      query.is_rejected = { $eq: true };
      query.checked_by = { $ne: "None" };
    }
    if (waiting_check) {
      query.checked_by = { $eq: "None" };
    }

    console.log(query);

    if (
      Object.keys(query).length === 0 &&
      query.constructor === Object &&
      req.headers.isfilter == "true"
    )
      sendError(res, 400, "No filter applied");
    else {
      const skip = (page - 1) * ITEMS_PER_PAGE;

      const count = await Approval.countDocuments(query);

      let applovals;

      if (req.headers.notpaginated) applovals = await Approval.find({});
      else
        applovals = await Approval.find(query)
          .sort({
            updatedAt: -1,
            checked_by: 1,
          })
          .skip(skip)
          .limit(ITEMS_PER_PAGE);

      const pageCount = Math.ceil(count / ITEMS_PER_PAGE); // Calculate the total number of pages

      res.status(200).json({
        pagination: {
          count,
          pageCount,
        },
        items: applovals,
      });
    }
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
