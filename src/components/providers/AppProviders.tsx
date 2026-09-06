"use client";

import type { ReactNode } from "react";
import QueryProvider from "@/lib/providers/QueryProvider";
import { AuthProvider } from "@/lib/context/AuthContext";

export default function AppProviders({ children }: { children: ReactNode }) {
  return (
    <QueryProvider>
      <AuthProvider>{children}</AuthProvider>
    </QueryProvider>
  );
}
