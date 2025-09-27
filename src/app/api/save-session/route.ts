// pages/api/save-session.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { supabaseAdmin } from "@/lib/supabaseAdmin.server";
import { encryptJSON } from "@/lib/crypto";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const { session } = req.body;
  if (!session) return res.status(400).json({ error: "missing session" });

  try {
    // Validate session via supabase service client: get user by access_token
    const { data: userResp, error: userErr } = await supabaseAdmin.auth.getUser(
      session.access_token
    );
    if (userErr || !userResp) {
      console.error("supabase getUser error", userErr);
      return res.status(401).json({ error: "invalid session" });
    }
    const user = userResp.user;
    if (!user) return res.status(401).json({ error: "no user" });

    // Build profile data to upsert
    const fullName = user.user_metadata?.full_name || user.user_metadata?.name || null;
    const email = user.email;
    const avatar = user.user_metadata?.avatar_url || user.user_metadata?.picture || null;
    const providerIds = user.identities || [];
    // find google identity to get provider_user_id (google sub)
    const googleIdentity = providerIds.find((i: any) => i.provider === "google");

    const googleSub = googleIdentity?.identity_data?.sub || googleIdentity?.id || null;

    // encrypt tokens: include access_token, refresh_token, expires_at
    const tokenPayload = {
      access_token: session.access_token,
      refresh_token: session.refresh_token,
      provider: session.provider,
      expires_at: session.expires_at ?? null,
      obtained_at: new Date().toISOString(),
    };
    const enc = encryptJSON(tokenPayload);

    // Upsert profile row
    const { data, error } = await supabaseAdmin
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

    if (error) {
      console.error("profiles upsert error", error);
      return res.status(500).json({ error: "db error" });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "server error" });
  }
}
