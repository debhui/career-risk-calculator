// components/UserMenu.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { LogOut, User, ChevronDown } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
// import { supabase } from "@/lib/supabaseClient";
import { createSupabaseClient } from "@/lib/supabase/browser";

interface UserMenuProps {
  userEmail?: string;
  avatarUrl?: string;
}

export function UserMenu({ userEmail, avatarUrl }: UserMenuProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const supabase = createSupabaseClient();
  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Sign out error:", error.message);
    } else {
      window.location.href = "/"; // hard redirect
    }
  };

  const getInitials = (email: string) => {
    if (!email) return "?";
    const initials = email.split("@")[0].slice(0, 2).toUpperCase();
    return initials;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="flex items-center space-x-2 text-white p-2 rounded-full hover:bg-gray-700 transition"
      >
        <div className="w-8 h-8 rounded-full bg-gray-500 flex items-center justify-center text-sm font-semibold">
          {/* {getInitials(userEmail || "")} */}

          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt={getInitials(userEmail || "")}
              className="w-8 h-8 rounded-full object-cover border-2 border-indigo-500"
              onError={e => {
                (e.target as HTMLImageElement).onerror = null;
                (e.target as HTMLImageElement).src =
                  "https://placehold.co/64x64/2D3748/A0AEC0?text=P";
              }}
              width={100}
              height={100}
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-md font-bold  shrink-0">
              {getInitials(userEmail || "U")}
            </div>
          )}
        </div>
        <ChevronDown className="w-4 h-4 text-gray-400" />
      </button>

      {isDropdownOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-gray-700 rounded-md shadow-lg py-1 z-50">
          <Link
            href="/profile"
            className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-600"
            onClick={() => setIsDropdownOpen(false)}
          >
            <User className="w-4 h-4 mr-2" />
            Profile
          </Link>
          <button
            onClick={handleSignOut}
            className="w-full text-left flex items-center px-4 py-2 text-sm text-red-400 hover:bg-gray-600"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
