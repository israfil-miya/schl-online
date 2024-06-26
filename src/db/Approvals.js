import mongoose from "mongoose";

const ApprovalSchema = new mongoose.Schema(
  {
    req_type: {
      type: String,
    },
    req_by: {
      type: String,
    },
    checked_by: {
      type: String,
      default: "None",
    },
    is_rejected: {
      type: Boolean,
      default: false,
    },

    // Users Database Entry

    name: {
      type: String,
    },
    real_name: {
      type: String,
    },
    password: {
      type: String,
    },
    role: {
      type: String,
    },

    // Reports Database Entry

    marketer_id: String,

    marketer_name: String,

    calling_date: String,

    followup_date: String,

    country: String,

    website: String,

    category: String,

    company_name: String,

    contact_person: String,

    contact_number: String,

    email_address: String,

    calling_status: String,

    linkedin: String,

    calling_date_history: [String],

    updated_by: {
      type: String,
      default: null,
    },
    followup_done: {
      type: Boolean,
    },
    is_test: {
      type: Boolean,
    },
    is_prospected: {
      type: Boolean,
    },
    prospect_status: {
      type: String,
    },
    is_lead: {
      type: Boolean,
      default: false,
    },
    lead_withdrawn: {
      type: Boolean,
      default: false,
    },

    // Employees Database Entry

    e_id: {
      type: String,
    },
    real_name: {
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
    // if employee is a marketer
    company_provided_name: {
      type: String,
    },
    gross_salary: {
      type: Number,
    },
    bonus_eid_ul_fitr: {
      type: String,
    },
    bonus_eid_ul_adha: {
      type: String,
    },
    provident_fund: {
      type: Number,
      default: 0,
    },
    branch: {
      type: String,
    },
    division: {
      type: String,
    },
    status: {
      type: String,
    },
    permenant: {
      type: Boolean,
    },
    note: {
      type: String,
    },

    id: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

module.exports =
  mongoose.models.Approval || mongoose.model("Approval", ApprovalSchema);
