import mongoose from "mongoose";

let NoticeSchema = new mongoose.Schema(
  {
    updated_by: {
      type: String,
      default: null,
    },
    channel: {
      type: String,
      required: true,
    },
    notice_no: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    file_name: {
      type: String,
    },
  },
  { timestamps: true, __v: false },
);

module.exports =
  mongoose.models.Notice || mongoose.model("Notice", NoticeSchema);
