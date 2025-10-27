"use client";

import * as React from "react";
import type { ReactNode } from "react";
import { useState, useEffect, useRef } from "react";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileNavigation } from "@/components/layout/mobile-navigation";
import { NavigationProvider } from "@/contexts/navigation-context";
import { usePathname, useRouter } from "next/navigation";
// Import the BranchProvider
import { BranchProvider } from "@/contexts/branch-context";
import { applyBrowserFixes } from "@/utils/browser-detection";
// Add the useRefresh hook import
import { useRefresh } from "@/hooks/use-refresh";

// Helper function to conditionally join class names
function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

// Memoize the MainLayoutContent component to prevent unnecessary re-renders
const MainLayoutContent = React.memo(function MainLayoutContent({
  children,
}: {
  children: ReactNode;
}) {
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const mainRef = useRef<HTMLElement>(null);
  const [debugMode, setDebugMode] = useState(false);

  // Memoize sidebar width calculation
  const sidebarWidth = React.useMemo(() => {
    return sidebarExpanded ? "16rem" : "4.5rem";
  }, [sidebarExpanded]);

  const pathname = usePathname();
  const router = useRouter();

  // Replace the existing refreshData function with:
  const { refresh } = useRefresh({
    onRefresh: async () => {
      console.log("MainLayout: Refresh triggered");
      // Create and dispatch a custom event that components can listen for
      const refreshEvent = new CustomEvent("app:refresh", {
        detail: { manual: true },
      });
      window.dispatchEvent(refreshEvent);
      console.log("MainLayout: Refresh event dispatched");

      // Give components a moment to respond to the event
      await new Promise((resolve) => setTimeout(resolve, 500));
      console.log("MainLayout: Refresh timeout completed");
    },
    showToast: false, // Don't show toasts from here, let the Header handle it
  });

  // Update the refreshData reference to use our new refresh function
  const refreshData = async () => {
    return refresh(true); // true = manual refresh
  };

  // Check if we're on the menu page
  const isMenuPage = pathname === "/menu";

  // Handle resize events to detect mobile/desktop transitions
  useEffect(() => {
    const checkIfMobile = () => {
      const wasMobile = isMobile;
      const newIsMobile = window.innerWidth < 768;
      setIsMobile(newIsMobile);

      // If transitioning from mobile to desktop while on menu page, redirect to dashboard
      if (wasMobile && !newIsMobile && isMenuPage) {
        router.push("/dashboard");
      }
    };

    // Initial check
    checkIfMobile();

    // Add event listener
    window.addEventListener("resize", checkIfMobile);

    // Clean up
    return () => {
      window.removeEventListener("resize", checkIfMobile);
    };
  }, [isMobile, isMenuPage, router]);

  // Load sidebar expanded state from localStorage on initial render
  useEffect(() => {
    const savedExpanded = localStorage.getItem("sidebar-expanded");
    if (savedExpanded !== null) {
      setSidebarExpanded(savedExpanded === "true");
    }

    // Update CSS variable for sidebar width
    document.documentElement.style.setProperty(
      "--sidebar-width",
      sidebarExpanded ? "16rem" : "4.5rem"
    );
    document.documentElement.setAttribute(
      "data-sidebar-collapsed",
      sidebarExpanded ? "false" : "true"
    );
  }, [sidebarExpanded]);

  useEffect(() => {
    // Safety check to ensure pointer events are always reset
    const resetPointerEvents = () => {
      document.body.style.pointerEvents = "auto";
    };

    // Reset on mount
    resetPointerEvents();

    // Add event listeners for drawer open/close
    document.addEventListener("pointerdown", resetPointerEvents);

    return () => {
      document.removeEventListener("pointerdown", resetPointerEvents);
      resetPointerEvents();
    };
  }, []);

  // Apply browser-specific fixes
  useEffect(() => {
    applyBrowserFixes();
  }, []);

  // Debug mode toggle with keyboard shortcut (Ctrl+Shift+D)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === "D") {
        setDebugMode((prev) => !prev);
        document.body.classList.toggle("debug-layout");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // If we're on the menu page, render only the children
  if (isMenuPage) {
    return <>{children}</>;
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen w-full overflow-hidden">
      {/* Desktop Sidebar */}
      <div
        className="hidden md:block h-screen flex-shrink-0 fixed left-0 top-0 z-50"
        style={{ width: sidebarWidth }}
      >
        <Sidebar
          expanded={sidebarExpanded}
          onExpandToggle={setSidebarExpanded}
          data-sidebar
        />
      </div>

      {/* Main Content Container */}
      <div className="flex flex-col flex-1 w-full min-w-0 overflow-hidden md:ml-[var(--sidebar-width)]">
        <Header refreshData={refreshData} />
        <main
          ref={mainRef}
          className="content-padding flex-1 w-full overflow-y-auto overflow-x-hidden hide-scrollbar bg-gray-50 pb-16 pt-16 md:pb-8"
          style={{
            msOverflowStyle: "none",
            scrollbarWidth: "none",
            WebkitOverflowScrolling: "touch",
            overflow: "auto",
            boxSizing: "border-box",
            maxWidth: "100%",
          }}
        >
          {/* Debug info */}
          {debugMode && (
            <div className="fixed bottom-20 right-4 bg-black text-white p-2 z-50 text-xs">
              <div>Main width: {mainRef.current?.offsetWidth}px</div>
              <div>
                Padding:{" "}
                {getComputedStyle(document.documentElement).getPropertyValue(
                  "--content-padding"
                )}
              </div>
              <div>Window width: {window.innerWidth}px</div>
            </div>
          )}
          {children}
        </main>
        <MobileNavigation />
      </div>
    </div>
  );
});

// Update the MainLayout component to use the BranchProvider
export function MainLayout({ children }: { children: ReactNode }) {
  return (
    <NavigationProvider>
      <BranchProvider>
        <MainLayoutContent>{children}</MainLayoutContent>
      </BranchProvider>
    </NavigationProvider>
  );
}
