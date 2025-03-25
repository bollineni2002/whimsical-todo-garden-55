
import { Transaction, Payment, Note, Attachment } from './types';

const DB_VERSION = 1;
const DB_NAME = 'transactly-smooth';

export class DatabaseManager {
  private db: IDBDatabase | null = null;

  constructor() {
    this.initDB();
  }

  private initDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Create object stores with indexes
        if (!db.objectStoreNames.contains('transactions')) {
          const transactionStore = db.createObjectStore('transactions', { keyPath: 'id' });
          transactionStore.createIndex('date', 'date', { unique: false });
          transactionStore.createIndex('status', 'status', { unique: false });
        }
        
        if (!db.objectStoreNames.contains('payments')) {
          const paymentStore = db.createObjectStore('payments', { keyPath: 'id' });
          paymentStore.createIndex('transactionId', 'transactionId', { unique: false });
          paymentStore.createIndex('date', 'date', { unique: false });
        }
        
        if (!db.objectStoreNames.contains('notes')) {
          const noteStore = db.createObjectStore('notes', { keyPath: 'id' });
          noteStore.createIndex('transactionId', 'transactionId', { unique: false });
        }
        
        if (!db.objectStoreNames.contains('attachments')) {
          const attachmentStore = db.createObjectStore('attachments', { keyPath: 'id' });
          attachmentStore.createIndex('transactionId', 'transactionId', { unique: false });
        }
      };

      request.onsuccess = (event) => {
        this.db = (event.target as IDBOpenDBRequest).result;
        console.log('Database initialized successfully');
        resolve(this.db);
      };

      request.onerror = (event) => {
        console.error('Database initialization error:', (event.target as IDBOpenDBRequest).error);
        reject((event.target as IDBOpenDBRequest).error);
      };
    });
  }

  // Ensure the database is open before performing operations
  private async ensureDbOpen(): Promise<IDBDatabase> {
    if (this.db) return this.db;
    return this.initDB();
  }

  // Generic method to perform a transaction
  private async doTransaction<T>(
    storeName: string,
    mode: IDBTransactionMode,
    operation: (store: IDBObjectStore) => IDBRequest<T>
  ): Promise<T> {
    const db = await this.ensureDbOpen();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, mode);
      const store = transaction.objectStore(storeName);
      const request = operation(store);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // Transaction CRUD operations
  async addTransaction(transaction: Transaction): Promise<string> {
    return this.doTransaction<string>('transactions', 'readwrite', (store) => {
      const request = store.add(transaction);
      return request as unknown as IDBRequest<string>;
    });
  }

  async getTransaction(id: string): Promise<Transaction | undefined> {
    return this.doTransaction<Transaction | undefined>('transactions', 'readonly', (store) => {
      return store.get(id);
    });
  }

  async getAllTransactions(): Promise<Transaction[]> {
    return this.doTransaction<Transaction[]>('transactions', 'readonly', (store) => {
      return store.getAll();
    });
  }

  async updateTransaction(transaction: Transaction): Promise<string> {
    return this.doTransaction<string>('transactions', 'readwrite', (store) => {
      const request = store.put(transaction);
      return request as unknown as IDBRequest<string>;
    });
  }

  async deleteTransaction(id: string): Promise<void> {
    return this.doTransaction<void>('transactions', 'readwrite', (store) => {
      return store.delete(id);
    });
  }

  // Export functionality
  async exportData(): Promise<string> {
    const transactions = await this.getAllTransactions();
    const dataStr = JSON.stringify(transactions, null, 2);
    return dataStr;
  }

  // Import functionality
  async importData(jsonData: string): Promise<void> {
    try {
      const transactions = JSON.parse(jsonData) as Transaction[];
      
      const db = await this.ensureDbOpen();
      const tx = db.transaction(['transactions'], 'readwrite');
      const store = tx.objectStore('transactions');
      
      // Clear existing data
      await this.doTransaction<void>('transactions', 'readwrite', (s) => s.clear());
      
      // Add new data
      for (const transaction of transactions) {
        store.add(transaction);
      }
      
      return new Promise((resolve, reject) => {
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    } catch (error) {
      console.error('Import failed:', error);
      throw error;
    }
  }
}

// Create a singleton instance
export const dbManager = new DatabaseManager();
