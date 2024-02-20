export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';


// app/get-remaining-time/route.js
import Order from "@/db/Orders";
import dbConnect from "@/db/dbConnect";
import moment from "moment-timezone";
import { setIntervalAsync } from 'set-interval-async/dynamic';
import { clearIntervalAsync } from 'set-interval-async';

dbConnect();

function calculateTimeDifference(deliveryDate, deliveryTime) {
  // ... (your time difference calculation logic)
}

export async function GET(req) {
  try {
    const res = NextResponse.create();

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
      // ... (your query conditions)
    ).lean();

    const sortedOrders = orders
      .map((order) => ({
        timeDifference: calculateTimeDifference(
          order.delivery_date,
          order.delivery_bd_time,
        ),
      }))
      .sort((a, b) => a.timeDifference - b.timeDifference);

    sendSSEEvent(sortedOrders);

    // Update time every second
    const intervalId = setIntervalAsync(async () => {
      const orders = await Order.find(
        // ... (your query conditions)
      ).lean();

      const sortedOrders = orders
        .map((order) => ({
          timeDifference: calculateTimeDifference(
            order.delivery_date,
            order.delivery_bd_time,
          ),
        }))
        .sort((a, b) => a.timeDifference - b.timeDifference);

      sendSSEEvent(sortedOrders);
    }, parseInt(process.env.NEXT_PUBLIC_UPDATE_DELAY));

    // Clean up on client disconnect or server-side request completion
    const cleanup = () => {
      console.log('Client disconnected or request completed');
      clearIntervalAsync(intervalId);
      res.end();
    };

    // Handle server-side request completion
    res.on('finish', cleanup);

    // Handle client disconnect (if applicable)
    if (req.socket) {
      req.socket.on('close', cleanup);
    }

    return res;
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
  }
}
