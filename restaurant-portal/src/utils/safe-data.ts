/**
 * Safely access nested properties in objects without throwing errors
 * @param obj The object to access
 * @param path The path to the property, using dot notation
 * @param defaultValue The default value to return if the property doesn't exist
 */
export function safeGet<T>(obj: any, path: string, defaultValue: T): T {
  try {
    const keys = path.split(".");
    let result = obj;

    for (const key of keys) {
      if (result === undefined || result === null) {
        return defaultValue;
      }
      result = result[key];
    }

    return result === undefined || result === null ? defaultValue : result;
  } catch (error) {
    console.error(`Error accessing path ${path}:`, error);
    return defaultValue;
  }
}

/**
 * Safely parse JSON without throwing errors
 * @param json The JSON string to parse
 * @param defaultValue The default value to return if parsing fails
 */
export function safeParseJSON<T>(json: string, defaultValue: T): T {
  try {
    return JSON.parse(json) as T;
  } catch (error) {
    console.error("Error parsing JSON:", error);
    return defaultValue;
  }
}

/**
 * Safely stringify an object without throwing errors
 * @param obj The object to stringify
 * @param defaultValue The default value to return if stringification fails
 */
export function safeStringifyJSON(obj: any, defaultValue = "{}"): string {
  try {
    return JSON.stringify(obj);
  } catch (error) {
    console.error("Error stringifying object:", error);
    return defaultValue;
  }
}

/**
 * Safely call a function without throwing errors
 * @param fn The function to call
 * @param defaultValue The default value to return if the function throws
 * @param args The arguments to pass to the function
 */
export function safeCall<T>(
  fn: (...args: any[]) => T,
  defaultValue: T,
  ...args: any[]
): T {
  try {
    return fn(...args);
  } catch (error) {
    console.error("Error calling function:", error);
    return defaultValue;
  }
}
