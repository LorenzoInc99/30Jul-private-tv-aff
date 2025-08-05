'use client';

import { usePathname } from 'next/navigation';
import MainLayoutClient from './MainLayoutClient';

interface AdminWrapperProps {
  children: React.ReactNode;
  competitions: any[];
  header: React.ReactNode;
  footer: React.ReactNode;
}

export default function AdminWrapper({ children, competitions, header, footer }: AdminWrapperProps) {
  const pathname = usePathname();
  const isAdminPage = pathname === '/admin';

  if (isAdminPage) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        {children}
      </div>
    );
  }

  // Return the normal layout for non-admin pages
  return (
    <>
      {header}
      <MainLayoutClient competitions={competitions || []}>
        {children}
      </MainLayoutClient>
      {footer}
    </>
  );
} 