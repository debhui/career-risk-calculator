import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { InputField } from "@/components/InputField";
import {
  User,
  Mail,
  Loader2,
  Phone,
  Linkedin,
  Briefcase,
  Building,
  ArrowRight,
} from "lucide-react";

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

// Zod Schema with enhanced validation
const profileSchema = z.object({
  fullName: z.string().min(2, "Full name is required."),
  email: z.string().email("Invalid email address."),

  // Phone Validation: Optional, but if provided, must match common phone formats.
  phone: z
    .string()
    .optional()
    .refine(
      val => {
        // Allows empty string/undefined, or a string that matches a typical phone pattern (10-15 digits/symbols)
        if (!val) return true;
        // Regex allows numbers, spaces, dashes, and parentheses, requiring at least 10 digits
        const phoneRegex = /^[\d\s\-\(\)]{10,15}$/;
        return phoneRegex.test(val);
      },
      { message: "Invalid phone number format." }
    ),

  // LinkedIn Validation: Optional, but if provided, must be a valid URL.
  linkedin: z
    .string()
    .optional()
    .or(z.literal(""))
    .refine(
      val => {
        if (!val) return true; // Allows empty string or undefined
        try {
          // Must be a valid URL
          new URL(val);
          // Simple check to ensure it's LinkedIn-related (can be made stricter if needed)
          return val.toLowerCase().includes("linkedin.com");
        } catch {
          // If URL parsing fails or if the value is a single word (not URL), return false.
          return false;
        }
      },
      { message: "Must be a valid LinkedIn URL (e.g., https://linkedin.com/in/user)." }
    ),

  jobTitle: z.string().min(2, "Job title is required."),
  company: z.string().min(1, "Company is required."),
});

type ProfileData = z.infer<typeof profileSchema>;

interface AssessmentProfileProps {
  profile: UserProfile | null;
  onProfileSubmit: (data: ProfileData) => void | Promise<void>;
}

export function AssessmentProfile({ profile, onProfileSubmit }: AssessmentProfileProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting: isProfileSubmitting },
    reset, // <-- Get the reset function
  } = useForm<ProfileData>({
    resolver: zodResolver(profileSchema),
    // Initialize default values to avoid 'undefined' issues, especially for strings
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      linkedin: "",
      jobTitle: "",
      company: "",
    },
  });

  // FIX: Use useEffect and reset() to update the form state when the async 'profile' data loads.
  useEffect(() => {
    if (profile) {
      // Map the backend profile object structure to the form field names (ProfileData)
      const defaultValues = {
        fullName: profile.full_name || "",
        email: profile.email || "",
        phone: profile.phone || "",
        // Ensure that null/undefined values for URL convert to empty string for the form
        linkedin: profile.linkedin_url || "",
        jobTitle: profile.job_title || "",
        company: profile.company || "",
      };

      // Use reset to initialize/update the form fields and internal RHF state
      reset(defaultValues);
    }
  }, [profile, reset]);

  return (
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
          value={profile?.full_name}
        />
        <InputField
          icon={Mail}
          id="email"
          label="Email Address"
          placeholder="john@example.com"
          register={register}
          errors={errors}
          type="email"
          value={profile?.email}
        />
        <InputField
          icon={Phone}
          id="phone"
          label="Phone Number (Optional)"
          placeholder="(123) 456-7890"
          register={register}
          errors={errors}
          value={profile?.phone}
        />
        <InputField
          icon={Linkedin}
          id="linkedin"
          label="LinkedIn URL (Optional)"
          placeholder="https://linkedin.com/in/johndoe"
          register={register}
          errors={errors}
          value={profile?.linkedin_url}
        />
      </div>
      <div className="relative py-4 mt-8">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-700"></div>
        </div>
        <div className="relative flex justify-start text-sm">
          <h2 className="bg-gray-800 pr-3 text-2xl font-bold text-white">Current Employment</h2>
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
          value={profile?.job_title}
        />
        <InputField
          icon={Building}
          id="company"
          label="Company Name"
          placeholder="RiskSecure Analytics"
          register={register}
          errors={errors}
          value={profile?.company}
        />
      </div>
      <button
        type="submit"
        disabled={isProfileSubmitting}
        className="mt-10 flex w-full items-center justify-center rounded-xl bg-indigo-600 py-3 px-4 text-lg font-bold text-white shadow-xl shadow-indigo-600/30 transition-all duration-300 hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed"
      >
        {isProfileSubmitting ? (
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        ) : (
          <>
            Save Profile & Proceed
            <ArrowRight className="ml-3 h-5 w-5" />
          </>
        )}
      </button>
    </form>
  );
}
