// onboarding/page.tsx
"use client";
import { ShieldCheck, BookOpenText, ArrowRight } from "lucide-react";
import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function OnboardingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Set the global status update function
  // setNavigationStatus = setMessage;

  // Initialize client once
  // useEffect(() => {
  //   initializeSupabase();
  // }, []);

  const handleConsent = useCallback(async () => {
    setLoading(true);
    setMessage("Processing consent...");

    const user = (await supabase.auth.getUser()).data.user;

    if (!user) {
      setMessage("Error: User not authenticated.");
      setLoading(false);
      return;
    }

    // Upsert profile data to mark consent as accepted
    // const { error } = await client.from("profiles").upsert({
    const { error } = await supabase.from("profiles").upsert({
      id: user.id,
      email: user.email,
      consent_accepted: true,
      consent_accepted_at: new Date().toISOString(),
      onboarding_completed: true,
      updated_at: new Date().toISOString(),
    });

    //   router.push("/assessment");
    if (error) {
      console.error("Failed to update profile:", error.message);
      setMessage(`Error: ${error.message}`);
      setLoading(false);
      return;
    }

    setMessage("Consent accepted! Redirecting...");
    router.push("/assessment-profile");
  }, [router]);

  // const handleConsent = async () => {
  //   const { error } = await supabase.auth.updateUser({
  //     data: { consentAccepted: true },
  //   });
  //   if (error) {
  //     console.error("Failed to save consent:", error.message);
  //     return;
  //   }
  //   router.push("/");
  // };

  // const handleConsent = async () => {
  //   const user = (await supabase.auth.getUser()).data.user;
  //   if (!user) return;

  //   const { error } = await supabase.from("profiles").upsert({
  //     id: user.id,
  //     email: user.email,
  //     consent_accepted: true,
  //     consent_accepted_at: new Date().toISOString(),
  //     onboarding_completed: true,
  //     updated_at: new Date().toISOString(),
  //   });

  //   if (error) {
  //     console.error("Failed to update profile:", error.message);
  //     return;
  //   }

  //   router.push("/assessment");
  // };

  // return (
  //   <div className="max-w-lg mx-auto p-6">
  //     <h1 className="text-2xl font-bold">Consent & Data Usage</h1>
  //     <p className="mt-4 text-gray-700">
  //       We use your profile, resume data, and LLM insights to improve your experience. You can
  //       export or delete your data anytime from settings.
  //     </p>
  //     <button onClick={handleConsent} className="mt-6 px-4 py-2 bg-green-600 text-white rounded">
  //       Accept & Continue
  //     </button>
  //   </div>
  // );

  return (
    <div className="min-h-[calc(100vh-200px)] bg-gray-900 flex items-center justify-center p-4 sm:p-6">
      {/* Container Card */}
      <div className="w-full max-w-2xl bg-gray-800 rounded-2xl shadow-2xl p-6 sm:p-10 border border-gray-700 space-y-8">
        {/* Header */}
        <div className="flex items-center space-x-4 border-b border-gray-700 pb-6">
          <ShieldCheck className="w-10 h-10 text-green-400" />
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Data Consent & Privacy
          </h1>
        </div>

        {/* Content Section */}
        <div className="space-y-6 text-gray-300">
          <p className="text-lg">
            Welcome to the Career Risk Calculator. Before proceeding, please review our commitment
            to your data privacy.
          </p>

          <div className="space-y-4 p-4 border border-gray-700 rounded-xl bg-gray-700/50">
            <h2 className="flex items-center text-xl font-semibold text-green-400 mb-3">
              <BookOpenText className="w-5 h-5 mr-2" />
              How We Use Your Data
            </h2>

            {/* Data Usage List */}
            <ul className="space-y-3 text-sm list-inside ml-4">
              <li className="flex items-start">
                <span className="text-green-400 mr-2">&#8226;</span>
                <span className="flex-1">
                  **Profile and Resume Data:** Stored securely to calculate and personalize your
                  career risk score and insights.
                </span>
              </li>
              <li className="flex items-start">
                <span className="text-green-400 mr-2">&#8226;</span>
                <span className="flex-1">
                  **LLM Insights:** Used to extract, structure, and analyze non-personally
                  identifiable skills and career data for generating reports.
                </span>
              </li>
              <li className="flex items-start">
                <span className="text-green-400 mr-2">&#8226;</span>
                <span className="flex-1">
                  **Full Control:** You can **export** or request **complete deletion** of all your
                  data anytime from the application settings.
                </span>
              </li>
            </ul>
          </div>

          <p className="pt-2 text-base text-gray-400 italic">
            By clicking &quot;Accept & Continue,&quot; you agree to the usage terms described above.
          </p>
        </div>

        {/* Status Message */}
        {message && (
          <div
            className={`p-3 rounded-lg text-center font-medium ${
              message.startsWith("Error")
                ? "bg-red-900 text-red-300"
                : "bg-green-900 text-green-300"
            }`}
          >
            {message}
          </div>
        )}

        {/* Action Button */}
        <button
          onClick={handleConsent}
          disabled={loading}
          className={`w-full flex items-center justify-center space-x-2 
                     px-6 py-3 text-lg font-bold text-white 
                     rounded-xl shadow-lg transition-all duration-200 
                     focus:outline-none focus:ring-4 focus:ring-green-500/50
                     ${
                       loading
                         ? "bg-gray-600 cursor-not-allowed"
                         : "bg-green-600 hover:bg-green-500"
                     }`}
        >
          {loading ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Processing...
            </>
          ) : (
            <>
              <span>Accept & Continue</span>
              <ArrowRight className="w-5 h-5 ml-2" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
