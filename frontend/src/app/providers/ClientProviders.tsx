// src/app/ClientProviders.tsx
"use client";

import { SessionProvider } from "next-auth/react";
import { MovieProvider } from "./MovieContext";
import type { ReactNode } from "react";

export function ClientProviders({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <MovieProvider>
        {children}
      </MovieProvider> 
    </SessionProvider>
  );
}
