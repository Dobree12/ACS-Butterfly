"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";

const baseLinks = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/tournaments", label: "Turnee" },
  { href: "/rankings", label: "Clasament" },
  { href: "/history", label: "Istoric" },
];

export default function Navigation() {
  const pathname = usePathname();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const navLinks = user
    ? [...baseLinks, { href: "/profile", label: "Profil" }]
    : [...baseLinks, { href: "/auth", label: "Autentificare" }];

  return (
    <nav>
      <div className="nav-container">
        <div className="logo">ACS Butterfly</div>
        <button
          type="button"
          className="nav-toggle"
          aria-label="Deschide meniul"
          aria-expanded={isOpen}
          onClick={() => setIsOpen((prev) => !prev)}
        >
          <span />
          <span />
          <span />
        </button>
        <ul className={`nav-links ${isOpen ? "open" : ""}`}>
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={pathname === link.href ? "active" : ""}
                onClick={() => setIsOpen(false)}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
