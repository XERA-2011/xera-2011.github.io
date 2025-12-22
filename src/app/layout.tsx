import { siteMetadata, siteViewport } from "@/config/site";
import '../styles/globals.css';
import Background from "@/components/background/star";
import Footer from "@/components/footer";
import Header from "@/components/header";
import UserAuth from "@/components/header/user-auth";
import ElasticCursor from "@/components/ui/elastic-cursor";
import { Providers } from "@/components/providers";

export const viewport = siteViewport;
export const metadata = siteMetadata;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh" className="theme-selection" data-scroll-behavior="smooth" suppressHydrationWarning>
      <body
        className="antialiased theme-scrollbar"
      >
        <Providers>
          <Background />
          <Header userAuth={<UserAuth />} />
          {children}
          <Footer />
          <ElasticCursor />
        </Providers>
      </body>
    </html>
  );
}
