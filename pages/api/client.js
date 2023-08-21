import Client from "../../db/Clients";
import dbConnect from "../../db/dbConnect";
dbConnect();
function sendError(res, statusCode, message) {
  res.status(statusCode).json({
    error: true,
    message: message,
  });
}

async function handleNewClient(req, res) {
  const data = req.body;

  try {
    const resData = await Client.findOneAndUpdate(
      { client_code: data.client_code },
      data,
      {
        new: true,
        upsert: true,
      },
    );

    if (resData) {
      res.status(200).json(resData);
    } else {
      sendError(res, 400, "No client found");
    }
  } catch (e) {
    console.error(e);
    sendError(res, 500, "An error occurred");
  }
}

async function handleGetAllClient(req, res) {
  try {
    const resData = await Client.find({});
    res.status(200).json(resData);
  } catch (e) {
    console.error(e);
    sendError(res, 500, "An error occurred");
  }
}

async function handleEditClient(req, res) {
  const data = req.body;
  // console.log("Received edit request with data:", data);

  try {
    const resData = await Client.findByIdAndUpdate(data._id, data, {
      new: true,
    });

    if (resData) {
      res.status(200).json(resData);
    } else {
      sendError(res, 400, "No client found");
    }
  } catch (e) {
    console.error(e);
    sendError(res, 500, "An error occurred");
  }
}

async function handleDeleteClient(req, res) {
  let data = req.headers;

  try {
    const resData = await Client.findByIdAndDelete(data.id);
    res.status(200).json(resData);
  } catch (e) {
    console.error(e);
    sendError(res, 500, "An error occurred");
  }
}

async function handleGetClientInfo(req, res) {
  let data = req.headers;

  try {
    const resData = await Client.findById(data._id);
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
      if (req.headers.getallclients) {
        await handleGetAllClient(req, res);
      } else if (req.headers.deleteclient) {
        await handleDeleteClient(req, res);
      } else if (req.headers.getclientinfo) {
        await handleGetClientInfo(req, res);
      } else {
        sendError(res, 400, "Not a valid GET request");
      }
      break;

    case "POST":
      if (req.headers.editclient) {
        await handleEditClient(req, res);
      } else {
        await handleNewClient(req, res);
      }
      break;

    default:
      sendError(res, 400, "Unknown request");
  }
}
