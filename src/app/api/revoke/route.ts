// pages/api/revoke.ts
import { NextResponse } from "next/server";
// Assuming 'supabaseAdmin' is the server-side client with Service Role key access
import { supabaseAdmin } from "@/lib/supabaseAdmin.server";

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new NextResponse(JSON.stringify({ error: "no auth" }), { status: 401 });
    }
    const token = authHeader.split(" ")[1];

    const { data: userResp, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !userResp.user) {
      console.error("Token verification failed:", error);
      return new NextResponse(JSON.stringify({ error: "invalid token" }), { status: 401 });
    }

    const user = userResp.user;

    const { error: softDeleteErr } = await supabaseAdmin
      .from("profiles")
      .update({
        consent_accepted: false,
        updated_at: new Date().toISOString(),
        // Optionally clear other sensitive data fields here
      })
      .eq("id", user.id);

    if (softDeleteErr) {
      console.error("Soft delete error:", softDeleteErr);
      // We continue even if soft delete fails, prioritizing the hard delete
    }

    // 4. Hard delete: Remove profile record completely
    // WARNING: Ensure you understand any cascade implications on other tables.
    const { error: profileDeleteErr } = await supabaseAdmin
      .from("profiles")
      .delete()
      .eq("id", user.id);

    if (profileDeleteErr) {
      console.error("Profile hard delete error:", profileDeleteErr);
      return new NextResponse(JSON.stringify({ error: "failed profile delete" }), { status: 500 });
    }

    // 5. Delete user from Supabase Auth (requires Service Role permissions)
    const { error: userDeleteErr } = await supabaseAdmin.auth.admin.deleteUser(user.id);

    if (userDeleteErr) {
      console.error("Auth user deletion error:", userDeleteErr);
      // This is critical for full deletion, so return 500
      return new NextResponse(JSON.stringify({ error: "failed auth user delete" }), {
        status: 500,
      });
    }

    // --- Successful response ---
    return new NextResponse(
      JSON.stringify({ message: "Your data has been successfully deleted." }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    // Catch parsing errors or unexpected issues
    console.error("API Error:", error);
    return new NextResponse(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
