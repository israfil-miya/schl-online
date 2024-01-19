import mongoose from "mongoose";
import moment from "moment-timezone";

const OrderSchema = new mongoose.Schema(
  {
    date_today: {
      type: String,
      default: moment().tz("Asia/Dhaka").format("DD-MM-YYYY"),
    },
    time_now: {
      type: String,
      default: moment().tz("Asia/Dhaka").format("HH:mm"),
    },
    client_code: {
      type: String,
    },
    client_name: {
      type: String,
    },
    folder: {
      type: String,
    },
    quantity: {
      type: Number,
    },
    download_date: {
      type: String,
    },
    delivery_date: {
      type: String,
    },
    delivery_bd_time: {
      type: String,
    },
    task: {
      type: String,
    },
    et: {
      type: Number,
    },
    production: {
      type: String,
    },
    qc1: {
      type: Number,
    },
    comment: {
      type: String,
    },
    type: {
      type: String,
    },
    status: {
      type: String,
    },
    priority: {
      type: String,
    },
    updated_by: {
      type: String,
      default: null,
    },
  },
  { timestamps: true },
);

export default mongoose.models?.Order || mongoose.model("Order", OrderSchema);
