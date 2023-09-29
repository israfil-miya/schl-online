// pages/api/ftp.js
import connectFtp from '../../lib/ftp';

async function handleGetFiles(req, res) {
  try {
    const ftp = await connectFtp();


    const directoryList = await ftp.list('/');


    // Filter and exclude specific files
    const filteredList = directoryList.filter((file) => file !== '.' || file !== '..' || file !== '.ftpquota')


    console.log(filteredList)
    res.status(200).json(filteredList);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to connect to FTP server' });
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
      break;

    default:
      sendError(res, 400, "Unknown request");
  }
}
