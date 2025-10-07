"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { createSupabaseClient } from "@/lib/supabase/browser";
import {
  Clock,
  Loader2,
  ListX,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Download,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useSupabaseDownloader } from "@/hooks/useSupabaseDownloader";
import { User } from "@supabase/supabase-js";

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
  const [assessmentList, setAssessmentList] = useState<AssessmentItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [userData, setUserData] = useState<User | null>(null);
  const { isLoadingDownload, errorDownload, downloadFile } = useSupabaseDownloader();
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 10;

  const totalPages = useMemo(() => {
    return Math.ceil(totalCount / pageSize);
  }, [totalCount, pageSize]);

  const handleToggleExpand = useCallback(
    (id: string) => {
      setExpandedId(id === expandedId ? null : id); // Toggle or set
    },
    [expandedId]
  );

  /**
   * Updates the report_status of a specific assessment item in the local state.
   * This is crucial for updating the button label instantly after payment.
   * @param {string} reportId - The ID of the assessment to update.
   * @param {AssessmentItem['report_status']} newStatus - The new status (e.g., 'READY').
   */
  const handleReportStatusChange = useCallback(
    (reportId: string, newStatus: AssessmentItem["report_status"]) => {
      setAssessmentList(prevList =>
        prevList.map(item => (item.id === reportId ? { ...item, report_status: newStatus } : item))
      );
    },
    []
  );

  useEffect(() => {
    const fetchAssessments = async () => {
      setIsLoading(true);
      setError(null);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setIsLoading(false);
        return;
      }
      setUserData(user);

      const from = (currentPage - 1) * pageSize;
      const to = from + pageSize - 1;

      try {
        // ✅ JOIN assessments with reports to fetch report status
        const {
          data,
          count,
          error: fetchError,
        } = await supabase
          .from("assessments")
          .select(
            `
          *,
          reports (
            id,
            status
          )
          `,
            { count: "exact" }
          )
          .eq("user_id", user.id)
          .neq("status", "DRAFT")
          .order("submitted_at", { ascending: false })
          .range(from, to);

        if (fetchError) {
          console.error("Error fetching assessments:", fetchError);
          setError("Failed to load assessments. Please try again.");
          setAssessmentList([]);
          setTotalCount(0);
        } else if (data) {
          // ✅ Merge the report status into the assessment item
          const mappedData = data.map((item: any) => ({
            ...item,
            report_status:
              item.reports && item.reports.length > 0
                ? (item.reports[0].status ?? "UNPAID").toUpperCase()
                : "UNPAID",
          }));

          setAssessmentList(mappedData);
          setTotalCount(count || 0);
        }
      } catch (e) {
        console.error("Unexpected error during fetch:", e);
        setError("An unexpected error occurred.");
        setAssessmentList([]);
        setTotalCount(0);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAssessments();
  }, [supabase, currentPage]);

  // --- Conditional Rendering for Loading, Error, and Authentication ---

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white min-h-[calc(100vh-178px)] flex items-center justify-center transition-colors duration-300">
        <div className="flex items-center space-x-3 text-lg font-medium text-gray-700 dark:text-gray-300">
          <Loader2 className="w-8 h-8 mx-auto mb-4 animate-spin text-green-600 dark:text-green-400" />
          <p>Loading history for page {currentPage}...</p>
        </div>
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

  const PaginationControls = () => (
    <div className="flex justify-between items-center mt-8 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg shadow-inner">
      <button
        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
        disabled={currentPage === 1}
        className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 transition-colors"
      >
        <ChevronLeft className="w-4 h-4 mr-2" />
        Previous
      </button>
      <span className="text-gray-700 dark:text-gray-300 text-sm font-semibold">
        Page {currentPage} of {totalPages} (Total: {totalCount})
      </span>
      <button
        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
        disabled={currentPage >= totalPages || totalPages === 0}
        className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 transition-colors"
      >
        Next
        <ChevronRight className="w-4 h-4 ml-2" />
      </button>
    </div>
  );

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
        {assessmentList.length === 0 && totalCount > 0 ? (
          <div className="text-center py-10 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
            <ListX className="w-10 h-10 mx-auto text-gray-400 dark:text-gray-500 mb-3" />
            <p className="text-lg font-medium text-gray-600 dark:text-gray-400">
              No results found on this page. Try going back.
            </p>
          </div>
        ) : assessmentList.length === 0 && totalCount === 0 ? (
          <div className="text-center py-10 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
            <ListX className="w-10 h-10 mx-auto text-gray-400 dark:text-gray-500 mb-3" />
            <p className="text-lg font-medium text-gray-600 dark:text-gray-400">
              No submitted assessments found.
            </p>
          </div>
        ) : (
          <>
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
                    {isExpanded && (
                      <>
                        <AssessmentDetail
                          item={item}
                          handleDownload={downloadFile}
                          isLoading={isLoadingDownload}
                          user={userData}
                          onReportStatusChange={handleReportStatusChange} // Pass the status update callback
                        />
                        {errorDownload && <p className="text-red-500 text-sm">{errorDownload}</p>}
                      </>
                    )}
                  </li>
                );
              })}
            </ul>
            {totalPages > 1 && <PaginationControls />}
          </>
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
function AssessmentDetail({
  item,
  isLoading,
  user,
  handleDownload,
  onReportStatusChange,
}: {
  item: AssessmentItem;
  isLoading?: boolean;
  user: User | null;
  handleDownload: (bucket: string, path: string, filename?: string) => void;
  onReportStatusChange: (reportId: string, newStatus: AssessmentItem["report_status"]) => void;
}) {
  const router = useRouter();
  const [isProcessingPayment, setIsProcessingPayment] = useState(false); // New state for payment loading

  // A helper function to format the data keys into readable labels
  const formatLabel = (key: string) => {
    return key.replace(/_/g, " ").replace(/\b\w/g, char => char.toUpperCase());
  };

  // Define the fields you want to display in the details section
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
  ];

  const handleReport = useCallback(async () => {
    setIsProcessingPayment(true);

    // 1. Call the Next.js API route to create the order (and the reports table entry)
    const orderRes = await fetch("/api/razorpay/order", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      // Pass the assessment ID so the API can link the new report/order
      body: JSON.stringify({
        assessmentId: item.id,
      }),
    });

    const data = await orderRes.json();

    if (data.error || !orderRes.ok) {
      console.error("Could not create Razorpay order:", data.details || data.error);
      setIsProcessingPayment(false);
      return;
    }
    let paymentCompleted = false;
    // 2. Open the Razorpay Checkout Modal
    const options = {
      key: data.keyId, // Key ID from the server response
      amount: data.amount,
      currency: data.currency,
      name: "Career Risk Report",
      description: "One-time access to your personalized report.",
      order_id: data.orderId,
      handler: async function (response: any) {
        paymentCompleted = true; // prevent modal.close reset

        // 3. Client-side Success: Call the secure verification API
        const verifyRes = await fetch("/api/razorpay/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...response, // Includes razorpay_payment_id, razorpay_order_id, razorpay_signature
            reportId: data.reportId, // Pass the report ID for fulfillment
          }),
        });

        setIsProcessingPayment(false); // Stop loading indicator here

        if (verifyRes.ok) {
          console.log("Payment Successful and Verified! Redirecting to report.");

          onReportStatusChange(data.reportId, "READY");

          router.push(`/report/${data.reportId}`);
          router.refresh();
        } else {
          // This path indicates payment success but failed DB update/verification
          console.error("Payment successful but failed client-side verification. Contact support.");
          router.push(`/payment-error?order=${data.orderId}`);
        }
      },
      prefill: {
        email: user?.email,
      },
      theme: {
        color: "#10b981", // Tailwind Green 600
      },
    };

    // If the modal opens, the loading state persists until handler/close event
    try {
      const rzp = new (window as any).Razorpay(options);
      rzp.on("modal.close", () => {
        if (!paymentCompleted) {
          console.log("Payment canceled by user.");
          setIsProcessingPayment(false);
        }
      });
      rzp.open();
    } catch (e) {
      console.error("Failed to open Razorpay modal:", e);
      setIsProcessingPayment(false);
    }
  }, [user, router, onReportStatusChange, item.id]);

  // --- Logic to determine which button to show ---
  const reportStatus = item.report_status; // e.g., "UNPAID", "PENDING", "PAID"
  const reportExists = item.reports && item.reports.length > 0; // ensure report exists
  const reportId = reportExists ? item.reports[0].id : null;

  let buttonProps: {
    label: string;
    action?: () => void;
    color?: string;
    isDisabled?: boolean;
  } | null = null;

  // Define button properties based on report_status
  if (!reportExists) {
    // ❌ No report entry exists → hide payment button
    buttonProps = null;
  } else if (reportStatus === "PAID") {
    // ✅ Report paid & ready to view
    buttonProps = {
      label: "View Report",
      action: () => router.push(`/report/${reportId}`),
      color:
        "bg-teal-600 dark:bg-indigo-600 shadow-teal-600/30 dark:shadow-indigo-600/30 hover:bg-teal-700 hover:dark:bg-indigo-700",
      isDisabled: false,
    };
  } else if (reportStatus === "UNPAID" || reportStatus === "PENDING_PAYMENT") {
    // 💰 Unpaid or pending → show pay button
    buttonProps = {
      label: isProcessingPayment ? "Processing Payment..." : "Pay for Report",
      action: handleReport,
      color:
        "bg-green-600 dark:bg-green-600 shadow-green-600/30 dark:shadow-green-600/30 hover:bg-green-700 hover:dark:bg-green-700",
      isDisabled: isProcessingPayment,
    };
  } else if (reportStatus === "PENDING") {
    // ⏳ Payment complete but report still generating
    buttonProps = {
      label: "Report Generating...",
      color:
        "bg-amber-500 dark:bg-amber-500 shadow-amber-500/30 dark:shadow-amber-500/30 opacity-80 cursor-default",
      isDisabled: true,
    };
  } else {
    // ❌ Other states (e.g., failed)
    buttonProps = {
      label: "Try Payment Again",
      action: handleReport,
      color:
        "bg-red-600 dark:bg-red-600 shadow-red-600/30 dark:shadow-red-600/30 hover:bg-red-700 hover:dark:bg-red-700",
      isDisabled: isProcessingPayment,
    };
  }

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

        {/* Manually render the derived report status for clarity */}
        <div className="flex flex-col">
          <span className="font-medium text-gray-600 dark:text-gray-400">Report Status:</span>
          <span
            className={`font-bold ${
              reportStatus === "PAID"
                ? "text-green-500"
                : reportStatus === "PENDING"
                ? "text-amber-500"
                : "text-red-500"
            }`}
          >
            {reportStatus}
          </span>
        </div>
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
      <div className="flex flex-wrap gap-4 items-center mt-6">
        {/* Optional: Add a link to download the file if storage_path is available */}
        {item.storage_path && (
          <button
            className={`flex items-center justify-center rounded-xl py-3 px-4 text-lg font-bold text-white shadow-xl transition-all duration-300 bg-teal-600 dark:bg-indigo-600 shadow-teal-600/30 dark:shadow-indigo-600/30 hover:bg-teal-700 hover:dark:bg-indigo-700`}
            onClick={() => {
              handleDownload("resumes", item.storage_path);
            }}
            disabled={isLoading}
          >
            <Download className="w-5 h-5 mr-3 " />
            {isLoading ? "Downloading..." : "Download Resume"}
          </button>
        )}

        {buttonProps && (
          <div className="flex gap-4">
            <button
              onClick={buttonProps.action}
              disabled={buttonProps.isDisabled}
              className={`flex items-center justify-center rounded-xl py-3 px-4 text-lg font-bold text-white shadow-xl transition-all duration-300 ${
                buttonProps.color
              } ${buttonProps.isDisabled ? "opacity-70 cursor-not-allowed" : ""}`}
            >
              {isProcessingPayment && buttonProps.label.includes("Pay") && (
                <Loader2 className="w-5 h-5 mr-3 animate-spin" />
              )}
              {buttonProps.label}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
