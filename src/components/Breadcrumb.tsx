"use client";
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

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
    <nav className={`flex items-center space-x-1 text-xs md:text-sm text-gray-600 dark:text-gray-400 overflow-hidden ${className}`}>
      {items.map((item, index) => (
        <div key={index} className="flex items-center flex-shrink-0 min-w-0">
          {index > 0 && (
            <ChevronRight className="w-3 h-3 md:w-4 md:h-4 text-gray-400 dark:text-gray-500 mx-1 flex-shrink-0" />
          )}
          {index === 0 && item.label === 'Home' && (
            <Home className="w-3 h-3 md:w-4 md:h-4 mr-1 flex-shrink-0" />
          )}
          {item.href && !item.isActive ? (
            <Link 
              href={item.href}
              className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors duration-200 cursor-pointer truncate max-w-[120px] md:max-w-none"
              title={item.label}
            >
              {item.label}
            </Link>
          ) : (
            <span 
              className={`truncate max-w-[120px] md:max-w-none ${item.isActive ? 'text-gray-900 dark:text-white font-medium' : 'text-gray-600 dark:text-gray-400'}`}
              title={item.label}
            >
              {item.label}
            </span>
          )}
        </div>
      ))}
    </nav>
  );
}
