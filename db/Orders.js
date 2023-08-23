import mongoose from "mongoose";

function convertTo24HourFormat(time) {
  const twelveHourRegex = /^(1[0-2]|0?[1-9]):([0-5][0-9]) (AM|PM)$/i;
  const twentyFourHourRegex = /^([01]?[0-9]|2[0-3]):([0-5][0-9])$/;

  if (twelveHourRegex.test(time)) {
    const [, hours, minutes, period] = twelveHourRegex.exec(time);
    let hour = parseInt(hours, 10);

    if (period.toLowerCase() === "pm" && hour !== 12) {
      hour += 12;
    } else if (period.toLowerCase() === "am" && hour === 12) {
      hour = 0;
    }

    return `${hour.toString().padStart(2, "0")}:${minutes}`;
  } else if (twentyFourHourRegex.test(time)) {
    return time;
  } else {
    throw new Error("Invalid time format");
  }
}

function dateToday() {
  let now = new Date();
  let year = now.getFullYear();
  let month = (now.getMonth() + 1).toString().padStart(2, "0");
  let day = now.getDate().toString().padStart(2, "0");

  const returnValue = `${year}-${month}-${day}`;

  return returnValue;
}

function timeNodw() {
  let now = new Date();
  let hour = now.getHours().toString().padStart(2, "0");
  let minute = now.getMinutes().toString().padStart(2, "0");

  const returnValue = `${hour}:${minute}`;

  return convertTo24HourFormat(returnValue);
}

const OrderSchema = new mongoose.Schema({
  date_today: {
    type: String,
    default: dateToday(),
  },
  time_now: {
    type: String,
    default: timeNodw(),
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
  status: {
    type: String,
  },
});

module.exports = mongoose.models.Order || mongoose.model("Order", OrderSchema);
