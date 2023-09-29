// pages/api/ftp.js
import { getConnection, releaseConnection } from '../../lib/ftp';
import streamifier from 'streamifier'; 
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

    const directoryList = await ftp.list('/');

    // Filter and exclude specific files
    const filteredList = directoryList.filter((file) => {
      const fileName = file.name;

      // Exclude files with names ".", "..", and ".ftpquota"
      return fileName !== '.' && fileName !== '..' && fileName !== '.ftpquota';
    });

    console.log(filteredList);
    res.status(200).json(filteredList);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to connect to FTP server' });
  } finally {
    if (ftp) {
      releaseConnection(ftp);
    }
  }
}







async function handleInsertFile(req, res) {
  let ftp;
  let  fileData = req.body.fileData;
  let fileName = req.body.fileName;

  try {
    ftp = await getConnection();


    console.log("fileData", fileData)

    // Convert Blob to ArrayBuffer
    const arrayBuffer = await new Response(fileData).arrayBuffer();

    // Use streamifier to create a Readable Stream
    const fileStream = streamifier.createReadStream(Buffer.from(arrayBuffer));

    // Use the Readable Stream for ftp.put
    await ftp.put(fileStream, `./${fileName}`);
    console.log(`File uploaded successfully to ftp`);
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
    case 'GET':
      if (req.headers.getfiles) {
        await handleGetFiles(req, res);
      } else {
        sendError(res, 400, 'Not a valid GET request');
      }
      break;

    case 'POST':
      if (req.headers.insertfile) {
        await handleInsertFile(req, res);
      } else {
        sendError(res, 400, 'Not a valid POST request');
      }
      break;

    default:
      sendError(res, 400, 'Unknown request');
  }
}
