"use client";
import { usePathname } from "next/navigation";
import SidebarCompetitions from "./SidebarCompetitions";
import React, { useEffect, useState } from "react";

export default function MainLayoutClient({ competitions, children }: { competitions: any[]; children: React.ReactNode }) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const hideSidebarRoutes = ["/about", "/contact", "/privacy-policy", "/terms-of-service"];
  const shouldShowSidebar = mounted && !hideSidebarRoutes.includes(pathname);

  return (
    <div className="w-full md:flex md:justify-center min-h-screen">
      <div className="flex w-full min-h-screen">
        {/* Sidebar - hidden on mobile, visible on desktop */}
        {shouldShowSidebar && (
          <div className="hidden md:block">
            <SidebarCompetitions competitions={competitions} />
          </div>
        )}
        {/* Main content - full width on mobile, flex-1 on desktop */}
        <main role="main" className="flex-1 min-w-0 w-full md:w-auto">{children}</main>
      </div>
    </div>
  );
} 