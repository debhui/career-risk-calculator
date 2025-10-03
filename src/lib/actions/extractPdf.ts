import { createSupabaseClient } from "@/lib/supabase/browser";

export async function extractPdf(filePath: string) {
  const supabase = createSupabaseClient();

  // ✅ ensure user is logged in
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error || !session) {
    throw new Error("Not authenticated");
  }

  const accessToken = session.access_token;

  // ✅ path inside private bucket
  const filePathWithBucket = `resumes/${filePath}`;

  // ✅ call your Supabase Edge Function
  const res = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/extract-pdf`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`, // 🔑 required
    },
    body: JSON.stringify({ filePath: filePathWithBucket }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`extract-pdf failed: ${err}`);
  }

  return res.json();
}
