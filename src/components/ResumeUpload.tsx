// components/ResumeUpload.tsx
"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { uploadWithProgress } from "@/lib/upload";
import { Upload } from "lucide-react";

export default function ResumeUpload() {
  const [progress, setProgress] = useState(0);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      alert("File too large (8MB max)");
      return;
    }

    const ext = file.name.split(".").pop();
    if (!["pdf", "doc", "docx", "txt"].includes(ext!)) {
      alert("Invalid file type");
      return;
    }

    // get current user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // request signed URL from server
    const res = await fetch("/api/resumes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fileName: file.name, userId: user?.id }),
    });
    const { url, path } = await res.json();

    // upload with progress
    await uploadWithProgress(file, url, setProgress);

    console.log("Uploaded to:", path);
  };

  // return (
  //   <div>
  //     <input type="file" onChange={handleUpload} />
  //     {progress > 0 && <p>Upload: {progress}%</p>}
  //   </div>
  // );

  return (
    <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-indigo-500/50 bg-gray-800 p-8 transition-colors duration-300 hover:border-indigo-400">
      <Upload className="h-8 w-8 text-indigo-400 mb-3" />
      <p className="text-sm text-gray-400 mb-2">Drag & drop your resume here, or click to upload</p>
      <input
        type="file"
        onChange={handleUpload}
        className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-md transition-colors hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-900"
      />
      <p className="mt-2 text-xs text-gray-500">(PDF, DOCX only. Max 5MB)</p>
    </div>
  );
}
