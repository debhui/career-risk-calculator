"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  ShieldOff,
  Trash2,
  Loader2,
  User,
  Check,
  X,
  Bell,
  CreditCard,
  Settings,
  Menu,
  ChevronRight,
} from "lucide-react";
import { createSupabaseClient } from "@/lib/supabase/browser";
import PaymentsPage from "@/components/Payments";
// --- Types ---
type Status = "idle" | "loading" | "success" | "error";
type SectionKey = "account" | "data" | "payments";

// --- Helper Components ---

// 1. Status Message Component (Minor cleanup/styling adjustment)
const StatusMessage: React.FC<{ type: Status; message: string }> = ({ type, message }) => {
  if (type === "idle" || type === "loading") return null;
  const color = type === "success" ? "text-green-400" : "text-red-400";
  const Icon = type === "success" ? Check : X;
  return (
    <div
      className={`flex items-center space-x-2 p-3 rounded-lg mt-2 ${color} border ${
        type === "success"
          ? "border-green-700/50 bg-green-900/30"
          : "border-red-700/50 bg-red-900/30"
      }`}
    >
      <Icon className="w-5 h-5 flex-shrink-0" />
      <p className="text-sm">{message}</p>
    </div>
  );
};

// 2. Data Management Section (Extracted Content Panel)
interface DataManagementProps {
  userId: string | null;
  isConsentAccepted: boolean;
  setIsConsentAccepted: React.Dispatch<React.SetStateAction<boolean>>;
  supabase: ReturnType<typeof createSupabaseClient>;
}

const DataManagementSection: React.FC<DataManagementProps> = ({
  userId,
  isConsentAccepted,
  setIsConsentAccepted,
  supabase,
}) => {
  const [consentStatus, setConsentStatus] = useState<Status>("idle");
  const [deleteStatus, setDeleteStatus] = useState<Status>("idle");
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

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
      console.error("Network error during consent revocation:", e);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleteStatus("loading");
    try {
      // Note: Assuming the localStorage token is still valid for this call
      const response = await fetch("/api/revoke", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("supabase.auth.token")}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        setDeleteStatus("success");
        setTimeout(() => (window.location.href = "/login"), 2000);
      } else {
        const errorData = await response.json();
        setDeleteStatus("error");
        console.error("Deletion API error:", errorData);
      }
    } catch (e) {
      setDeleteStatus("error");
      console.error("Error during account deletion:", e);
    } finally {
      setIsConfirmingDelete(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center mb-4">
        <ShieldOff className="w-6 h-6 mr-2 text-red-600 dark:text-red-400" /> Data Management &
        Deletion
      </h2>

      {/* Revoke Consent Card */}
      <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-xl border border-gray-300 dark:border-gray-700 transition-colors duration-300">
        <div className="flex justify-between items-center">
          <div>
            <p className="font-semibold text-gray-800 dark:text-white">Revoke Data Consent</p>
            <p className="text-sm text-gray-600 dark:text-gray-500 max-w-lg">
              This stops all analysis and use of your data, but keeps your account active.
            </p>
            <p
              className={`text-sm mt-1 font-medium ${
                isConsentAccepted
                  ? "text-green-600 dark:text-green-500"
                  : "text-red-600 dark:text-red-500"
              }`}
            >
              Status: {isConsentAccepted ? "Consent Accepted" : "Consent Revoked"}
            </p>
          </div>
          <button
            onClick={handleRevokeConsent}
            disabled={consentStatus === "loading" || !isConsentAccepted}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition duration-200 flex items-center flex-shrink-0 ml-4 ${
              isConsentAccepted
                ? "bg-yellow-600 hover:bg-yellow-700 text-white"
                : "bg-gray-400 dark:bg-gray-600 text-gray-600 dark:text-gray-400 cursor-not-allowed"
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
      </div>

      {/* Delete Account Card */}
      <div className="bg-red-50 dark:bg-gray-800 p-4 rounded-xl border border-red-500 dark:border-red-700 transition-colors duration-300">
        <div className="flex justify-between items-center">
          <div>
            <p className="font-semibold text-red-600 dark:text-red-400">
              Permanently Delete Account
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-500 max-w-lg">
              This action is irreversible. All profile data and analysis will be permanently
              deleted.
            </p>
          </div>
          <button
            onClick={() => setIsConfirmingDelete(true)}
            disabled={deleteStatus === "loading"}
            className="px-4 py-2 text-sm font-medium rounded-lg bg-red-600 hover:bg-red-700 text-white transition duration-200 flex items-center flex-shrink-0 ml-4"
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

      {/* Confirmation Modal */}
      {isConfirmingDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 p-8 rounded-xl shadow-2xl border border-red-600 max-w-sm w-full transition-colors duration-300">
            <h3 className="text-xl font-bold text-red-600 dark:text-red-400 mb-3 flex items-center">
              <Bell className="w-6 h-6 mr-2 animate-pulse" />
              Confirm Deletion
            </h3>
            <p className="text-gray-700 dark:text-gray-400 mb-6">
              Are you absolutely sure? This will **permanently delete** your user account and all
              associated data. This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setIsConfirmingDelete(false)}
                className="px-4 py-2 text-sm font-medium rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
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
};

// 3. Account Info Section (Extracted Content Panel)
const AccountInfoSection: React.FC<{ userId: string | null; userData: any }> = ({
  userId,
  userData,
}) => (
  <div className="space-y-6">
    <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center mb-4">
      <User className="w-6 h-6 mr-2 text-blue-600 dark:text-blue-400" /> Account Information
    </h2>
    <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-xl border border-gray-300 dark:border-gray-700 transition-colors duration-300 space-y-3">
      <p className="text-gray-600 dark:text-gray-400">
        <span className="font-medium text-gray-800 dark:text-white block mb-1">Email Address:</span>
        <span className="font-medium text-blue-600 dark:text-blue-400">
          {userId ? userData?.email : "N/A"}
        </span>
      </p>
      <p className="text-gray-600 dark:text-gray-400">
        <span className="font-medium text-gray-800 dark:text-white block mb-1">User ID:</span>
        <span className="font-mono text-sm bg-gray-300 dark:bg-gray-700 p-1 rounded text-green-700 dark:text-green-300">
          {userId || "N/A"}
        </span>
      </p>
      {/* Add more account details here later */}
    </div>
  </div>
);

// 4. Payments Section (Placeholder Content Panel)
const PaymentsSection = () => (
  <div className="space-y-6">
    <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center mb-4">
      <CreditCard className="w-6 h-6 mr-2 text-teal-600 dark:text-indigo-400" /> Payments & Billing
    </h2>
    <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-xl border border-gray-300 dark:border-gray-700 transition-colors duration-300">
      {/* <p className="text-gray-600 dark:text-gray-400">
        This section is under development. You will be able to manage your subscriptions, view
        invoices, and update payment methods here.
      </p>
      <button className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm">
        Manage Subscription (External)
      </button> */}
      <PaymentsPage />
    </div>
  </div>
);

// 5. Main Settings Page Component
export default function SettingsPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [userData, setUserData] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isConsentAccepted, setIsConsentAccepted] = useState(true);
  const [selectedSection, setSelectedSection] = useState<SectionKey>("account");
  const [isMenuOpen, setIsMenuOpen] = useState(false); // State for mobile menu

  const supabase = useMemo(() => createSupabaseClient(), []);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          setUserId(user.id);
          setUserData(user);
          // Fetch current consent status
          const { data } = await supabase
            .from("profiles")
            .select("consent_accepted")
            .eq("id", user.id)
            .single();
          if (data) {
            setIsConsentAccepted(data.consent_accepted);
          }
        }
      } catch (error) {
        console.error("Failed to fetch user data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUser();
  }, [supabase]);

  const sections: { key: SectionKey; name: string; icon: React.ElementType }[] = [
    { key: "account", name: "Account Information", icon: User },
    { key: "payments", name: "Payments & Billing", icon: CreditCard },
    { key: "data", name: "Data & Deletion", icon: ShieldOff },
  ];

  // Map the selected key to the corresponding component
  const CurrentContentComponent = useMemo(() => {
    switch (selectedSection) {
      case "data":
        return (
          <DataManagementSection
            userId={userId}
            isConsentAccepted={isConsentAccepted}
            setIsConsentAccepted={setIsConsentAccepted}
            supabase={supabase}
          />
        );
      case "payments":
        return <PaymentsSection />;
      case "account":
      default:
        return <AccountInfoSection userId={userId} userData={userData} />;
    }
  }, [selectedSection, userId, userData, isConsentAccepted, supabase]);

  // Conditional Rendering for initial loading state
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white min-h-[calc(100vh-178px)] flex items-center justify-center transition-colors duration-300">
        <div className="flex items-center space-x-3 text-lg font-medium text-gray-700 dark:text-gray-300">
          <Loader2 className="w-8 h-8 mx-auto mb-4 animate-spin text-green-600 dark:text-green-400" />
          <p>Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white min-h-[calc(100vh-178px)] transition-colors duration-300">
      <div className="max-w-6xl mx-auto p-4 sm:p-8 pt-12">
        <header className="mb-8 border-b border-gray-300 dark:border-gray-700 pb-3 flex justify-between items-center">
          <h1 className="text-3xl font-extrabold text-gray-800 dark:text-white flex items-center">
            <Settings className="w-8 h-8 mr-3 text-teal-600 dark:text-indigo-400" />
            Manage Account Settings
          </h1>
          {/* Mobile Menu Button */}
          <button
            className="sm:hidden p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-white transition"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </header>

        {/* Responsive Layout Grid */}
        <div className="flex flex-col sm:flex-row gap-8 relative">
          {/* --- Navigation Menu (Sidebar) --- */}
          <nav
            className={`absolute sm:relative w-full sm:w-64 flex-shrink-0 ${
              isMenuOpen ? "block" : "hidden"
            } sm:block`}
          >
            {/* Mobile Dropdown/List */}
            <ul className="bg-gray-100 dark:bg-gray-800 rounded-xl p-3 space-y-1 shadow-lg border border-gray-300 dark:border-gray-700">
              {sections.map(section => {
                const isSelected = selectedSection === section.key;
                const Icon = section.icon;

                return (
                  <li key={section.key}>
                    <button
                      onClick={() => {
                        setSelectedSection(section.key);
                        setIsMenuOpen(false); // Close menu on selection
                      }}
                      className={`w-full text-left flex items-center justify-between p-3 rounded-lg transition-colors duration-200 ${
                        isSelected
                          ? "bg-teal-600 dark:bg-indigo-600 text-white shadow-md font-semibold"
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                      }`}
                    >
                      <span className="flex items-center">
                        <Icon className="w-5 h-5 mr-3" />
                        {section.name}
                      </span>
                      {/* Chevron icon for mobile/list view */}
                      {isSelected ? (
                        <ChevronRight className="w-4 h-4 hidden sm:block" /> // Show on desktop for emphasis
                      ) : (
                        <ChevronRight className="w-4 h-4 text-gray-400 dark:text-gray-600 hidden sm:block" />
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* --- Content Area --- */}
          <div className="flex-1 min-w-0 bg-white dark:bg-gray-900">
            <div className="p-0">{CurrentContentComponent}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
