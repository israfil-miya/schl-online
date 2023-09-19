export default async function handle(req, res) {
    const { method } = req;
  
    switch (method) {
      case "GET":


       
        break;
  
      case "POST":
        console.log(req.body?.data)
        res.status(200).json(req.body?.data);
  
        break;
  
      default:
        sendError(res, 400, "Unknown request");
    }
  }
  