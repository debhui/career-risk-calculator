// components/providers.tsx
"use client";

import { ThemeProvider, type ThemeProviderProps } from "next-themes";
// import { type ThemeProviderProps } from "next-themes/dist/types";
import React from "react";

export default function ThemeProviders({ children, ...props }: ThemeProviderProps) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem={true} {...props}>
      {children}
    </ThemeProvider>
  );
}
