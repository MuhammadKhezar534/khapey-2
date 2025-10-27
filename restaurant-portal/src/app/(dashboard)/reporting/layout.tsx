"use client";

import type React from "react";

import { ReportTabsHeader } from "@/components/reporting/report-tabs-header";
import { useIsMobile } from "@/hooks/use-mobile";

export default function ReportingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isMobile = useIsMobile();

  // Add debugging to see what's being rendered
  console.log("Reporting layout rendering with children:", children);

  return (
    <div className="flex flex-col w-full">
      <ReportTabsHeader isMobile={isMobile} />
      <div className="mt-12 w-full">{children}</div>
    </div>
  );
}
