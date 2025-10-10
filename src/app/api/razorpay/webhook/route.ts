// src/app/api/razorpay/webhook/route.ts
import { NextResponse } from "next/server";
import crypto from "crypto";
import { supabaseAdmin } from "@/lib/supabase/service";

const WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET!;

export async function POST(req: Request) {
  let logId: string | null = null;
  let transactionId: string | null = null;
  let event = "unknown";
  let statusCode = 500;
  let processed = false;
  let errorMessage: string | null = null;

  try {
    const signature = req.headers.get("x-razorpay-signature");
    const body = await req.text();

    if (!signature || !WEBHOOK_SECRET) {
      return new NextResponse("Missing webhook configuration", { status: 400 });
    }

    // Try parsing early for logging
    let payload: any;
    try {
      payload = JSON.parse(body);
      event = payload?.event || "unverified";
    } catch {
      payload = { raw: body };
    }

    // 🪵 Step 1: Pre-log the webhook
    const { data: inserted, error: insertError } = await supabaseAdmin
      .from("webhook_logs")
      .insert({
        event,
        payload,
        signature,
        processed: false,
      })
      .select("id")
      .single();

    if (insertError) console.error("⚠️ Failed to insert webhook log:", insertError);
    else logId = inserted?.id;

    // ✅ Step 2: Verify Razorpay signature
    const expected = crypto.createHmac("sha256", WEBHOOK_SECRET).update(body).digest("hex");
    if (expected !== signature) {
      errorMessage = "Invalid Razorpay signature";
      statusCode = 403;
      console.error("❌ Invalid signature");

      if (logId)
        await supabaseAdmin
          .from("webhook_logs")
          .update({
            status_code: statusCode,
            error_message: errorMessage,
          })
          .eq("id", logId);

      return new NextResponse(errorMessage, { status: statusCode });
    }

    // Step 3: Extract payment details
    const payment = payload.payload?.payment?.entity;
    if (!payment) {
      statusCode = 200;
      errorMessage = "No payment entity found";
      await updateLog(logId, statusCode, processed, errorMessage);
      return new NextResponse("No payment entity", { status: statusCode });
    }

    const orderId = payment.order_id;
    const paymentId = payment.id;
    const reportId = payment.notes?.report_id;

    if (!reportId || !orderId) {
      statusCode = 200;
      errorMessage = "Missing report_id or order_id";
      await updateLog(logId, statusCode, processed, errorMessage);
      return new NextResponse("Missing data", { status: statusCode });
    }

    // Step 4: Find related transaction
    const { data: tx } = await supabaseAdmin
      .from("transactions")
      .select("id")
      .eq("razorpay_order_id", orderId)
      .single();

    if (tx) transactionId = tx.id;

    // Step 5: Update DB for captured payments
    if (event === "payment.captured" || payment.status === "captured") {
      const { error: txError } = await supabaseAdmin
        .from("transactions")
        .update({
          status: "success",
          razorpay_payment_id: paymentId,
          updated_at: new Date().toISOString(),
        })
        .eq("razorpay_order_id", orderId);
      if (txError) throw txError;

      const { error: reportError } = await supabaseAdmin
        .from("reports")
        .update({
          status: "paid_ready_to_view",
          paid_at: new Date().toISOString(),
        })
        .eq("id", reportId);
      if (reportError) throw reportError;

      processed = true;
      statusCode = 200;
      console.log(`✅ Payment captured for report ${reportId}`);
    }

    // Step 6: Update webhook_logs entry
    await updateLog(logId, statusCode, processed, errorMessage, transactionId);
    return new NextResponse("OK", { status: 200 });
  } catch (err: any) {
    console.error("❌ Webhook error:", err);
    errorMessage = err.message || "Internal error";

    await updateLog(logId, 500, false, errorMessage, transactionId);
    return new NextResponse("Internal error", { status: 500 });
  }
}

async function updateLog(
  logId: string | null,
  statusCode: number,
  processed: boolean,
  errorMessage: string | null,
  transactionId: string | null = null
) {
  if (!logId) return;
  await supabaseAdmin
    .from("webhook_logs")
    .update({
      status_code: statusCode,
      processed,
      error_message: errorMessage,
      transaction_id: transactionId,
    })
    .eq("id", logId);
}
