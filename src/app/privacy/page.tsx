// privacy/page.tsx
"use client";

import React from "react";

export default function PrivacyPage() {
  return (
    <div className="text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-gray-800 p-8 rounded-xl shadow-2xl border border-indigo-700/50">
        <h1 className="text-4xl font-extrabold text-white mb-2">Privacy Policy</h1>
        <p className="text-sm text-gray-400 mb-8">Effective Date: September 27, 2025</p>

        <div className="space-y-8 text-gray-300">
          {/* Introduction */}
          <section>
            <h2 className="text-2xl font-bold text-indigo-400 mb-3 border-b border-gray-700 pb-1">
              1. Introduction
            </h2>
            <p>
              The Career Risk Calculator (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) is
              committed to protecting the privacy of our users. This Privacy Policy describes how we
              collect, use, and disclose the personal information you provide when using our
              Service. By using the Service, you consent to the data practices described in this
              policy.
            </p>
          </section>

          {/* Information We Collect */}
          <section>
            <h2 className="text-2xl font-bold text-indigo-400 mb-3 border-b border-gray-700 pb-1">
              2. Information We Collect
            </h2>
            <ul className="list-disc list-inside space-y-3 ml-4">
              <li>
                **Account Data:** Information you provide when creating an account, such as your
                email address and authentication details (handled via Supabase).
              </li>
              <li>
                **Assessment Data:** Responses and inputs you provide during the career risk
                assessment process (e.g., job history, industry, skills, risk tolerance). This data
                is the core of the Service.
              </li>
              <li>
                **Usage Data:** Information on how you access and use the Service, including IP
                addresses, browser type, device information, and pages visited.
              </li>
            </ul>
          </section>

          {/* How We Use Information */}
          <section>
            <h2 className="text-2xl font-bold text-indigo-400 mb-3 border-b border-gray-700 pb-1">
              3. How We Use Your Information
            </h2>
            <p>We use the information we collect for the following purposes:</p>
            <ul className="list-disc list-inside space-y-3 ml-4">
              <li>
                To **provide and maintain the Service**, including calculating and delivering your
                career risk assessment results.
              </li>
              <li>To **analyze and improve** the quality and performance of the Service.</li>
              <li>
                To **communicate with you** regarding service updates, security alerts, and support.
              </li>
              <li>To **prevent fraud** and maintain the security of the Service.</li>
            </ul>
          </section>

          {/* Data Sharing and Disclosure */}
          <section>
            <h2 className="text-2xl font-bold text-indigo-400 mb-3 border-b border-gray-700 pb-1">
              4. Data Sharing and Disclosure
            </h2>
            <p>
              We do not sell your personal data. We may share your information only in the following
              circumstances:
            </p>
            <ul className="list-disc list-inside space-y-3 ml-4">
              <li>
                **Service Providers:** With third-party service providers (like Supabase for
                database hosting) who perform services on our behalf and are contractually obligated
                to keep your information confidential.
              </li>
              <li>
                **Legal Requirements:** When required to do so by law or in response to valid
                requests by public authorities (e.g., a court order).
              </li>
              <li>
                **Aggregated Data:** We may share aggregated or anonymized data that cannot
                reasonably be used to identify you.
              </li>
            </ul>
          </section>

          {/* Data Security and Retention */}
          <section>
            <h2 className="text-2xl font-bold text-indigo-400 mb-3 border-b border-gray-700 pb-1">
              5. Data Security and Retention
            </h2>
            <p>
              We implement reasonable security measures to protect your personal information from
              unauthorized access, alteration, disclosure, or destruction. We retain your personal
              data only for as long as necessary to fulfill the purposes outlined in this Privacy
              Policy, typically for the duration of your active account.
            </p>
          </section>

          {/* Your Data Rights */}
          <section>
            <h2 className="text-2xl font-bold text-indigo-400 mb-3 border-b border-gray-700 pb-1">
              6. Your Data Rights
            </h2>
            <p>
              You have the right to access, update, or delete the personal information we hold about
              you. You can manage your consent status and delete your entire account via the
              **Settings page** in the application.
            </p>
          </section>

          {/* Contact Us */}
          <section>
            <h2 className="text-2xl font-bold text-indigo-400 mb-3 border-b border-gray-700 pb-1">
              7. Contact Us
            </h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us at:{" "}
              <a
                href="mailto:privacy@example.com"
                className="text-indigo-400 hover:text-indigo-300"
              >
                privacy@example.com
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
