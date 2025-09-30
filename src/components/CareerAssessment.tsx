import { z } from "zod";
import { Save, Loader2, ArrowRight } from "lucide-react";
import CustomSelect from "@/components/CustomSelect";

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
// const initialAssessmentData: AssessmentData = {
//   industry: "Technology",
//   specialization: "Software Development",
//   jobRole: "Senior Developer",
//   experience: "6-10 years",
//   timeInCurrentRole: "3-5 years",
//   ageRange: "31-40 years",
//   education: "Bachelor's Degree",
//   location: "North America",
//   companySize: "Startup (1-50)",
//   workPreference: "Remote",
//   recentTraining: "",
//   certifications: [],
// };

const FormField: React.FC<{ label: string; description: string; children: React.ReactNode }> = ({
  label,
  description,
  children,
}) => (
  <div className="space-y-2 border-b border-gray-700 pb-6">
    <label className="block text-base font-medium text-gray-800 dark:text-white">
      {label} <span className="text-red-500">*</span>
    </label>
    <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
    <div className="mt-1">{children}</div>
  </div>
);

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

interface CareerAssessment {
  assessmentFormData: AssessmentData;
  isAssessmentLoading: boolean;
  submitStatus: "idle" | "success" | "error";
  handleAssessmentChange: (field: keyof AssessmentData, value: string | string[]) => void;
  handleAssessmentSubmit: (e: React.FormEvent) => void | Promise<void>;
}
export function CareerAssessment({
  assessmentFormData,
  isAssessmentLoading,
  submitStatus = "idle",
  handleAssessmentChange,
  handleAssessmentSubmit,
}: CareerAssessment) {
  return (
    <form onSubmit={handleAssessmentSubmit} className="space-y-6">
      {/* <button
        type="button"
        onClick={() => setStep(2)} // Go back to Step 1
        className="inline-flex items-center text-sm font-medium text-indigo-400 hover:text-indigo-300 transition duration-150"
      >
        <ArrowRight className="h-4 w-4 mr-1 rotate-180" />
        Back to Profile
      </button> */}
      {/* <div className="flex flex-row justify-center"> */}
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white border-b border-gray-300 dark:border-gray-700 pb-3 mt-4 mb-8">
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
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white border-b border-gray-300 dark:border-gray-700 pb-3 pt-6 mt-4 mb-8">
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
                className="h-4 w-4 text-teal-600 dark:text-indigo-600 border-gray-300 focus:ring-teal-500 focus:dark:ring-indigo-500 bg-gray-700"
              />
              <label
                htmlFor={`edu-${option}`}
                className="ml-3 block text-sm font-medium text-gray-600 dark:text-gray-300"
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
                className="h-4 w-4 text-teal-600 dark:text-indigo-600 border-gray-300 focus:ring-teal-500 focus:dark:ring-indigo-500 bg-gray-700"
              />
              <label
                htmlFor={`loc-${option}`}
                className="ml-3 block text-sm font-medium text-gray-600 dark:text-gray-300"
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
                className="h-4 w-4 text-teal-600 dark:text-indigo-600 border-gray-300 focus:ring-teal-500 focus:dark:ring-indigo-500 bg-gray-700"
              />
              <label
                htmlFor={`work-${option}`}
                className="ml-3 block text-sm font-medium text-gray-600 dark:text-gray-300"
              >
                {option}
              </label>
            </div>
          ))}
        </div>
      </FormField>
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white border-b border-gray-300 dark:border-gray-700 pb-3 pt-6 mt-4 mb-8">
        Skills & Certification
      </h2>
      <FormField label="Recent Training" description="e.g., AWS CCP, Data Ethics Course">
        <input
          id="recentTraining"
          type="text"
          value={assessmentFormData.recentTraining}
          onChange={e => handleAssessmentChange("recentTraining", e.target.value)}
          className="mt-1 block w-full border border-gray-400 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-teal-500 focus:dark:border-indigo-500 sm:text-sm bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-white"
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
                onChange={() =>
                  handleAssessmentChange(
                    "certifications",
                    assessmentFormData.certifications?.includes(cert)
                      ? assessmentFormData.certifications.filter(c => c !== cert)
                      : [...(assessmentFormData.certifications || []), cert]
                  )
                }
                className="h-4 w-4 text-teal-600 dark:text-indigo-600 border-gray-800 dark:border-gray-300 rounded focus:ring-teal-500 focus:dark:ring-indigo-500 bg-gray-300 dark:bg-gray-700"
              />
              <label
                htmlFor={`cert-${cert}`}
                className="ml-3 block text-sm font-medium text-gray-600 dark:text-gray-300"
              >
                {cert}
              </label>
            </div>
          ))}
        </div>
      </FormField>
      <div className="flex flex-col justify-between items-center pt-4">
        {/* Added Back to Profile button and grouped with Clear Form */}
        {/* <div className="flex items-center space-x-6">
          <button
            type="button"
            onClick={() => setAssessmentFormData(initialAssessmentData)}
            className="text-sm font-medium text-gray-500 hover:text-gray-300 transition duration-150"
          >
            Clear Form
          </button>
        </div> */}
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

        <button
          type="submit"
          disabled={isAssessmentLoading}
          className="mt-4 flex w-full items-center justify-center rounded-xl bg-teal-600 dark:bg-indigo-600 py-3 px-4 text-lg font-bold text-white shadow-xl shadow-teal-600/30 dark:shadow-indigo-600/30 transition-all duration-300 hover:bg-teal-700 hover:dark:bg-indigo-700 disabled:bg-teal-400  disabled:dark:bg-indigo-400 disabled:cursor-not-allowed"
        >
          {isAssessmentLoading ? (
            <Loader2 className="w-5 h-5 mr-3 animate-spin" />
          ) : (
            <Save className="w-5 h-5 mr-3" />
          )}
          {isAssessmentLoading ? "Calculating Risk..." : "Submit"}
          <ArrowRight className="ml-3 h-5 w-5" />
        </button>
      </div>
    </form>
  );
}
