"use client";

import { useState, useCallback } from "react";
// FIX: The path alias "@/lib/supabaseClient" failed to resolve.
// We are mocking the necessary supabase client functionality for demonstration.
// import { supabase } from "@/lib/supabaseClient";
import { Upload } from "lucide-react";

// --- Mock Implementation for Compilation Fix ---
// This mock object provides the minimum functionality (auth.getUser)
// needed by the component to proceed without the external file.
const supabase = {
  auth: {
    getUser: async () => ({
      data: { user: { id: "mock-user-id-12345" } }, // Provide a mock user ID
    }),
  },
};

// Mock implementation of uploadWithProgress for completeness,
// replace with your actual implementation from "@/lib/upload"
const uploadWithProgress = async (file: File, url: string, setProgress: (p: number) => void) => {
  console.log(`Mock Uploading ${file.name} to ${url}`);

  // Simulate upload progress
  for (let i = 1; i <= 100; i += 10) {
    await new Promise(resolve => setTimeout(resolve, 100));
    setProgress(i);
  }
  setProgress(100);
  console.log("Mock Upload Complete.");
  return { path: `resumes/${file.name}` };
};

export default function ResumeUpload() {
  const [progress, setProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  /**
   * Central logic to process and upload a single file.
   * @param file The File object to upload.
   */
  const processAndUpload = useCallback(
    async (file: File) => {
      setErrorMessage(null);
      setProgress(0);

      // 1. Validation
      if (file.size > 5 * 1024 * 1024) {
        // Changed max size to 5MB as per UI text
        setErrorMessage("File too large (5MB max)");
        return;
      }

      const ext = file.name.split(".").pop()?.toLowerCase();
      if (!["pdf", "doc", "docx", "txt"].includes(ext!)) {
        setErrorMessage("Invalid file type. Please use PDF, DOCX, DOC, or TXT.");
        return;
      }

      // 2. Auth Check
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setErrorMessage("Authentication failed. Please sign in.");
        return;
      }

      try {
        // 3. Request Signed URL
        const res = await fetch("/api/resumes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fileName: file.name, userId: user.id }),
        });

        if (!res.ok) {
          throw new Error("Failed to get signed upload URL.");
        }

        const { url, path } = await res.json();

        // 4. Upload with progress
        // Note: The mock uploadWithProgress simulates the actual upload logic
        const result = await uploadWithProgress(file, url, setProgress);

        console.log("Uploaded to:", result.path);
      } catch (error) {
        console.error("Upload error:", error);
        setErrorMessage("An error occurred during upload. Check console for details.");
      } finally {
        // Only reset progress to 0 if an error occurred,
        // otherwise let it display 100% success state briefly
        if (errorMessage) {
          setProgress(0);
        } else if (progress === 100) {
          // Keep at 100% briefly, then reset for next upload
          setTimeout(() => setProgress(0), 3000);
        }
      }
    },
    [errorMessage, progress]
  );

  // Handler for file input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processAndUpload(file);
      // Reset input value so same file can be selected again
      e.target.value = "";
    }
  };

  // Handlers for Drag & Drop
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault(); // Necessary to allow dropping
    e.stopPropagation();
    if (!isDragging) setIsDragging(true);
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    // Get file from dataTransfer
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processAndUpload(file);
    }
  };

  // Determine border style based on dragging state and errors
  const borderClasses = `
    border-2 border-dashed rounded-xl p-8 transition-colors duration-300
    ${
      isDragging
        ? "border-indigo-400 bg-gray-700"
        : errorMessage
        ? "border-red-500 bg-gray-800 hover:border-red-400"
        : "border-indigo-500/50 bg-gray-800 hover:border-indigo-400"
    }
  `;

  const isUploading = progress > 0 && progress < 100;

  return (
    <div
      className={borderClasses}
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="flex flex-col items-center justify-center">
        <Upload className="h-8 w-8 text-indigo-400 mb-3" />
        <p className="text-sm text-gray-400 mb-2">
          Drag & drop your resume here, or click the button below
        </p>

        {/* Input file button styling trick */}
        <label htmlFor="file-upload" className="cursor-pointer">
          <div
            className={`rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-md transition-colors ${
              isUploading ? "bg-gray-500 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700"
            } focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-900`}
          >
            {isUploading ? "Uploading..." : "Browse Files"}
          </div>
        </label>
        <input
          id="file-upload"
          type="file"
          onChange={handleInputChange}
          accept=".pdf,.doc,.docx,.txt"
          disabled={isUploading}
          className="sr-only" // Visually hide the input but keep it accessible
        />

        {/* Progress Bar and Status */}
        {errorMessage && <p className="mt-4 text-sm text-red-400 font-semibold">{errorMessage}</p>}
        {progress > 0 && progress <= 100 && (
          <div className="w-full mt-4">
            <p className="text-sm text-indigo-300 mb-1">
              {progress < 100 ? `Uploading: ${progress}%` : "Upload Complete!"}
            </p>
            <div className="h-2 bg-gray-700 rounded-full">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${
                  progress === 100 ? "bg-green-500" : "bg-indigo-500"
                }`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        <p className="mt-2 text-xs text-gray-500">(PDF, DOCX, DOC, TXT only. Max 5MB)</p>
      </div>
    </div>
  );
}
