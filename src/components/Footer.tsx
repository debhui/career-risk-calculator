import { Code } from "lucide-react";
import React from "react"; // Explicitly import React

const Footer: React.FC = () => {
  return (
    <footer className="bg-teal-600 dark:bg-gray-800 border-t border-gray-300 dark:border-gray-700 p-6">
      <div className="max-w-7xl mx-auto text-center text-gray-200 dark:text-gray-400 text-sm">
        <p className="mb-2">
          &copy; {new Date().getFullYear()} Career Risk Calculator. All rights reserved.
        </p>
        <div className="space-x-4">
          <a
            href="/privacy"
            // FIX 3: Ensure links are visible in both modes
            className="text-gray-200 dark:text-gray-300 hover:text-green-500 transition"
          >
            Privacy Policy
          </a>
          <a
            href="/terms"
            className="text-gray-200 dark:text-gray-300 hover:text-green-500 transition"
          >
            Terms of Service
          </a>
          <a
            href="https://github.com/debhui/career-risk-calculator"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-200 dark:text-gray-300 hover:text-green-500 transition"
          >
            <Code className="w-4 h-4 inline-block align-text-bottom mr-1" />
            GitHub
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
