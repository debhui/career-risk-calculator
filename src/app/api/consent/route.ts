// app/api/accept-consent/route.ts
import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "missing auth" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const supabase = await createSupabaseServerClient();

    // ✅ must be access_token, not refresh_token
    const { data: userResp, error: userErr } = await supabase.auth.getUser(token);

    if (userErr || !userResp?.user) {
      console.error("Token verification failed:", userErr);
      return NextResponse.json({ error: "invalid token" }, { status: 401 });
    }

    const user = userResp.user;
    const body = await req.json();

    if (!body.accept) {
      return NextResponse.json({ error: "must accept" }, { status: 400 });
    }

    const { error: dbErr } = await supabase
      .from("profiles")
      .update({
        consent_accepted: true,
        consent_accepted_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        onboarding_completed: true,
      })
      .eq("id", user.id);

    if (dbErr) {
      console.error("Database Error:", dbErr);
      return NextResponse.json({ error: "db error" }, { status: 500 });
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err) {
    console.error("API Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
