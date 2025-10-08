import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET() {
  // const authHeader = req.headers.get("authorization");
  // if (!authHeader) {
  //   return NextResponse.json({ error: "Missing auth header" }, { status: 401 });
  // }

  // const token = authHeader.replace("Bearer ", "").trim();
  const supabase = await createSupabaseServerClient();

  const { data: user, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    console.error("Authentication failed:", userError?.message || "User not found.");
    return new NextResponse(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  const { data, error } = await supabase
    .from("transactions")
    .select(
      `
      id,
      amount,
      status,
      created_at,
      razorpay_order_id,
      razorpay_payment_id,
      report:report_id (
        id,
        status,
        price,
        created_at,
        assessment:assessment_id (
          id,
          job_role,
          industry,
          specialization
        )
      )
    `
    )
    .eq("user_id", user.user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching transactions:", error);
    return NextResponse.json({ error: "Failed to load payments" }, { status: 500 });
  }

  return NextResponse.json({ payments: data || [] });
}
