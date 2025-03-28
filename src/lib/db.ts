import { openDB, DBSchema } from 'idb';
import { Transaction } from './types';

interface MyDatabase extends DBSchema {
  transactions: {
    key: string;
    value: Transaction;
  };
}

const DB_NAME = 'transactly-db';
const DB_VERSION = 1;

const openDatabase = async () => {
  return openDB<MyDatabase>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('transactions')) {
        db.createObjectStore('transactions', { keyPath: 'id' });
      }
    },
  });
};

// Generic function to add an item to a store
const addItem = async <T>(storeName: string, item: T & { id: string }) => {
  const db = await openDatabase();
  const tx = db.transaction(storeName, 'readwrite');
  const store = tx.objectStore(storeName);
  await store.add(item);
  await tx.done;
  db.close();
};

// Generic function to get an item from a store
const getItem = async <T>(storeName: string, id: string): Promise<T | null> => {
  const db = await openDatabase();
  const tx = db.transaction(storeName, 'readonly');
  const store = tx.objectStore(storeName);
  const item = await store.get(id);
  db.close();
  return item || null;
};

// Generic function to get all items from a store
const getAllItems = async <T>(storeName: string): Promise<T[]> => {
  const db = await openDatabase();
  const tx = db.transaction(storeName, 'readonly');
  const store = tx.objectStore(storeName);
  const items = await store.getAll();
  db.close();
  return items;
};

// Generic function to update an item in a store
const updateItem = async <T>(storeName: string, item: T & { id: string }) => {
  const db = await openDatabase();
  const tx = db.transaction(storeName, 'readwrite');
  const store = tx.objectStore(storeName);
  await store.put(item);
  await tx.done;
  db.close();
};

// Generic function to delete an item from a store
const deleteItem = async (storeName: string, id: string) => {
  const db = await openDatabase();
  const tx = db.transaction(storeName, 'readwrite');
  const store = tx.objectStore(storeName);
  await store.delete(id);
  await tx.done;
  db.close();
};

export const dbManager = {
  // Get all transactions for a specific user
  getAllTransactions: async (userId?: string | null): Promise<Transaction[]> => {
    try {
      const transactions = await getAllItems<Transaction>('transactions');
      
      // Filter by user_id if it's provided
      if (userId) {
        return transactions.filter(transaction => 
          transaction.user_id === userId
        );
      }
      
      return transactions;
    } catch (error) {
      console.error('Error getting all transactions:', error);
      return [];
    }
  },

  // Get a specific transaction
  getTransaction: async (id: string): Promise<Transaction | null> => {
    try {
      const transaction = await getItem<Transaction>('transactions', id);
      return transaction;
    } catch (error) {
      console.error('Error getting transaction:', error);
      return null;
    }
  },

  // Add a new transaction with user_id
  addTransaction: async (transaction: Transaction): Promise<void> => {
    try {
      // Ensure all arrays are initialized
      const enhancedTransaction = {
        ...transaction,
        payments: transaction.payments || [],
        notes: transaction.notes || [],
        attachments: transaction.attachments || [],
        updatedAt: new Date().toISOString()
      };
      
      await addItem('transactions', enhancedTransaction);
    } catch (error) {
      console.error('Error adding transaction:', error);
      throw error;
    }
  },

  // Update an existing transaction
  updateTransaction: async (transaction: Transaction): Promise<void> => {
    try {
      // Ensure all arrays are initialized
      const enhancedTransaction = {
        ...transaction,
        payments: transaction.payments || [],
        notes: transaction.notes || [],
        attachments: transaction.attachments || [],
        updatedAt: new Date().toISOString()
      };
      
      await updateItem('transactions', enhancedTransaction);
    } catch (error) {
      console.error('Error updating transaction:', error);
      throw error;
    }
  },

  // Delete a transaction
  deleteTransaction: async (id: string): Promise<void> => {
    try {
      await deleteItem('transactions', id);
    } catch (error) {
      console.error('Error deleting transaction:', error);
      throw error;
    }
  },
};
