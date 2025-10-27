/**
 * Pick specific properties from an object
 * @param obj The object to pick properties from
 * @param keys The keys to pick
 * @returns A new object with only the picked properties
 */
export function pick<T extends object, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
  return keys.reduce(
    (result, key) => {
      if (key in obj) {
        result[key] = obj[key]
      }

      return result
    },
    {} as Pick<T, K>,
  )
}

/**
 * Omit specific properties from an object
 * @param obj The object to omit properties from
 * @param keys The keys to omit
 * @returns A new object without the omitted properties
 */
export function omit<T extends object, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> {
  const result = { ...obj }

  keys.forEach((key) => {
    delete result[key]
  })

  return result as Omit<T, K>
}

/**
 * Deep clone an object
 * @param obj The object to clone
 * @returns A deep clone of the object
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== "object") {
    return obj
  }

  if (Array.isArray(obj)) {
    return obj.map(deepClone) as unknown as T
  }

  return Object.keys(obj).reduce((result, key) => {
    result[key as keyof T] = deepClone(obj[key as keyof T])

    return result
  }, {} as T)
}

/**
 * Check if an object is empty
 * @param obj The object to check
 * @returns Whether the object is empty
 */
export function isEmpty(obj: object): boolean {
  return Object.keys(obj).length === 0
}

/**
 * Merge two objects deeply
 * @param target The target object
 * @param source The source object
 * @returns The merged object
 */
export function deepMerge<T extends object, U extends object>(target: T, source: U): T & U {
  const result = { ...target } as T & U

  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach((key) => {
      const sourceKey = key as keyof U
      const targetKey = key as keyof T

      if (isObject(source[sourceKey]) && targetKey in target) {
        if (isObject(target[targetKey])) {
          result[sourceKey] = deepMerge(target[targetKey] as object, source[sourceKey] as object) as any
        } else {
          result[sourceKey] = source[sourceKey]
        }
      } else {
        result[sourceKey] = source[sourceKey]
      }
    })
  }

  return result
}

/**
 * Check if a value is an object
 * @param value The value to check
 * @returns Whether the value is an object
 */
function isObject(value: any): value is object {
  return value !== null && typeof value === "object" && !Array.isArray(value)
}

/**
 * Flatten an object
 * @param obj The object to flatten
 * @param prefix The prefix for the keys
 * @returns The flattened object
 */
export function flattenObject(obj: Record<string, any>, prefix = ""): Record<string, any> {
  return Object.keys(obj).reduce(
    (result, key) => {
      const prefixedKey = prefix ? `${prefix}.${key}` : key

      if (isObject(obj[key])) {
        Object.assign(result, flattenObject(obj[key], prefixedKey))
      } else {
        result[prefixedKey] = obj[key]
      }

      return result
    },
    {} as Record<string, any>,
  )
}

/**
 * Unflatten an object
 * @param obj The object to unflatten
 * @returns The unflattened object
 */
export function unflattenObject(obj: Record<string, any>): Record<string, any> {
  const result: Record<string, any> = {}

  Object.keys(obj).forEach((key) => {
    const parts = key.split(".")
    let current = result

    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i]

      if (!(part in current)) {
        current[part] = {}
      }

      current = current[part]
    }

    current[parts[parts.length - 1]] = obj[key]
  })

  return result
}

/**
 * Transform an object's keys
 * @param obj The object to transform
 * @param transform The transform function
 * @returns The transformed object
 */
export function transformKeys<T extends Record<string, any>>(
  obj: T,
  transform: (key: string) => string,
): Record<string, any> {
  return Object.keys(obj).reduce(
    (result, key) => {
      const transformedKey = transform(key)

      result[transformedKey] = obj[key]

      return result
    },
    {} as Record<string, any>,
  )
}

/**
 * Transform an object's values
 * @param obj The object to transform
 * @param transform The transform function
 * @returns The transformed object
 */
export function transformValues<T extends Record<string, any>, U>(
  obj: T,
  transform: (value: any, key: string) => U,
): Record<string, U> {
  return Object.keys(obj).reduce(
    (result, key) => {
      result[key] = transform(obj[key], key)

      return result
    },
    {} as Record<string, U>,
  )
}
