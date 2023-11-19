import mongoose from "mongoose";
const ReportSchema = new mongoose.Schema(
  {
    marketer_id: String,
    marketer_name: String,
    calling_date: String,
    followup_date: String,
    country: String,
    website: String,
    category: String,
    company_name: String,
    contact_person: String,
    designation: String,
    contact_number: String,
    email_address: String,
    calling_status: String,
    email_status: String,
    feedback: String,
    linkedin: String,
    leads_taken_feedback: String,
    followup_done: {
      type: Boolean,
      default: false,
    },
    is_test: {
      type: Boolean,
      default: false,
    },
    is_prospected: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

module.exports =
  mongoose.models.Report || mongoose.model("Report", ReportSchema);
