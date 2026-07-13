"use client";

import { ReactNode } from "react";
import { ThemeProvider } from "@/components/theme-provider";
import SessionProvider from "@/components/session-provider";
import { AppProvider } from "@/contexts/AppContext";
import dynamic from "next/dynamic";

const SmoothScroll = dynamic(() => import("@/components/smooth-scroll"), { ssr: false });
const Background = dynamic(() => import("@/components/background/star"), { ssr: false });
const ElasticCursor = dynamic(() => import("@/components/ui/elastic-cursor"), { ssr: false });

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
            <Background />
            {children}
            <ElasticCursor />
          </SmoothScroll>
        </AppProvider>
      </SessionProvider>
    </ThemeProvider>
  );
}
