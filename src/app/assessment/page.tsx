"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
// FIX: Changed alias import to relative path
import { supabase } from "@/lib/supabaseClient";
import {
  User,
  Mail,
  Phone,
  Linkedin,
  Briefcase,
  Building,
  ShieldHalf,
  ArrowRight,
  Loader2,
  Save,
  Zap,
  CheckCircle,
} from "lucide-react";
// FIX: Changed alias imports to relative paths
import { InputField } from "@/components/InputField";
import ResumeUpload from "@/components/ResumeUpload";
import CustomSelect from "@/components/CustomSelect";

// --- Zod Schemas ---
const profileSchema = z.object({
  fullName: z.string().min(2, "Full name is required."),
  email: z.string().email("Invalid email address."),
  phone: z.string().optional(),
  linkedin: z.string().url("Invalid URL.").optional().or(z.literal("")),
  jobTitle: z.string().min(2, "Job title is required."),
  company: z.string().min(1, "Company is required."),
});
type ProfileData = z.infer<typeof profileSchema>;

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

// --- Form Wrapper Components ---
const FormField: React.FC<{ label: string; description: string; children: React.ReactNode }> = ({
  label,
  description,
  children,
}) => (
  <div className="space-y-2 border-b border-gray-700 pb-6">
    <label className="block text-base font-medium text-white">
      {label} <span className="text-red-500">*</span>
    </label>
    <p className="text-sm text-gray-400">{description}</p>
    <div className="mt-1">{children}</div>
  </div>
);

// --- Main Component ---
export default function CombinedAssessmentPage() {
  const [step, setStep] = useState(1);
  const [assessmentFormData, setAssessmentFormData] =
    useState<AssessmentData>(initialAssessmentData);
  const [isAssessmentLoading, setIsAssessmentLoading] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting: isProfileSubmitting },
  } = useForm<ProfileData>({
    resolver: zodResolver(profileSchema),
  });

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
      user_id: user.id,
      ...assessmentFormData,
      submitted_at: new Date().toISOString(),
    };

    // In a real environment, you would use the imported 'supabase' object.
    const { error } = await supabase.from("assessments").upsert(dataToSave);

    setIsAssessmentLoading(false);

    if (error) {
      setSubmitStatus("error");
      console.error("Save Error:", error);
    } else {
      setSubmitStatus("success");
      setStep(3);
    }
  };

  // Dropdown Options
  const industryOptions = ["Technology", "Finance", "Healthcare", "Manufacturing", "Other"];
  const specializationOptions = [
    "Software Development",
    "Data Science",
    "Product Management",
    "Cybersecurity",
    "IT Operations",
  ];
  const jobRoleOptions = [
    "Senior Developer",
    "Mid-Level Analyst",
    "Director",
    "Entry Level",
    "Executive",
  ];
  const experienceOptions = ["0-2 years", "3-5 years", "6-10 years", "11-15 years", "15+ years"];
  const timeOptions = ["< 1 year", "1-2 years", "3-5 years", "6+ years"];
  const ageOptions = ["18-24 years", "25-30 years", "31-40 years", "41-50 years", "51+ years"];
  const companySizeOptions = [
    "Startup (1-50)",
    "Small (51-200)",
    "Mid-Size (201-1000)",
    "Large (1000+)",
  ];
  const certOptions = ["PMP", "AWS", "Azure", "Scrum Master", "Other"];
  const radioOptions = {
    education: ["High School", "Bachelor's Degree", "Master's Degree", "PhD"],
    location: ["North America", "Europe", "Asia", "Other"],
    workPreference: ["Remote", "Hybrid", "On-site"],
  };

  const steps = [
    { id: 1, name: "Your Profile" },
    { id: 2, name: "Your Assessment" },
    { id: 3, name: "Results" },
  ];

  return (
    <div className="flex flex-col items-center p-4 sm:p-6 font-inter">
      {/* Progress Bar */}
      <nav className="flex items-center justify-between w-full max-w-2xl mb-10 text-center">
        {steps.map((item, index) => (
          <React.Fragment key={item.id}>
            <div className="flex flex-col items-center flex-1">
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full font-bold text-lg transition-all duration-300
                  ${step > item.id ? "bg-indigo-600 text-white" : "bg-gray-700 text-gray-400"}
                  ${step === item.id ? "bg-indigo-500 text-white ring-2 ring-indigo-500" : ""}
                `}
              >
                {step > item.id ? <CheckCircle className="w-5 h-5" /> : item.id}
              </div>
              <span
                className={`mt-2 text-sm font-medium transition-colors duration-300
                  ${step >= item.id ? "text-white" : "text-gray-400"}
                `}
              >
                {item.name}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`flex-1 h-1 mx-2 transition-colors duration-300 ${
                  step > item.id ? "bg-indigo-600" : "bg-gray-700"
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
            <h1 className="text-4xl font-extrabold text-white">
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
            <Zap className="w-10 h-10 mx-auto text-yellow-400 mb-2" />
            <h1 className="text-4xl font-extrabold text-white">Career Risk Assessment</h1>
            <p className="mt-2 text-lg text-gray-400">
              Answer these questions to calculate your current career risk score and identify areas
              for optimization.
            </p>
          </>
        )}
      </header>

      {/* Conditional Forms */}
      {step === 1 ? (
        <div className="w-full max-w-2xl rounded-3xl bg-gray-800 p-6 shadow-2xl md:p-10">
          <form onSubmit={handleSubmit(onProfileSubmit)} className="space-y-6">
            <h2 className="text-2xl font-bold text-white border-b border-gray-700 pb-3">
              Personal & Contact Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField
                icon={User}
                id="fullName"
                label="Full Name"
                placeholder="John Doe"
                register={register}
                errors={errors}
              />
              <InputField
                icon={Mail}
                id="email"
                label="Email Address"
                placeholder="john@example.com"
                register={register}
                errors={errors}
                type="email"
              />
              <InputField
                icon={Phone}
                id="phone"
                label="Phone Number (Optional)"
                placeholder="(123) 456-7890"
                register={register}
                errors={errors}
              />
              <InputField
                icon={Linkedin}
                id="linkedin"
                label="LinkedIn URL (Optional)"
                placeholder="https://linkedin.com/in/johndoe"
                register={register}
                errors={errors}
              />
            </div>
            <div className="relative py-4 mt-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-700"></div>
              </div>
              <div className="relative flex justify-start text-sm">
                <h2 className="bg-gray-800 pr-3 text-2xl font-bold text-white">
                  Current Employment
                </h2>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField
                icon={Briefcase}
                id="jobTitle"
                label="Job Title"
                placeholder="Senior Software Engineer"
                register={register}
                errors={errors}
              />
              <InputField
                icon={Building}
                id="company"
                label="Company Name"
                placeholder="RiskSecure Analytics"
                register={register}
                errors={errors}
              />
            </div>
            <button
              type="submit"
              disabled={isProfileSubmitting}
              className="mt-10 flex w-full items-center justify-center rounded-xl bg-indigo-600 py-3 px-4 text-lg font-bold text-white shadow-xl shadow-indigo-600/30 transition-all duration-300 hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed"
            >
              {isProfileSubmitting ? (
                "Saving Profile..."
              ) : (
                <>
                  Save Profile & Proceed to Assessment
                  <ArrowRight className="ml-3 h-5 w-5" />
                </>
              )}
            </button>
          </form>
          <div className="border-t border-gray-700 pt-8 mt-8">
            <h2 className="text-xl font-semibold text-white mb-4">
              Optional: Upload Resume for Deeper Analysis
            </h2>
            <ResumeUpload />
          </div>
        </div>
      ) : step === 2 ? (
        <div className="w-full max-w-3xl mx-auto p-4 sm:p-6 lg:p-8 pt-12">
          <form
            onSubmit={handleAssessmentSubmit}
            className="space-y-8 bg-gray-800 p-8 rounded-2xl shadow-2xl border border-indigo-700/50"
          >
            <button
              type="button"
              onClick={() => setStep(1)} // Go back to Step 1
              className="inline-flex items-center text-sm font-medium text-indigo-400 hover:text-indigo-300 transition duration-150"
            >
              <ArrowRight className="h-4 w-4 mr-1 rotate-180" />
              Back to Profile
            </button>
            {/* <div className="flex flex-row justify-center"> */}
            <h2 className="text-2xl font-bold text-indigo-400 border-b border-gray-700 pb-2">
              Your Current Role
            </h2>
            {/* </div> */}
            <FormField label="Industry" description="Select your primary industry.">
              <CustomSelect
                id="industry"
                // label="Industry"
                value={assessmentFormData.industry}
                onChange={v => handleAssessmentChange("industry", v)}
                options={industryOptions}
              />
            </FormField>
            <FormField label="Specialization" description="Choose your specific specialization.">
              <CustomSelect
                id="specialization"
                // label="Specialization"
                value={assessmentFormData.specialization}
                onChange={v => handleAssessmentChange("specialization", v)}
                options={specializationOptions}
              />
            </FormField>
            <FormField label="Job Role" description="Choose the role that best matches your title.">
              <CustomSelect
                id="jobRole"
                // label="Job Role"
                value={assessmentFormData.jobRole}
                onChange={v => handleAssessmentChange("jobRole", v)}
                options={jobRoleOptions}
              />
            </FormField>
            <FormField label="Experience" description="Total professional experience in years.">
              <CustomSelect
                id="experience"
                // label="Experience"
                value={assessmentFormData.experience}
                onChange={v => handleAssessmentChange("experience", v)}
                options={experienceOptions}
              />
            </FormField>
            <FormField
              label="Time in Current Role"
              description="How long have you been in your current position?"
            >
              <CustomSelect
                id="timeInCurrentRole"
                // label="Time in Current Role"
                value={assessmentFormData.timeInCurrentRole}
                onChange={v => handleAssessmentChange("timeInCurrentRole", v)}
                options={timeOptions}
              />
            </FormField>
            <FormField label="Age Range" description="Select your age bracket.">
              <CustomSelect
                id="ageRange"
                // label="Age Range"
                value={assessmentFormData.ageRange}
                onChange={v => handleAssessmentChange("ageRange", v)}
                options={ageOptions}
              />
            </FormField>
            <h2 className="text-2xl font-bold text-indigo-400 pt-6 border-b border-gray-700 pb-2">
              Background & Preferences
            </h2>
            <FormField label="Education" description="Highest education completed.">
              <div className="space-y-2">
                {radioOptions.education.map(option => (
                  <div key={option} className="flex items-center">
                    <input
                      id={`edu-${option}`}
                      name="education"
                      type="radio"
                      checked={assessmentFormData.education === option}
                      onChange={() => handleAssessmentChange("education", option)}
                      className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500 bg-gray-700"
                    />
                    <label
                      htmlFor={`edu-${option}`}
                      className="ml-3 block text-sm font-medium text-gray-300"
                    >
                      {option}
                    </label>
                  </div>
                ))}
              </div>
            </FormField>
            <FormField label="Location" description="Primary work location/region.">
              <div className="space-y-2">
                {radioOptions.location.map(option => (
                  <div key={option} className="flex items-center">
                    <input
                      id={`loc-${option}`}
                      name="location"
                      type="radio"
                      checked={assessmentFormData.location === option}
                      onChange={() => handleAssessmentChange("location", option)}
                      className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500 bg-gray-700"
                    />
                    <label
                      htmlFor={`loc-${option}`}
                      className="ml-3 block text-sm font-medium text-gray-300"
                    >
                      {option}
                    </label>
                  </div>
                ))}
              </div>
            </FormField>
            <FormField label="Company Size" description="Size of your current employer.">
              <CustomSelect
                id="companySize"
                // label="Company Size"
                value={assessmentFormData.companySize}
                onChange={v => handleAssessmentChange("companySize", v)}
                options={companySizeOptions}
              />
            </FormField>
            <FormField label="Work Preference" description="Preferred working arrangement.">
              <div className="space-y-2">
                {radioOptions.workPreference.map(option => (
                  <div key={option} className="flex items-center">
                    <input
                      id={`work-${option}`}
                      name="workPreference"
                      type="radio"
                      checked={assessmentFormData.workPreference === option}
                      onChange={() => handleAssessmentChange("workPreference", option)}
                      className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500 bg-gray-700"
                    />
                    <label
                      htmlFor={`work-${option}`}
                      className="ml-3 block text-sm font-medium text-gray-300"
                    >
                      {option}
                    </label>
                  </div>
                ))}
              </div>
            </FormField>
            <h2 className="text-2xl font-bold text-indigo-400 pt-6 border-b border-gray-700 pb-2">
              Skills & Certification
            </h2>
            <FormField label="Recent Training" description="e.g., AWS CCP, Data Ethics Course">
              <input
                id="recentTraining"
                type="text"
                value={assessmentFormData.recentTraining}
                onChange={e => handleAssessmentChange("recentTraining", e.target.value)}
                className="mt-1 block w-full border border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-gray-700 text-white"
                placeholder="e.g., AWS Certified Cloud Practitioner"
              />
            </FormField>
            <FormField
              label="Certifications"
              description="Select all relevant certifications you currently hold."
            >
              <div className="space-y-2">
                {certOptions.map(cert => (
                  <div key={cert} className="flex items-center">
                    <input
                      id={`cert-${cert}`}
                      type="checkbox"
                      checked={assessmentFormData.certifications?.includes(cert)}
                      onChange={e =>
                        handleAssessmentChange(
                          "certifications",
                          assessmentFormData.certifications?.includes(cert)
                            ? assessmentFormData.certifications.filter(c => c !== cert)
                            : [...(assessmentFormData.certifications || []), cert]
                        )
                      }
                      className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 bg-gray-700"
                    />
                    <label
                      htmlFor={`cert-${cert}`}
                      className="ml-3 block text-sm font-medium text-gray-300"
                    >
                      {cert}
                    </label>
                  </div>
                ))}
              </div>
            </FormField>
            <div className="pt-8 flex justify-between items-center">
              {/* Added Back to Profile button and grouped with Clear Form */}
              <div className="flex items-center space-x-6">
                <button
                  type="button"
                  onClick={() => setAssessmentFormData(initialAssessmentData)}
                  className="text-sm font-medium text-gray-500 hover:text-gray-300 transition duration-150"
                >
                  Clear Form
                </button>
              </div>

              <button
                type="submit"
                disabled={isAssessmentLoading}
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-xl shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-200 disabled:opacity-50"
              >
                {isAssessmentLoading ? (
                  <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                ) : (
                  <Save className="w-5 h-5 mr-3" />
                )}
                {isAssessmentLoading ? "Calculating Risk..." : "Submit"}
                <ArrowRight className="w-4 h-4 ml-2" />
              </button>
            </div>
            {submitStatus === "success" && (
              <p className="text-center text-green-400 font-medium p-3 bg-green-900/50 rounded-lg">
                Assessment submitted! Redirecting to results...
              </p>
            )}
            {submitStatus === "error" && (
              <p className="text-center text-red-400 font-medium p-3 bg-red-900/50 rounded-lg">
                Error submitting assessment. Please try again.
              </p>
            )}
          </form>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Assessment Complete!</h2>
          <p className="text-lg text-gray-400">
            Thank you for completing your profile and assessment. Your results are being calculated.
          </p>
          {/* Grouped buttons for navigation */}
          <div className="flex space-x-4 mt-6">
            <button
              onClick={() => setStep(2)} // Go back to Step 2
              className="inline-flex items-center px-6 py-3 text-gray-300 bg-gray-700 rounded-xl hover:bg-gray-600 transition font-semibold"
            >
              <ArrowRight className="h-4 w-4 mr-2 rotate-180" />
              Back to Assessment
            </button>
            <a
              href="/results"
              className="inline-flex items-center px-6 py-3 text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition font-semibold"
            >
              View My Results
              <ArrowRight className="h-4 w-4 ml-2" />
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
