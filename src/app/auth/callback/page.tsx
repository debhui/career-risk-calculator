// app/auth/callback/page.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseClient } from "@/lib/supabase/browser";

async function fetchProfile(supabase: any, userId: string, maxRetries = 5) {
  for (let i = 0; i < maxRetries; i++) {
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("consent_accepted, onboarding_completed")
      .eq("id", userId)
      .maybeSingle();

    if (error) throw error;
    if (profile) return profile;

    // wait 500ms before retry
    await new Promise(r => setTimeout(r, 500));
  }
  return null;
}

export default function CallbackPage() {
  const router = useRouter();
  const supabase = createSupabaseClient();

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session) {
        try {
          const profile = await fetchProfile(supabase, session.user.id);

          if (!profile) {
            router.replace("/onboarding"); // profile not found → force onboarding
            return;
          }

          if (!profile.consent_accepted) {
            router.replace("/onboarding");
          } else if (!profile.onboarding_completed) {
            router.replace("/onboarding"); // step 2 if needed
          } else {
            router.replace("/assessment");
          }
        } catch (err) {
          console.error("Error fetching profile:", err);
          router.replace("/error");
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router, supabase]);

  return (
    <div className="flex flex-col items-center p-4 sm:p-6 font-inter">
      <p className="text-white">Signing you in...</p>
    </div>
  );
}
