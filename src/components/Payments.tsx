"use client";

import { useEffect, useState } from "react";

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
  pending: { label: "Pending", color: "text-yellow-600  bg-yellow-300" },
  failed: { label: "Failed", color: "text-red-600 bg-red-300" },
  refunded: { label: "Refunded", color: "text-blue-600 bg-blue-300" },
  processing: { label: "Processing", color: "text-gray-600 bg-gray-300" },
};

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // fetch("/api/payments", {
    //   method: "GET",
    //   headers: {
    //     // Authorization: `Bearer ${localStorage.getItem("supabase.auth.token")}`,
    //     "Content-Type": "application/json",
    //   },
    // });
    fetch("/api/payments")
      .then(res => res.json())
      .then(data => {
        setPayments(data.payments || []);
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Loading payments...</p>;

  if (payments.length === 0) {
    return (
      <div className="max-w-3xl mx-auto p-6 text-center text-gray-600">
        <h2 className="text-xl font-semibold mb-2">No payments yet</h2>
        <p>When you purchase a report, it’ll appear here.</p>
      </div>
    );
  }

  // const razorpayDashboardBase = "https://dashboard.razorpay.com/app";

  return (
    <div className="max-w-4xl mx-auto p-0 md:p-6">
      <h1 className="text-2xl font-bold mb-6">Your Payments</h1>

      <div className="space-y-4">
        {payments.map(p => {
          const status = statusMap[p.status] || {
            label: p.status,
            color: "text-green-600 bg-green-300",
          };

          // const orderLink = p.razorpay_order_id
          //   ? `${razorpayDashboardBase}/orders/${p.razorpay_order_id}`
          //   : null;

          // const paymentLink = p.razorpay_payment_id
          //   ? `${razorpayDashboardBase}/payments/${p.razorpay_payment_id}`
          //   : null;

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
                {p.razorpay_order_id && (
                  <p>
                    Order ID:{" "}
                    {/* {orderLink ? (
                      <a
                        href={orderLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 underline hover:text-blue-800"
                      >
                        {p.razorpay_order_id}
                      </a>
                    ) : ( */}
                    {p.razorpay_order_id}
                    {/* )} */}
                  </p>
                )}

                {p.razorpay_payment_id && (
                  <p>
                    Payment ID:{" "}
                    {/* {paymentLink ? (
                      <a
                        href={paymentLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 underline hover:text-blue-800"
                      >
                        {p.razorpay_payment_id}
                      </a>
                    ) : ( */}
                    {p.razorpay_payment_id}
                    {/* )} */}
                  </p>
                )}
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
            </div>
          );
        })}
      </div>
    </div>
  );
}
