import mongoose from "mongoose";
const UserSchema = new mongoose.Schema({
  name: {
    required: true,
    type: String,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    required: true,
  },
  company_provided_name: {
    type: String,
  },
});

module.exports = mongoose.models.User || mongoose.model("User", UserSchema);
