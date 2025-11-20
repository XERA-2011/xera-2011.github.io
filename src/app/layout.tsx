import type { Metadata } from "next/types";
import '../styles/globals.css';
import Background from "@/components/background/star";
// import Footer from "@/components/footer";
import Header from "@/components/header";
import UserAuth from "@/components/header/UserAuth";
import SmoothScroll from "@/components/SmoothScroll";
import ElasticCursor from "@/components/ui/ElasticCursor";
import { AppProvider } from "@/contexts/AppContext";
import SessionProvider from "@/components/SessionProvider";
import { ThemeProvider } from "@/components/theme-provider";

export const metadata: Metadata = {
  title: "XERA-2011",
  description: "Pocket Universe",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="theme-selection" data-scroll-behavior="smooth" suppressHydrationWarning>
      <body
        className="antialiased theme-scrollbar"
        suppressHydrationWarning
      >
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
                <Header userAuth={<UserAuth />} />
                {children}
                {/* <Footer /> */}
                <ElasticCursor />
              </SmoothScroll>
            </AppProvider>
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
