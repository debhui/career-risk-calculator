import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin.server";

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new NextResponse(JSON.stringify({ error: "missing auth" }), { status: 401 });
    }
    const token = authHeader.split(" ")[1];

    const { data: userResp, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !userResp.user) {
      console.error("Token verification failed:", error);
      return new NextResponse(JSON.stringify({ error: "invalid token" }), { status: 401 });
    }

    const user = userResp.user;

    const { accept } = await req.json();

    if (!accept) {
      return new NextResponse(JSON.stringify({ error: "must accept" }), { status: 400 });
    }

    const { error: dbErr } = await supabaseAdmin
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
      return new NextResponse(JSON.stringify({ error: "db error" }), { status: 500 });
    }

    return new NextResponse(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    // Catch network or parsing errors
    console.error("API Error:", error);
    return new NextResponse(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
