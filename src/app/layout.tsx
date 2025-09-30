"use client";

import { useEffect, useState } from "react";
import "./globals.css";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import Providers from "@/components/Providers";
import { createSupabaseClient } from "@/lib/supabase/browser";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userEmail, setUserEmail] = useState<string>("");
  const [avatarUrl, setAvatarUrl] = useState<string>("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    async function checkAuthentication() {
      const supabase = createSupabaseClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        setIsAuthenticated(true);
        setUserEmail(user?.email || "");
        setAvatarUrl(user?.user_metadata?.avatar_url);
        return user;
      } else {
        setIsAuthenticated(false);
        setUserEmail("");
        setAvatarUrl("");
        return null;
      }
    }

    checkAuthentication();
  }, []);

  return (
    // The 'dark' class will be added to the html element by the Providers/ThemeProvider
    <html lang="en" suppressHydrationWarning className="h-full">
      <body className="flex flex-col h-full bg-white text-gray-900 dark:bg-gray-900 dark:text-white transition-colors duration-300">
        <Providers>
          <Navbar
            isAuthenticated={isAuthenticated}
            userEmail={userEmail}
            avatarUrl={avatarUrl}
            onMenuClick={() => setIsSidebarOpen(true)}
          />
          {/* Main Content Wrapper - Needs proper light/dark background */}
          <div className="flex flex-1  bg-white dark:bg-gray-900 overflow-hidden">
            {isAuthenticated && (
              <Sidebar isMobileOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
            )}
            <main className="flex-1 h-full overflow-y-auto">
              <div className="p-0">{children}</div>
              <Footer />
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
