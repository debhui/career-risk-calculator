// auth/callback/page.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function CallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session) {
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("consent_accepted, onboarding_completed")
          .eq("id", session.user.id)
          .maybeSingle(); // 👈 use maybeSingle so it doesn't throw if no row
        console.log("profiles", profile);
        if (error) {
          console.error("Error fetching profile:", error);
          router.push("/error");
          return;
        }

        if (!profile) {
          // profile row doesn't exist yet, force onboarding
          router.push("/onboarding");
          return;
        }

        if (!profile.consent_accepted) {
          router.push("/onboarding");
        } else if (!profile.onboarding_completed) {
          router.push("/onboarding"); // step 2 if needed
        } else {
          router.push("/assessment-profile");
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  // useEffect(() => {
  //     const {
  //       data: { subscription },
  //     } = supabase.auth.onAuthStateChange(async (event, session) => {
  //       if (event === "SIGNED_IN" && session) {
  //    // const hasConsent = session.user?.user_metadata?.consentAccepted;
  //         // router.push(hasConsent ? "/" : "/onboarding");

  //  }
  //     });

  //     // Clean up the subscription on unmount
  //     return () => {
  //       subscription.unsubscribe();
  //     };
  //   }, [router]);

  return (
    <div className="flex flex-col items-center p-4 sm:p-6 font-inter">
      <p className="text-white">Signing you in...</p>
    </div>
  );
}
