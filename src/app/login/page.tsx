"use client";

import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import { Lock, User, Chrome } from "lucide-react";

export default function Login() {
  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  // return (
  //   <main className="p-8">
  //     <h1 className="text-2xl font-bold">Welcome</h1>
  //     <button onClick={handleLogin} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded">
  //       Sign in with Google
  //     </button>
  //   </main>
  // );
  return (
    <div className="flex items-center justify-center  p-4">
      <div className="w-full max-w-md space-y-8 rounded-xl bg-gray-800 p-8 shadow-2xl">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Sign in to your account</h2>
          <p className="mt-2 text-sm text-gray-600">
            Or{" "}
            <Link href="/register" className="font-medium text-indigo-600 hover:text-indigo-500">
              create a new account
            </Link>
          </p>
        </div>

        <div className="space-y-4">
          <button
            type="button"
            className="group relative flex w-full items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            onClick={handleLogin}
          >
            {/* Using Lucide's Chrome icon for Google */}
            <Chrome className="mr-2 h-5 w-5 text-red-500" />
            Sign in with Google
          </button>
        </div>
      </div>
    </div>
  );
}
