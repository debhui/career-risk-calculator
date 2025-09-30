"use client";

import React, { useState, useEffect } from "react";
import { FileUp, Loader2, CheckCircle, XCircle, ArrowRight, MousePointer } from "lucide-react";
import { createSupabaseClient } from "@/lib/supabase/browser";

const RESUME_BUCKET = "resumes"; // Define the bucket name
const ASSESSMENT_TABLE = "assessments";
// Define props to include the callback for success
interface ResumeUploadProps {
  onUploadSuccess: (assessmentId: string) => void;
  onContinue: () => void;
  // New prop: indicates if the Resume step was successfully completed in this flow session (Back button logic)
  isResumeStepCompletedInFlow: boolean;
  // Persistent state: indicates if *any* file was ever uploaded (for initialization/re-select logic)
  hasFileUploadedHistorically: boolean;
}

export const ResumeUpload: React.FC<ResumeUploadProps> = ({
  onUploadSuccess,
  onContinue,
  isResumeStepCompletedInFlow,
  hasFileUploadedHistorically,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Status is initialized to success ONLY if the parent flow indicates completion AND a file was historically uploaded
  const initialStatus =
    isResumeStepCompletedInFlow && hasFileUploadedHistorically ? "success" : "idle";
  const [uploadStatus, setUploadStatus] = useState<"idle" | "success" | "error" | "selected">(
    initialStatus
  );

  const [errorMessage, setErrorMessage] = useState("");
  const supabase = createSupabaseClient();
  const [isDragging, setIsDragging] = useState(false);

  // Effect to reset status if the flow state changes to not-completed (i.e., manual progress bar click)
  useEffect(() => {
    // If the parent says the flow is reset, and we don't have a new file selected, reset the status
    if (!isResumeStepCompletedInFlow && uploadStatus === "success" && !file) {
      setUploadStatus("idle");
    }
  }, [isResumeStepCompletedInFlow, uploadStatus, file]);

  // Client-side Validation (Acceptance Criterion met here)
  const validateAndSetFile = (selectedFile: File | null) => {
    setErrorMessage("");

    if (selectedFile) {
      if (selectedFile.type !== "application/pdf") {
        setErrorMessage("Only PDF files are supported.");
        setUploadStatus("error");
        setFile(null);
        return false;
      }
      if (selectedFile.size > 5 * 1024 * 1024) {
        // Max 5MB
        setErrorMessage("File size must be under 5MB.");
        setUploadStatus("error");
        setFile(null);
        return false;
      }

      setFile(selectedFile);
      setUploadStatus("selected"); // Change status to selected/ready-to-upload
      return true;
    } else {
      setFile(null);
      // If we clear the file, go back to idle, or keep success if the flow is still complete
      setUploadStatus(
        isResumeStepCompletedInFlow && hasFileUploadedHistorically ? "success" : "idle"
      );
      return false;
    }
  };

  // Handler for file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    validateAndSetFile(selectedFile);
  };

  // Handlers for Drag and Drop
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files?.[0] || null;
    validateAndSetFile(droppedFile);
  };

  // Server-side Upload Logic
  const handleUpload = async () => {
    if (!file) {
      setErrorMessage("Please select a file first.");
      return;
    }

    setIsUploading(true);
    setUploadStatus("idle");
    setErrorMessage("");

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setErrorMessage("Authentication required to upload.");
        setUploadStatus("error");
        return;
      }

      const fileExt = file.name.split(".").pop();
      const fileName = `resume_${Date.now()}.${fileExt}`;
      const filePath = `users/${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from(RESUME_BUCKET)
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: true,
        });

      if (uploadError) {
        setErrorMessage(`Upload failed: ${uploadError.message}`);
        setUploadStatus("error");
        setIsUploading(false);
        return;
      }

      const metadata = {
        user_id: user.id,
        file_name: file.name,
        storage_path: filePath,
        status: "DRAFT",
      };

      const { data, error: dbError } = await supabase
        .from(ASSESSMENT_TABLE) // Assuming table name is 'resumes'
        .insert([metadata])
        .select("id");

      if (dbError) {
        setErrorMessage(`Database insert failed: ${dbError.message}`);
        setUploadStatus("error");
      } else if (data && data.length > 0) {
        const newAssessmentId = data[0].id;
        setUploadStatus("success");
        onUploadSuccess(newAssessmentId);
        setFile(null);
      } else {
        // Should not happen if select('id') is successful
        setErrorMessage("Database insert failed to return ID.");
        setUploadStatus("error");
      }
    } catch (e) {
      setErrorMessage("An unexpected error occurred during upload.");
      setUploadStatus("error");
      console.error(e);
    } finally {
      setIsUploading(false);
    }
  };

  // --- UI Logic ---

  // Determine which button to show
  const showContinueButton = uploadStatus === "success" && !file;
  const isUploadButtonDisabled = isUploading || !file;
  const isFileSelectionDisabled = isUploading;

  const statusMap = {
    idle: {
      icon: FileUp,
      color: "text-teal-600 dark:text-indigo-400",
      message: "Accepted format: PDF (Max 5MB)",
    },
    selected: {
      icon: CheckCircle,
      color: "text-yellow-600 dark:text-yellow-400",
      message: `${file?.name} ready to upload.`,
    },
    success: {
      icon: CheckCircle,
      color: "text-green-600 dark:text-green-400",
      message: "Resume ready. Click 'Continue' or select a new file to update.",
    },
    error: { icon: XCircle, color: "text-red-400", message: errorMessage || "Upload failed." },
  };

  const currentStatus = statusMap[uploadStatus];

  // Dynamic drop zone styling
  const dropZoneClasses = `
    p-6 space-y-4 rounded-xl transition-all duration-300
    ${
      isDragging
        ? "border-teal-500 dark:border-indigo-500 bg-gray-300 dark:bg-gray-700 border-solid"
        : "border-teal-500 dark:border-gray-700 bg-gray-300 dark:bg-gray-900/50 border-dashed"
    }
    border-2
  `;

  return (
    <div
      className={dropZoneClasses}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Drag & Drop Visual Indicator */}
      {isDragging && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-gray-400 dark:bg-gray-900/80 rounded-xl pointer-events-none">
          <MousePointer className="w-12 h-12 text-teal-400 dark:text-indigo-400 animate-bounce" />{" "}
          <p className="mt-2 text-xl font-semibold text-teal-300 dark:text-indigo-300">
            Drop your PDF resume here
          </p>
        </div>
      )}

      <div className={`relative ${isDragging ? "opacity-50 pointer-events-none" : ""}`}>
        <div className="flex flex-col items-center justify-center space-y-2 text-gray-600 dark:text-gray-400 mb-4">
          <FileUp className="w-8 h-8" />
          <p className="text-sm font-medium">Drag & Drop or Choose File</p>
        </div>

        {/* Hidden File Input (triggered by the label) */}
        <label htmlFor="resume-file-input" className="block cursor-pointer">
          <input
            id="resume-file-input"
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            className="hidden" // Hide the default input UI
            disabled={isFileSelectionDisabled}
          />
          {/* Custom File Picker Button */}
          <div className="flex flex-col w-full text-center gap-2">
            <span
              className={`inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white transition duration-200 
                            ${
                              showContinueButton
                                ? "bg-green-600 cursor-default"
                                : "bg-teal-600 dark:bg-indigo-600 hover:bg-teal-700 hover:dark:bg-indigo-700 cursor-pointer"
                            }
                        `}
            >
              {showContinueButton ? "File Uploaded" : "Select File"}
            </span>
            <p className={`text-sm flex items-center justify-center ${currentStatus.color}`}>
              <currentStatus.icon className="w-4 h-4 mr-2" />
              {currentStatus.message}
            </p>
          </div>
        </label>

        {/* Action Buttons */}
        <div className="flex flex-col justify-center items-center gap-4 pt-4 border-t border-gray-700 mt-4">
          {/* 1. UPLOAD BUTTON (Shown when a new file is selected or if error/idle) */}
          {(uploadStatus !== "success" || file) && (
            <button
              onClick={handleUpload}
              disabled={isUploadButtonDisabled}
              className={`mt-2 flex w-full items-center justify-center rounded-xl py-3 px-4 text-lg font-bold text-white shadow-xl shadow-teal-600/30 dark:shadow-indigo-600/30 transition-all duration-300 hover:bg-teal-700 dark:hover:bg-indigo-700 
                                ${
                                  isUploadButtonDisabled
                                    ? "bg-teal-700 dark:bg-indigo-400 cursor-not-allowed"
                                    : "bg-teal-600 dark:bg-indigo-600"
                                }
                            `}
            >
              {isUploading ? (
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              ) : (
                <FileUp className="w-5 h-5 mr-2" />
              )}
              {isUploading ? "Uploading..." : "Upload File & Proceed"}
              <ArrowRight className="ml-3 h-5 w-5" />
            </button>
          )}

          {/* 2. CONTINUE BUTTON (Shown when already uploaded and no new file selected) */}
          {showContinueButton && (
            <button
              onClick={onContinue}
              className="mt-2 flex w-full items-center justify-center rounded-xl bg-green-600 py-3 px-4 text-lg font-bold text-white shadow-xl shadow-green-600/30 transition-all duration-300 hover:bg-green-700"
            >
              Continue to Assessment
              <ArrowRight className="ml-3 h-5 w-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
