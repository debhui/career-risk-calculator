import { ShieldCheck, LogOut, Code, Home, Settings } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";

interface NavbarProps {
  isAuthenticated: boolean;
}

// --- 1. Navigation Bar Component ---
const Navbar: React.FC<NavbarProps> = ({ isAuthenticated }) => {
  console.log("auth", isAuthenticated);
  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Sign out error:", error.message);
    } else {
      window.location.href = "/"; // hard redirect
    }
  };

  return (
    <header className="bg-gray-800 shadow-md border-b border-gray-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        {/* Logo and Title */}
        <div className="flex items-center space-x-3">
          <Code className="w-6 h-6 text-green-400" />
          <span className="text-xl font-extrabold text-white tracking-wider">
            Career Risk Calculator
          </span>
        </div>

        {/* Navigation Links */}
        {isAuthenticated && (
          <nav className="hidden md:flex space-x-6">
            <Link
              href="/profile"
              className="text-gray-300 hover:text-green-400 transition duration-150 flex items-center"
            >
              <Home className="w-4 h-4 mr-1" /> Profile
            </Link>
            <Link
              href="/assessment"
              className="text-gray-300 hover:text-green-400 transition duration-150 flex items-center"
            >
              <ShieldCheck className="w-4 h-4 mr-1" /> Assessment
            </Link>
          </nav>
        )}
        {/* User Actions */}
        <div className="flex items-center space-x-4">
          {
            isAuthenticated && (
              <>
                <Link
                  href="/settings"
                  className="text-gray-300 hover:text-white p-2 rounded-full hover:bg-gray-700 transition"
                >
                  <Settings className="w-5 h-5" />
                </Link>
                <button
                  onClick={handleSignOut}
                  className="flex items-center text-red-400 hover:text-red-300 transition"
                >
                  <LogOut className="w-5 h-5 mr-1" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </>
            )
            // : (
            //   <Link
            //     href="/"
            //     className="bg-green-600 hover:bg-green-500 text-white font-medium py-1.5 px-4 rounded-lg transition"
            //   >
            //     Sign In
            //   </Link>
            // )
          }
        </div>
      </div>
    </header>
  );
};

export default Navbar;
