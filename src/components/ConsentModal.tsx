// components/ConsentModal.tsx
import React, { useState } from "react";

export default function ConsentModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  async function accept() {
    setLoading(true);
    const r = await fetch("/api/consent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accept: true }),
    });
    setLoading(false);
    if (r.ok) onClose();
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        display: "grid",
        placeItems: "center",
        background: "rgba(0,0,0,0.25)",
      }}
    >
      <div style={{ width: 700, background: "white", borderRadius: 8, padding: 24 }}>
        <h3>Data & Consent</h3>
        <p>
          We will use your resume, LLM results, and market data to provide personalized
          recommendations. You can export or delete your data anytime.
        </p>
        <ul>
          <li>Data used: resume text, profile, interactions</li>
          <li>Retention: default 12 months (configurable)</li>
          <li>Export & delete available from Account settings</li>
        </ul>

        <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input type="checkbox" checked={accepted} onChange={e => setAccepted(e.target.checked)} />
          I consent to the stated data usage.
        </label>

        <div style={{ marginTop: 16, display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <button onClick={onClose} disabled={loading}>
            Decline
          </button>
          <button
            onClick={accept}
            disabled={!accepted || loading}
            style={{ background: "#2f855a", color: "#fff", padding: "8px 12px", borderRadius: 6 }}
          >
            {loading ? "Saving..." : "Accept & Continue"}
          </button>
        </div>
      </div>
    </div>
  );
}
