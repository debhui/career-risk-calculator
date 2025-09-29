"use client";

import { useEffect, useState } from "react";
import {
  ArrowRight,
  ShieldHalf,
  GanttChart,
  TrendingUp,
  User,
  Settings,
  LucideIcon,
} from "lucide-react";
import Login from "@/components/Login";
import { createSupabaseClient } from "@/lib/supabase/browser";

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
    title: "View Reports",
    description: "Analyze your risk score and strategic recommendations.",
    href: "/reports",
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
  <a
    href={href}
    className={`p-6 border border-gray-700 rounded-xl transition-all duration-300 transform hover:scale-[1.02] ${bg} flex flex-col justify-between group`} // Added group for hover effects on children
  >
    <div>
      <Icon className={`w-8 h-8 mb-4 ${color}`} />
      <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
      <p className="text-sm text-gray-400">{description}</p>
    </div>
    <div className="mt-4 flex items-center text-sm font-medium text-indigo-400">
      Go to {title}
      <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
    </div>
  </a>
);

export default function CareerRiskCalculatorHomePage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const supabase = createSupabaseClient();

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
    };
    fetchUser();
  }, [supabase]);

  return (
    // Dark, analytical background with a subtle fixed background pattern for depth
    <div className="flex flex-col items-center justify-center bg-gray-900 p-4">
      {isAuthenticated ? (
        <div className="max-w-6xl mx-auto">
          {/* Header and Welcome */}
          <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-6 border-b border-gray-700 mb-10">
            <div>
              {/* <h1 className="text-4xl font-extrabold text-white">
                Welcome, {user.email || 'User'}!
            </h1> */}
              <p className="mt-2 text-gray-400 text-lg">
                Your starting point for managing your career risk and growth.
              </p>
            </div>
          </header>

          {/* Quick Links Grid */}
          <section className="mt-8">
            <h2 className="text-2xl font-bold text-indigo-400 mb-6">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {quickLinks.map((link, index) => (
                <QuickLinkCard key={index} {...link} />
              ))}
            </div>
          </section>

          {/* Status/User Info Panel */}
          <section className="mt-12 p-6 bg-gray-800 rounded-xl shadow-xl border border-gray-700/50">
            <div className="flex items-center">
              <ShieldHalf className="w-8 h-8 text-indigo-500 mr-4" />
              <h3 className="text-xl font-semibold text-white">Current Status Overview</h3>
            </div>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="p-3 bg-gray-700 rounded-lg">
                <p className="text-gray-400">Assessment Status:</p>
                <p className="font-bold text-yellow-300">Incomplete</p>
              </div>
              <div className="p-3 bg-gray-700 rounded-lg">
                <p className="text-gray-400">Last Login:</p>
                <p className="font-bold text-white">{new Date().toLocaleDateString()}</p>
              </div>
              <div className="p-3 bg-gray-700 rounded-lg">
                <p className="text-gray-400">User ID:</p>
                {/* <p className="font-mono text-xs text-white break-all">{user.id}</p> */}
              </div>
            </div>
          </section>
        </div>
      ) : (
        <div className="max-w-4xl mx-auto p-4 sm:p-8 pt-12">
          {/* Header/Branding */}
          <header className="mb-12 text-center">
            {/* Logo and App Title */}
            <ShieldHalf className="mx-auto mb-4 h-14 w-14 text-indigo-400 animate-pulse-slow" />
            <h1 className="text-6xl font-extrabold text-white sm:text-7xl">
              <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Career
              </span>{" "}
              <span className="text-gray-200">Risk</span>
            </h1>
            <p className="mt-3 text-2xl font-light text-gray-400 italic">
              Predict. Optimize. Secure Your Future.
            </p>
          </header>

          {/* Sign In Form - Centered on the page */}
          <main className="w-full max-w-lg">
            <Login />
          </main>
        </div>
      )}
    </div>
  );
}
