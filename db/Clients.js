import mongoose from "mongoose";
const ClientSchema = new mongoose.Schema({
  client_code: {
    required: true,
    type: String,
  },
});

module.exports =
  mongoose.models.Client || mongoose.model("Client", ClientSchema);
