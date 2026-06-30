"use client";
import React from "react";
import { UrlShortener } from "@components/url/UrlShortener";

export default function HomePage() {
  return (
    <div className="relative mx-auto max-w-[1200px] px-4 pb-28 pt-16 sm:px-6 lg:px-16">
      <section className="relative flex min-h-[calc(100vh-8rem)] flex-col items-center justify-center overflow-hidden text-center">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(0,229,255,0.05),_transparent_68%)]" />
        <div className="relative z-10 w-full space-y-12">
          <div className="mx-auto max-w-4xl space-y-4">
            <span className="eyebrow justify-center tracking-[0.2em]">Link your shortener</span>
            <h1 className="hero-title mx-auto max-w-4xl">The ultimate focus for your links</h1>
          </div>
          <UrlShortener />
        </div>
      </section>

      <footer className="mt-14 border-t border-white/[0.05] pt-10">
        <div className="grid gap-8 md:grid-cols-[1fr_auto] md:items-end">
          <div className="space-y-3">
            <span className="display-font text-2xl font-bold text-slate-100">
              Shorten Me
            </span>
            <p className="max-w-xl text-sm leading-6 text-[#bac9cc]">
              Simplified link management for creators and teams who want the interface to stay
              out of the way.
            </p>
          </div>
          <div className="flex flex-wrap gap-x-8 gap-y-3 text-sm text-[#bac9cc]">
            <a className="transition hover:text-cyan-200" href="#">
              Privacy
            </a>
            <a className="transition hover:text-cyan-200" href="#">
              Terms
            </a>
            <a className="transition hover:text-cyan-200" href="#">
              API
            </a>
            <a className="transition hover:text-cyan-200" href="#">
              Support
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
