"use client";

import { RedirectPage } from "@/components/redirect-page";
import useAuthenticated from "@/hooks/useAuthenticate";

export default async function DashboardPage() {
  const { isAuthenticated } = useAuthenticated();

  console.log("isAuthenticated", isAuthenticated);
  if (isAuthenticated) {
    return <RedirectPage to="/dashboard" message="Loading dashboard..." />;
  }

  return <RedirectPage to="/login" message="Loading dashboard..." />;
}
