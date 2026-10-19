"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignOutButton } from "@/components/SignOutButton";

const LINKS = [
  { href: "/", label: "Pulse" },
  { href: "/users", label: "Users" },
  { href: "/media", label: "Media" },
  { href: "/ratings", label: "Ratings" },
];

export function AdminNav({ email }: { email?: string }) {
  const pathname = usePathname();

  return (
    <header className="admin-nav">
      <div className="admin-nav-brand">
        <Link href="/" className="admin-mark">
          lt<span>ops</span>
        </Link>
        <p className="admin-nav-sub">Little Tools control room</p>
      </div>
      <nav className="admin-nav-links" aria-label="Admin">
        {LINKS.map((link) => {
          const active =
            link.href === "/"
              ? pathname === "/"
              : pathname === link.href || pathname.startsWith(`${link.href}/`);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={active ? "admin-nav-link is-active" : "admin-nav-link"}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
      <div className="admin-nav-meta">
        {email ? <span className="admin-nav-email">{email}</span> : null}
        <SignOutButton />
      </div>
    </header>
  );
}
