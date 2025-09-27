"use client";

import React, { ReactNode } from "react";
import { ShieldCheck, LogOut, Code, Home, Settings } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";

// Define the Props type for the Layout component
interface LayoutProps {
  children: ReactNode;
}

// --- 1. Navigation Bar Component ---
const Navbar: React.FC = () => {
  // NOTE: In a full app, this would use router or auth state for navigation/user status
  const isAuthenticated = true; // Mock status

  const handleSignOut = async () => {
    // const supabase = getSupabaseClient();

    if (supabase) {
      console.log("Attempting Supabase sign out...");
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error("Sign out error:", error.message);
        // Display user-friendly error message
      } else {
        // Sign out is successful; redirect to the login page
        // Use window.location.href for a full page refresh redirect after sign-out
        window.location.href = "/";
      }
    }
  };

  return (
    <header className="bg-gray-800 shadow-md border-b border-gray-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
        {/* Logo and Title */}
        <div className="flex items-center space-x-3">
          <Code className="w-6 h-6 text-green-400" />
          <span className="text-xl font-extrabold text-white tracking-wider">
            Career Risk Calculator
          </span>
        </div>

        {/* Navigation Links */}
        <nav className="hidden md:flex space-x-6">
          <a
            href="/profile"
            className="text-gray-300 hover:text-green-400 transition duration-150 flex items-center"
          >
            <Home className="w-4 h-4 mr-1" /> Profile
          </a>
          <a
            href="/assessment"
            className="text-gray-300 hover:text-green-400 transition duration-150 flex items-center"
          >
            <ShieldCheck className="w-4 h-4 mr-1" /> Assessment
          </a>
        </nav>

        {/* User Actions */}
        <div className="flex items-center space-x-4">
          {isAuthenticated ? (
            <>
              <a
                href="/settings"
                className="text-gray-300 hover:text-white p-2 rounded-full hover:bg-gray-700 transition"
              >
                <Settings className="w-5 h-5" />
              </a>
              <button
                onClick={handleSignOut}
                className="flex items-center text-red-400 hover:text-red-300 transition"
              >
                <LogOut className="w-5 h-5 mr-1" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </>
          ) : (
            <Link
              href="/"
              className="bg-green-600 hover:bg-green-500 text-white font-medium py-1.5 px-4 rounded-lg transition"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

// --- 2. Footer Component ---
const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 border-t border-gray-800 mt-10 p-6">
      <div className="max-w-7xl mx-auto text-center text-gray-500 text-sm">
        <p className="mb-2">
          &copy; {new Date().getFullYear()} Career Risk Calculator. All rights reserved.
        </p>
        <div className="space-x-4">
          <a href="/privacy" className="hover:text-green-400 transition">
            Privacy Policy
          </a>
          <a href="/terms" className="hover:text-green-400 transition">
            Terms of Service
          </a>
          <a
            href="https://github.com/debhui/career-risk-calculator"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-green-400 transition"
          >
            <Code className="w-4 h-4 inline-block align-text-bottom mr-1" />
            GitHub
          </a>
        </div>
      </div>
    </footer>
  );
};

// --- 3. Main Layout Component ---
export const GlobalLayout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-[calc(100vh-200px)] flex flex-col bg-gray-900">
      <Navbar />

      {/* Main Content Area */}
      <main className="flex-grow">{children}</main>

      <Footer />
    </div>
  );
};

// Exporting Navbar and Footer separately if needed
export { Navbar, Footer };
