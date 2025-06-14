'use client';
import React from 'react';
import Link from 'next/link';
import { useUser } from '../context/UserContext';
import { usePathname } from 'next/navigation';

const HomeLink = () => (
  <Link href="/" className="text-2xl font-bold text-primary-lightest">
    ShortenMe
  </Link>
);

const Navbar = () => {
  const { user } = useUser();
  const pathname = usePathname();
  const isRedirectPage = pathname?.startsWith('/r/');

  if (isRedirectPage) {
    return (
      <nav className="fixed top-0 left-0 right-0 z-50 bg-primary-dark/50 backdrop-blur-sm border-b border-primary-light/20">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <HomeLink />
        </div>
      </nav>
    );
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-primary-dark/50 backdrop-blur-sm border-b border-primary-light/20">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <HomeLink />
        <div className="space-x-4">
          {user ? (
            <Link
              href="/account"
              className="bg-primary-light hover:bg-primary-lightest text-white px-4 py-2 rounded-lg transition-colors"
            >
              My Account
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="text-primary-lightest hover:text-white transition-colors"
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="bg-primary-light hover:bg-primary-lightest text-white px-4 py-2 rounded-lg transition-colors"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
