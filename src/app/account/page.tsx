"use client";

import { supabase } from "@/lib/supabaseClient";

export default function AccountPage() {
  const revokeConsent = async () => {
    const { error } = await supabase.auth.updateUser({
      data: { consentAccepted: false },
    });
    if (error) {
      console.error("Failed to revoke consent:", error.message);
      return;
    }
    alert("Consent revoked. Your data will be deleted.");
  };

  const deleteAccount = async () => {
    // optional API route: app/api/revoke/route.ts
    await fetch("/api/revoke", { method: "DELETE" });
    alert("Account deletion started");
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold">Account Settings</h1>
      <button onClick={revokeConsent} className="mt-4 px-4 py-2 bg-yellow-500 text-white rounded">
        Revoke Consent
      </button>
      <button onClick={deleteAccount} className="mt-4 ml-4 px-4 py-2 bg-red-600 text-white rounded">
        Delete Account
      </button>
    </div>
  );
}
