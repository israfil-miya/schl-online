// pages/api/ftp.js
import { getConnection, releaseConnection } from "../../lib/ftp";
import formidable from "formidable-serverless-2";

function sendError(res, statusCode, message) {
  res.status(statusCode).json({
    error: true,
    message: message,
  });
}

async function handleGetFiles(req, res) {
  let ftp;

  try {
    ftp = await getConnection();

    const directoryList = await ftp.list("/");

    // Filter and exclude specific files
    const filteredList = directoryList.filter((file) => {
      const fileName = file.name;

      // Exclude files with names ".", "..", and ".ftpquota"
      return fileName !== "." && fileName !== ".." && fileName !== ".ftpquota";
    });

    // console.log(filteredList);
    res.status(200).json(filteredList);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to connect to FTP server" });
  } finally {
    if (ftp) {
      releaseConnection(ftp);
    }
  }
}

async function handleInsertFile(req, res) {
  let ftp;
  try {
    // console.log(req)
    ftp = await getConnection();
    const form = new formidable.IncomingForm({ keepExtensions: true });

    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error("Error parsing form data:", err);
        res.status(500).json({ error: "Error parsing form data" });
        return;
      }

      // console.log(files);

      const fileData = files.file;

      if (!fileData) {
        console.error("No file data received.");
        res.status(400).json({ error: "No file data received" });
        return;
      }

      // Handle the file data
      const fileName = fileData.originalFilename;
      const filePath = fileData.filepath;
      // console.log("Received file:", fileName);

      await ftp.put(filePath, `./${fileName}`);

      // console.log("File uploaded to FTP.");
      res.status(200).json({ message: "File uploaded successfully" });
    });
  } catch (error) {
    console.error("Error in handleInsertFile:", error);
    res.status(500).json({ error: "Failed to connect to FTP server" });
  } finally {
    if (ftp) {
      releaseConnection(ftp);
    }
  }
}

export default async function handle(req, res) {
  const { method } = req;

  switch (method) {
    case "GET":
      if (req.headers.getfiles) {
        await handleGetFiles(req, res);
      } else {
        sendError(res, 400, "Not a valid GET request");
      }
      break;

    case "POST":
      if (req.headers.insertfile) {
        await handleInsertFile(req, res);
      } else {
        sendError(res, 400, "Not a valid POST request");
      }
      break;

    default:
      sendError(res, 400, "Unknown request");
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};
