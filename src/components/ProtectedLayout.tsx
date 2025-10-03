"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { createSupabaseClient } from "@/lib/supabase/browser";

interface ProtectedLayoutProps {
  children: React.ReactNode;
}

const ProtectedLayout: React.FC<ProtectedLayoutProps> = ({ children }) => {
  const router = useRouter();
  const supabase = createSupabaseClient();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const checkAuthAndProfile = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        // 1. User is not authenticated, redirect to sign-in
        router.replace("/");
        return;
      }

      // 2. User is authenticated, check profile status
      const { data: profile } = await supabase
        .from("profiles")
        .select("consent_accepted, onboarding_completed")
        .eq("id", user.id)
        .maybeSingle();

      if (!profile || !profile.consent_accepted || !profile.onboarding_completed) {
        // 3. Profile incomplete, force redirect to onboarding
        router.replace("/onboarding");
        return;
      }

      // 4. All checks passed
      setIsReady(true);
    };

    checkAuthAndProfile();
  }, [router, supabase]);

  if (!isReady) {
    return (
      <div className="flex flex-col items-center justify-center h-screen w-full bg-white dark:bg-gray-900">
        <Loader2 className="w-8 h-8 mx-auto mb-4 animate-spin text-green-600 dark:text-green-400" />
        <p className="mt-2 text-gray-700 dark:text-gray-300">Securing route...</p>
      </div>
    );
  }

  // Render the child components (the protected page content)
  return <>{children}</>;
};

export default ProtectedLayout;
