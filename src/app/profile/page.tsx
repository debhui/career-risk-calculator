"use client";

import React, { useEffect, useState } from "react";
import { User as AuthUser } from "@supabase/supabase-js";
import { User as UserIcon, CheckCircle, XCircle, Settings, FileText } from "lucide-react";
import { createSupabaseClient } from "@/lib/supabase/browser";
import Image from "next/image";

interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  consent_accepted: boolean;
  onboarding_completed: boolean;
}

// --- Icons and Styles for Data Fields ---
const DataField = ({
  title,
  value,
  icon: Icon,
  status,
}: {
  title: string;
  value: string | boolean;
  icon: React.ElementType;
  status?: "ok" | "fail";
}) => {
  const displayValue = typeof value === "boolean" ? (value ? "Accepted" : "Revoked") : value;

  const statusIcon =
    status === "ok" ? (
      <CheckCircle className="w-5 h-5 text-green-400 mr-2" />
    ) : status === "fail" ? (
      <XCircle className="w-5 h-5 text-red-400 mr-2" />
    ) : null;

  return (
    <div className="flex items-start justify-between p-4 bg-gray-800 rounded-lg shadow-md transition duration-300 hover:bg-gray-700/70">
      <div className="flex items-center">
        <Icon className="w-6 h-6 text-indigo-400 mr-3 shrink-0" />
        <div>
          <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider">{title}</p>
          <p className="mt-1 text-lg font-medium text-white break-all">{displayValue}</p>
        </div>
      </div>
      {statusIcon && <div className="flex items-center">{statusIcon}</div>}
    </div>
  );
};

// --- Main Component ---
export default function ProfilePage() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createSupabaseClient();

  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // 1. Fetch Auth User
        const {
          data: { user: authUser },
          error: authError,
        } = await supabase.auth.getUser();
        if (authError || !authUser) {
          throw new Error(authError?.message || "User not authenticated.");
        }
        setUser(authUser);

        // 2. Fetch Profile Data
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", authUser.id)
          .single();

        if (profileError && profileError.code !== "PGRST116") {
          // PGRST116 is for "no row found"
          console.warn("Profile fetch error:", profileError.message);
        }

        if (profileData) {
          setProfile(profileData as UserProfile);
        } else {
          // Create a mock profile if one doesn't exist, defaulting consent to false
          setProfile({
            id: authUser.id,
            email: authUser.email || "N/A",
            full_name: authUser.user_metadata?.full_name || authUser.user_metadata?.name,
            consent_accepted: false,
            onboarding_completed: false,
          });
        }
      } catch (err: any) {
        console.error("Fetch data error:", err);
        setError("Failed to load user data. Please try logging in again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [supabase]);

  useEffect(() => {
    console.log(profile);
  }, [profile]);
  const profileName =
    profile?.full_name ||
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    "User Profile";
  const avatarUrl = profile?.avatar_url || user?.user_metadata?.avatar_url;

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="text-center p-8">
          <svg
            className="animate-spin h-8 w-8 text-indigo-400 mx-auto"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <p className="mt-4 text-gray-400">Loading user profile...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center p-8 text-red-400">
          <p>Error: {error}</p>
        </div>
      );
    }

    if (!user) {
      return (
        <div className="text-center p-8 text-red-400">
          <p>
            You must be signed in to view your profile.{" "}
            <a href="/login" className="text-indigo-400 hover:underline">
              Go to Login
            </a>
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-8">
        {/* Profile Header Card */}
        <div className="flex items-center p-6 bg-gray-800 rounded-xl shadow-2xl border border-indigo-700/50">
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt={profileName}
              className="w-16 h-16 rounded-full object-cover mr-6 border-2 border-indigo-500"
              onError={e => {
                (e.target as HTMLImageElement).onerror = null;
                (e.target as HTMLImageElement).src =
                  "https://placehold.co/64x64/2D3748/A0AEC0?text=P";
              }}
              width={100}
              height={100}
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-indigo-600 flex items-center justify-center text-white text-3xl font-bold mr-6 shrink-0">
              {profileName[0] || "U"}
            </div>
          )}
          <div>
            <h1 className="text-3xl font-extrabold text-white truncate">{profileName}</h1>
            <p className="text-indigo-400 mt-1">Career Risk Calculator User</p>
          </div>
        </div>

        {/* Data Status Section */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-300 border-b border-gray-700 pb-2">
            Account & Data Status
          </h2>

          <DataField title="Email Address" value={user.email || "N/A"} icon={UserIcon} />

          <DataField
            title="Data Consent"
            value={profile?.consent_accepted ?? false}
            icon={CheckCircle}
            status={profile?.consent_accepted ? "ok" : "fail"}
          />

          <DataField
            title="Onboarding"
            value={profile?.onboarding_completed ?? false}
            icon={FileText}
            status={profile?.onboarding_completed ? "ok" : "fail"}
          />
        </div>

        {/* Quick Actions */}
        <div className="space-y-4 pt-4">
          <h2 className="text-xl font-bold text-gray-300 border-b border-gray-700 pb-2">
            Quick Actions
          </h2>
          <a
            href="/assessment"
            className="flex items-center justify-center w-full px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-lg hover:bg-indigo-700 transition duration-300"
          >
            Start Assessment
          </a>
          <a
            href="/settings"
            className="flex items-center justify-center w-full px-6 py-3 border border-gray-600 text-gray-300 font-semibold rounded-lg shadow-lg hover:bg-gray-700 transition duration-300"
          >
            <Settings className="w-5 h-5 mr-2" />
            Manage Settings & Data
          </a>
        </div>
      </div>
    );
  };

  return (
    <div className="text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">{renderContent()}</div>
    </div>
  );
}
