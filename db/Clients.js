import mongoose from "mongoose";
const ClientSchema = new mongoose.Schema({
  client_code: {
    type: String,
  },
  client_name: {
    type: String,
  },
  marketer: {
    type: String
  },
  contact_person: {
    type: String
  },
  designation: {
    type: String
  },
  contact_number: {
    type: String
  },
  email: {
    type: String
  },
  country: {
    type: String
  },
  price: {
    type: String
  }
});

module.exports =
  mongoose.models.Client || mongoose.model("Client", ClientSchema);
