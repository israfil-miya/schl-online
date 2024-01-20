import mongoose from "mongoose";

const ProvidentFundHistorySchema = new mongoose.Schema(
  {
    date: String, // An update of provident_fund/gross was made in this date.

    gross: Number, // previous gross salary (if changed).

    provident_fund: Number, // previous pf percentage (if changed).

    saved_amount: Number, // total saved pf money
    // from previous object's(of this pf_history array) `date` value, if no previous object then use `pf_start_date` field's value
    // to this object's(of this pf_history array) `date` value.

    note: String, // what got changed. Ex. Value: "Gross salary was updated."
  },
  { _id: false, __v: false },
);

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
      type: Number,
      default: 0,
    },
    bonus_eid_ul_adha: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      default: "Active",
    },
    provident_fund: {
      type: Number,
      default: 0,
    },
    pf_start_date: {
      type: String,
    },
    pf_history: {
      type: [ProvidentFundHistorySchema],
    },
    branch: {
      type: String,
    },
    division: {
      type: String,
    },
    company_provided_name: {
      type: String,
    },
    note: {
      type: String,
    },
  },
  { timestamps: true },
);

module.exports =
  mongoose.models.Employee || mongoose.model("Employee", EmployeeSchema);
