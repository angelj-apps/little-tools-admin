"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignOutButton } from "@/components/SignOutButton";

const LINKS = [
  { href: "/", label: "Pulse" },
  { href: "/users", label: "Users" },
  { href: "/media", label: "Media" },
  { href: "/ratings", label: "Ratings" },
  { href: "/prompt-chains", label: "Chains" },
  { href: "/prompt-chains/steps", label: "Steps" },
  { href: "/prompt-chains/mix", label: "Mix" },
  { href: "/terms", label: "Terms" },
  { href: "/generation-requests", label: "Gen reqs" },
  { href: "/examples", label: "Examples" },
  { href: "/llm-providers", label: "Providers" },
  { href: "/llm-models", label: "Models" },
  { href: "/llm-responses", label: "Responses" },
  { href: "/signup-domains", label: "Domains" },
  { href: "/whitelist", label: "Whitelist" },
  { href: "/images", label: "Images" },
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
              : pathname === link.href ||
                (link.href !== "/prompt-chains" &&
                  pathname.startsWith(`${link.href}/`)) ||
                (link.href === "/prompt-chains" &&
                  pathname === "/prompt-chains");
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
