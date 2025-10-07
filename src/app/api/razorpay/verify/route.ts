import { NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, reportId } = body;

    // 1️⃣ Verify Razorpay signature
    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    // 2️⃣ Initialize Supabase (server-side)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 3️⃣ Fetch the report to get user_id and amount
    const { data: report, error: reportError } = await supabase
      .from("reports")
      .select("id, user_id, price")
      .eq("id", reportId)
      .single();

    if (reportError || !report) {
      console.error("Report fetch failed:", reportError);
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }
    console.log("#$%35423v 523");
    // 4️⃣ Update report status to "paid"
    const { error: updateError } = await supabase
      .from("reports")
      .update({
        status: "paid",
        paid_at: new Date().toISOString(),
      })
      .eq("id", report.id);

    if (updateError) {
      console.error("Failed to update report:", updateError);
      return NextResponse.json({ error: "Report update failed" }, { status: 500 });
    }

    // 5️⃣ Insert or update transaction (depending on whether the order already exists)
    const { error: txnError } = await supabase.from("transactions").upsert(
      {
        user_id: report.user_id,
        report_id: report.id,
        razorpay_order_id,
        razorpay_payment_id,
        status: "success",
        amount: report.price,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "razorpay_order_id" } // ensures unique constraint respected
    );

    if (txnError) {
      console.error("Failed to insert transaction:", txnError);
      // Don't fail the whole process if this happens
    }

    // 6️⃣ Return success response
    return NextResponse.json({
      success: true,
      message: "Payment verified, report marked paid, and transaction recorded",
    });
  } catch (err) {
    console.error("Verify route error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
