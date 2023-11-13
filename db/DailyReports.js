import mongoose from "mongoose";
const DailyReportSchema = new mongoose.Schema(
  {
    report_date: String,
    marketer_name: String,
    calls_made: Number,
    contacts_made: Number,
    prospects: Number,
    test_jobs: Number,
  },
  { timestamps: true },
);

module.exports =
  mongoose.models.DailyReport ||
  mongoose.model("DailyReport", DailyReportSchema);
