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
  const options = {
    timeZone: 'Asia/Dhaka',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  };

  const now = new Date();
  const localDate = now.toLocaleDateString('en-US', options);
  const [month, day, year] = localDate.split('/');

  const formattedDate = `${day}-${month}-${year}`;

  return formattedDate;
}


console.log(dateToday());


function timeNow() {
  const options = {
    timeZone: 'Asia/Dhaka',
    hour12: false,
    hour: '2-digit',
    minute: '2-digit'
  };

  const now = new Date();
  const localTime = now.toLocaleTimeString('en-US', options);
  const utcTime = now.toISOString();

  console.log('Local Time:', localTime);
  console.log('UTC Time:', utcTime);

  return localTime;
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
