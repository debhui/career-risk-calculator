// assessment/page.tsx
"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { supabase } from "@/lib/supabaseClient";

import ResumeUpload from "@/components/ResumeUpload";
import { ArrowRight, Loader2, Save, Zap } from "lucide-react";
import CustomSelect from "@/components/CustomSelect";

const schema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(), // validate with libphonenumber-js
  linkedin: z.string().url().optional(),
  jobTitle: z.string().min(2),
  company: z.string().min(1),
});

type FormData = z.infer<typeof schema>;

// --- Form State Structure ---
interface AssessmentData {
  industry: string;
  specialization: string;
  jobRole: string;
  experience: string;
  timeInCurrentRole: string;
  ageRange: string;
  education: string;
  location: string;
  companySize: string;
  workPreference: string;
  recentTraining: string;
  certifications: string[];
}

// Initial state for the form
const initialData: AssessmentData = {
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

// --- Helper Components ---

// Input wrapper for required fields
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

// Standard Dropdown/Select
const SelectField: React.FC<{
  id: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}> = ({ id, value, onChange, options }) => (
  <select
    id={id}
    value={value}
    onChange={e => onChange(e.target.value)}
    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-600 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md bg-gray-700 text-white"
  >
    {options.map(option => (
      <option key={option} value={option}>
        {option}
      </option>
    ))}
  </select>
);

// --- Main Assessment Component ---
export default function AssessmentPage() {
  const [formData, setFormData] = useState<AssessmentData>(initialData);
  const [loading, setLoading] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");

  const handleChange = (field: keyof AssessmentData, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCertificationChange = (cert: string, checked: boolean) => {
    setFormData(prev => {
      const currentCerts = prev.certifications;
      if (checked) {
        return { ...prev, certifications: [...currentCerts, cert] };
      } else {
        return { ...prev, certifications: currentCerts.filter(c => c !== cert) };
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSubmitStatus("idle");

    // Fetch User ID (or mock ID)
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      setSubmitStatus("error");
      console.error("User not authenticated.");
      return;
    }

    const dataToSave = {
      user_id: user.id,
      ...formData,
      submitted_at: new Date().toISOString(),
    };

    // Mock API call to save data (or calculate risk)
    const { error } = await supabase.from("assessments").upsert(dataToSave);

    setLoading(false);

    if (error) {
      setSubmitStatus("error");
      console.error("Save Error:", error);
    } else {
      setSubmitStatus("success");
      // In a real app, you would redirect to the results page here:
      // router.push('/results');
      console.log("Assessment saved successfully!");
    }
  };

  // Dropdown Options based on the image
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

  return (
    <div className="flex flex-col items-center p-4 sm:p-6 font-inter">
      <div className="max-w-3xl mx-auto p-4 sm:p-6 lg:p-8 pt-12">
        <header className="text-center mb-10">
          <Zap className="w-10 h-10 mx-auto text-yellow-400 mb-2" />
          <h1 className="text-4xl font-extrabold text-white">Career Risk Assessment</h1>
          <p className="mt-2 text-lg text-gray-400">
            Answer these questions to calculate your current career risk score and identify areas
            for optimization.
          </p>
        </header>

        <form
          onSubmit={handleSubmit}
          className="space-y-8 bg-gray-800 p-8 rounded-2xl shadow-2xl border border-indigo-700/50"
        >
          {/* --- Section 1: Role & Experience --- */}
          <h2 className="text-2xl font-bold text-indigo-400 border-b border-gray-700 pb-2">
            Your Current Role
          </h2>

          <FormField label="Industry" description="Select your primary industry.">
            <CustomSelect
              id="industry"
              label="Industry"
              value={formData.industry}
              onChange={v => handleChange("industry", v)}
              options={industryOptions}
            />
          </FormField>

          <FormField label="Specialization" description="Choose your specific specialization.">
            <CustomSelect
              id="specialization"
              label="Specialization"
              value={formData.specialization}
              onChange={v => handleChange("specialization", v)}
              options={specializationOptions}
            />
          </FormField>

          <FormField label="Job Role" description="Choose the role that best matches your title.">
            <CustomSelect
              id="jobRole"
              label="Job Role"
              value={formData.jobRole}
              onChange={v => handleChange("jobRole", v)}
              options={jobRoleOptions}
            />
          </FormField>

          <FormField label="Experience" description="Total professional experience in years.">
            <CustomSelect
              id="experience"
              label="Experience"
              value={formData.experience}
              onChange={v => handleChange("experience", v)}
              options={experienceOptions}
            />
          </FormField>

          <FormField
            label="Time in Current Role"
            description="How long have you been in your current position?"
          >
            <CustomSelect
              id="timeInCurrentRole"
              label="Time in Current Role"
              value={formData.timeInCurrentRole}
              onChange={v => handleChange("timeInCurrentRole", v)}
              options={timeOptions}
            />
          </FormField>

          <FormField label="Age Range" description="Select your age bracket.">
            <CustomSelect
              id="ageRange"
              label="Age Range"
              value={formData.ageRange}
              onChange={v => handleChange("ageRange", v)}
              options={ageOptions}
            />
          </FormField>

          {/* --- Section 2: Background & Preferences --- */}
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
                    checked={formData.education === option}
                    onChange={() => handleChange("education", option)}
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
                    checked={formData.location === option}
                    onChange={() => handleChange("location", option)}
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
            <SelectField
              id="companySize"
              value={formData.companySize}
              onChange={v => handleChange("companySize", v)}
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
                    checked={formData.workPreference === option}
                    onChange={() => handleChange("workPreference", option)}
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

          {/* --- Section 3: Training & Certification --- */}
          <h2 className="text-2xl font-bold text-indigo-400 pt-6 border-b border-gray-700 pb-2">
            Skills & Certification
          </h2>

          <FormField label="Recent Training" description="e.g., AWS CCP, Data Ethics Course">
            <input
              id="recentTraining"
              type="text"
              value={formData.recentTraining}
              onChange={e => handleChange("recentTraining", e.target.value)}
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
                    checked={formData.certifications.includes(cert)}
                    onChange={e => handleCertificationChange(cert, e.target.checked)}
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

          {/* --- Submit Button and Status --- */}
          <div className="pt-8 flex justify-between items-center">
            <button
              type="button"
              onClick={() => setFormData(initialData)}
              className="text-sm font-medium text-gray-500 hover:text-gray-300 transition duration-150"
            >
              Clear Form
            </button>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-xl shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-200 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 mr-3 animate-spin" />
              ) : (
                <Save className="w-5 h-5 mr-3" />
              )}
              {loading ? "Calculating Risk..." : "Submit & Calculate Risk"}
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
    </div>
  );
}
