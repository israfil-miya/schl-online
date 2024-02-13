import User from "../../db/Users";
import jwt from "jsonwebtoken";

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

  try {
    const userData = await User.findOneAndUpdate({ name: data.name }, data, {
      new: true,
      upsert: true,
    });

    if (userData) {
      res.status(200).json(userData);
    } else {
      sendError(res, 400, "Unable to create account");
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

    // console.log("USER DATA: ", data);

    const users = await User.findById(data.id).lean();

    // console.log("Users return data: ", users);

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

async function handleVerifyUserAndSetCookie(req, res) {
  const { name, password } = req.body;
  const { redirect_path } = req.headers;

  try {
    const userData = await User.findOne({
      name,
      password,
    });

    if (userData) {
      const token = jwt.sign(
        { userId: userData._id, exp: Date.now() + 10 * 1000 },
        process.env.SECRET,
      );
      res.setHeader(
        "Set-Cookie",
        `verify-token.tmp=${token}; Path=${redirect_path}`,
      );
      res.status(200).json({});
    } else {
      sendError(res, 400, "No account found");
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
      if (req.headers.signin) {
        await handleSignIn(req, res);
      } else if (req.headers.getalluser) {
        await handleGetAllUser(req, res);
      } else if (req.headers.getusersbyid) {
        await handleGetUsersById(req, res);
      } else if (req.headers.deleteuser) {
        await handleDeleteUser(req, res);
      } else if (req.headers.verify_user) {
        await handleVerifyUserAndSetCookie(req, res);
      } else {
        sendError(res, 400, "Not a valid GET request");
      }
      break;

    case "POST":
      if (req.headers.edituser) {
        await handleEditUser(req, res);
      } else if (req.headers.verify_user) {
        await handleVerifyUserAndSetCookie(req, res);
      } else {
        await handleNewUser(req, res);
      }

      break;

    default:
      sendError(res, 400, "Unknown request");
  }
}
