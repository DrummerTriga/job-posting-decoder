"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import LogoutButton from "./LogoutButton";

const links = [
  { href: "/", label: "Home" },
  { href: "/analyze", label: "Analyze" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/profile", label: "My CV" },
];

export default function Nav({ userEmail }: { userEmail: string | null }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // The auth pages are self-contained — a nav bar there would only be noise.
  if (pathname === "/login" || pathname === "/signup") return null;

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header className="sticky top-0 z-50 border-b border-neutral-800 bg-neutral-950/80 backdrop-blur">
      <nav className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between gap-4">
        <Link
          href="/"
          className="flex items-center gap-2 font-semibold text-neutral-100 shrink-0 hover:text-white"
        >
          <Image src="/favicon.ico" alt="Job Posting Decoder" width={20} height={20} className="shrink-0" />
          Job Posting Decoder
        </Link>

        {/* Desktop */}
        <div className="hidden sm:flex items-center gap-1">
          {userEmail &&
            links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive(link.href) ? "page" : undefined}
                className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  isActive(link.href)
                    ? "bg-neutral-800 text-neutral-100"
                    : "text-neutral-400 hover:text-neutral-100 hover:bg-neutral-900"
                }`}
              >
                {link.label}
              </Link>
            ))}

          {userEmail ? (
            <div className="flex items-center gap-3 pl-3 ml-2 border-l border-neutral-800">
              <span
                className="text-xs text-neutral-500 max-w-[14rem] truncate"
                title={userEmail}
              >
                {userEmail}
              </span>
              <LogoutButton />
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="px-3 py-1.5 rounded-lg text-sm text-neutral-300 hover:text-neutral-100 hover:bg-neutral-900"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="px-3 py-1.5 rounded-lg text-sm bg-neutral-100 text-neutral-900 font-medium hover:bg-white"
              >
                Sign up
              </Link>
            </div>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          aria-label="Toggle navigation menu"
          className="sm:hidden px-3 py-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-300 text-sm"
        >
          {open ? "✕" : "☰"}
        </button>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="sm:hidden border-t border-neutral-800 px-6 py-3 space-y-1">
          {userEmail ? (
            <>
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  aria-current={isActive(link.href) ? "page" : undefined}
                  className={`block px-3 py-2 rounded-lg text-sm ${
                    isActive(link.href)
                      ? "bg-neutral-800 text-neutral-100"
                      : "text-neutral-400 hover:bg-neutral-900"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <div className="flex items-center justify-between pt-3 mt-2 border-t border-neutral-800">
                <span className="text-xs text-neutral-500 truncate pr-3">
                  {userEmail}
                </span>
                <LogoutButton />
              </div>
            </>
          ) : (
            <>
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm text-neutral-300 hover:bg-neutral-900"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                onClick={() => setOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm text-neutral-300 hover:bg-neutral-900"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}
