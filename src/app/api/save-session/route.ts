// pages/api/save-session.ts
import { NextResponse } from "next/server";
// Assuming 'supabaseAdmin' is the server-side client with Service Role key access
import { supabaseAdmin } from "@/lib/supabaseAdmin.server";
import { encryptJSON } from "@/lib/crypto";

// Define a simple type for the identity to avoid 'any' error
interface UserIdentity {
  provider: string;
  identity_data?: {
    sub?: string;
  };
  id?: string;
}

// Define the handler for POST requests using App Router syntax
export async function POST(req: Request) {
  try {
    // 1. Parse request body
    const { session } = await req.json();

    if (!session || !session.access_token) {
      return new NextResponse(JSON.stringify({ error: "missing session or access token" }), {
        status: 400,
      });
    }

    // 2. Validate session via supabase service client: get user by access_token
    const { data: userResp, error: userErr } = await supabaseAdmin.auth.getUser(
      session.access_token
    );

    if (userErr || !userResp.user) {
      console.error("Supabase getUser error:", userErr);
      return new NextResponse(JSON.stringify({ error: "invalid session" }), { status: 401 });
    }

    const user = userResp.user;

    // 3. Extract profile metadata
    const fullName = user.user_metadata?.full_name || user.user_metadata?.name || null;
    const email = user.email;
    const avatar = user.user_metadata?.avatar_url || user.user_metadata?.picture || null;
    const providerIds: UserIdentity[] = user.identities || [];

    // Find google identity to get provider_user_id (google sub)
    const googleIdentity = providerIds.find(i => i.provider === "google");

    const googleSub = googleIdentity?.identity_data?.sub || googleIdentity?.id || null;

    // 4. Encrypt tokens
    const tokenPayload = {
      access_token: session.access_token,
      refresh_token: session.refresh_token,
      provider: session.provider,
      expires_at: session.expires_at ?? null,
      obtained_at: new Date().toISOString(),
    };
    // NOTE: Assuming 'encryptJSON' returns a string.
    const enc = encryptJSON(tokenPayload);

    // 5. Upsert profile row
    const { data: _data, error: dbError } = await supabaseAdmin
      .from("profiles")
      .upsert(
        {
          id: user.id,
          full_name: fullName,
          email,
          avatar_url: avatar,
          google_sub: googleSub,
          encrypted_tokens: enc,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" }
      )
      .select();

    if (dbError) {
      console.error("profiles upsert error:", dbError);
      return new NextResponse(JSON.stringify({ error: "db error" }), { status: 500 });
    }

    // 6. Successful response
    return new NextResponse(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("API Catch Error:", err);
    return new NextResponse(JSON.stringify({ error: "server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
