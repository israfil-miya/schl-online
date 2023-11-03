import User from "../../db/Users";
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

async function handleNewUser(req, res) {
  const data = req.body;

  let insertdata = {
    name: data.name,
    password: data.password,
    role: data.role,
  };
  if (data.phone) insertdata.phone = data.phone;
  if (data.email) insertdata.email = data.email;
  if (data.company_provided_name)
    insertdata.company_provided_name = data.company_provided_name;
  if (data.joining_date) insertdata.joining_date = data.joining_date;

  try {
    const userData = await User.findOneAndUpdate(
      { name: data.name },
      insertdata,
      {
        new: true,
        upsert: true,
      },
    );

    if (userData) {
      res.status(200).json({
        id: userData._id,
        password: userData.password,
        name: userData.name,
        role: userData.role,
        company_provided_name: userData.company_provided_name,
        joining_date: userData.joining_date,
        phone: userData.phone,
        email: userData.email,
      });
    } else {
      sendError(res, 400, "No account found");
    }
  } catch (e) {
    console.error(e);
    sendError(res, 500, "An error occurred");
  }
}

async function handleGetAllUser(req, res) {
  try {
    const userData = await User.find({});
    res.status(200).json(userData);
  } catch (e) {
    console.error(e);
    sendError(res, 500, "An error occurred");
  }
}

async function handleGetUsersById(req, res) {
  try {
    let data = req.headers;

    console.log("USER DATA: ", data);

    const users = await User.findById(data.id).lean();

    console.log("Users return data: ", users);

    if (!users) sendError(res, 400, "No user found with the id");
    else res.status(200).json(users);
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
      } else if (req.headers.getalluser) {
        await handleGetAllUser(req, res);
      } else if (req.headers.getusersbyid) {
        await handleGetUsersById(req, res);
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
        await handleNewUser(req, res);
      }

      break;

    default:
      sendError(res, 400, "Unknown request");
  }
}
