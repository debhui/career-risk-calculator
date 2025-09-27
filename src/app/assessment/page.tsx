// assessment/page.tsx
"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/lib/supabaseClient";
import { InputField } from "@/components/InputField";
import ResumeUpload from "@/components/ResumeUpload";
import {
  User,
  Mail,
  Phone,
  Linkedin,
  Briefcase,
  Building,
  ShieldHalf,
  ArrowRight,
} from "lucide-react";
import { GlobalLayout } from "@/components/GlobalLayout";

const schema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(), // validate with libphonenumber-js
  linkedin: z.string().url().optional(),
  jobTitle: z.string().min(2),
  company: z.string().min(1),
});

type FormData = z.infer<typeof schema>;

export default function AssessmentForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    const { error } = await supabase.from("profiles").upsert({
      id: (await supabase.auth.getUser()).data.user?.id,
      full_name: data.fullName,
      email: data.email,
      phone: data.phone,
      linkedin_url: data.linkedin,
      job_title: data.jobTitle,
      company: data.company,
    });

    if (error) console.error(error);
  };

  return (
    <GlobalLayout>
      <div className="min-h-[calc(100vh-200px)] bg-gray-900 flex flex-col items-center p-4 sm:p-6 font-inter">
        {/* <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col space-y-4">
        <input {...register("fullName")} placeholder="Full Name" />
        <input {...register("email")} type="email" placeholder="Email" />
        <input {...register("phone")} placeholder="Phone" />
        <input {...register("linkedin")} placeholder="LinkedIn URL" />
        <input {...register("jobTitle")} placeholder="Job Title" />
        <input {...register("company")} placeholder="Company" />
        <button type="submit">Save</button>
      </form> */}

        <header className="mb-10 text-center w-full max-w-2xl">
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
        </header>
        <div className="w-full max-w-2xl rounded-3xl bg-gray-800 p-6 shadow-2xl md:p-10">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Section Title */}
            <h2 className="text-2xl font-bold text-white border-b border-gray-700 pb-3">
              Personal & Contact Information
            </h2>

            {/* Grid for Personal Info */}
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

            {/* Separator and Professional Section Title */}
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

            {/* Grid for Professional Info */}
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

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-10 flex w-full items-center justify-center rounded-xl bg-indigo-600 py-3 px-4 text-lg font-bold text-white shadow-xl shadow-indigo-600/30 transition-all duration-300 hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
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
      </div>
    </GlobalLayout>
  );
}
