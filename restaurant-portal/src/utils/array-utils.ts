/**
 * Group an array of objects by a key
 * @param array The array to group
 * @param key The key to group by
 * @returns An object with keys as the grouped values and values as arrays of objects
 */
export function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
  return array.reduce(
    (result, item) => {
      const groupKey = String(item[key])

      if (!result[groupKey]) {
        result[groupKey] = []
      }

      result[groupKey].push(item)

      return result
    },
    {} as Record<string, T[]>,
  )
}

/**
 * Sort an array of objects by a key
 * @param array The array to sort
 * @param key The key to sort by
 * @param direction The sort direction (default: 'asc')
 * @returns The sorted array
 */
export function sortBy<T>(array: T[], key: keyof T, direction: "asc" | "desc" = "asc"): T[] {
  return [...array].sort((a, b) => {
    const valueA = a[key]
    const valueB = b[key]

    if (valueA === valueB) return 0

    if (valueA === null || valueA === undefined) return direction === "asc" ? -1 : 1
    if (valueB === null || valueB === undefined) return direction === "asc" ? 1 : -1

    if (typeof valueA === "string" && typeof valueB === "string") {
      return direction === "asc" ? valueA.localeCompare(valueB) : valueB.localeCompare(valueA)
    }

    return direction === "asc" ? (valueA as any) - (valueB as any) : (valueB as any) - (valueA as any)
  })
}

/**
 * Remove duplicates from an array
 * @param array The array to remove duplicates from
 * @param key The key to use for comparison (optional)
 * @returns The array without duplicates
 */
export function removeDuplicates<T>(array: T[], key?: keyof T): T[] {
  if (!key) {
    return [...new Set(array)]
  }

  const seen = new Set()

  return array.filter((item) => {
    const value = item[key]

    if (seen.has(value)) {
      return false
    }

    seen.add(value)

    return true
  })
}

/**
 * Chunk an array into smaller arrays
 * @param array The array to chunk
 * @param size The size of each chunk
 * @returns An array of chunks
 */
export function chunkArray<T>(array: T[], size: number): T[][] {
  const result = []

  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size))
  }

  return result
}

/**
 * Find the intersection of two arrays
 * @param array1 The first array
 * @param array2 The second array
 * @returns The intersection of the two arrays
 */
export function intersection<T>(array1: T[], array2: T[]): T[] {
  return array1.filter((item) => array2.includes(item))
}

/**
 * Find the difference between two arrays
 * @param array1 The first array
 * @param array2 The second array
 * @returns The difference between the two arrays
 */
export function difference<T>(array1: T[], array2: T[]): T[] {
  return array1.filter((item) => !array2.includes(item))
}

/**
 * Flatten an array of arrays
 * @param arrays The arrays to flatten
 * @returns The flattened array
 */
export function flatten<T>(arrays: T[][]): T[] {
  return arrays.reduce((result, array) => [...result, ...array], [] as T[])
}

/**
 * Shuffle an array
 * @param array The array to shuffle
 * @returns The shuffled array
 */
export function shuffle<T>(array: T[]): T[] {
  const result = [...array]

  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }

  return result
}

/**
 * Get a random item from an array
 * @param array The array to get a random item from
 * @returns A random item from the array
 */
export function getRandomItem<T>(array: T[]): T | undefined {
  if (array.length === 0) return undefined

  const index = Math.floor(Math.random() * array.length)

  return array[index]
}

/**
 * Sum an array of numbers
 * @param array The array to sum
 * @returns The sum of the array
 */
export function sum(array: number[]): number {
  return array.reduce((result, item) => result + item, 0)
}

/**
 * Calculate the average of an array of numbers
 * @param array The array to calculate the average of
 * @returns The average of the array
 */
export function average(array: number[]): number {
  if (array.length === 0) return 0

  return sum(array) / array.length
}

/**
 * Find the minimum value in an array of numbers
 * @param array The array to find the minimum value in
 * @returns The minimum value in the array
 */
export function min(array: number[]): number {
  if (array.length === 0) return 0

  return Math.min(...array)
}

/**
 * Find the maximum value in an array of numbers
 * @param array The array to find the maximum value in
 * @returns The maximum value in the array
 */
export function max(array: number[]): number {
  if (array.length === 0) return 0

  return Math.max(...array)
}
