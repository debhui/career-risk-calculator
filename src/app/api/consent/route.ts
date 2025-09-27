// pages/api/consent.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { supabaseAdmin } from "@/lib/supabaseAdmin.server";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();
  const { accept } = req.body;

  // We expect the client to include Authorization header (bearer) with their access token
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "missing auth" });
  const token = authHeader.split(" ")[1];

  // Verify the token and get user
  const { data: userResp, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !userResp) return res.status(401).json({ error: "invalid token" });
  const user = userResp.user;
  if (!user) return res.status(401).json({ error: "no user" });

  if (!accept) return res.status(400).json({ error: "must accept" });

  const { error: dbErr } = await supabaseAdmin
    .from("profiles")
    .update({
      consent_accepted: true,
      consent_accepted_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      onboarding_completed: true,
    })
    .eq("id", user.id);

  if (dbErr) return res.status(500).json({ error: "db" });
  return res.status(200).json({ ok: true });
}
