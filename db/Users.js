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
  joining_date: {
    type: String,
  },
  phone: {
    type: String,
  },
  email: {
    type: String,
  },
  code: {
    type: String,
  },
  real_first_name: {
    type: String,
  },
  real_last_name: {
    type: String,
  },
  birth_date: {
    type: String,
  },
  nid: {
    type: Number,
  },
  blood_group: {
    type: String,
  },
  designation: {
    type: String,
  },
  department: {
    type: String,
  },
  base_salary: {
    type: Number,
  },
  note: {
    type: String,
  },
});

module.exports = mongoose.models.User || mongoose.model("User", UserSchema);
