import mongoose from "mongoose";
const ClientSchema = new mongoose.Schema({
  client_code: {
    type: String,
  },
  client_name: {
    type: String,
  },
});

module.exports =
  mongoose.models.Client || mongoose.model("Client", ClientSchema);
