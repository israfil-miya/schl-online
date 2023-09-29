// pages/api/ftp.js
import { getConnection, releaseConnection } from "../../lib/ftp";
import streamifier from "streamifier";
import formidable from 'formidable';
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

    console.log(filteredList);
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
  let fileName = req.body.fileName;

  try {
    ftp = await getConnection();
    const form = formidable({})

    form.parse(req, (err, fields, files) => {
      if (err) {
        res.status(500).json({ error: 'Error parsing form data' });
        return;
      }

      // Access the uploaded file using the 'file' field name
      const uploadedFile = files.file;

      console.log("File data:", uploadedFile)

      // Use the Readable Stream for ftp.put
      uploadedFile.pipe(ftp.put(`./${fileName}`));

      uploadedFile.on('end', () => {
        console.log(`File uploaded successfully to FTP`);
        res.status(200).json({});
      });
    });
    res.status(200).json({});
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to connect to FTP server' });
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
