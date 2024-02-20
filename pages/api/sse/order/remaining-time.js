import Order from "../../../../db/Orders";
import dbConnect from "../../../../db/dbConnect";
import moment from "moment-timezone";
import { setIntervalAsync } from 'set-interval-async/dynamic';
import { clearIntervalAsync } from 'set-interval-async';
dbConnect();

function calculateTimeDifference(deliveryDate, deliveryTime) {
  const is12HourFormat = /\b(?:am|pm)\b/i.test(deliveryTime);
  const [time, meridiem] = deliveryTime.split(/\s+/);
  const [hours, minutes] = time.split(":").map(Number);

  let adjustedHours = hours;
  if (is12HourFormat) {
    const meridiemLower = meridiem.toLowerCase();
    adjustedHours = moment(
      `${hours}:${minutes} ${meridiemLower}`,
      "hh:mm a",
    ).hours();
  }
  const asiaDhakaTime = moment().tz("Asia/Dhaka");

  const [year, month, day] = deliveryDate.split("-").map(Number);
  const deliveryDateTime = moment.tz(
    `${year}-${month}-${day} ${adjustedHours}:${minutes}`,
    "YYYY-MM-DD HH:mm",
    "Asia/Dhaka",
  );

  const timeDifferenceMs = deliveryDateTime.diff(asiaDhakaTime);

  return timeDifferenceMs;
}

export default async function handleGetRemainingTimeSSE(req, res) {
  try {
    // Set headers for SSE
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'text/event-stream;charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('X-Accel-Buffering', 'no');
  
    // Function to send SSE event
    function sendSSEEvent(data) {
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    }
  
    // Send initial time
    const orders = await Order.find(
      { status: { $nin: ["Finished", "Correction"] }, type: { $ne: "Test" } },
      { delivery_date: 1, delivery_bd_time: 1 },
    ).lean();

    const sortedOrders = orders
      .map((order) => ({
        timeDifference: calculateTimeDifference(
          order.delivery_date,
          order.delivery_bd_time,
        ),
      }))
      .sort((a, b) => a.timeDifference - b.timeDifference);

    const initialRemainingTimes = sortedOrders;
    sendSSEEvent(initialRemainingTimes);
  
    // Update time every second
    const intervalId = setIntervalAsync(async () => {
      const orders = await Order.find(
        { status: { $nin: ["Finished", "Correction"] }, type: { $ne: "Test" } },
        { delivery_date: 1, delivery_bd_time: 1 },
      ).lean();

      const sortedOrders = orders
        .map((order) => ({
          timeDifference: calculateTimeDifference(
            order.delivery_date,
            order.delivery_bd_time,
          ),
        }))
        .sort((a, b) => a.timeDifference - b.timeDifference);

      const remainingTimes = sortedOrders;
      sendSSEEvent(remainingTimes);
    }, parseInt(process.env.NEXT_PUBLIC_UPDATE_DELAY));
  
    // Clean up on client disconnect
    req.on('close', () => {
      console.log('Client disconnected');
      clearIntervalAsync(intervalId);
      res.end();
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('An error occurred');
  }
}


export const config = {
  supportsResponseStreaming: true,
};