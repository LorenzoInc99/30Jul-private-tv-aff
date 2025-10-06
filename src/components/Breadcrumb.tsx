"use client";
import Link from 'next/link';

interface BreadcrumbItem {
  label: string;
  href?: string;
  isActive?: boolean;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export default function Breadcrumb({ items, className = "" }: BreadcrumbProps) {
  return (
    <nav className={`flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 overflow-hidden ${className}`}>
      {items.map((item, index) => (
        <div key={index} className="flex items-center flex-shrink-0 min-w-0">
          {index > 0 && (
            <span className="text-gray-400 dark:text-gray-500 mx-2 flex-shrink-0">{'>'}</span>
          )}
          {item.href && !item.isActive ? (
            <Link 
              href={item.href}
              className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors duration-200 cursor-pointer truncate"
            >
              {item.label}
            </Link>
          ) : (
            <span className={`truncate ${item.isActive ? 'text-gray-900 dark:text-white font-medium' : 'text-gray-600 dark:text-gray-400'}`}>
              {item.label}
            </span>
          )}
        </div>
      ))}
    </nav>
  );
}
