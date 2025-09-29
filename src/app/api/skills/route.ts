import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

interface SkillPayload {
  userId: string;
  skillIds: number[]; // canonical skills selected
  projects: string[]; // free-text projects
}

export async function POST(req: NextRequest) {
  try {
    const body: SkillPayload = await req.json();
    const { userId, skillIds, projects } = body;

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    const supabase = await createSupabaseServerClient();
    // Insert skills (upsert to avoid duplicates)
    if (skillIds?.length > 0) {
      const rows = skillIds.map(id => ({ user_id: userId, skill_id: id }));
      const { error: skillError } = await supabase
        .from("user_ai_skills")
        .upsert(rows, { onConflict: "user_id,skill_id" });

      if (skillError) throw skillError;
    }

    // Insert projects
    if (projects?.length > 0) {
      const rows = projects.map(name => ({ user_id: userId, project_name: name }));
      const { error: projectError } = await supabase.from("user_ai_projects").insert(rows);

      if (projectError) throw projectError;
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Skill save error:", err.message);
    return NextResponse.json({ error: "Save failed" }, { status: 500 });
  }
}
