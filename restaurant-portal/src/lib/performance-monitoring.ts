"use client";

import { Logger } from "./logger";

const logger = new Logger("Performance");

interface PerformanceMetrics {
  lcp: number | null; // Largest Contentful Paint
  fid: number | null; // First Input Delay
  cls: number | null; // Cumulative Layout Shift
  ttfb: number | null; // Time to First Byte
  fcp: number | null; // First Contentful Paint
  navigationTiming: NavigationTiming | null;
  resourceTiming: ResourceTiming[];
  memoryInfo: MemoryInfo | null;
}

interface NavigationTiming {
  dnsLookup: number;
  tcpConnect: number;
  tlsNegotiation: number;
  serverResponse: number;
  pageLoad: number;
  domInteractive: number;
  domComplete: number;
}

interface ResourceTiming {
  name: string;
  duration: number;
  transferSize: number;
  initiatorType: string;
}

interface MemoryInfo {
  jsHeapSizeLimit: number;
  totalJSHeapSize: number;
  usedJSHeapSize: number;
}

class PerformanceMonitoring {
  private metrics: PerformanceMetrics = {
    lcp: null,
    fid: null,
    cls: null,
    ttfb: null,
    fcp: null,
    navigationTiming: null,
    resourceTiming: [],
    memoryInfo: null,
  };

  private clsValue = 0;
  private clsEntries: PerformanceEntry[] = [];

  private observers: PerformanceObserver[] = [];

  constructor() {
    this.initMemoryInfo();
  }

  // Initialize performance monitoring
  public init(): void {
    if (typeof window === "undefined" || !("performance" in window)) {
      logger.warn("Performance API not supported");
      return;
    }

    // logger.info("Initializing performance monitoring");

    // Collect navigation timing metrics
    this.collectNavigationTiming();

    // Set up observers for Web Vitals
    this.observeLCP();
    this.observeFID();
    this.observeCLS();
    this.observeFCP();
    this.observeResourceTiming();

    // Set up periodic reporting
    this.schedulePeriodicReporting();
  }

  // Clean up observers
  public disconnect(): void {
    this.observers.forEach((observer) => observer.disconnect());
    this.observers = [];
  }

  // Get current metrics
  public getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  // Collect navigation timing metrics
  private collectNavigationTiming(): void {
    if (!performance || !performance.timing) return;

    // Wait for the page to load completely
    window.addEventListener("load", () => {
      // Use setTimeout to ensure timing data is available
      setTimeout(() => {
        const timing = performance.timing;

        this.metrics.navigationTiming = {
          dnsLookup: timing.domainLookupEnd - timing.domainLookupStart,
          tcpConnect: timing.connectEnd - timing.connectStart,
          tlsNegotiation:
            timing.secureConnectionStart > 0
              ? timing.connectEnd - timing.secureConnectionStart
              : 0,
          serverResponse: timing.responseStart - timing.requestStart,
          pageLoad: timing.loadEventEnd - timing.navigationStart,
          domInteractive: timing.domInteractive - timing.navigationStart,
          domComplete: timing.domComplete - timing.navigationStart,
        };

        this.metrics.ttfb = timing.responseStart - timing.navigationStart;

        logger.debug(
          "Navigation timing collected",
          this.metrics.navigationTiming
        );
      }, 0);
    });
  }

  // Observe Largest Contentful Paint
  private observeLCP(): void {
    if (!PerformanceObserver) return;

    try {
      const lcpObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        const lastEntry = entries[entries.length - 1];
        this.metrics.lcp = lastEntry.startTime;
        logger.debug(`LCP: ${this.metrics.lcp}ms`);
      });

      lcpObserver.observe({ type: "largest-contentful-paint", buffered: true });
      this.observers.push(lcpObserver);
    } catch (error) {
      logger.error("Error observing LCP", error);
    }
  }

  // Observe First Input Delay
  private observeFID(): void {
    if (!PerformanceObserver) return;

    try {
      const fidObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        const firstEntry = entries[0];
        if (firstEntry) {
          this.metrics.fid = firstEntry.processingStart - firstEntry.startTime;
          logger.debug(`FID: ${this.metrics.fid}ms`);
        }
      });

      fidObserver.observe({ type: "first-input", buffered: true });
      this.observers.push(fidObserver);
    } catch (error) {
      logger.error("Error observing FID", error);
    }
  }

  // Observe Cumulative Layout Shift
  private observeCLS(): void {
    if (!PerformanceObserver) return;

    try {
      let sessionValue = 0;
      let sessionEntries: PerformanceEntry[] = [];
      let sessionId = 0;

      const entryHandler = (entries: PerformanceEntry[]) => {
        entries.forEach((entry) => {
          // Only count layout shifts without recent user input
          if (!(entry as any).hadRecentInput) {
            const currentSessionId = sessionId;

            // If it's been > 1 second since the last entry, start a new session
            if (
              sessionEntries.length > 0 &&
              entry.startTime -
                sessionEntries[sessionEntries.length - 1].startTime >
                1000
            ) {
              // If this session has a higher CLS value, update the metrics
              if (sessionValue > (this.metrics.cls || 0)) {
                this.metrics.cls = sessionValue;
                this.clsValue = sessionValue;
                this.clsEntries = sessionEntries;
                logger.debug(`CLS updated: ${this.metrics.cls}`);
              }

              // Start a new session
              sessionValue = 0;
              sessionEntries = [];
              sessionId++;
            }

            // Only add the entry if it's part of the current session
            if (currentSessionId === sessionId) {
              sessionEntries.push(entry);
              sessionValue += (entry as any).value;
            }
          }
        });
      };

      const clsObserver = new PerformanceObserver((entryList) => {
        entryHandler(entryList.getEntries());
      });

      clsObserver.observe({ type: "layout-shift", buffered: true });
      this.observers.push(clsObserver);
    } catch (error) {
      logger.error("Error observing CLS", error);
    }
  }

  // Observe First Contentful Paint
  private observeFCP(): void {
    if (!PerformanceObserver) return;

    try {
      const fcpObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        const firstEntry = entries[0];
        if (firstEntry) {
          this.metrics.fcp = firstEntry.startTime;
          logger.debug(`FCP: ${this.metrics.fcp}ms`);
        }
      });

      fcpObserver.observe({ type: "paint", buffered: true });
      this.observers.push(fcpObserver);
    } catch (error) {
      logger.error("Error observing FCP", error);
    }
  }

  // Observe Resource Timing
  private observeResourceTiming(): void {
    if (!PerformanceObserver) return;

    try {
      const resourceObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();

        entries.forEach((entry) => {
          if (entry.entryType === "resource") {
            const resourceEntry = entry as PerformanceResourceTiming;

            this.metrics.resourceTiming.push({
              name: resourceEntry.name,
              duration: resourceEntry.duration,
              transferSize: resourceEntry.transferSize,
              initiatorType: resourceEntry.initiatorType,
            });
          }
        });
      });

      resourceObserver.observe({ type: "resource", buffered: true });
      this.observers.push(resourceObserver);
    } catch (error) {
      logger.error("Error observing resource timing", error);
    }
  }

  // Collect memory info if available
  private initMemoryInfo(): void {
    if (performance && (performance as any).memory) {
      const memoryInfo = (performance as any).memory;

      this.metrics.memoryInfo = {
        jsHeapSizeLimit: memoryInfo.jsHeapSizeLimit,
        totalJSHeapSize: memoryInfo.totalJSHeapSize,
        usedJSHeapSize: memoryInfo.usedJSHeapSize,
      };

      // Update memory info periodically
      setInterval(() => {
        if ((performance as any).memory) {
          const memoryInfo = (performance as any).memory;

          this.metrics.memoryInfo = {
            jsHeapSizeLimit: memoryInfo.jsHeapSizeLimit,
            totalJSHeapSize: memoryInfo.totalJSHeapSize,
            usedJSHeapSize: memoryInfo.usedJSHeapSize,
          };
        }
      }, 10000); // Every 10 seconds
    }
  }

  // Schedule periodic reporting of metrics
  private schedulePeriodicReporting(): void {
    // Report metrics after page load
    window.addEventListener("load", () => {
      setTimeout(() => {
        this.reportMetrics();
      }, 5000); // 5 seconds after load
    });

    // Report metrics periodically
    setInterval(() => {
      this.reportMetrics();
    }, 60000); // Every minute
  }

  // Report metrics to console and potentially to an analytics service
  private reportMetrics(): void {
    // logger.info("Performance metrics:", this.getMetrics());
    // Here you would send the metrics to your analytics service
    // Example:
    // sendToAnalytics(this.getMetrics())
  }
}

// Create and export a singleton instance
export const performanceMonitor = new PerformanceMonitoring();

// Initialize in client-side code
export function initPerformanceMonitoring(): void {
  if (typeof window !== "undefined") {
    performanceMonitor.init();
  }
}

export function reportPerformanceMetric(metricName: string, value: number) {
  if (typeof window !== "undefined" && "performance" in window) {
    // Report to analytics service
    console.log(`Performance metric: ${metricName} = ${value}ms`);

    // Store in performance entries
    performance.mark(metricName, { detail: { value } });
  }
}

export function measurePerformance<T>(fn: () => T, metricName: string): T {
  if (typeof window !== "undefined" && "performance" in window) {
    const startTime = performance.now();
    const result = fn();
    const endTime = performance.now();

    reportPerformanceMetric(metricName, endTime - startTime);
    return result;
  }

  return fn();
}

export async function measureAsyncPerformance<T>(
  fn: () => Promise<T>,
  metricName: string
): Promise<T> {
  if (typeof window !== "undefined" && "performance" in window) {
    const startTime = performance.now();
    try {
      const result = await fn();
      const endTime = performance.now();
      reportPerformanceMetric(metricName, endTime - startTime);
      return result;
    } catch (error) {
      const endTime = performance.now();
      reportPerformanceMetric(`${metricName}_error`, endTime - startTime);
      throw error;
    }
  }

  return fn();
}
