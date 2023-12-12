import mongoose from "mongoose";
const EmployeeSchema = new mongoose.Schema(
  {
    e_id: {
      type: String,
      required: true,
    },
    real_name: {
      type: String,
      required: true,
    },
    joining_date: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
    },
    email: {
      type: String,
    },

    birth_date: {
      type: String,
    },
    nid: {
      type: String,
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
    gross_salary: {
      type: Number,
      default: 0,
    },
    bonus_eid_ul_fitr: {
      type: String,
      default: 0,
    },
    bonus_eid_ul_adha: {
      type: String,
      default: 0,
    },
    status: {
      type: String,
      default: "Active",
    },
    permenant: {
      type: Boolean,
      default: false,
    },
    note: {
      type: String,
    },
  },
  { timestamps: true },
);

module.exports =
  mongoose.models.Employee || mongoose.model("Employee", EmployeeSchema);
