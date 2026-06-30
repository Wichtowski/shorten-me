import React from "react";
import Link from "next/link";

interface AuthFrameProps {
  title: string;
  footerQuestion: string;
  footerLinkHref: string;
  footerLinkText: string;
  children: React.ReactNode;
}

export function AuthFrame({
  title,
  footerQuestion,
  footerLinkHref,
  footerLinkText,
  children
}: AuthFrameProps) {
  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-[1200px] flex-col px-4 pb-28 pt-10 sm:px-6 lg:px-16">
      <div className="relative flex flex-1 items-center justify-center py-8">
        <section className="relative w-full max-w-2xl">
          <div className="surface-strong rounded-xl p-4 shadow-2xl sm:p-8 lg:p-10">
            <div className="mb-4 space-y-3 text-center">
              <h1 className="section-title mx-auto max-w-xl">{title}</h1>
            </div>

            <div className="rounded-xl border border-white/[0.05] bg-[#0a0f14] p-4 sm:p-6">
              {children}
              <p className="mt-8 text-center text-sm text-[#bac9cc]">
                {footerQuestion}{" "}
                <Link
                  href={footerLinkHref}
                  className="font-semibold text-cyan-300 transition hover:text-cyan-100"
                >
                  {footerLinkText}
                </Link>
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
