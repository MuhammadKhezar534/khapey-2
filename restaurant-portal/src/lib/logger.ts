// Define log levels
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  NONE = 4,
}

// Logger configuration
interface LoggerConfig {
  minLevel: LogLevel;
  enableConsole: boolean;
  enableRemote: boolean;
  remoteUrl?: string;
  batchSize?: number;
  flushInterval?: number;
}

// Default configuration
const DEFAULT_CONFIG: LoggerConfig = {
  minLevel:
    process.env.NODE_ENV === "production" ? LogLevel.INFO : LogLevel.DEBUG,
  enableConsole: true,
  enableRemote: process.env.NODE_ENV === "production",
  batchSize: 10,
  flushInterval: 30000, // 30 seconds
};

// Log entry structure
interface LogEntry {
  timestamp: string;
  level: string;
  module: string;
  message: string;
  data?: any;
  error?: Error;
  userId?: string;
  sessionId?: string;
  url?: string;
}

// Queue for batched logs
let logQueue: LogEntry[] = [];
let flushTimer: NodeJS.Timeout | null = null;

// Global configuration
let globalConfig: LoggerConfig = { ...DEFAULT_CONFIG };

// Set global logger configuration
export function configureLogger(config: Partial<LoggerConfig>): void {
  globalConfig = { ...globalConfig, ...config };

  // Clear existing timer if any
  if (flushTimer) {
    clearInterval(flushTimer);
    flushTimer = null;
  }

  // Set up new timer if remote logging is enabled
  if (globalConfig.enableRemote && globalConfig.flushInterval) {
    flushTimer = setInterval(() => {
      flushLogs();
    }, globalConfig.flushInterval);
  }
}

// Flush logs to remote server
async function flushLogs(): Promise<void> {
  if (!globalConfig.enableRemote || logQueue.length === 0) return;

  const logs = [...logQueue];
  logQueue = [];

  if (globalConfig.remoteUrl) {
    try {
      await fetch(globalConfig.remoteUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ logs }),
      });
    } catch (error) {
      // If sending fails, add back to queue
      logQueue = [...logs, ...logQueue];

      // But cap the queue size to prevent memory issues
      if (logQueue.length > 1000) {
        logQueue = logQueue.slice(-1000);
      }

      // Log to console as fallback
      if (globalConfig.enableConsole) {
        console.error("Failed to send logs to remote server", error);
      }
    }
  }
}

export class Logger {
  private context: string;

  constructor(context: string) {
    this.context = context;
  }

  info(message: string, ...args: any[]) {
    // console.log(`[${this.context}] INFO:`, message, ...args);
  }

  warn(message: string, ...args: any[]) {
    // console.warn(`[${this.context}] WARNING:`, message, ...args);
  }

  error(message: string, ...args: any[]) {
    // console.error(`[${this.context}] ERROR:`, message, ...args);

    // In production, you might want to send this to an error tracking service
    if (process.env.NODE_ENV === "production") {
      // Send to error tracking service
    }
  }

  debug(message: string, ...args: any[]) {
    if (process.env.NODE_ENV !== "production") {
      console.debug(`[${this.context}] DEBUG:`, message, ...args);
    }
  }
}

// Initialize logger
export function initLogger(): void {
  // Generate a session ID if not already present
  if (typeof window !== "undefined" && !localStorage.getItem("sessionId")) {
    localStorage.setItem("sessionId", generateUniqueId());
  }

  // Set up flush timer
  if (globalConfig.enableRemote && globalConfig.flushInterval) {
    flushTimer = setInterval(() => {
      flushLogs();
    }, globalConfig.flushInterval);
  }
}

// Generate a unique ID for session tracking
function generateUniqueId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

// Flush logs on page unload
if (typeof window !== "undefined") {
  window.addEventListener("beforeunload", () => {
    if (logQueue.length > 0) {
      flushLogs();
    }
  });
}
