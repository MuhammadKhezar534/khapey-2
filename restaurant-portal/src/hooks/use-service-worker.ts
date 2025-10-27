"use client";

import { useState, useEffect } from "react";
import { toast } from "@/components/ui/use-toast";

export function useServiceWorker() {
  const [registration, setRegistration] =
    useState<ServiceWorkerRegistration | null>(null);
  const [waitingServiceWorker, setWaitingServiceWorker] =
    useState<ServiceWorker | null>(null);
  const [isUpdateAvailable, setIsUpdateAvailable] = useState(false);

  useEffect(() => {
    // Only register service worker in production and if the browser supports it
    if (
      process.env.NODE_ENV !== "production" ||
      !("serviceWorker" in navigator)
    ) {
      return;
    }

    const registerServiceWorker = async () => {
      try {
        const reg = await navigator.serviceWorker.register(
          "/service-worker.js"
        );
        setRegistration(reg);

        // Initial check for waiting service worker
        if (reg.waiting) {
          setWaitingServiceWorker(reg.waiting);
          setIsUpdateAvailable(true);
        }

        // When a new service worker is found
        reg.addEventListener("updatefound", () => {
          const newWorker = reg.installing;
          if (!newWorker) return;

          newWorker.addEventListener("statechange", () => {
            if (
              newWorker.state === "installed" &&
              navigator.serviceWorker.controller
            ) {
              setWaitingServiceWorker(newWorker);
              setIsUpdateAvailable(true);

              toast({
                title: "App update available",
                description: "Refresh the page to use the latest version",
                action: (
                  <button
                    onClick={() => updateServiceWorker()}
                    className="bg-primary text-primary-foreground px-3 py-1 rounded-md text-sm"
                  >
                    Update now
                  </button>
                ),
                duration: 10000,
              });
            }
          });
        });

        // Detect controller change
        let refreshing = false;
        navigator.serviceWorker.addEventListener("controllerchange", () => {
          if (refreshing) return;
          refreshing = true;
          window.location.reload();
        });
      } catch (error) {
        console.error("Service worker registration failed:", error);
      }
    };

    registerServiceWorker();

    return () => {
      if (registration) {
        registration.removeEventListener("updatefound", () => {});
      }
    };
  }, []);

  // Function to update the service worker
  const updateServiceWorker = () => {
    if (!waitingServiceWorker) return;

    waitingServiceWorker.postMessage({ type: "SKIP_WAITING" });
  };

  return {
    isUpdateAvailable,
    updateServiceWorker,
  };
}
