// onboarding/page.tsx
"use client";

import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function OnboardingPage() {
  const router = useRouter();

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

  const handleConsent = async () => {
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) return;

    const { error } = await supabase.from("profiles").upsert({
      id: user.id,
      email: user.email,
      consent_accepted: true,
      consent_accepted_at: new Date().toISOString(),
      onboarding_completed: true,
      updated_at: new Date().toISOString(),
    });

    if (error) {
      console.error("Failed to update profile:", error.message);
      return;
    }

    router.push("/assessment");
  };

  return (
    <div className="max-w-lg mx-auto p-6">
      <h1 className="text-2xl font-bold">Consent & Data Usage</h1>
      <p className="mt-4 text-gray-700">
        We use your profile, resume data, and LLM insights to improve your experience. You can
        export or delete your data anytime from settings.
      </p>
      <button onClick={handleConsent} className="mt-6 px-4 py-2 bg-green-600 text-white rounded">
        Accept & Continue
      </button>
    </div>
  );
}
