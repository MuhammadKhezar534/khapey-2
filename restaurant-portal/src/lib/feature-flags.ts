import { Logger } from "./logger";

const logger = new Logger("FeatureFlags");

// Define feature flag types
export type NavigationFeatureFlag = {
  id: string;
  title: string;
  enabled: boolean;
  children?: NavigationFeatureFlag[];
};

export type TabFeatureFlag = {
  id: string;
  title: string;
  enabled: boolean;
};

export type FeatureFlagConfig = {
  navigation: Record<string, boolean>;
  tabs: Record<string, Record<string, boolean>>;
  features: Record<string, boolean>;
  permissions: Record<string, Record<string, boolean>>;
};

// Default configuration (fallback if API fails)
const DEFAULT_CONFIG: FeatureFlagConfig = {
  navigation: {
    dashboard: true,
    reviews: true,
    notification: true,
    discounts: true,
    reporting: true,
    payments: true,
    invite: true,
    settings: true,
  },
  tabs: {
    dashboard: {
      overview: true,
      branches: true,
      reviews: true,
      competition: true,
    },
    reporting: {
      discounts: true,
      sales: true,
    },
    discounts: {
      verify: true,
      manage: true,
    },
  },
  features: {
    OFFLINE_MODE: true,
    BACKGROUND_SYNC: true,
    ADVANCED_CACHING: true,
    PERFORMANCE_MONITORING: true,
    CACHE_ANALYTICS: true,
    VIRTUALIZED_LISTS: true,
    PREFETCHING: true,
    ENHANCED_ERROR_HANDLING: true,
  },
  permissions: {
    discounts: {
      create: true,
      edit: true,
      toggleStatus: true,
      delete: true,
    },
  },
};

// Current configuration
let currentConfig: FeatureFlagConfig = { ...DEFAULT_CONFIG };

// User-specific overrides (loaded from localStorage)
let userOverrides: Partial<FeatureFlagConfig> = {
  navigation: {},
  tabs: {},
  features: {},
  permissions: {},
};

// Check if a navigation item is enabled
export function isNavigationEnabled(itemId: string): boolean {
  // Check user overrides first
  if (
    userOverrides.navigation &&
    userOverrides.navigation[itemId] !== undefined
  ) {
    return userOverrides.navigation[itemId];
  }

  // Check current config
  return (
    currentConfig.navigation[itemId] ??
    DEFAULT_CONFIG.navigation[itemId] ??
    true
  );
}

// Check if a tab is enabled
export function isTabEnabled(pageId: string, tabId: string): boolean {
  // Check user overrides first
  if (
    userOverrides.tabs &&
    userOverrides.tabs[pageId] &&
    userOverrides.tabs[pageId][tabId] !== undefined
  ) {
    return userOverrides.tabs[pageId][tabId];
  }

  // Check current config
  return (
    (currentConfig.tabs[pageId] && currentConfig.tabs[pageId][tabId]) ??
    (DEFAULT_CONFIG.tabs[pageId] && DEFAULT_CONFIG.tabs[pageId][tabId]) ??
    true
  );
}

// Check if a feature is enabled
export function isFeatureEnabled(featureId: string): boolean {
  // Check user overrides first
  if (
    userOverrides.features &&
    userOverrides.features[featureId] !== undefined
  ) {
    return userOverrides.features[featureId];
  }

  // Check current config
  return (
    currentConfig.features[featureId] ??
    DEFAULT_CONFIG.features[featureId] ??
    false
  );
}

// Add a function to check permissions
export function hasPermission(section: string, action: string): boolean {
  // Check user overrides first
  if (
    userOverrides.permissions &&
    userOverrides.permissions[section] &&
    userOverrides.permissions[section][action] !== undefined
  ) {
    return userOverrides.permissions[section][action];
  }

  // Check current config
  return (
    (currentConfig.permissions[section] &&
      currentConfig.permissions[section][action]) ??
    (DEFAULT_CONFIG.permissions[section] &&
      DEFAULT_CONFIG.permissions[section][action]) ??
    false
  );
}

// Update the setFeatureOverride function to handle permissions
export function setFeatureOverride(
  type: "navigation" | "tabs" | "features" | "permissions",
  id: string,
  subId: string | null,
  enabled: boolean
): void {
  if (type === "tabs" && subId) {
    if (!userOverrides.tabs) userOverrides.tabs = {};
    if (!userOverrides.tabs[id]) userOverrides.tabs[id] = {};
    userOverrides.tabs[id][subId] = enabled;
  } else if (type === "navigation") {
    if (!userOverrides.navigation) userOverrides.navigation = {};
    userOverrides.navigation[id] = enabled;
  } else if (type === "features") {
    if (!userOverrides.features) userOverrides.features = {};
    userOverrides.features[id] = enabled;
  } else if (type === "permissions" && subId) {
    if (!userOverrides.permissions) userOverrides.permissions = {};
    if (!userOverrides.permissions[id]) userOverrides.permissions[id] = {};
    userOverrides.permissions[id][subId] = enabled;
  }

  // logger.info(
  //   `Feature override set: ${type}.${id}${
  //     subId ? `.${subId}` : ""
  //   } = ${enabled}`
  // );

  // Save to localStorage for persistence
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem("featureOverrides", JSON.stringify(userOverrides));
    } catch (error) {
      logger.error("Error saving feature override to localStorage", error);
    }
  }
}

// Reset all user-specific overrides
export function resetFeatureOverrides(): void {
  userOverrides = {
    navigation: {},
    tabs: {},
    features: {},
    permissions: {},
  };
  // logger.info("Feature overrides reset");

  // Clear from localStorage
  if (typeof window !== "undefined") {
    try {
      localStorage.removeItem("featureOverrides");
    } catch (error) {
      logger.error("Error clearing feature overrides from localStorage", error);
    }
  }
}

// Load user overrides from localStorage
export function loadFeatureOverrides(): void {
  if (typeof window !== "undefined") {
    try {
      const savedOverrides = localStorage.getItem("featureOverrides");
      if (savedOverrides) {
        userOverrides = JSON.parse(savedOverrides);
        // logger.info(
        //   "Loaded feature overrides from localStorage",
        //   userOverrides
        // );
      }
    } catch (error) {
      logger.error("Error loading feature overrides from localStorage", error);
    }
  }
}

// Fetch feature flags from API
export async function fetchFeatureFlags(): Promise<FeatureFlagConfig | null> {
  try {
    // logger.info("Fetching feature flags from API");
    const response = await fetch("/api/feature-flags");

    if (!response.ok) {
      throw new Error(`Failed to fetch feature flags: ${response.status}`);
    }

    const data = await response.json();
    // logger.info("Feature flags fetched successfully", data);
    return data;
  } catch (error) {
    logger.error("Error fetching feature flags", error);
    return null;
  }
}

// Update current configuration with API response
export async function updateFeatureFlags(): Promise<boolean> {
  const apiConfig = await fetchFeatureFlags();

  if (apiConfig) {
    currentConfig = {
      navigation: { ...DEFAULT_CONFIG.navigation, ...apiConfig.navigation },
      tabs: { ...DEFAULT_CONFIG.tabs, ...apiConfig.tabs },
      features: { ...DEFAULT_CONFIG.features, ...apiConfig.features },
      permissions: { ...DEFAULT_CONFIG.permissions, ...apiConfig.permissions },
    };
    // logger.info("Feature flags updated from API", currentConfig)
    return true;
  }

  logger.warn("Using default feature flags configuration");
  return false;
}

// Initialize feature flags
export async function initFeatureFlags(): Promise<void> {
  loadFeatureOverrides();
  await updateFeatureFlags();

  // logger.info("Feature flags initialized", {
  //   defaults: DEFAULT_CONFIG,
  //   current: currentConfig,
  //   overrides: userOverrides,
  // })
}

// Get all enabled navigation items
export function getEnabledNavigationItems(): string[] {
  return Object.keys(currentConfig.navigation).filter((id) =>
    isNavigationEnabled(id)
  );
}

// Get all enabled tabs for a page
export function getEnabledTabs(pageId: string): string[] {
  if (!currentConfig.tabs[pageId]) return [];
  return Object.keys(currentConfig.tabs[pageId]).filter((id) =>
    isTabEnabled(pageId, id)
  );
}
