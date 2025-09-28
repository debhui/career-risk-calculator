import { Info, ShieldHalf } from "lucide-react";
import Login from "./login/page";

export default function CareerRiskCalculatorHomePage() {
  return (
    // Dark, analytical background with a subtle fixed background pattern for depth
    <div className="flex min-h-[calc(100vh-158px)] flex-col items-center justify-center bg-gray-900 p-4">
      {/* Header/Branding */}
      <header className="mb-12 text-center">
        {/* Logo and App Title */}
        <ShieldHalf className="mx-auto mb-4 h-14 w-14 text-indigo-400 animate-pulse-slow" />
        <h1 className="text-6xl font-extrabold text-white sm:text-7xl">
          <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Career
          </span>{" "}
          <span className="text-gray-200">Risk</span>
        </h1>
        <p className="mt-3 text-2xl font-light text-gray-400 italic">
          Predict. Optimize. Secure Your Future.
        </p>
      </header>

      {/* Sign In Form - Centered on the page */}
      <main className="w-full max-w-lg">
        <Login />
      </main>

      {/* Small Legal Footer */}
      <footer className="mt-16 text-center text-sm text-gray-500">
        <div className="flex items-center justify-center space-x-1">
          <Info className="h-4 w-4 text-gray-600" />
          <p>&copy; {new Date().getFullYear()} RiskSecure Analytics. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
