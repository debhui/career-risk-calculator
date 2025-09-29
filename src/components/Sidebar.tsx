// components/Sidebar.tsx
"use client";

import { Home, ShieldCheck, Clock, Settings, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const sidebarItems = [
  {
    name: "Home",
    icon: Home,
    url: "/",
  },
  {
    name: "Assement",
    icon: ShieldCheck,
    url: "/assessment",
  },
  {
    name: "History",
    icon: Clock,
    url: "/history",
  },
  {
    name: "Settings",
    icon: Settings,
    url: "/settings",
  },
];

interface SidebarProps {
  isMobileOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isMobileOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const mobileClasses = isMobileOpen ? "transform-none" : "-translate-x-full md:transform-none";

  return (
    <>
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-gray-800 p-4 shadow-lg z-50 transition-transform duration-300 ease-in-out ${mobileClasses} md:static md:translate-x-0`}
      >
        <div className="flex justify-end md:hidden">
          <button onClick={onClose} className="text-white p-2">
            <X className="h-6 w-6" />
          </button>
        </div>
        <nav className="flex flex-col space-y-2 justify-between">
          <div className="space-y-4">
            {sidebarItems.map((item, index) => {
              const isActive = pathname === item.url;
              return (
                <Link
                  key={`sidebar-${index}`}
                  href={`${item.url}`}
                  className={`flex flex-row items-center gap-2 space-y-2 py-2 px-4 rounded-lg transition-colors duration-200 ${
                    isActive
                      ? "bg-gray-700 text-green-400 font-semibold"
                      : "text-white hover:bg-gray-700 hover:text-gray-300"
                  }`}
                  onClick={onClose}
                >
                  <item.icon size={15} />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </nav>
      </aside>
    </>
  );
}
