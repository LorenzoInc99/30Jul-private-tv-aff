"use client";
import Link from 'next/link';
import { generateBreadcrumbStructuredData, BreadcrumbItem } from '../lib/structuredData';

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  const structuredData = generateBreadcrumbStructuredData(items);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <nav className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 mt-2 mb-3">
        {items.map((item, index) => (
          <div key={index} className="flex items-center">
            {index > 0 && (
              <svg
                className="w-4 h-4 mx-2 text-gray-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            )}
            {index === items.length - 1 ? (
              <span className="text-gray-900 dark:text-white font-medium">
                {item.name}
              </span>
            ) : (
              <Link
                href={item.url}
                className="text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              >
                {item.name}
              </Link>
            )}
          </div>
        ))}
      </nav>
    </>
  );
} 