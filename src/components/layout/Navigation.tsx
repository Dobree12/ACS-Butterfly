"use client";

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
  const navLinks = user
    ? [...baseLinks, { href: "/profile", label: "Profil" }]
    : [...baseLinks, { href: "/auth", label: "Autentificare" }];

  return (
    <nav>
      <div className="nav-container">
        <div className="logo">ACS Butterfly</div>
        <ul className="nav-links">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={pathname === link.href ? "active" : ""}
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
