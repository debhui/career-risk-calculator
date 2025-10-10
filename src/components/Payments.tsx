"use client";

import { useEffect, useState } from "react";
import { Loader2, Download } from "lucide-react";

type Payment = {
  id: string;
  amount: number;
  status: string;
  created_at: string;
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  report?: {
    id: string;
    status: string;
    assessment?: {
      job_role?: string;
      industry?: string;
    };
  };
};

const statusMap: Record<string, { label: string; color: string }> = {
  paid: { label: "Paid", color: "text-green-600 bg-green-300" },
  pending: { label: "Pending", color: "text-yellow-600 bg-yellow-300" },
  failed: { label: "Failed", color: "text-red-600 bg-red-300" },
  refunded: { label: "Refunded", color: "text-blue-600 bg-blue-300" },
  processing: { label: "Processing", color: "text-gray-600 bg-gray-300" },
};

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  // const [emailing, setEmailing] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/payments")
      .then(res => res.json())
      .then(data => {
        setPayments(data.payments || []);
        setLoading(false);
      });
  }, []);

  const handleDownloadReceipt = async (id: string) => {
    const res = await fetch(`/api/payments/receipt/${id}`);
    if (!res.ok) {
      alert("Failed to generate receipt");
      return;
    }
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `receipt-${id}.pdf`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // const handleEmailReceipt = async (id: string) => {
  //   try {
  //     setEmailing(id);
  //     const res = await fetch(`/api/payments/receipt/email/${id}`, { method: "POST" });
  //     if (!res.ok) throw new Error("Email failed");
  //     alert("Receipt sent to your email!");
  //   } catch (err) {
  //     alert("Failed to send email receipt");
  //   } finally {
  //     setEmailing(null);
  //   }
  // };

  if (loading)
    return (
      <div className="flex items-center space-x-3 text-lg font-medium text-gray-700 dark:text-gray-300">
        <Loader2 className="w-8 h-8 mx-auto mb-4 animate-spin text-green-600 dark:text-green-400" />
        <p>Loading payments...</p>
      </div>
    );

  if (payments.length === 0) {
    return (
      <div className="max-w-3xl mx-auto p-6 text-center text-gray-600">
        <h2 className="text-xl font-semibold mb-2">No payments yet</h2>
        <p>When you purchase a report, it’ll appear here.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="space-y-4">
        {payments.map(p => {
          const status = statusMap[p.status] || {
            label: p.status,
            color: "text-green-600 bg-green-300",
          };

          return (
            <div
              key={p.id}
              className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 shadow-sm"
            >
              <div className="flex justify-between items-center">
                <p className="text-lg font-semibold">₹{p.amount.toFixed(2)}</p>
                <span className={`text-sm font-medium px-2 py-0.5 rounded-md ${status.color}`}>
                  {status.label}
                </span>
              </div>
              <p className="text-sm text-gray-500">{new Date(p.created_at).toLocaleString()}</p>
              <div className="mt-2 space-y-1 text-sm">
                {p.razorpay_order_id && <p>Order ID: {p.razorpay_order_id}</p>}
                {p.razorpay_payment_id && <p>Payment ID: {p.razorpay_payment_id}</p>}
              </div>
              {p.report && (
                <div className="mt-3 text-sm text-gray-500">
                  <p>
                    Report: <span className="font-medium">{p.report.status}</span>
                  </p>
                  {p.report.assessment && (
                    <p>
                      {p.report.assessment.job_role && (
                        <>
                          Role: <span className="font-medium">{p.report.assessment.job_role}</span>
                          {" • "}
                        </>
                      )}
                      {p.report.assessment.industry && (
                        <>
                          Industry:{" "}
                          <span className="font-medium">{p.report.assessment.industry}</span>
                        </>
                      )}
                    </p>
                  )}
                </div>
              )}

              {p.status === "success" && (
                <div className="mt-4 flex gap-3">
                  <button
                    onClick={() => handleDownloadReceipt(p.id)}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    <Download className="w-4 h-4" />
                    Download & Email Receipt
                  </button>

                  {/* <button
                    onClick={() => handleEmailReceipt(p.id)}
                    disabled={emailing === p.id}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {emailing === p.id ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Mail className="w-4 h-4" />
                        Email Receipt
                      </>
                    )}
                  </button> */}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
