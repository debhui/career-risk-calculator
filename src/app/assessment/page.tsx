"use client";

import React, { useEffect, useState } from "react";
import { z } from "zod";
// import { User as AuthUser } from "@supabase/supabase-js";
import { createSupabaseClient } from "@/lib/supabase/browser";
import { ShieldHalf, ArrowRight, ArrowLeft, Zap, CheckCircle, Loader2 } from "lucide-react";
import { AssessmentProfile } from "@/components/AssessmentProfile";
import { CareerAssessment } from "@/components/CareerAssessment";
import { ResumeUpload } from "@/components/ResumeUpload";
import { extractPdf } from "@/lib/actions/extractPdf";

interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  consent_accepted: boolean;
  onboarding_completed: boolean;
  phone?: string;
  linkedin_url?: string;
  job_title?: string;
  company?: string;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const profileSchema = z.object({
  fullName: z.string().min(2, "Full name is required."),
  email: z.string().email("Invalid email address."),
  phone: z.string().optional(),
  linkedin: z.string().url("Invalid URL.").optional().or(z.literal("")),
  jobTitle: z.string().min(2, "Job title is required."),
  company: z.string().min(1, "Company is required."),
});
type ProfileData = z.infer<typeof profileSchema>;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const assessmentSchema = z.object({
  industry: z.string().min(1),
  specialization: z.string().min(1),
  jobRole: z.string().min(1),
  experience: z.string().min(1),
  timeInCurrentRole: z.string().min(1),
  ageRange: z.string().min(1),
  education: z.string().min(1),
  location: z.string().min(1),
  companySize: z.string().min(1),
  workPreference: z.string().min(1),
  recentTraining: z.string().optional(),
  certifications: z.array(z.string()).optional(),
});
type AssessmentData = z.infer<typeof assessmentSchema>;

// Initial state for assessment form
const initialAssessmentData: AssessmentData = {
  industry: "Technology",
  specialization: "Software Development",
  jobRole: "Senior Developer",
  experience: "6-10 years",
  timeInCurrentRole: "3-5 years",
  ageRange: "31-40 years",
  education: "Bachelor's Degree",
  location: "North America",
  companySize: "Startup (1-50)",
  workPreference: "Remote",
  recentTraining: "",
  certifications: [],
};

// --- Main Component ---
export default function CombinedAssessmentPage() {
  const [step, setStep] = useState(1);
  const [assessmentFormData, setAssessmentFormData] =
    useState<AssessmentData>(initialAssessmentData);
  const [isAssessmentLoading, setIsAssessmentLoading] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createSupabaseClient();
  const [hasFileUploadedHistorically, setHasFileUploadedHistorically] = useState(false);
  const [isResumeStepCompletedInFlow, setIsResumeStepCompletedInFlow] = useState(false);
  const [assessmentId, setAssessmentId] = useState<string>("");

  // const [loading, setLoading] = useState(false);
  // const [extractText, setExtractText] = useState("");

  async function handleExtract(filePath: string) {
    // setLoading(true);
    try {
      const result = await extractPdf(filePath);
      // setExtractText(result.text);
      console.log("extract", result.text);
    } catch (err: any) {
      console.error(err);
      // setExtractText("Error extracting PDF: " + err.message);
    } finally {
      // setLoading(false);
    }
  }

  const REPORT_PRICE_PAISE = 49900;

  const onProfileSubmit = async (data: ProfileData) => {
    // Note: Supabase calls are mocked here as external file imports are not available.
    // Assuming 'supabase' is globally available or imported successfully.

    // In a real environment, you would use the imported 'supabase' object.
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      console.error("User not authenticated.");
      return;
    }

    const { error } = await supabase.from("profiles").upsert({
      id: user.id,
      full_name: data.fullName,
      email: data.email,
      phone: data.phone,
      linkedin_url: data.linkedin,
      job_title: data.jobTitle,
      company: data.company,
    });

    if (error) {
      console.error(error);
    } else {
      setStep(2); // Move to the next step
    }
  };

  const handleResumeSuccess = (assementId: string, filePath: string) => {
    // filePath: string
    setHasFileUploadedHistorically(true);
    setIsResumeStepCompletedInFlow(true);
    setAssessmentId(assementId);
    handleExtract(filePath);
    setStep(3); // Advance to the Assessment step
  };

  const handleResumeContinue = () => {
    setIsResumeStepCompletedInFlow(true);
    setStep(3); // Advance to the Assessment step
  };

  // Assessment Form Logic
  const handleAssessmentChange = (field: keyof AssessmentData, value: string | string[]) => {
    setAssessmentFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAssessmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAssessmentLoading(true);
    setSubmitStatus("idle");

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setIsAssessmentLoading(false);
      setSubmitStatus("error");
      console.error("User not authenticated.");
      return;
    }

    const dataToSave = {
      id: assessmentId,
      user_id: user.id,
      age_range: assessmentFormData.ageRange,
      time_in_current_role: assessmentFormData.timeInCurrentRole,
      job_role: assessmentFormData.jobRole,
      company_size: assessmentFormData.companySize,
      work_preference: assessmentFormData.workPreference,
      recent_training: assessmentFormData.recentTraining,
      industry: assessmentFormData.industry,
      specialization: assessmentFormData.specialization,
      experience: assessmentFormData.experience,
      education: assessmentFormData.education,
      location: assessmentFormData.location,
      certifications: assessmentFormData.certifications,
      status: "COMPLETED",
      submitted_at: new Date().toISOString(),
    };

    // In a real environment, you would use the imported 'supabase' object.
    const { error } = await supabase.from("assessments").update(dataToSave).eq("id", assessmentId);

    setIsAssessmentLoading(false);

    if (error) {
      setSubmitStatus("error");
      console.error("Save Error:", error);
    } else {
      setSubmitStatus("success");

      // fake report generation
      const { data: reportData, error: reportError } = await supabase
        .from("reports")
        .insert({
          user_id: user.id,
          price: REPORT_PRICE_PAISE / 100, // Price is real
          status: "pending_payment", // Status is temporary/fake
          assessment_id: assessmentId,
          // report_data remains NULL here
        })
        .select("id")
        .single();
      if (reportData) {
        setStep(4);
      } else {
        console.error(reportError);
      }
    }
  };

  const steps = [
    { id: 1, name: "Profile" },
    { id: 2, name: "Resume" },
    { id: 3, name: "Assessment" },
    { id: 4, name: "Results" },
  ];

  const handleStepClick = (targetStep: number) => {
    const previousStep = step;

    // Only allow navigating forward to steps that are already completed
    if (targetStep > step && targetStep === 3 && !isResumeStepCompletedInFlow) return;
    if (targetStep > step && targetStep === 4 && submitStatus !== "success") return;

    // Core Navigation
    setStep(targetStep);

    // LOGIC IMPLEMENTATION: If user manually clicks back to step 2 (from 3 or 4) via the progress bar,
    // we reset the *flow* state to force the user to see the default upload view.
    if (targetStep === 2 && previousStep > 2) {
      setIsResumeStepCompletedInFlow(true); // Reset flow state for manual revisit
    }
    // If they manually click to step 3 from step 2 via progress bar (after completing step 2)
    else if (targetStep === 3 && previousStep === 2) {
      setIsResumeStepCompletedInFlow(true); // Keep flow state if moving forward
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // 1. Fetch Auth User
        const {
          data: { user: authUser },
          error: authError,
        } = await supabase.auth.getUser();
        if (authError || !authUser) {
          throw new Error(authError?.message || "User not authenticated.");
        }

        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", authUser.id)
          .single();

        if (profileError && profileError.code !== "PGRST116") {
          // PGRST116 is for "no row found"
          console.warn("Profile fetch error:", profileError.message);
        }

        if (profileData) {
          setProfile(profileData as UserProfile);

          if (profileData.full_name) {
            setHasFileUploadedHistorically(true);
          }
        } else {
          // Create a mock profile if one doesn't exist, defaulting consent to false
          setProfile({
            id: authUser.id,
            email: authUser.email || "N/A",
            full_name: authUser.user_metadata?.full_name || authUser.user_metadata?.name,
            consent_accepted: false,
            onboarding_completed: false,
          });
        }
      } catch (err: any) {
        console.error("Fetch data error:", err);
        setError("Failed to load user data. Please ensure you are logged in.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [supabase]);

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white min-h-[calc(100vh-178px)] flex items-center justify-center transition-colors duration-300">
        <div className="flex items-center space-x-3 text-lg font-medium text-gray-700 dark:text-gray-300">
          <Loader2 className="w-8 h-8 mx-auto mb-4 animate-spin text-green-600 dark:text-green-400" />
          <p>Loading assessement page...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center p-4 sm:p-6 font-inter min-h-[calc(100vh-178px)]">
      {/* --- Global Loading and Error State --- */}
      {error ? (
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center w-full max-w-2xl bg-red-900/20 p-8 rounded-xl shadow-xl border border-red-700">
          <p className="text-lg font-semibold text-red-400 mb-2">Error Loading Data</p>
          <p className="text-sm text-red-300">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-6 py-3 bg-red-600 rounded-xl text-white hover:bg-red-700 transition font-semibold"
          >
            Reload Page
          </button>
        </div>
      ) : (
        /* --- Main Content (If Loaded) --- */
        <>
          {/* Progress Bar */}
          <nav className="flex items-center justify-between w-full max-w-2xl mb-10 text-center">
            {steps.map((item, index) => (
              <React.Fragment key={item.id}>
                <div className="flex flex-col items-center flex-1">
                  <button
                    type="button"
                    onClick={() => handleStepClick(item.id)}
                    // Disable clicking ahead to unfinished steps
                    disabled={item.id > step && item.id > 1}
                    className={`flex flex-col items-center flex-1 transition-transform hover:scale-105 duration-200 ${
                      item.id > step && item.id > 1
                        ? "cursor-not-allowed opacity-50"
                        : "cursor-pointer"
                    }`}
                  >
                    <div
                      className={`flex items-center justify-center w-10 h-10 rounded-full font-bold text-lg transition-all duration-300
                        ${
                          step > item.id
                            ? "bg-teal-600 dark:bg-indigo-600 text-white"
                            : "bg-gray-700 text-gray-400"
                        }
                        ${
                          step === item.id
                            ? "bg-teal-500 dark:bg-indigo-500 text-white ring-2 ring-teal-500 dark:ring-indigo-500"
                            : ""
                        }
                      `}
                    >
                      {step > item.id ? <CheckCircle className="w-5 h-5" /> : item.id}
                    </div>
                    <span
                      className={`mt-2 text-sm font-medium transition-colors duration-300
                        ${step >= item.id ? "text-gray-800 dark:text-white" : "text-gray-400"}
                      `}
                    >
                      {item.name}
                    </span>
                  </button>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`flex-1 h-1 mx-2 transition-colors duration-300 ${
                      step > item.id
                        ? "bg-teal-600 dark:bg-indigo-600"
                        : "bg-gray-400 dark:bg-gray-700"
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </nav>

          {/* Dynamic Header based on Step */}
          <header className="mb-10 text-center w-full max-w-2xl">
            {step === 1 && (
              <>
                <ShieldHalf className="mx-auto mb-3 h-10 w-10 text-indigo-400" />
                <h1 className="text-4xl font-extrabold text-gray-800 dark:text-white">
                  <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                    Risk
                  </span>{" "}
                  Assessment Profile
                </h1>
                <p className="mt-2 text-lg font-light text-gray-400">
                  Tell us about your current role to calculate your career risk score.
                </p>
              </>
            )}
            {step === 2 && (
              <>
                <h1 className="text-4xl font-extrabold text-gray-800 dark:text-white">Resume</h1>
                <p className="mt-2 text-lg text-gray-400">Upload your resume</p>
              </>
            )}
            {step === 3 && (
              <>
                <Zap className="w-10 h-10 mx-auto text-yellow-400 mb-2" />
                <h1 className="text-4xl font-extrabold text-gray-800 dark:text-white">
                  Career Risk Assessment
                </h1>
                <p className="mt-2 text-lg text-gray-400 dark:text-gray-400">
                  Answer these questions to calculate your current career risk score and identify
                  areas for optimization.
                </p>
              </>
            )}
          </header>

          {/* Conditional Forms */}
          {step === 1 ? (
            <div className="w-full max-w-2xl bg-gray-200 dark:bg-gray-800 p-8 rounded-2xl shadow-2xl border border-gray-300 dark:border-indigo-700/50">
              <AssessmentProfile profile={profile} onProfileSubmit={onProfileSubmit} />
            </div>
          ) : step === 2 ? (
            <div className="w-full max-w-2xl bg-gray-200 dark:bg-gray-800  p-8 rounded-2xl shadow-2xl border border-gray-300 dark:border-indigo-700/50">
              <button
                type="button"
                onClick={() => setStep(1)} // Go back to Step 1
                className="inline-flex items-center text-sm font-medium text-teal-500 dark:text-indigo-400 hover:text-teal-300 hover:dark:text-indigo-300 transition duration-150"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to Profile
              </button>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white border-b border-gray-300 dark:border-gray-700 pb-3 mt-4 mb-8">
                Upload Resume for Deeper Analysis
              </h2>
              <ResumeUpload
                onUploadSuccess={handleResumeSuccess}
                onContinue={handleResumeContinue}
                isResumeStepCompletedInFlow={isResumeStepCompletedInFlow}
                hasFileUploadedHistorically={hasFileUploadedHistorically}
              />
            </div>
          ) : step === 3 ? (
            <div className="w-full max-w-2xl bg-gray-200 dark:bg-gray-800  p-8 rounded-2xl shadow-2xl border border-gray-300 dark:border-indigo-700/50">
              <button
                type="button"
                onClick={() => {
                  setStep(2);
                  setIsResumeStepCompletedInFlow(true);
                }}
                className="inline-flex items-center text-sm font-medium text-teal-500 dark:text-indigo-400 hover:text-teal-300 hover:dark:text-indigo-300 transition duration-150"
              >
                <ArrowRight className="h-4 w-4 mr-1 rotate-180" />
                Back to Resume
              </button>
              <CareerAssessment
                assessmentFormData={assessmentFormData}
                isAssessmentLoading={isAssessmentLoading}
                submitStatus={submitStatus}
                handleAssessmentChange={handleAssessmentChange}
                handleAssessmentSubmit={handleAssessmentSubmit}
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
              <h2 className="text-3xl font-bold text-white mb-4">Assessment Complete!</h2>
              <p className="text-lg text-gray-400">
                Thank you for completing your profile and assessment. Your results are being
                calculated.
              </p>
              {/* Grouped buttons for navigation */}
              <div className="flex space-x-4 mt-6">
                <a
                  href="/history"
                  className="inline-flex items-center px-6 py-3 text-white bg-teal-600 dark:bg-indigo-600 rounded-xl hover:bg-teal-700 hover:dark:bg-indigo-700 transition font-semibold"
                >
                  View My Results
                  <ArrowRight className="h-4 w-4 ml-2" />
                </a>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
