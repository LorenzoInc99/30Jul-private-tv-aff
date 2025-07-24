"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function MobileCompetitionsMenu({ competitions }: { competitions: { id: number|string; name: string }[] }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  function slugify(name: string) {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  }

  return (
    <>
      <button
        className="p-2 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
        aria-label="Open competitions menu"
        onClick={() => setOpen(true)}
      >
        {/* Hamburger icon */}
        <svg className="w-7 h-7 text-gray-900 dark:text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
      {open && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex justify-end" onClick={() => setOpen(false)}>
          <nav
            className="w-64 h-full bg-white dark:bg-gray-900 shadow-lg p-6 overflow-y-auto"
            aria-label="Competitions menu"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <span className="text-lg font-bold text-gray-900 dark:text-white">Competitions</span>
              <button onClick={() => setOpen(false)} aria-label="Close menu" className="p-1">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <ul className="space-y-3">
              {competitions.map(comp => (
                <li key={comp.id}>
                  <a
                    href={`/competition/${comp.id}-${slugify(comp.name)}`}
                    className="block text-gray-800 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400 text-base font-medium py-1"
                    onClick={() => setOpen(false)}
                  >
                    {comp.name}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      )}
    </>
  );
} 