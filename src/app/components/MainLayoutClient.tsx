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
      <div className="flex w-full">
        {shouldShowSidebar && <SidebarCompetitions competitions={competitions} />}
        <main role="main" className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
} 