import { Injectable } from '@angular/core';
import { FlightSearchObj } from 'src/app/shared/types/flights-results.type';

export interface CachedFlightResults {
  searchObj: FlightSearchObj;
  data: any[];
  timestamp: Date;
  searchId: string;
}

export interface FlightComparison {
  id: string;
  flights: any[];
  createdAt: Date;
  name?: string;
}

export interface UserPreferences {
  preferredAirlines: string[];
  preferredDepartureTime: string;
  maxStops: number;
  priceRange: { min: number; max: number };
  sortPreference: string;
}

@Injectable({
  providedIn: 'root'
})
export class FlightsResultsStorageService {
  private dbName = 'FlightResultsDB';
  private dbVersion = 1;
  private db: IDBDatabase | null = null;

  constructor() {
    this.initDB();
  }

  private async initDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => {
        console.error('IndexedDB error:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log('IndexedDB initialized successfully');
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Flight results cache store
        if (!db.objectStoreNames.contains('flightResults')) {
          const flightResultsStore = db.createObjectStore('flightResults', { 
            keyPath: 'searchId' 
          });
          flightResultsStore.createIndex('timestamp', 'timestamp', { unique: false });
          flightResultsStore.createIndex('searchHash', 'searchHash', { unique: false });
        }

        // Flight comparisons store
        if (!db.objectStoreNames.contains('flightComparisons')) {
          const comparisonsStore = db.createObjectStore('flightComparisons', { 
            keyPath: 'id' 
          });
          comparisonsStore.createIndex('createdAt', 'createdAt', { unique: false });
        }

        // User preferences store
        if (!db.objectStoreNames.contains('userPreferences')) {
          db.createObjectStore('userPreferences', { keyPath: 'id' });
        }

        // Search history store
        if (!db.objectStoreNames.contains('searchHistory')) {
          const historyStore = db.createObjectStore('searchHistory', { 
            keyPath: 'id', 
            autoIncrement: true 
          });
          historyStore.createIndex('timestamp', 'timestamp', { unique: false });
          historyStore.createIndex('route', 'route', { unique: false });
        }
      };
    });
  }

  // Flight Results Caching
  public async cacheFlightResults(flights: any[], searchObj?: FlightSearchObj): Promise<void> {
    if (!this.db) {
      await this.initDB();
    }

    const searchId = this.generateSearchId();
    const searchHash = searchObj ? this.generateSearchHash(searchObj) : '';

    const cacheEntry: CachedFlightResults & { searchHash: string } = {
      searchId,
      searchObj: searchObj || {} as FlightSearchObj,
      data: flights,
      timestamp: new Date(),
      searchHash
    };

    return this.addToStore('flightResults', cacheEntry);
  }

  public async getCachedFlightResults(searchObj: FlightSearchObj): Promise<CachedFlightResults | null> {
    if (!this.db) {
      await this.initDB();
    }

    const searchHash = this.generateSearchHash(searchObj);
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['flightResults'], 'readonly');
      const store = transaction.objectStore('flightResults');
      const index = store.index('searchHash');
      const request = index.get(searchHash);

      request.onsuccess = () => {
        resolve(request.result || null);
      };

      request.onerror = () => {
        console.error('Error getting cached results:', request.error);
        resolve(null);
      };
    });
  }

  public async getLastValidResults(): Promise<any[] | null> {
    if (!this.db) {
      await this.initDB();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['flightResults'], 'readonly');
      const store = transaction.objectStore('flightResults');
      const index = store.index('timestamp');
      const request = index.openCursor(null, 'prev'); // Latest first

      request.onsuccess = () => {
        const cursor = request.result;
        if (cursor) {
          const entry = cursor.value as CachedFlightResults;
          
          // Check if the entry is less than 1 day old
          const maxAge = 24 * 60 * 60 * 1000; // 24 hours
          if (Date.now() - entry.timestamp.getTime() < maxAge) {
            resolve(entry.data);
          } else {
            cursor.continue();
          }
        } else {
          resolve(null);
        }
      };

      request.onerror = () => {
        console.error('Error getting last valid results:', request.error);
        resolve(null);
      };
    });
  }

  // Flight Comparisons
  public async saveFlightComparison(flights: any[], name?: string): Promise<string> {
    const comparison: FlightComparison = {
      id: this.generateComparisonId(),
      flights,
      createdAt: new Date(),
      name: name || `Comparison ${new Date().toLocaleDateString()}`
    };

    await this.addToStore('flightComparisons', comparison);
    return comparison.id;
  }

  public async getFlightComparison(id: string): Promise<FlightComparison | null> {
    return this.getFromStore('flightComparisons', id);
  }

  public async getAllFlightComparisons(): Promise<FlightComparison[]> {
    if (!this.db) {
      await this.initDB();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['flightComparisons'], 'readonly');
      const store = transaction.objectStore('flightComparisons');
      const request = store.getAll();

      request.onsuccess = () => {
        resolve(request.result || []);
      };

      request.onerror = () => {
        console.error('Error getting all comparisons:', request.error);
        resolve([]);
      };
    });
  }

  public async deleteFlightComparison(id: string): Promise<void> {
    return this.deleteFromStore('flightComparisons', id);
  }

  // User Preferences
  public async saveUserPreferences(preferences: UserPreferences): Promise<void> {
    const prefWithId = { ...preferences, id: 'user_preferences' };
    return this.addToStore('userPreferences', prefWithId);
  }

  public async getUserPreferences(): Promise<UserPreferences | null> {
    const result = await this.getFromStore('userPreferences', 'user_preferences');
    if (result) {
      const { id, ...preferences } = result;
      return preferences as UserPreferences;
    }
    return null;
  }

  // Search History
  public async addToSearchHistory(searchObj: FlightSearchObj, resultsCount: number): Promise<void> {
    const historyEntry = {
      searchObj,
      resultsCount,
      timestamp: new Date(),
      route: `${searchObj.departureCity.city.name} → ${searchObj.destinationCity.city.name}`
    };

    await this.addToStore('searchHistory', historyEntry);
    
    // Keep only last 50 searches
    await this.cleanupSearchHistory();
  }

  public async getSearchHistory(limit: number = 10): Promise<any[]> {
    if (!this.db) {
      await this.initDB();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['searchHistory'], 'readonly');
      const store = transaction.objectStore('searchHistory');
      const index = store.index('timestamp');
      const request = index.openCursor(null, 'prev'); // Latest first
      
      const results: any[] = [];
      let count = 0;

      request.onsuccess = () => {
        const cursor = request.result;
        if (cursor && count < limit) {
          results.push(cursor.value);
          count++;
          cursor.continue();
        } else {
          resolve(results);
        }
      };

      request.onerror = () => {
        console.error('Error getting search history:', request.error);
        resolve([]);
      };
    });
  }

  // Cleanup methods
  public async cleanupOldData(): Promise<void> {
    await Promise.all([
      this.cleanupFlightResults(),
      this.cleanupSearchHistory(),
      this.cleanupComparisons()
    ]);
  }

  private async cleanupFlightResults(): Promise<void> {
    const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days
    const cutoffDate = new Date(Date.now() - maxAge);
    
    await this.deleteOldEntries('flightResults', 'timestamp', cutoffDate);
  }

  private async cleanupSearchHistory(): Promise<void> {
    const maxEntries = 50;
    await this.keepOnlyRecentEntries('searchHistory', 'timestamp', maxEntries);
  }

  private async cleanupComparisons(): Promise<void> {
    const maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days
    const cutoffDate = new Date(Date.now() - maxAge);
    
    await this.deleteOldEntries('flightComparisons', 'createdAt', cutoffDate);
  }

  // Generic database operations
  private async addToStore(storeName: string, data: any): Promise<void> {
    if (!this.db) {
      await this.initDB();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put(data);

      request.onsuccess = () => resolve();
      request.onerror = () => {
        console.error(`Error adding to ${storeName}:`, request.error);
        reject(request.error);
      };
    });
  }

  private async getFromStore(storeName: string, key: string): Promise<any | null> {
    if (!this.db) {
      await this.initDB();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(key);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => {
        console.error(`Error getting from ${storeName}:`, request.error);
        resolve(null);
      };
    });
  }

  private async deleteFromStore(storeName: string, key: string): Promise<void> {
    if (!this.db) {
      await this.initDB();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(key);

      request.onsuccess = () => resolve();
      request.onerror = () => {
        console.error(`Error deleting from ${storeName}:`, request.error);
        reject(request.error);
      };
    });
  }

  private async deleteOldEntries(storeName: string, indexName: string, cutoffDate: Date): Promise<void> {
    if (!this.db) {
      await this.initDB();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const index = store.index(indexName);
      const range = IDBKeyRange.upperBound(cutoffDate);
      const request = index.openCursor(range);

      request.onsuccess = () => {
        const cursor = request.result;
        if (cursor) {
          cursor.delete();
          cursor.continue();
        } else {
          resolve();
        }
      };

      request.onerror = () => {
        console.error(`Error cleaning up ${storeName}:`, request.error);
        reject(request.error);
      };
    });
  }

  private async keepOnlyRecentEntries(storeName: string, indexName: string, maxEntries: number): Promise<void> {
    if (!this.db) {
      await this.initDB();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const index = store.index(indexName);
      const request = index.openCursor(null, 'prev'); // Latest first
      
      let count = 0;

      request.onsuccess = () => {
        const cursor = request.result;
        if (cursor) {
          if (count >= maxEntries) {
            cursor.delete();
          }
          count++;
          cursor.continue();
        } else {
          resolve();
        }
      };

      request.onerror = () => {
        console.error(`Error keeping recent entries in ${storeName}:`, request.error);
        reject(request.error);
      };
    });
  }

  // Utility methods
  private generateSearchId(): string {
    return `search_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateComparisonId(): string {
    return `comp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateSearchHash(searchObj: FlightSearchObj): string {
    const key = `${searchObj.departureCity.id}_${searchObj.destinationCity.id}_${searchObj.dateFrom}_${searchObj.dateTo}_${searchObj.isFlightTypeOneWay}_${searchObj.infoSerialized.adults}_${searchObj.infoSerialized.children}_${searchObj.infoSerialized.infants}_${searchObj.cabinClass}`;
    return btoa(key).replace(/[^a-zA-Z0-9]/g, ''); // Base64 encode and remove special chars
  }

  // Legacy method for backward compatibility
  fetchFlights() {
    console.log('fetchFlights called - use cacheFlightResults instead');
  }

  // Database status and metrics
  public async getDatabaseStatus(): Promise<any> {
    if (!this.db) {
      return { connected: false };
    }

    const stores = ['flightResults', 'flightComparisons', 'userPreferences', 'searchHistory'];
    const counts = await Promise.all(
      stores.map(store => this.getStoreCount(store))
    );

    return {
      connected: true,
      version: this.db.version,
      stores: stores.reduce((acc, store, index) => {
        acc[store] = counts[index];
        return acc;
      }, {} as any)
    };
  }

  private async getStoreCount(storeName: string): Promise<number> {
    if (!this.db) return 0;

    return new Promise((resolve) => {
      const transaction = this.db!.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.count();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => resolve(0);
    });
  }
}
