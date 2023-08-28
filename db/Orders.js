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
  const utcOffset = 6;
  const now = new Date();
  const utcPlus6Date = new Date(now.getTime() + (utcOffset * 60 * 60 * 1000));

  const year = utcPlus6Date.getUTCFullYear();
  const month = (utcPlus6Date.getUTCMonth() + 1).toString().padStart(2, "0");
  const day = utcPlus6Date.getUTCDate().toString().padStart(2, "0");

  const returnValue = `${year}-${month}-${day}`;

  return returnValue;
}

console.log(dateToday());


function timeNow() {
  const utcOffset = 6;
  const now = new Date();
  const utcPlus6Time = new Date(now.getTime() + (utcOffset * 60 * 60 * 1000));

  const hour = utcPlus6Time.getUTCHours().toString().padStart(2, "0");
  const minute = utcPlus6Time.getUTCMinutes().toString().padStart(2, "0");

  const returnValue = `${hour}:${minute}`;

  return returnValue;
}

console.log(timeNow());


const OrderSchema = new mongoose.Schema({
  date_today: {
    type: String,
    default: dateToday(),
  },
  time_now: {
    type: String,
    default: timeNow(),
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
