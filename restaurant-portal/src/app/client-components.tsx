"use client";

import dynamic from "next/dynamic";
import type { ComponentType } from "react";

async function loadComponent<T extends {}>(path: string) {
  const mod = await import(`@/components/${path}`);
  if (!mod.default) {
    throw new Error(`Component at ${path} has no default export`);
  }
  return mod.default as ComponentType<T>;
}

export const OfflineNotification = dynamic(
  () => loadComponent("ui/offline-notification"),
  { ssr: false }
);

export const ServiceWorkerRegistration = dynamic(
  () => loadComponent("service-worker-registration"),
  { ssr: false }
);
