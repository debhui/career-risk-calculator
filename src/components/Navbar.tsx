import { Code, Home, Menu } from "lucide-react";
import { UserMenu } from "./UserMenu";
import Link from "next/link";

interface NavbarProps {
  isAuthenticated: boolean;
  userEmail?: string;
  avatarUrl?: string;
  onMenuClick?: () => void;
}

// --- 1. Navigation Bar Component ---
const Navbar: React.FC<NavbarProps> = ({ isAuthenticated, userEmail, avatarUrl, onMenuClick }) => {
  return (
    <header className="bg-gray-800 shadow-md border-b border-gray-700 sticky top-0 z-50">
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
            <span className="text-md md:text-xl font-extrabold text-white tracking-wider">
              Career Risk Calculator
            </span>
          </Link>
        </div>

        {/* User Actions or Sign In */}
        <div className="flex items-center space-x-4">
          {isAuthenticated ? (
            <UserMenu userEmail={userEmail} avatarUrl={avatarUrl} />
          ) : (
            <Link href={`/`} className="text-white">
              <Home />
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
