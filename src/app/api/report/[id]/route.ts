import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params; // ✅ await the params

  const supabase = await createSupabaseServerClient();
  const { data: sessionData } = await supabase.auth.getSession();
  const userId = sessionData?.session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { data: report, error } = await supabase
    .from("reports")
    .select("*")
    .eq("id", id)
    .eq("user_id", userId)
    .single();

  if (error || !report) {
    return NextResponse.json({ error: "report_not_found" }, { status: 404 });
  }

  if (report.status !== "paid") {
    return NextResponse.json({ error: "payment_required" }, { status: 402 });
  }

  return NextResponse.json({ report });
}
