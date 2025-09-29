"use client";

import { createSupabaseClient } from "@/lib/supabase/browser";
import { Chrome } from "lucide-react";

export default function Login() {
  const supabase = createSupabaseClient();

  const handleLogin = async () => {
    // Using a relative path for the redirect, which should work in a local environment
    // where window.location.origin is defined.
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  return (
    <div className="flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8 rounded-2xl border border-indigo-700/50 bg-gray-800 p-8 shadow-2xl transition duration-300 hover:shadow-indigo-500/30">
        <div className="text-center">
          <h2 className="mt-2 text-3xl font-bold text-white tracking-tight">
            Access Your Dashboard
          </h2>
          <p className="mt-2 text-sm text-gray-400">
            Sign in below to continue your risk assessment or view your profile.
          </p>
        </div>

        <div className="space-y-6">
          <button
            type="button"
            className="group relative flex w-full items-center justify-center rounded-lg border border-gray-600 bg-white px-5 py-3 text-base font-semibold text-gray-700 shadow-md transition duration-200 hover:bg-gray-100 focus:outline-none focus:ring-4 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-800"
            onClick={handleLogin}
          >
            {/* Using Lucide's Chrome icon for Google */}
            <Chrome className="mr-3 h-5 w-5 text-red-600 group-hover:text-red-700" />
            Continue with Google
          </button>
        </div>

        {/* Legal and Registration Link */}
        <div className="mt-6 text-center text-sm">
          <p className="text-gray-400 mb-2">
            By signing in, you agree to our{" "}
            <a href="/terms" className="font-medium text-indigo-400 hover:text-indigo-300">
              Terms
            </a>{" "}
            and{" "}
            <a href="/privacy" className="font-medium text-indigo-400 hover:text-indigo-300">
              Privacy Policy
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
