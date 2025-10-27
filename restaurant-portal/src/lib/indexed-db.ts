// Database configuration
const DB_NAME = "KhapeyDB"
const DB_VERSION = 1

// Object store names
export const STORES = {
  DASHBOARD: "dashboardData",
  REVIEWS: "reviewsData",
  DISCOUNTS: "discountsData",
  SYNC_QUEUE: "syncQueue",
}

// Initialize the database
export async function initializeDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onupgradeneeded = (event) => {
      const db = request.result

      // Create object stores for different data types
      if (!db.objectStoreNames.contains(STORES.DASHBOARD)) {
        db.createObjectStore(STORES.DASHBOARD, { keyPath: "id" })
      }

      if (!db.objectStoreNames.contains(STORES.REVIEWS)) {
        db.createObjectStore(STORES.REVIEWS, { keyPath: "id" })
      }

      if (!db.objectStoreNames.contains(STORES.DISCOUNTS)) {
        db.createObjectStore(STORES.DISCOUNTS, { keyPath: "id" })
      }

      // Create a store for sync operations
      if (!db.objectStoreNames.contains(STORES.SYNC_QUEUE)) {
        const syncStore = db.createObjectStore(STORES.SYNC_QUEUE, {
          keyPath: "id",
          autoIncrement: true,
        })
        // Create an index for the sync tag
        syncStore.createIndex("tag", "tag", { unique: false })
      }
    }

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

// Generic function to store data
export async function storeData<T>(storeName: string, data: T): Promise<void> {
  const db = await initializeDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, "readwrite")
    const store = transaction.objectStore(storeName)
    const request = store.put(data)

    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
    transaction.oncomplete = () => db.close()
  })
}

// Generic function to retrieve data
export async function getData<T>(storeName: string, id: string | number): Promise<T | null> {
  const db = await initializeDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, "readonly")
    const store = transaction.objectStore(storeName)
    const request = store.get(id)

    request.onsuccess = () => resolve(request.result || null)
    request.onerror = () => reject(request.error)
    transaction.oncomplete = () => db.close()
  })
}

// Get all data from a store
export async function getAllData<T>(storeName: string): Promise<T[]> {
  const db = await initializeDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, "readonly")
    const store = transaction.objectStore(storeName)
    const request = store.getAll()

    request.onsuccess = () => resolve(request.result || [])
    request.onerror = () => reject(request.error)
    transaction.oncomplete = () => db.close()
  })
}

// Delete data from a store
export async function deleteData(storeName: string, id: string | number): Promise<void> {
  const db = await initializeDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, "readwrite")
    const store = transaction.objectStore(storeName)
    const request = store.delete(id)

    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
    transaction.oncomplete = () => db.close()
  })
}

// Clear all data from a store
export async function clearStore(storeName: string): Promise<void> {
  const db = await initializeDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, "readwrite")
    const store = transaction.objectStore(storeName)
    const request = store.clear()

    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
    transaction.oncomplete = () => db.close()
  })
}

// Add an item to the sync queue
export async function addToSyncQueue(syncData: {
  tag: string
  url: string
  method: string
  body?: any
  timestamp: number
}): Promise<number> {
  const db = await initializeDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORES.SYNC_QUEUE, "readwrite")
    const store = transaction.objectStore(STORES.SYNC_QUEUE)
    const request = store.add(syncData)

    request.onsuccess = () => resolve(request.result as number)
    request.onerror = () => reject(request.error)
    transaction.oncomplete = () => db.close()
  })
}

// Get all items with a specific sync tag
export async function getSyncItemsByTag(tag: string): Promise<any[]> {
  const db = await initializeDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORES.SYNC_QUEUE, "readonly")
    const store = transaction.objectStore(STORES.SYNC_QUEUE)
    const index = store.index("tag")
    const request = index.getAll(tag)

    request.onsuccess = () => resolve(request.result || [])
    request.onerror = () => reject(request.error)
    transaction.oncomplete = () => db.close()
  })
}

// Remove an item from the sync queue
export async function removeFromSyncQueue(id: number): Promise<void> {
  return deleteData(STORES.SYNC_QUEUE, id)
}
