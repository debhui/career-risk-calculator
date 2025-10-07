// api/razorpay/webhooks/route.ts
import { NextResponse } from "next/server";
import crypto from "crypto";
import { supabaseAdmin } from "@/lib/supabase/service";

// Get the Webhook Secret from environment variables
const WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET;

export async function POST(req: Request) {
  // 1. Get Raw Body and Signature
  const body = await req.text(); // Get the raw body string
  const signature = req.headers.get("x-razorpay-signature");

  if (!signature || !WEBHOOK_SECRET) {
    return new NextResponse("Webhook configuration error", { status: 400 });
  }

  // 2. 🛑 Verification: Securely check the signature
  const shasum = crypto.createHmac("sha256", WEBHOOK_SECRET);
  shasum.update(body);
  const digest = shasum.digest("hex");

  if (digest !== signature) {
    return new NextResponse("Invalid signature", { status: 403 });
  }

  // 3. Parse and Process Payload
  const payload = JSON.parse(body);
  const event = payload.event;
  const payment = payload.payload.payment.entity;

  console.log(`Processing Razorpay event: ${event}`);

  // We only care about successful payments
  if (event === "payment.captured" || payment.status === "captured") {
    const orderId = payment.order_id;
    const paymentId = payment.id;
    const reportId = payment.notes.report_id; // Retrieve reportId from the order notes

    // --- Step 5: Database Update & Fulfillment ---
    try {
      // A. Update the transaction status to 'success'
      const { error: txError } = await supabaseAdmin
        .from("transactions")
        .update({
          status: "success",
          razorpay_payment_id: paymentId,
          updated_at: new Date().toISOString(),
        })
        .eq("razorpay_order_id", orderId);

      if (txError) throw txError;

      // B. Update the report status (The ultimate sign-off)
      const { error: reportUpdateError } = await supabaseAdmin
        .from("reports")
        .update({
          status: "paid_ready_to_view",
        })
        .eq("id", reportId);

      if (reportUpdateError) throw reportUpdateError;

      // Success response (status 200 is mandatory for Razorpay)
      return new NextResponse("OK", { status: 200 });
    } catch (dbError) {
      console.error("Database update failed for order:", orderId, dbError);
      // Return 500 so Razorpay retries the webhook
      return new NextResponse("Database error", { status: 500 });
    }
  }

  // Handle other events like payment.failed or refund events (optional)
  return new NextResponse("Event received and ignored", { status: 200 });
}
