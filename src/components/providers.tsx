"use client";

import { ReactNode } from "react";
import { ThemeProvider } from "@/components/theme-provider";
import SessionProvider from "@/components/session-provider";
import { AppProvider } from "@/contexts/AppContext";
import SmoothScroll from "@/components/smooth-scroll";

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      disableTransitionOnChange
    >
      <SessionProvider>
        <AppProvider>
          <SmoothScroll>
            {children}
          </SmoothScroll>
        </AppProvider>
      </SessionProvider>
    </ThemeProvider>
  );
}
