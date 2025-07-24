"use client";
import { usePathname } from "next/navigation";
import React from "react";

export default function FooterNavClient() {
  const pathname = usePathname();
  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/teams", label: "All Competitions" },
    { href: "/sitemap.xml", label: "Sitemap" },
  ];
  return (
    <nav aria-label="Main footer navigation">
      <h3 className="font-bold mb-2 text-gray-900 dark:text-white">Navigation</h3>
      <ul className="space-y-1">
        {navLinks.map(link => (
          <li key={link.href + link.label}>
            <a
              href={link.href}
              className="hover:underline"
              aria-current={pathname === link.href ? "page" : undefined}
            >
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
} 