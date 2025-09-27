import { ShieldHalf, Chrome } from "lucide-react";
import Login from "./login/page";

export default function CareerRiskCalculatorHomePage() {
  return (
    // Dark, analytical background with subtle gradient
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-900 p-4">
      {/* Header/Branding */}
      <header className="mb-10 text-center">
        {/* Logo and App Title */}
        <ShieldHalf className="mx-auto mb-3 h-12 w-12 text-indigo-400" />
        <h1 className="text-5xl font-extrabold text-white sm:text-6xl">
          <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            Career
          </span>{" "}
          Risk Calculator
        </h1>
        <p className="mt-2 text-xl font-light text-gray-400">
          Predict. Optimize. Secure Your Future.
        </p>
      </header>

      {/* Sign In Form - Centered on the page */}
      <main className="w-full max-w-md">
        <Login />
      </main>

      {/* Footer */}
      <footer className="mt-10 text-center text-sm text-gray-500">
        &copy; {new Date().getFullYear()} RiskSecure Analytics. All rights reserved.
      </footer>
    </div>
  );
}
