// app/report/[id]/page.tsx
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth"; // your auth/session helper
import { getReportById } from "@/lib/reports"; // your DB fetch helper

interface ReportPageProps {
  params: { id: string };
}

export default async function ReportIDPage({ params }: ReportPageProps) {
  const { id } = params;

  // 1. Get the current user session
  const session = await getSession(); // e.g., from cookies or JWT

  if (!session) {
    // Not logged in → redirect to login
    redirect(`/login?redirect=/report/${id}`);
  }

  // 2. Fetch report
  const report = await getReportById(id);

  if (!report) {
    // Report not found
    return (
      <div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white min-h-[calc(100vh-178px)] transition-colors duration-300">
        <div className="max-w-4xl mx-auto p-4 sm:p-8 pt-12">
          <p>Report not found.</p>
        </div>
      </div>
    );
  }

  // 3. Check if the user has paid
  const hasAccess = report.userId === session.user.id || report.status === "paid";

  if (!hasAccess) {
    // Redirect or show a "payment required" message
    redirect(`/purchase-report`);
  }

  // 4. Show the report
  return (
    <div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white min-h-[calc(100vh-178px)] transition-colors duration-300">
      <div className="max-w-4xl mx-auto p-4 sm:p-8 pt-12">
        <h1>Report for ID: {id}</h1>
        <pre>{JSON.stringify(report, null, 2)}</pre>
      </div>
    </div>
  );
}
