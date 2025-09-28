// settings/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { ShieldOff, Trash2, Loader2, User, Check, X, Bell } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

type Status = "idle" | "loading" | "success" | "error";

// Helper component for displaying feedback messages
const StatusMessage: React.FC<{ type: Status; message: string }> = ({ type, message }) => {
  if (type === "idle" || type === "loading") return null;
  const color = type === "success" ? "text-green-400" : "text-red-400";
  const Icon = type === "success" ? Check : X;
  return (
    <div className={`flex items-center space-x-2 p-3 rounded-lg bg-gray-700/50 ${color}`}>
      <Icon className="w-5 h-5" />
      <p className="text-sm">{message}</p>
    </div>
  );
};

export default function SettingsPage() {
  // const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [userData, setUserData] = useState<any>({});
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  // Status states for asynchronous actions
  const [consentStatus, setConsentStatus] = useState<Status>("idle");
  const [deleteStatus, setDeleteStatus] = useState<Status>("idle");
  const [isConsentAccepted, setIsConsentAccepted] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        setUserData(user);
        // Fetch current consent status
        const { data } = await supabase // error
          .from("profiles")
          .select("consent_accepted")
          .eq("id", user.id)
          .single();
        if (data) {
          setIsConsentAccepted(data.consent_accepted);
        }
      }
    };
    fetchUser();
  }, []);

  const handleRevokeConsent = async () => {
    if (!userId) return;
    setConsentStatus("loading");

    try {
      const { error } = await supabase.from("profiles").upsert({
        id: userId,
        consent_accepted: false,
        updated_at: new Date().toISOString(),
      });

      if (error) {
        setConsentStatus("error");
        console.error("Revoke consent error:", error.message);
      } else {
        setConsentStatus("success");
        setIsConsentAccepted(false);
        setTimeout(() => setConsentStatus("idle"), 5000);
      }
    } catch (e) {
      setConsentStatus("error");
      console.error("Network error during deletion:", e);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleteStatus("loading");

    // This fetch call routes to your /api/revoke/route.ts endpoint
    // that handles the actual Supabase Auth deletion.
    try {
      const response = await fetch("/api/revoke", {
        method: "POST",
        headers: {
          // Assuming you have an access token available for server-side validation
          Authorization: `Bearer ${localStorage.getItem("supabase.auth.token")}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        setDeleteStatus("success");
        // Force redirect to login/home page after successful server-side deletion
        // The API route should have already signed out the user via admin.deleteUser
        setTimeout(() => (window.location.href = "/login"), 2000);
      } else {
        const errorData = await response.json();
        setDeleteStatus("error");
        console.error("Deletion API error:", errorData);
      }
    } catch (e) {
      setDeleteStatus("error");
      console.error("Error:", e);
    } finally {
      setIsConfirmingDelete(false); // Close modal regardless of outcome
    }
  };

  return (
    <div>
      <div className="max-w-4xl mx-auto p-4 sm:p-8 pt-12">
        <h1 className="text-3xl font-extrabold text-white mb-8 border-b border-gray-700 pb-3 flex items-center">
          {/* <Settings className="w-6 h-6 mr-3 text-green-400" /> */}
          Account Settings
        </h1>

        {/* Account Section */}
        <div className="bg-gray-800 shadow-xl rounded-xl p-6 mb-8 border border-gray-700">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center">
            <User className="w-5 h-5 mr-2 text-blue-400" /> Account Information
          </h2>
          <p className="text-gray-400 mb-2">
            User ID:{" "}
            <span className="font-mono text-sm bg-gray-700 p-1 rounded text-green-300">
              {userId || "Loading..."}
            </span>
          </p>
          <p className="text-gray-400">
            Email:{" "}
            <span className="font-medium text-white">
              {userId ? userData?.email : "Loading..."}
            </span>
          </p>
        </div>

        {/* Data Management Section */}
        <div className="bg-gray-800 shadow-xl rounded-xl p-6 border border-gray-700">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center">
            <ShieldOff className="w-5 h-5 mr-2 text-red-400" /> Data Management & Deletion
          </h2>

          {/* Revoke Consent Card */}
          <div className="flex justify-between items-center bg-gray-900 p-4 rounded-lg border border-gray-700/50 mb-4">
            <div>
              <p className="font-semibold text-white">Revoke Data Consent</p>
              <p className="text-sm text-gray-500">
                This stops all analysis and use of your data, but keeps your account active.
              </p>
              <p
                className={`text-sm mt-1 font-medium ${
                  isConsentAccepted ? "text-green-500" : "text-red-500"
                }`}
              >
                Status: {isConsentAccepted ? "Consent Accepted" : "Consent Revoked"}
              </p>
            </div>
            <button
              onClick={handleRevokeConsent}
              disabled={consentStatus === "loading" || !isConsentAccepted}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition duration-200 flex items-center ${
                isConsentAccepted
                  ? "bg-yellow-600 hover:bg-yellow-700 text-white"
                  : "bg-gray-600 text-gray-400 cursor-not-allowed"
              }`}
            >
              {consentStatus === "loading" ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <ShieldOff className="w-4 h-4 mr-2" />
              )}
              Revoke
            </button>
          </div>

          <StatusMessage
            type={consentStatus}
            message={
              consentStatus === "success"
                ? "Consent successfully revoked."
                : "Failed to revoke consent."
            }
          />

          {/* Delete Account Card */}
          <div className="flex justify-between items-center bg-gray-900 p-4 rounded-lg border border-red-900 mt-6">
            <div>
              <p className="font-semibold text-red-400">Permanently Delete Account</p>
              <p className="text-sm text-gray-500">
                This action is irreversible. All profile data and analysis will be permanently
                deleted.
              </p>
            </div>
            <button
              onClick={() => setIsConfirmingDelete(true)}
              disabled={deleteStatus === "loading"}
              className="px-4 py-2 text-sm font-medium rounded-lg bg-red-600 hover:bg-red-700 text-white transition duration-200 flex items-center"
            >
              {deleteStatus === "loading" ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4 mr-2" />
              )}
              Delete Account
            </button>
          </div>

          <StatusMessage
            type={deleteStatus}
            message={
              deleteStatus === "success"
                ? "Account deleted successfully. Redirecting..."
                : "Account deletion failed."
            }
          />
        </div>
      </div>

      {/* Confirmation Modal */}
      {isConfirmingDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-8 rounded-xl shadow-2xl border border-red-700 max-w-sm w-full">
            <h3 className="text-xl font-bold text-red-400 mb-3 flex items-center">
              <Bell className="w-6 h-6 mr-2 animate-pulse" />
              Confirm Deletion
            </h3>
            <p className="text-gray-400 mb-6">
              Are you absolutely sure? This will **permanently delete** your user account and all
              associated data. This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setIsConfirmingDelete(false)}
                className="px-4 py-2 text-sm font-medium rounded-lg text-gray-300 hover:bg-gray-700 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteStatus === "loading"}
                className="px-4 py-2 text-sm font-medium rounded-lg bg-red-600 hover:bg-red-700 text-white transition flex items-center"
              >
                {deleteStatus === "loading" ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4 mr-2" />
                )}
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
