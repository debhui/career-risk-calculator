import { Code, Home, Menu, DollarSign, X } from "lucide-react";
import { UserMenu } from "./UserMenu";
import Link from "next/link";
import { ThemeSwitcher } from "./ThemeSwitcher";
import React, { useState, useEffect } from "react"; // Added useEffect for path check

interface NavbarProps {
  isAuthenticated: boolean;
  userEmail?: string;
  avatarUrl?: string;
  onMenuClick?: () => void;
}

// --- 1. Navigation Bar Component ---
const Navbar: React.FC<NavbarProps> = ({ isAuthenticated, userEmail, avatarUrl, onMenuClick }) => {
  // State to control the visibility of the mobile menu when not authenticated
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  // State to hold the current path for active link detection
  const [currentPath, setCurrentPath] = useState("");

  // Get the current path once the component mounts and whenever the mobile menu state changes
  // This helps re-evaluate the active link state after a Link component navigation finishes
  useEffect(() => {
    // Check if window is available (needed for Next.js "use client" component)
    if (typeof window !== "undefined") {
      // Set the path on mount
      setCurrentPath(window.location.pathname);

      // Simple way to check if the path has changed after a soft navigation.
      // We will check the path whenever the mobile menu closes (as navigation usually happens then).
      // Note: In a full Next.js environment, using `useRouter().pathname` is the preferred way.
    }
  }, [isMobileMenuOpen]); // Dependency on isMobileMenuOpen forces a path recheck when it changes

  // Helper function to determine active link class
  const getLinkClasses = (href: string) => {
    // Check if the current path matches the href exactly (or starts with it, if needed for nested routes)
    const isActive = currentPath === href;
    const baseClasses =
      "flex items-center space-x-2 px-3 py-2 text-gray-200 dark:text-white rounded-md transition duration-150";

    // Classes for the mobile dropdown
    const mobileActiveClasses = isActive
      ? "bg-gray-600 dark:bg-gray-700 font-bold" // Active color in mobile menu
      : "hover:bg-gray-600 dark:hover:bg-gray-700"; // Hover color in mobile menu

    // Classes for the desktop links
    const desktopBaseClasses =
      "p-2 transition-colors duration-200 rounded-full flex gap-1 items-center text-gray-200 dark:text-white";
    const desktopActiveClasses = isActive
      ? "bg-teal-700 dark:bg-gray-700 font-bold" // Active color in desktop menu
      : "hover:bg-teal-700 dark:hover:bg-gray-600"; // Hover color in desktop menu

    return {
      mobile: `${baseClasses} ${mobileActiveClasses}`,
      desktop: `${desktopBaseClasses} ${desktopActiveClasses}`,
    };
  };

  // Helper component for Mobile Links (Non-Authenticated)
  const MobileAuthLinks = () => (
    <div
      className={`
        absolute top-full right-0 mt-1 w-48 rounded-lg shadow-2xl transition-all duration-300 transform origin-top-right
        bg-gray-700 dark:bg-gray-800 border border-gray-600 dark:border-gray-700
        ${isMobileMenuOpen ? "scale-y-100 opacity-100" : "scale-y-0 opacity-0 pointer-events-none"}
      `}
    >
      <div className="flex flex-col p-2 space-y-1">
        <Link
          href={`/`}
          // Closing the menu here triggers the useEffect dependency, forcing a path recheck.
          onClick={() => setIsMobileMenuOpen(false)}
          className={getLinkClasses("/").mobile}
        >
          <Home className="w-5 h-5" />
          <span>Home</span>
        </Link>
        <Link
          href={`/pricing`}
          // Closing the menu here triggers the useEffect dependency, forcing a path recheck.
          onClick={() => setIsMobileMenuOpen(false)}
          className={getLinkClasses("/pricing").mobile}
        >
          <DollarSign className="w-5 h-5" />
          <span>Pricing</span>
        </Link>

        {/* Theme Switcher added to the mobile menu */}
        <div
          className="flex items-center space-x-2 px-3 py-2 text-gray-200 dark:text-white mt-2 border-t border-gray-600 dark:border-gray-700 pt-2"
          // FIX: Stop event propagation to ensure the ThemeSwitcher click event fires correctly.
          onClick={e => e.stopPropagation()}
        >
          <span className="flex-grow">Theme</span>
          <ThemeSwitcher />
        </div>
      </div>
    </div>
  );

  // Function to handle link clicks on desktop links to force path update
  const handleDesktopLinkClick = (href: string) => {
    // If we detect the path has changed, update state immediately.
    // This is a workaround since we cannot use Next.js routing hooks.
    if (typeof window !== "undefined" && window.location.pathname !== href) {
      setCurrentPath(href);
    }
  };

  return (
    <header
      className={` bg-teal-600 dark:bg-gray-800 shadow-md border-b border-teal-900 dark:border-gray-700 sticky top-0 z-50 transition-colors duration-300`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        {/* Mobile Menu Button for Authenticated users */}
        {isAuthenticated && (
          <div className="flex md:hidden text-white">
            <button onClick={onMenuClick}>
              <Menu />
            </button>
          </div>
        )}

        {/* Logo and Title */}
        <div>
          <Link href={`/`} className="flex items-center space-x-3">
            <Code className="w-6 h-6 text-green-400" />
            <span className="text-md md:text-xl font-extrabold text-gray-200 dark:text-white tracking-wider transition-colors duration-300">
              Career Risk Calculator
            </span>
          </Link>
        </div>

        {/* User Actions or Sign In */}
        <div className="flex items-center space-x-4 relative">
          {isAuthenticated ? (
            <UserMenu userEmail={userEmail} avatarUrl={avatarUrl} />
          ) : (
            <>
              {/* Desktop Links (Show on sm: breakpoint and larger) */}
              <div className="hidden sm:flex items-center space-x-4">
                <Link
                  href={`/`}
                  // Added onClick handler for desktop links
                  onClick={() => handleDesktopLinkClick("/")}
                  className={getLinkClasses("/").desktop}
                >
                  <Home className="w-5 h-5" />
                  <span>Home</span>
                </Link>
                <Link
                  href={`/pricing`}
                  // Added onClick handler for desktop links
                  onClick={() => handleDesktopLinkClick("/pricing")}
                  className={getLinkClasses("/pricing").desktop}
                >
                  <DollarSign className="w-5 h-5" />
                  <span>Pricing</span>
                </Link>
              </div>

              {/* Mobile Dropdown Toggle (Show on smaller screens) */}
              <div className="sm:hidden relative">
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="p-2 text-gray-200 dark:text-white transition-colors duration-200 rounded-full hover:bg-teal-700 dark:hover:bg-gray-600"
                  aria-expanded={isMobileMenuOpen}
                >
                  {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
                {/* Render the mobile dropdown menu */}
                <MobileAuthLinks />
              </div>
            </>
          )}
          {/* ThemeSwitcher is visible on desktop */}
          <div className="hidden sm:block">
            <ThemeSwitcher />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
