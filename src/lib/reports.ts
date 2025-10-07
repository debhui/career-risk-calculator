// lib/reports.ts
import { supabaseAdmin } from "@/lib/supabase/service"; // or "@/lib/supabase" if same file

export async function getReportById(id: string) {
  const { data, error } = await supabaseAdmin.from("reports").select("*").eq("id", id).single();

  if (error) {
    console.error("Error fetching report:", error.message);
    return null;
  }

  return data;
}
