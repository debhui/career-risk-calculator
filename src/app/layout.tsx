// app/layout.tsx
"use client";

import { useEffect, useState } from "react";
import "./globals.css";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import { supabase } from "@/lib/supabaseClient";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userEmail, setUserEmail] = useState<string>("");
  const [avatarUrl, setAvatarUrl] = useState<string>("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  async function checkAuthentication() {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) {
      setIsAuthenticated(false);
      setUserEmail("");
      setAvatarUrl("");
      return null;
    }
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
  useEffect(() => {
    checkAuthentication();
  }, [checkAuthentication]);

  // const isAuthenticated = !!user;
  return (
    <html lang="en" className="h-full">
      <body className="flex flex-col h-full bg-gray-900 text-white">
        <Navbar
          isAuthenticated={isAuthenticated}
          userEmail={userEmail}
          avatarUrl={avatarUrl}
          onMenuClick={() => setIsSidebarOpen(true)}
        />
        <div className="flex flex-1 bg-gray-900 overflow-hidden">
          {isAuthenticated && (
            <Sidebar isMobileOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
          )}
          <main className="flex-1 overflow-y-auto">
            {/* The main content area where children are rendered */}
            <div className="p-0">{children}</div>
            <Footer />
          </main>
        </div>
      </body>
    </html>
  );
}
