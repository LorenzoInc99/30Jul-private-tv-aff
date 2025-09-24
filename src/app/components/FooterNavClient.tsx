"use client";
import { usePathname } from "next/navigation";
import React from "react";

export default function FooterNavClient() {
  const pathname = usePathname();
  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/sitemap.xml", label: "Sitemap" },
  ];
  return (
    <nav aria-label="Main footer navigation">
      <h3 className="font-bold mb-2 text-white">Navigation</h3>
      <ul className="space-y-1">
        {navLinks.map(link => (
          <li key={link.href + link.label}>
            <a
              href={link.href}
              className="hover:underline text-white hover:text-blue-100"
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