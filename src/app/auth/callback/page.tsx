// app/auth/callback/page.tsx
"use client";

import { useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseClient } from "@/lib/supabase/browser";
import { Session } from "@supabase/supabase-js";
import { useAppDispatch } from "@/hooks/appDispatch";
import { setSession } from "@/store/authSlice";

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
  const dispatch = useAppDispatch();

  // useEffect(() => {
  //   const {
  //     data: { subscription },
  //   } = supabase.auth.onAuthStateChange(async (event, session) => {
  //     if (session) {
  //       dispatch(setSession(session));
  //     } else {
  //       dispatch(setSession(null));
  //     }
  //     if (event === "SIGNED_IN" && session) {
  //       try {
  //         const profile = await fetchProfile(supabase, session.user.id);

  //         if (!profile) {
  //           router.replace("/onboarding"); // profile not found → force onboarding
  //           return;
  //         }

  //         if (!profile.consent_accepted) {
  //           router.replace("/onboarding");
  //         } else if (!profile.onboarding_completed) {
  //           router.replace("/onboarding"); // step 2 if needed
  //         } else {
  //           router.replace("/");
  //         }
  //       } catch (err) {
  //         console.error("Error fetching profile:", err);
  //         router.replace("/error");
  //       }
  //     }
  //   });

  //   return () => {
  //     subscription.unsubscribe();
  //   };
  // }, [router, supabase, dispatch]);

  const handleSessionAndRouting = useCallback(
    async (session: Session | null) => {
      // 1. Always update Redux state immediately
      dispatch(setSession(session));

      // ** FIX: Add a brief wait (50ms) to allow Redux Persist to commit the new state **
      // This addresses the issue of Redux session showing null after redirect.
      await new Promise(resolve => setTimeout(resolve, 50));

      // 2. Check profile completion and redirect if a session is present,
      // regardless of whether the event was SIGNED_IN or INITIAL_SESSION.
      if (session) {
        try {
          const profile = await fetchProfile(supabase, session.user.id);

          if (!profile) {
            router.replace("/onboarding"); // profile not found → force onboarding
            return;
          }

          const isComplete = profile.consent_accepted && profile.onboarding_completed;

          if (!isComplete) {
            // If consent or onboarding is incomplete, redirect to the start of the flow
            router.replace("/onboarding");
          } else {
            // Profile complete, redirect to the main app dashboard
            router.replace("/");
          }
        } catch (err) {
          console.error("Error fetching profile:", err);
          router.replace("/error");
        }
      } else {
        // If session is null (e.g., SIGNED_OUT event), redirect to login
        router.replace("/login");
      }
    },
    [router, supabase, dispatch]
  );

  useEffect(() => {
    // Use onAuthStateChange to capture all relevant events
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      // Trigger routing logic for any event that provides a session,
      // or specifically for SIGNED_OUT
      if (session || event === "SIGNED_OUT") {
        handleSessionAndRouting(session);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase.auth, handleSessionAndRouting]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <div className="flex flex-col items-center p-8 bg-white dark:bg-gray-800 rounded-xl shadow-2xl">
        {/* Replacing lucide-react (Loader2) with inline spinner for robustness */}
        <div className="w-8 h-8 border-4 border-t-4 border-indigo-600 border-opacity-25 border-t-indigo-600 rounded-full animate-spin dark:border-indigo-400 dark:border-t-indigo-400"></div>
        <h1 className="mt-4 text-xl font-semibold text-gray-800 dark:text-gray-100">
          Authenticating Session
        </h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Please wait while we secure your connection and check your profile.
        </p>
      </div>
    </div>
  );
}
