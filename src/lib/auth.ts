import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function getSession() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error || !session) {
    return null;
  }

  return session; // contains user info and access token
}
