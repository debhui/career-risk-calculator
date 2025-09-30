"use client";

import React from "react";
import { CheckCircle, XCircle, ArrowRight, Zap } from "lucide-react";

// --- Pricing Data Structure ---
const pricingTiers = [
  {
    name: "Basic Access",
    price: "0",
    frequency: "per month",
    description: "Start your career analysis journey with foundational tools.",
    features: [
      { text: "Single Comprehensive Assessment", included: true },
      { text: "Basic Risk Score Report", included: true },
      { text: "Limited Historical Tracking", included: false },
      { text: "Personalized Strategy Recommendations", included: false },
      { text: "Access to Community Forums", included: false },
    ],
    buttonText: "Start Free",
    theme: "gray",
  },
  {
    name: "Pro Analyst",
    price: "499",
    frequency: "per month",
    description: "Unlock deep, continuous analysis and strategic guidance.",
    features: [
      { text: "Unlimited Assessments", included: true },
      { text: "Advanced Risk Analytics Dashboard", included: true },
      { text: "Full Historical Tracking & Comparison", included: true },
      { text: "Personalized Strategy Recommendations", included: true },
      { text: "Access to Premium Resources", included: true },
    ],
    buttonText: "Go Pro",
    theme: "gray", // Highlighted tier
  },
  {
    name: "Enterprise",
    price: "Custom",
    frequency: "per year",
    description: "Tailored solutions for large teams and institutional risk management.",
    features: [
      { text: "Everything in Pro Analyst", included: true },
      { text: "Multi-user Team Dashboard", included: true },
      { text: "Dedicated Account Manager", included: true },
      { text: "Custom API Integration", included: true },
      { text: "On-site Workshops & Training", included: true },
    ],
    buttonText: "Contact Sales",
    theme: "purple",
  },
];

// --- Single Pricing Card Component ---
interface PricingCardProps {
  tier: (typeof pricingTiers)[0];
  isHighlighted: boolean;
}

const PricingCard: React.FC<PricingCardProps> = ({ tier, isHighlighted }) => {
  const isCustom = tier.price === "Custom";
  const primaryColor = isHighlighted ? "indigo" : tier.theme;

  return (
    <div
      className={`
        flex flex-col p-8 rounded-2xl shadow-2xl transition-all duration-500 h-full
        ${
          isHighlighted
            ? `bg-gray-200 dark:bg-gray-950 border-4 border-${primaryColor}-500 dark:border-indigo-500 transform scale-105`
            : "bg-gray-200 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 hover:shadow-xl"
        }
      `}
    >
      <header className="pb-6 border-b border-gray-200 dark:border-gray-700">
        <h3
          className={`text-2xl font-extrabold ${
            isHighlighted
              ? `text-${primaryColor}-500 dark:text-indigo-500`
              : "text-gray-900 dark:text-white"
          } mb-2`}
        >
          {tier.name}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">{tier.description}</p>
        <div className="mt-4 flex items-baseline">
          <span
            className={`text-5xl font-extrabold tracking-tight ${
              isHighlighted ? `text-${primaryColor}-500` : "text-gray-900 dark:text-white"
            }`}
          >
            {tier.price}
          </span>
          {!isCustom && (
            <span className="ml-1 text-xl font-semibold text-gray-500 dark:text-gray-400">
              /{tier.frequency}
            </span>
          )}
        </div>
      </header>

      <ul role="list" className="mt-6 space-y-4 flex-grow">
        {tier.features.map((feature, index) => (
          <li key={index} className="flex items-start">
            {feature.included ? (
              <CheckCircle
                className={`flex-shrink-0 w-5 h-5 ${
                  isHighlighted ? `text-${primaryColor}-500 ` : "text-green-500"
                }`}
              />
            ) : (
              <XCircle className="flex-shrink-0 w-5 h-5 text-red-400 opacity-50" />
            )}
            <p className="ml-3 text-base text-gray-700 dark:text-gray-300">{feature.text}</p>
          </li>
        ))}
      </ul>

      <a
        href={isCustom ? "mailto:sales@riskcalc.com" : "/signup"}
        className={`
          mt-8 block w-full text-center py-3 px-4 rounded-xl text-lg font-bold shadow-lg
          transition-all duration-300 transform hover:scale-[1.02]
          ${
            isHighlighted
              ? `bg-${primaryColor}-600 dark:bg-indigo-600 text-white hover:bg-${primaryColor}-700 shadow-${primaryColor}-600/50`
              : "bg-teal-500 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
          }
          flex items-center justify-center
        `}
      >
        {tier.name === "Pro Analyst" && <Zap className="w-5 h-5 mr-2" />}
        {tier.buttonText}
        <ArrowRight className="w-4 h-4 ml-2" />
      </a>
    </div>
  );
};

// --- Main Page Component ---
export default function PricingPage() {
  return (
    <div className={`min-h-[calc(100vh-170px)] transition-colors duration-300`}>
      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-base font-semibold tracking-wide text-teal-600 dark:text-indigo-400 uppercase">
            Pricing
          </h2>
          <p className="mt-2 text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-6xl">
            The Right Plan for Your Career
          </p>
          <p className="mt-4 max-w-2xl text-xl text-gray-500 dark:text-gray-400 mx-auto">
            Choose a plan that fits your personal ambition or team&#39;s security needs.
          </p>
        </div>

        {/* Pricing Grid */}
        <div className="mt-12 grid grid-cols-1 gap-10 lg:grid-cols-3 lg:gap-8">
          {pricingTiers.map((tier, index) => (
            <PricingCard key={index} tier={tier} isHighlighted={tier.name === ""} /> // Pro Analysts
          ))}
        </div>

        {/* Footer CTA / Info */}
        <div className="mt-16 pt-10 border-t border-gray-300 dark:border-gray-700 text-center">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Questions?</h3>
          <p className="text-gray-600 dark:text-gray-400">
            Need a custom quote or more information on Enterprise features?
            <a
              href="mailto:sales@riskcalc.com"
              className="font-medium text-teal-600 dark:text-indigo-400 hover:underline ml-2"
            >
              Contact our Sales Team.
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
