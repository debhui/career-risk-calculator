// api/resumes/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin.server";
import { randomUUID } from "crypto";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const userId = formData.get("userId") as string | null;

    if (!file || !userId) {
      return NextResponse.json({ error: "Missing file or userId" }, { status: 400 });
    }

    // Validate file size (max 8MB)
    if (file.size > 8 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large" }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
    ];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "Unsupported file type" }, { status: 400 });
    }

    // Upload to Supabase storage
    const buffer = Buffer.from(await file.arrayBuffer());
    const fileName = `${userId}/${randomUUID()}-${file.name}`;
    const { data: storageData, error: storageError } = await supabaseAdmin.storage
      .from("resumes")
      .upload(fileName, buffer, {
        contentType: file.type,
      });

    if (storageError) throw storageError;

    // Public URL
    const { data: publicUrl } = supabaseAdmin.storage.from("resumes").getPublicUrl(fileName);

    // Insert metadata into DB
    const { error: dbError } = await supabaseAdmin.from("resumes").insert({
      user_id: userId,
      file_name: file.name,
      file_url: publicUrl.publicUrl,
      file_size: file.size,
    });

    if (dbError) throw dbError;

    return NextResponse.json({ success: true, url: publicUrl.publicUrl });
  } catch (err: any) {
    console.error("Resume upload error:", err.message);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
