import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { NotificationProvider } from '@components/context/NotificationContext';
import './globals.css';
import Navbar from '@components/layout/Navbar';
import { UserProvider } from '@components/context/UserContext';
import { env } from 'cloudflare:workers';
import { assertJwtConfigured } from '@lib/runtime-config';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

assertJwtConfigured(env);

export const metadata: Metadata = {
  title: 'Shoten Me!',
  description:
    'Shoten Me! is a URL shortener that allows you to shorten your URLs and track your clicks.',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-gradient-to-b from-primary-darkest to-primary-dark pt-16`}
      >
        <UserProvider>
          <Navbar />
          <NotificationProvider>{children}</NotificationProvider>
        </UserProvider>
      </body>
    </html>
  );
}
