"use client";

import { useCallback } from "react";
import {
  addToSyncQueue,
  getSyncItemsByTag,
  removeFromSyncQueue,
} from "@/lib/indexed-db";
import { useNetworkStatus } from "./use-network-status";
import { toast } from "@/components/ui/use-toast";
import { Logger } from "@/lib/logger";

const logger = new Logger("BackgroundSync");

interface SyncOptions {
  tag: string;
  url: string;
  method: string;
  body?: any;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export function useBackgroundSync() {
  const { isOnline } = useNetworkStatus();

  // Register a sync operation
  const registerSync = useCallback(
    async ({ tag, url, method, body, onSuccess, onError }: SyncOptions) => {
      try {
        // If online, try to perform the operation immediately
        if (isOnline) {
          try {
            const response = await fetch(url, {
              method,
              headers: {
                "Content-Type": "application/json",
              },
              body: body ? JSON.stringify(body) : undefined,
            });

            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }

            // logger.info(`Sync operation completed successfully: ${tag}`);
            onSuccess?.();
            return true;
          } catch (error) {
            logger.error(`Error performing sync operation: ${tag}`, error);
            // If the operation fails, queue it for later
            await queueSyncOperation({ tag, url, method, body });
            onError?.(error as Error);
            return false;
          }
        } else {
          // If offline, queue the operation for later
          await queueSyncOperation({ tag, url, method, body });
          toast({
            title: "Offline mode",
            description: "Your changes will be saved when you're back online.",
            duration: 3000,
          });
          return false;
        }
      } catch (error) {
        logger.error(`Error in registerSync: ${tag}`, error);
        onError?.(error as Error);
        return false;
      }
    },
    [isOnline]
  );

  // Queue a sync operation in IndexedDB
  const queueSyncOperation = useCallback(
    async ({
      tag,
      url,
      method,
      body,
    }: Omit<SyncOptions, "onSuccess" | "onError">) => {
      try {
        await addToSyncQueue({
          tag,
          url,
          method,
          body,
          timestamp: Date.now(),
        });

        // Register with the Sync Manager if available
        if ("serviceWorker" in navigator && "SyncManager" in window) {
          const registration = await navigator.serviceWorker.ready;
          await registration?.sync.register(tag);
          // logger.info(`Registered sync tag: ${tag}`);
        }

        return true;
      } catch (error) {
        logger.error(`Error queueing sync operation: ${tag}`, error);
        return false;
      }
    },
    []
  );

  // Process all pending sync operations for a specific tag
  const processPendingSyncs = useCallback(
    async (tag: string) => {
      if (!isOnline) return false;

      try {
        const pendingSyncs = await getSyncItemsByTag(tag);
        // logger.info(`Processing ${pendingSyncs.length} pending syncs for tag: ${tag}`)

        let successCount = 0;
        for (const sync of pendingSyncs) {
          try {
            const response = await fetch(sync.url, {
              method: sync.method,
              headers: {
                "Content-Type": "application/json",
              },
              body: sync.body ? JSON.stringify(sync.body) : undefined,
            });

            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }

            // Remove the successful sync from the queue
            await removeFromSyncQueue(sync.id);
            successCount++;
          } catch (error) {
            logger.error(`Error processing sync: ${sync.id}`, error);
            // Leave failed syncs in the queue to try again later
          }
        }

        if (successCount > 0 && successCount === pendingSyncs.length) {
          toast({
            title: "Sync complete",
            description: `Successfully synchronized ${successCount} pending changes.`,
            duration: 3000,
          });
          return true;
        } else if (successCount > 0) {
          toast({
            title: "Partial sync",
            description: `Synchronized ${successCount} of ${pendingSyncs.length} pending changes.`,
            duration: 3000,
          });
          return false;
        }

        return false;
      } catch (error) {
        logger.error(`Error processing pending syncs for tag: ${tag}`, error);
        return false;
      }
    },
    [isOnline]
  );

  return {
    registerSync,
    processPendingSyncs,
    isOnline,
  };
}
