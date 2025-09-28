import { Code } from "lucide-react";

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 border-t border-gray-800 p-6">
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

export default Footer;
