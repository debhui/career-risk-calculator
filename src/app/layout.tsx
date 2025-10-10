// app/layout.tsx

"use client";

import { useEffect, useState } from "react";
import "./globals.css";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import StoreProvider from "@/lib/StoreProvider";
import ThemeProviders from "@/components/ThemeProviders";
import { usePathname, useRouter } from "next/navigation";
import { createSupabaseClient } from "@/lib/supabase/browser";
import Script from "next/script";
// import { Session } from "@supabase/supabase-js";
// import { useAppDispatch } from "@/hooks/appDispatch";
// import { setSession } from "@/store/authSlice";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userEmail, setUserEmail] = useState<string>("");
  const [avatarUrl, setAvatarUrl] = useState<string>("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileComplete, setIsProfileComplete] = useState<boolean>(false);
  // const [isAuthCheckComplete, setIsAuthCheckComplete] = useState<boolean>(false);
  // const dispatch = useAppDispatch();

  const supabase = createSupabaseClient();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    async function checkAuthenticationAndProfile() {
      // setIsAuthCheckComplete(false);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      // const {
      //   data: { session },
      // } = await supabase.auth.getSession();
      // if (session) {
      //   dispatch(setSession);
      // } else {
      //   dispatch(null);
      // }
      if (user) {
        setIsAuthenticated(true);
        setUserEmail(user?.email || "");
        setAvatarUrl(user?.user_metadata?.avatar_url);

        // --- PROFILE CHECK LOGIC ---
        const { data: profile } = await supabase
          .from("profiles")
          .select("consent_accepted, onboarding_completed")
          .eq("id", user.id)
          .maybeSingle();

        const isComplete = profile?.consent_accepted && profile?.onboarding_completed;
        setIsProfileComplete(isComplete);

        // --- ENFORCE ONBOARDING REDIRECT (Critical) ---
        if (!isComplete && pathname !== "/onboarding") {
          // If incomplete, force redirect to the onboarding page
          router.replace("/onboarding");
        } else if (isComplete && pathname === "/onboarding") {
          // If complete, prevent them from accessing /onboarding again
          router.replace("/");
        }
        // ---------------------------------------------
      } else {
        setIsAuthenticated(false);
        setIsProfileComplete(false);
        setUserEmail("");
        setAvatarUrl("");
      }

      // setIsAuthCheckComplete(true);
    }

    checkAuthenticationAndProfile();
  }, [pathname, router, supabase]); // Add dependencies

  // if (!isAuthCheckComplete) {
  //   return (
  //     <html lang="en" className="h-full">
  //       <body className="flex flex-col items-center justify-center h-full bg-white dark:bg-gray-900">
  //         <div className="flex flex-col items-center justify-center h-screen w-full bg-white dark:bg-gray-900">
  //           <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
  //           <p className="mt-2 text-gray-700 dark:text-gray-300">Checking session...</p>
  //         </div>
  //       </body>
  //     </html>
  //   );
  // }

  return (
    // The 'dark' class will be added to the html element by the Providers/ThemeProvider
    <html lang="en" suppressHydrationWarning className="h-full">
      <body className="flex flex-col h-full bg-white text-gray-900 dark:bg-gray-900 dark:text-white transition-colors duration-300">
        <StoreProvider>
          <ThemeProviders>
            <Navbar
              isAuthenticated={isAuthenticated}
              userEmail={userEmail}
              avatarUrl={avatarUrl}
              onMenuClick={() => setIsSidebarOpen(true)}
            />
            {/* Main Content Wrapper - Needs proper light/dark background */}
            <div className="flex flex-1  bg-white dark:bg-gray-900 overflow-hidden">
              {isAuthenticated && isProfileComplete && (
                <Sidebar isMobileOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
              )}
              <main className="flex-1 h-full overflow-y-auto">
                <div className="p-0">{children}</div>
                <Footer />
              </main>
            </div>
          </ThemeProviders>
        </StoreProvider>
        <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}
