import type { Metadata } from "next";
import { Hanken_Grotesk, JetBrains_Mono } from "next/font/google";
import { NotificationProvider } from "@components/context/NotificationContext";
import "./globals.css";
import { Navbar } from "@components/layout/Navbar";
import { UserProvider } from "@components/context/UserContext";
import { env } from "cloudflare:workers";
import { assertJwtConfigured } from "@lib/runtime-config";

const hankenGrotesk = Hanken_Grotesk({
  variable: "--font-geist-sans",
  subsets: ["latin"]
});

const jetBrainsMono = JetBrains_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"]
});

const displayFont = Hanken_Grotesk({
  variable: "--font-display",
  subsets: ["latin"]
});

assertJwtConfigured(env);

export const metadata: Metadata = {
  title: "Shorten Me",
  description:
    "Shorten Me is a URL shortener that helps you create clean links, track clicks, and manage your shortcuts.",
  icons: {
    icon: "/favicon.ico"
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${hankenGrotesk.variable} ${jetBrainsMono.variable} ${displayFont.variable} app-shell`}>
        <UserProvider>
          <Navbar />
          <NotificationProvider>
            <main className="relative pt-16">{children}</main>
          </NotificationProvider>
        </UserProvider>
      </body>
    </html>
  );
}
