// app/GlobalLayout.tsx
import React, { ReactNode } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabaseServer } from "@/lib/supabaseServer";
import { redirect } from "next/navigation";

interface LayoutProps {
  children: ReactNode;
}

// 👇 Notice: no "use client"
export const GlobalLayout = async ({ children }: LayoutProps) => {
  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  return (
    <div className="min-h-[calc(100vh-200px)] flex flex-col bg-gray-900">
      {/* pass flag down to Navbar (can be a client comp) */}
      <Navbar isAuthenticated={!!user} />

      <main className="flex-grow">{children}</main>

      <Footer />
    </div>
  );
};
