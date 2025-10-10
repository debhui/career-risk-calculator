const getInitialTheme = () => {
  if (typeof window !== "undefined" && localStorage.getItem("theme")) {
    return localStorage.getItem("theme");
  }
  if (typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches) {
    return "dark";
  }
  return "light";
};

// Apply initial theme
if (typeof document !== "undefined") {
  if (getInitialTheme() === "dark") {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
}

export default function PurchaseReportPage() {
  // const [theme, setTheme] = useState(getInitialTheme());

  // useEffect(() => {
  //   const handleStorageChange = () => {
  //     setTheme(getInitialTheme());
  //   };
  //   // Listen for theme changes (e.g., from other parts of the app)
  //   window.addEventListener("storage", handleStorageChange);
  //   return () => window.removeEventListener("storage", handleStorageChange);
  // }, []);

  // const handleThemeToggle = () => {
  //   toggleTheme();
  //   setTheme(getInitialTheme());
  // };

  // const isDark = theme === "dark";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-500">
      {/* --- HEADER --- */}
      <header className="sticky top-0 z-10 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 shadow-sm transition-colors duration-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            {/* Logo or Site Name */}
            <h1 className="text-xl font-bold text-teal-600 dark:text-indigo-400">Report Viewer</h1>
          </div>
        </div>
      </header>
      {/* --- END HEADER --- */}

      {/* --- CONTENT AREA --- */}
      <main className="max-w-6xl mx-auto p-4 sm:p-8 pt-12">
        <div className="bg-white dark:bg-gray-800 shadow-2xl rounded-xl p-8 sm:p-12 text-center border border-gray-200 dark:border-gray-700 transition-colors duration-500">
          {/* Main Title/Heading */}
          <h2 className="text-3xl sm:text-4xl font-extrabold text-teal-600 dark:text-indigo-600 mb-4">
            Access Restricted 🚫
          </h2>

          {/* Core Message */}
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-lg mx-auto leading-relaxed">
            It looks like you have not purchased this report yet. To view the content, please go
            back to the purchase page.
          </p>

          <button
            // onClick={handleGoBack}
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-teal-600 dark:bg-indigo-600 hover:bg-teal-700 dark:hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-300 transform hover:scale-[1.02]"
          >
            Go Back and Purchase Report
          </button>

          <div className="mt-6">
            <p className="text-sm text-gray-400 dark:text-gray-500">
              Your report will load automatically after successful purchase.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
