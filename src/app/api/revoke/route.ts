// pages/api/revoke.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { supabaseAdmin } from "@/lib/supabaseAdmin.server";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: "no auth" });
  const token = auth.split(" ")[1];

  const { data: userResp, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !userResp || !userResp.user) return res.status(401).json({ error: "invalid" });

  const user = userResp.user;
  try {
    // 1) set consent flag false (soft)
    await supabaseAdmin
      .from("profiles")
      .update({ consent_accepted: false, updated_at: new Date().toISOString() })
      .eq("id", user.id);

    // 2) remove profile (hard-delete) - be careful: this will cascade? profiles table references auth.users id only
    await supabaseAdmin.from("profiles").delete().eq("id", user.id);

    // 3) optionally remove user from auth (this requires service role)
    await supabaseAdmin.auth.admin.deleteUser(user.id);

    // Note: deleteUser removes auth.user and related tokens; ensure you understand implications
    return res.status(200).json({ message: "Your data has been deleted." });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "failed" });
  }
}
