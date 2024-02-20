export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import Order from "@/db/Orders";
import dbConnect from "@/db/dbConnect";
import moment from "moment-timezone";
import { setIntervalAsync } from "set-interval-async/dynamic";
import { clearIntervalAsync } from "set-interval-async";

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

export async function GET(req) {
  try {
    let responseStream = new TransformStream();
    const writer = responseStream.writable.getWriter();
    const encoder = new TextEncoder();

    function sendSSEEvent(data) {
      const formattedData = `data: ${JSON.stringify(data)}\n\n`;
      writer.write(encoder.encode(formattedData));
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
    req.signal.onabort = () => {
      console.log("Client disconnected");
      clearIntervalAsync(intervalId);
      writer.close();
    };

    return new Response(responseStream.readable, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "text/event-stream;charset=utf-8",
        Connection: "keep-alive",
        "Cache-Control": "no-cache, no-transform",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "An error occurred" }, { status: 500 });
  }
}
