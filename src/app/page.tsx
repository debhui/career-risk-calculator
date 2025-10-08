// app/page.tsx
"use client";

import { useEffect, useState } from "react";
import {
  ArrowRight,
  ShieldHalf,
  GanttChart,
  TrendingUp,
  User,
  Loader2,
  Settings,
  LucideIcon,
} from "lucide-react";
import Link from "next/link";
import Login from "@/components/Login";
import { createSupabaseClient } from "@/lib/supabase/browser";
import { useRouter } from "next/navigation";
// --- Quick Link Card Data ---
const quickLinks = [
  {
    title: "Career Assessment",
    description: "Start or continue your risk profile evaluation.",
    href: "/assessment",
    icon: GanttChart,
    color: "text-indigo-400",
    bg: "bg-indigo-600/10 hover:bg-indigo-600/20",
  },
  {
    title: "View History",
    description: "Analyze your risk score and strategic recommendations.",
    href: "/history",
    icon: TrendingUp,
    color: "text-green-400",
    bg: "bg-green-600/10 hover:bg-green-600/20",
  },
  {
    title: "Manage Profile",
    description: "Update your personal and professional information.",
    href: "/profile",
    icon: User,
    color: "text-yellow-400",
    bg: "bg-yellow-600/10 hover:bg-yellow-600/20",
  },
  {
    title: "Account Settings",
    description: "Change security preferences and notifications.",
    href: "/settings",
    icon: Settings,
    color: "text-purple-400",
    bg: "bg-purple-600/10 hover:bg-purple-600/20",
  },
];

interface QuickLinkCardProps {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
  color: string;
  bg: string;
}
// --- Quick Link Card Component ---
const QuickLinkCard: React.FC<QuickLinkCardProps> = ({
  title,
  description,
  href,
  icon: Icon,
  color,
  bg,
}) => (
  <Link
    href={href}
    // Ensures border, background colors, and hover effects are theme-aware
    className={`p-6 border border-gray-300 dark:border-gray-700 rounded-xl transition-all duration-300 transform hover:scale-[1.02] ${bg} flex flex-col justify-between group`}
  >
    <div>
      <Icon className={`w-8 h-8 mb-4 ${color}`} />
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
      <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
    </div>
    <div className="mt-4 flex items-center text-sm font-medium text-indigo-500 dark:text-indigo-400">
      Go to {title}
      <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
    </div>
  </Link>
);

export default function CareerRiskCalculatorHomePage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const supabase = createSupabaseClient();
  const router = useRouter();
  // Effect to apply theme class and persist to localStorage whenever theme state changes

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        // Use a 200ms delay to prevent visual flash on fast connections
        await new Promise(resolve => setTimeout(resolve, 200));

        if (user) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("consent_accepted, onboarding_completed")
            .eq("id", user.id)
            .maybeSingle();

          if (!profile || !profile.consent_accepted || !profile.onboarding_completed) {
            // Found a user, but onboarding is incomplete or profile is missing
            router.replace("/onboarding");
            return; // Stop execution to prevent setting isAuthenticated(true) prematurely
          }
          // if (error) {
          //   console.error("Error fetching profile on home page:", error);
          //   setIsAuthenticated(true); // Treat as logged in, but show status error
          // } else if (!profile || !profile.consent_accepted || !profile.onboarding_completed) {
          //   // If the profile is missing or onboarding is incomplete, redirect.
          //   // This handles users who navigate back to '/' but haven't finished onboarding.
          //   router.replace("/onboarding"); // <--- This is the key line
          //   return; // Stop rendering the home page content
          // }

          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error("Error fetching user session:", error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUser();
  }, [supabase, router]);

  // --- 1. Full-Screen Loading State ---
  if (isLoading || isAuthenticated === null) {
    return (
      <div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white min-h-[calc(100vh-178px)] flex items-center justify-center transition-colors duration-300">
        <div className="flex items-center space-x-3 text-lg font-medium text-gray-700 dark:text-gray-300">
          <Loader2 className="w-8 h-8 mx-auto mb-4 animate-spin text-green-600 dark:text-green-400" />
          <p>Loading home page...</p>
        </div>
      </div>
    );
  }

  // --- 2. Main Content (After Loading is Complete) ---
  return (
    // Main container now controls the background and text color for the whole page
    <div
      className={`bg-white dark:bg-gray-900 text-gray-900 dark:text-white ${
        isAuthenticated ? "min-h-[calc(100vh-178px)]" : "min-h-[calc(100vh-170px)]"
      } transition-colors duration-300`}
    >
      <div className="max-w-6xl mx-auto p-4 sm:p-8 pt-12">
        {isAuthenticated ? (
          <div className="w-full">
            {/* Header and Welcome */}
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-6 border-b border-gray-300 dark:border-gray-700 mb-10">
              <div>
                <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white">
                  Welcome Back!
                </h1>
                <p className="mt-2 text-gray-600 dark:text-gray-400 text-lg">
                  Your starting point for managing your career risk and growth.
                </p>
              </div>
            </header>

            {/* Quick Links Grid */}
            <section className="mt-8">
              <h2 className="text-2xl font-bold text-indigo-500 dark:text-indigo-400 mb-6">
                Quick Actions
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {quickLinks.map((link, index) => (
                  <QuickLinkCard key={index} {...link} />
                ))}
              </div>
            </section>

            {/* Status/User Info Panel */}
            <section className="mt-12 p-6 bg-gray-100 dark:bg-gray-800 rounded-xl shadow-xl border border-gray-300 dark:border-gray-700/50 transition-colors duration-300">
              <div className="flex items-center">
                <ShieldHalf className="w-8 h-8 text-indigo-500 dark:text-indigo-400 mr-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Current Status Overview
                </h3>
              </div>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="p-3 bg-gray-200 dark:bg-gray-700 rounded-lg transition-colors duration-300">
                  <p className="text-gray-500 dark:text-gray-400">Assessment Status:</p>
                  <p className="font-bold text-yellow-700 dark:text-yellow-300">Incomplete</p>
                </div>
                <div className="p-3 bg-gray-200 dark:bg-gray-700 rounded-lg transition-colors duration-300">
                  <p className="text-gray-500 dark:text-gray-400">Last Login:</p>
                  <p className="font-bold text-gray-800 dark:text-white">
                    {new Date().toLocaleDateString()}
                  </p>
                </div>
                <div className="p-3 bg-gray-200 dark:bg-gray-700 rounded-lg transition-colors duration-300">
                  <p className="text-gray-500 dark:text-gray-400">User ID:</p>
                  <p className="font-mono text-xs text-gray-800 dark:text-white break-all">
                    Checking...
                  </p>
                </div>
              </div>
            </section>
          </div>
        ) : (
          <div className="max-w-6xl mx-auto p-4 sm:p-8 pt-12">
            {/* Header/Branding */}
            <header className="mb-12 text-center">
              {/* Logo and App Title */}
              <ShieldHalf className="mx-auto mb-4 h-14 w-14 text-indigo-400 animate-pulse-slow" />
              <h1 className="text-6xl font-extrabold text-gray-900 dark:text-white sm:text-7xl">
                <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Career
                </span>{" "}
                <span className="text-gray-800 dark:text-gray-200">Risk</span>
              </h1>
              <p className="mt-3 text-2xl font-light text-gray-500 dark:text-gray-400 italic">
                Predict. Optimize. Secure Your Future.
              </p>
            </header>

            {/* Sign In Form - Centered on the page */}
            <main className="w-full max-w-lg mx-auto">
              {/* Assuming Login component handles its own dark/light mode styles */}
              <Login />
            </main>
          </div>
        )}
      </div>
    </div>
  );
}
