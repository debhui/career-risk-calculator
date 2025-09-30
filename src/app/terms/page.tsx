"use client";

import React from "react";

export default function TermsPage() {
  return (
    <div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white min-h-screen transition-colors duration-300 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-gray-100 dark:bg-gray-800 p-8 rounded-xl shadow-2xl border border-teal-500/50 dark:border-indigo-700/50 transition-colors duration-300">
        <div className="flex justify-between items-start mb-6">
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white">
            Terms of Service
          </h1>
        </div>

        <p className="text-sm text-gray-600 dark:text-gray-400 mb-8">
          Last Updated: September 27, 2025
        </p>

        <div className="space-y-6 text-gray-700 dark:text-gray-300">
          {/* Acceptance of Terms */}
          <section>
            <h2 className="text-2xl font-bold text-teal-600 dark:text-indigo-400 mb-3 border-b border-gray-300 dark:border-gray-700 pb-1">
              1. Acceptance of Terms
            </h2>
            <p>
              By accessing and using the Career Risk Calculator (&quot;Service&quot;), you accept
              and agree to be bound by the terms and provisions of this agreement. These terms apply
              to all visitors, users, and others who access or use the Service. If you disagree with
              any part of the terms, then you may not access the Service.
            </p>
          </section>

          {/* Use of Service */}
          <section>
            <h2 className="text-2xl font-bold text-teal-600 dark:text-indigo-400 mb-3 border-b border-gray-300 dark:border-gray-700 pb-1">
              2. Use of Service
            </h2>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>
                **Accuracy of Information:** You agree to provide accurate, current, and complete
                information during the use of the Service.
              </li>
              <li>
                **Not Financial Advice:** The information provided by the Service is for
                informational and analysis purposes only. It does not constitute financial,
                investment, or career advice. You use the results at your own risk.
              </li>
              <li>
                **Prohibited Conduct:** You must not use the Service for any unlawful or prohibited
                purpose, including unauthorized access to data or systems.
              </li>
            </ul>
          </section>

          {/* Intellectual Property */}
          <section>
            <h2 className="text-2xl font-bold text-teal-600 dark:text-indigo-400 mb-3 border-b border-gray-300 dark:border-gray-700 pb-1">
              3. Intellectual Property
            </h2>
            <p>
              The Service and its original content, features, and functionality are and will remain
              the exclusive property of Career Risk Calculator and its licensors. Our trademarks and
              trade dress may not be used in connection with any product or service without the
              prior written consent of Career Risk Calculator.
            </p>
          </section>

          {/* Termination */}
          <section>
            <h2 className="text-2xl font-bold text-teal-600 dark:text-indigo-400 mb-3 border-b border-gray-300 dark:border-gray-700 pb-1">
              4. Termination
            </h2>
            <p>
              We may terminate or suspend your account immediately, without prior notice or
              liability, for any reason whatsoever, including without limitation if you breach the
              Terms. Upon termination, your right to use the Service will immediately cease. If you
              wish to terminate your account, you may simply discontinue using the Service or use
              the deletion option in the **Settings page**.
            </p>
          </section>

          {/* Limitation of Liability */}
          <section>
            <h2 className="text-2xl font-bold text-teal-600 dark:text-indigo-400 mb-3 border-b border-gray-300 dark:border-gray-700 pb-1">
              5. Limitation of Liability
            </h2>
            <p>
              In no event shall Career Risk Calculator, nor its directors, employees, partners,
              agents, suppliers, or affiliates, be liable for any indirect, incidental, special,
              consequential or punitive damages, including without limitation, loss of profits,
              data, use, goodwill, or other intangible losses, resulting from (i) your access to or
              use of or inability to access or use the Service; (ii) any conduct or content of any
              third party on the Service; (iii) any content obtained from the Service; and (iv)
              unauthorized access, use or alteration of your transmissions or content, whether based
              on warranty, contract, tort (including negligence) or any other legal theory.
            </p>
          </section>

          {/* Governing Law */}
          <section>
            <h2 className="text-2xl font-bold text-teal-600 dark:text-indigo-400 mb-3 border-b border-gray-300 dark:border-gray-700 pb-1">
              6. Governing Law
            </h2>
            <p>
              These Terms shall be governed and construed in accordance with the laws of the
              jurisdiction where the company is registered, without regard to its conflict of law
              provisions.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
