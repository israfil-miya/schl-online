import Client from "@/db/Clients";
import dbConnect from "@/db/dbConnect";
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
      sendError(res, 400, "Unable to add new client");
    }
  } catch (e) {
    console.error(e);
    sendError(res, 500, "An error occurred");
  }
}

async function handleGetAllClient(req, res) {
  try {
    const page = req.headers.page || 1;

    let { country, clientcode, contactperson, marketer } = req.headers;

    const ITEMS_PER_PAGE = 20; // Number of items per page

    let query = {};
    if (country) query.country = { $regex: country, $options: "i" };
    if (clientcode) query.client_code = { $regex: clientcode, $options: "i" };
    if (contactperson)
      query.contact_person = { $regex: contactperson, $options: "i" };
    if (marketer) query.marketer = { $regex: marketer, $options: "i" };

    console.log(query);

    if (
      Object.keys(query).length === 0 &&
      query.constructor === Object &&
      req.headers.isfilter == true
    )
      sendError(res, 400, "No filter applied");
    else {
      const skip = (page - 1) * ITEMS_PER_PAGE;

      const count = await Client.countDocuments(query);

      let clients;

      if (req.headers.notpaginated) clients = await Client.find({});
      else clients = await Client.find(query).skip(skip).limit(ITEMS_PER_PAGE);

      const pageCount = Math.ceil(count / ITEMS_PER_PAGE); // Calculate the total number of pages

      res.status(200).json({
        pagination: {
          count,
          pageCount,
        },
        items: clients,
      });
    }
  } catch (e) {
    console.error(e);
    sendError(res, 500, "An error occurred");
  }
}

async function handleEditClient(req, res) {
  let data = req.body;
  const updated_by = req.headers.name;
  data = { ...data, updated_by };

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

async function handleGetClientsByCode(req, res) {
  try {
    let data = req.headers;

    const client = await Client.findOne({
      client_code: data.client_code,
    }).lean();

    if (!client) sendError(res, 400, "No client found with the code");
    else res.status(200).json(client);
  } catch (e) {
    console.error(e);
    sendError(res, 500, "An error occurred");
  }
}

async function handleGetClientsById(req, res) {
  try {
    let data = req.headers;

    const client = await Client.findById(data.id).lean();

    if (!client) sendError(res, 400, "No client found with the id");
    else res.status(200).json(client);
  } catch (e) {
    console.error(e);
    sendError(res, 500, "An error occurred");
  }
}

async function handleGetClientNameByCode(req, res) {
  try {
    let data = req.headers;
    const resData = await Client.findOne({ client_code: data.client_code });
    if (!resData) sendError(res, 500, "No client found with the code");
    else res.status(200).json(resData);
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

export default async function handle(req, res) {
  const { method } = req;

  switch (method) {
    case "GET":
      if (req.headers.getallclients) {
        await handleGetAllClient(req, res);
      } else if (req.headers.deleteclient) {
        await handleDeleteClient(req, res);
      } else if (req.headers.getclientnamebycode) {
        await handleGetClientNameByCode(req, res);
      } else if (req.headers.getclientsbyid) {
        await handleGetClientsById(req, res);
      } else if (req.headers.getclientsbycode) {
        await handleGetClientsByCode(req, res);
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
