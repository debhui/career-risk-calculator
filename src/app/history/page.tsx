"use client";

import React, { useState, useEffect } from "react";
import { createSupabaseClient } from "@/lib/supabase/browser";
import { Clock, Loader2, ListX, ChevronDown, ChevronUp } from "lucide-react";

// 1. Define the full structure of your assessment data
type AssessmentItem = {
  id: string;
  submitted_at: string;
  industry: string;
  job_role: string;
  company_size: string;
  experience: string;
  education: string;
  age_range: string;
  work_preference: string;
  // All other fields from the database are included by using 'select("*")'
  [key: string]: any;
};

export default function HistoryPage() {
  const supabase = createSupabaseClient();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [assessmentList, setAssessmentList] = useState<AssessmentItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  /**
   * Toggles the expansion state of a history item.
   */
  const handleToggleExpand = (id: string) => {
    setExpandedId(id === expandedId ? null : id); // Toggle or set
  };

  /**
   * Fetches the authenticated user and their assessment list.
   */
  useEffect(() => {
    const fetchAssessments = async () => {
      setIsLoading(true);
      setError(null);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }

      setIsAuthenticated(true);

      // Fetch ALL columns with select("*") as requested
      const { data, error: fetchError } = await supabase
        .from("assessments")
        .select("*")
        .eq("user_id", user.id)
        .order("submitted_at", { ascending: false })
        .limit(50);

      if (fetchError) {
        console.error("Error fetching assessments:", fetchError);
        setError("Failed to load assessments. Please try again.");
      } else if (data) {
        setAssessmentList(data as AssessmentItem[]);
      }

      setIsLoading(false);
    };

    fetchAssessments();
  }, [supabase]);

  // --- Conditional Rendering for Loading, Error, and Authentication ---

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-4 sm:p-8 pt-12 text-center text-gray-600 dark:text-gray-400">
        <Loader2 className="w-8 h-8 mx-auto mb-4 animate-spin text-green-600 dark:text-green-400" />
        <p>Loading history...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-4 sm:p-8 pt-12 text-center text-red-600 dark:text-red-400">
        <p>Error: {error}</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="max-w-4xl mx-auto p-4 sm:p-8 pt-12 text-center text-yellow-600 dark:text-yellow-400">
        <p className="text-xl font-semibold">Please log in to view your assessment history.</p>
      </div>
    );
  }

  // --- Main Render ---
  return (
    <div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white min-h-[calc(100vh-178px)] transition-colors duration-300">
      <div className="max-w-4xl mx-auto p-4 sm:p-8 pt-12">
        <div className="flex justify-between items-center mb-8 border-b border-gray-200 dark:border-gray-700 pb-3">
          <h1 className="text-3xl font-extrabold flex items-center">
            <Clock className="w-6 h-6 mr-3 text-green-600 dark:text-green-400" />
            Assessment History
          </h1>
        </div>

        {assessmentList.length === 0 ? (
          <div className="text-center py-10 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
            <ListX className="w-10 h-10 mx-auto text-gray-400 dark:text-gray-500 mb-3" />
            <p className="text-lg font-medium text-gray-600 dark:text-gray-400">
              No assessments found.
            </p>
          </div>
        ) : (
          <ul className="space-y-4">
            {assessmentList.map(item => {
              const isExpanded = item.id === expandedId;
              return (
                <li
                  key={item.id}
                  className="bg-gray-200 dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden border border-gray-200 dark:border-gray-800 transition-shadow duration-300"
                >
                  {/* Summary Header - Always visible */}
                  <div
                    className="p-4 flex justify-between items-center cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition duration-150"
                    onClick={() => handleToggleExpand(item.id)}
                  >
                    <div>
                      <p className="text-xl font-bold text-teal-500 dark:text-green-400">
                        {item.job_role}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        **{item.industry}** &bull; {item.experience}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        Submitted: {new Date(item.submitted_at).toLocaleDateString()}
                      </p>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    )}
                  </div>

                  {/* Detailed Body - Shown only when expanded */}
                  {isExpanded && <AssessmentDetail item={item} />}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

// --- DETAIL COMPONENT ---

/**
 * Renders the full details of a single assessment item.
 * @param {AssessmentItem} item - The full assessment data object.
 */
function AssessmentDetail({ item }: { item: AssessmentItem }) {
  // A helper function to format the data keys into readable labels
  const formatLabel = (key: string) => {
    return key.replace(/_/g, " ").replace(/\b\w/g, char => char.toUpperCase());
  };

  // Define the fields you want to display in the details section
  // You can customize this array to show or hide any of the "select(*)" fields
  const detailFields = [
    "company_size",
    "location",
    "work_preference",
    "education",
    "specialization",
    "experience",
    "time_in_current_role",
    "age_range",
    "file_name",
    "status",
  ];

  return (
    <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-900 animate-fade-in transition-colors duration-300">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
        Full Submission Details
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 text-sm">
        {detailFields.map(key => {
          const value = item[key];

          // Skip empty or irrelevant fields for a cleaner display
          if (
            !value ||
            (Array.isArray(value) && value.length === 0) ||
            key === "id" ||
            key === "user_id"
          ) {
            return null;
          }

          return (
            <div key={key} className="flex flex-col">
              <span className="font-medium text-gray-600 dark:text-gray-400">
                {formatLabel(key)}:
              </span>
              <span className="text-gray-900 dark:text-white">
                {Array.isArray(value) ? value.join(", ") : String(value)}
              </span>
            </div>
          );
        })}
      </div>

      {/* Example of handling specific, complex data like Certifications */}
      {item.certifications && item.certifications.length > 0 && (
        <div className="mt-4">
          <span className="font-medium text-gray-600 dark:text-gray-400">Certifications:</span>
          <ul className="list-disc list-inside ml-2 text-gray-900 dark:text-white">
            {item.certifications.map((cert: string, index: number) => (
              <li key={index}>{cert}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Optional: Add a link to download the file if storage_path is available */}
      {item.storage_path && (
        <a
          href={`/api/download?path=${item.storage_path}`} // Adjust this API route as needed
          className="mt-4 inline-block text-green-600 dark:text-green-400 hover:text-green-500 dark:hover:text-green-300 transition duration-150 text-sm font-semibold"
          target="_blank"
          rel="noopener noreferrer"
        >
          Download Submitted File
        </a>
      )}
    </div>
  );
}
