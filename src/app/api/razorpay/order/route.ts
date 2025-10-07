// api/razorpay/order/route.ts
import Razorpay from "razorpay";
import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const REPORT_PRICE_PAISE = 49900;

export async function POST() {
  const supabase = await createSupabaseServerClient();

  // 1. Get the user. The client automatically reads the session from cookies.
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    console.error("Authentication failed:", error?.message || "User not found.");
    return new NextResponse(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  const userId = user.id;

  try {
    // 🚨 FIX: Check for reports that are either 'unpaid' (initial) or 'pending_payment'
    const { data: reports, error: fetchError } = await supabase
      .from("reports")
      .select("id, status")
      .eq("user_id", userId)
      .in("status", ["unpaid", "pending_payment"])
      .order("created_at", { ascending: false })
      .limit(1);

    let reportId: string;

    if (fetchError) {
      console.error("❌ Error fetching existing reports:", fetchError);
      throw fetchError;
    }

    if (reports && reports.length > 0) {
      reportId = reports[0].id;
      console.log("🟢 Found existing unpaid/pending report:", reportId);
    } else {
      // Create a new report if none exists in a state ready for payment
      const { data: newReport, error: insertError } = await supabase
        .from("reports")
        .insert({
          user_id: userId,
          price: REPORT_PRICE_PAISE / 100,
          status: "unpaid",
        })
        .select("id")
        .single();

      if (insertError) throw insertError;
      reportId = newReport.id;
      console.log("🟢 Created new unpaid report:", reportId);
    }

    // --- Step B: Create the Razorpay Order ---
    const options = {
      amount: REPORT_PRICE_PAISE,
      currency: "INR",
      receipt: `rpt_${reportId}`,
      payment_capture: 1,
      notes: {
        user_id: userId,
        report_id: reportId,
      },
    };

    const order = await razorpay.orders.create(options);

    // --- Step C: Record the pending Transaction in Supabase ---
    // Update the 'reports' status to 'pending_payment' now that an order is created
    const { error: reportUpdateError } = await supabase
      .from("reports")
      .update({
        status: "pending_payment",
      })
      .eq("id", reportId);

    if (reportUpdateError) {
      console.error("❌ Failed to update report status:", reportUpdateError);
      throw reportUpdateError;
    }

    const { error: transactionError } = await supabase.from("transactions").insert({
      user_id: userId,
      report_id: reportId,
      razorpay_order_id: order.id,
      status: "pending",
      amount: REPORT_PRICE_PAISE / 100,
    });

    if (transactionError) throw transactionError;

    // 2. Return success response
    return new NextResponse(
      JSON.stringify({
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        reportId: reportId,
        keyId: process.env.RAZORPAY_KEY_ID,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Error creating Razorpay order:", error.message || error);
    return new NextResponse(
      JSON.stringify({
        error: "Failed to create payment order",
        details: error.message || "Server error",
      }),
      { status: 500 }
    );
  }
}
