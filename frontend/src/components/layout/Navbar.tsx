"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useUser } from "../context/UserContext";
import { usePathname } from "next/navigation";

const HomeLink = () => (
  <Link href="/" className="group flex items-center gap-2">
    <span className="display-font text-2xl font-bold text-cyan-100 transition group-hover:text-cyan-300">
      Shorten Me
    </span>
  </Link>
);

export const Navbar = () => {
  const { user } = useUser();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const isRedirectPage = pathname?.startsWith("/r/");

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setMounted(true);
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  if (!mounted) {
    return (
      <nav className="fixed left-0 right-0 top-0 z-50 border-b border-white/[0.05] bg-[#0f1419]/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-4 sm:px-6 lg:px-16">
          <HomeLink />
          <div className="h-10 w-24" />
        </div>
      </nav>
    );
  }

  if (isRedirectPage) {
    return (
      <nav className="fixed left-0 right-0 top-0 z-50 border-b border-white/[0.05] bg-[#0f1419]/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-4 sm:px-6 lg:px-16">
          <HomeLink />
        </div>
      </nav>
    );
  }

  return (
    <>
      <nav className="fixed left-0 right-0 top-0 z-50 border-b border-white/[0.05] bg-[#0f1419]/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-4 sm:px-6 lg:px-16">
          <div className="flex items-center gap-8">
            <HomeLink />
            <div className="hidden items-center gap-6 md:flex">
              <Link
                href="/"
                className={`text-base transition hover:text-cyan-200 ${
                  pathname === "/" ? "border-b-2 border-cyan-300 pb-1 text-cyan-200" : "text-[#bac9cc]"
                }`}
              >
                Home
              </Link>
              {user && (
                <Link
                  href="/account"
                  className={`text-base transition hover:text-cyan-200 ${
                    pathname === "/account"
                      ? "border-b-2 border-cyan-300 pb-1 text-cyan-200"
                      : "text-[#bac9cc]"
                  }`}
                >
                  Dashboard
                </Link>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
          {user ? (
            <>
              <Link href="/" className="primary-button hidden px-5 py-2 text-sm sm:inline-flex">
                Shorten
              </Link>
              <Link
                href="/account"
                className="rounded-full p-2 text-cyan-200 transition hover:bg-white/[0.05]"
                aria-label="My account"
              >
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                  account_circle
                </span>
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="hidden text-sm font-medium text-[#bac9cc] transition hover:text-cyan-200 sm:inline-flex"
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="primary-button px-5 py-2 text-sm"
              >
                Sign Up
              </Link>
            </>
          )}
          </div>
        </div>
      </nav>
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/[0.05] bg-[#0f1419]/90 px-6 py-3 backdrop-blur-xl md:hidden">
        <div className="mx-auto flex max-w-md items-center justify-around">
          <Link
            href="/"
            className={`flex flex-col items-center gap-1 text-xs ${
              pathname === "/" ? "text-cyan-200" : "text-[#bac9cc]"
            }`}
          >
            <span className="material-symbols-outlined">home</span>
            Home
          </Link>
          <Link
            href="/account"
            className={`flex flex-col items-center gap-1 text-xs ${
              pathname === "/account" ? "text-cyan-200" : "text-[#bac9cc]"
            }`}
          >
            <span className="material-symbols-outlined">dashboard</span>
            Dashboard
          </Link>
        </div>
      </nav>
    </>
  );
};
