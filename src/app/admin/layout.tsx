import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin Dashboard - Football Data Management',
  description: 'Admin dashboard for managing football data pipeline',
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {children}
    </div>
  );
} 