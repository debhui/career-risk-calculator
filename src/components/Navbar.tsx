import { Code, Home, Menu } from "lucide-react";
import { UserMenu } from "./UserMenu";
import Link from "next/link";
import { ThemeSwitcher } from "./ThemeSwitcher";

interface NavbarProps {
  isAuthenticated: boolean;
  userEmail?: string;
  avatarUrl?: string;
  onMenuClick?: () => void;
}

// --- 1. Navigation Bar Component ---
const Navbar: React.FC<NavbarProps> = ({ isAuthenticated, userEmail, avatarUrl, onMenuClick }) => {
  return (
    <header
      // Changed light mode background to bg-sky-100 for a brighter, non-gray color,
      // and adjusted the border color to match.
      className={` bg-teal-600 dark:bg-gray-800 shadow-md border-b border-teal-900 dark:border-gray-700 sticky top-0 z-50 transition-colors duration-300`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        {/* <MobileMenu isAuthenticated={isAuthenticated} userEmail={userEmail} avatarUrl={avatarUrl} /> */}
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
        <div className="flex items-center space-x-4">
          {isAuthenticated ? (
            <UserMenu userEmail={userEmail} avatarUrl={avatarUrl} />
          ) : (
            <Link
              href={`/`}
              // Adjusted light mode hover effect to match the new sky background
              className="text-gray-200 dark:text-white transition-colors duration-200 p-2 rounded-full hover:bg-sky-200 dark:hover:bg-gray-600"
            >
              <Home />
            </Link>
          )}
          <ThemeSwitcher />
        </div>
      </div>
    </header>
  );
};

export default Navbar;
