
import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { Transaction } from './types';

interface MyDatabase extends DBSchema {
  transactions: {
    key: string;
    value: Transaction;
  };
}

const DB_NAME = 'transactly-db';
const DB_VERSION = 1;

const openDatabase = async (): Promise<IDBPDatabase<MyDatabase>> => {
  return openDB<MyDatabase>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('transactions')) {
        db.createObjectStore('transactions', { keyPath: 'id' });
      }
    },
  });
};

// Add transaction to the store
const addTransaction = async (transaction: Transaction): Promise<void> => {
  const db = await openDatabase();
  const tx = db.transaction('transactions', 'readwrite');
  const store = tx.objectStore('transactions');
  await store.add(transaction);
  await tx.done;
  db.close();
};

// Get transaction from the store
const getTransaction = async (id: string): Promise<Transaction | null> => {
  const db = await openDatabase();
  const tx = db.transaction('transactions', 'readonly');
  const store = tx.objectStore('transactions');
  const transaction = await store.get(id);
  db.close();
  return transaction || null;
};

// Get all transactions from the store
const getAllTransactions = async (): Promise<Transaction[]> => {
  const db = await openDatabase();
  const tx = db.transaction('transactions', 'readonly');
  const store = tx.objectStore('transactions');
  const transactions = await store.getAll();
  db.close();
  return transactions;
};

// Update transaction in the store
const updateTransaction = async (transaction: Transaction): Promise<void> => {
  const db = await openDatabase();
  const tx = db.transaction('transactions', 'readwrite');
  const store = tx.objectStore('transactions');
  await store.put(transaction);
  await tx.done;
  db.close();
};

// Delete transaction from the store
const deleteTransaction = async (id: string): Promise<void> => {
  const db = await openDatabase();
  const tx = db.transaction('transactions', 'readwrite');
  const store = tx.objectStore('transactions');
  await store.delete(id);
  await tx.done;
  db.close();
};

export const dbManager = {
  // Get all transactions for a specific user
  getAllTransactions: async (userId?: string | null): Promise<Transaction[]> => {
    try {
      const transactions = await getAllTransactions();
      
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
      const transaction = await getTransaction(id);
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
        suppliers: transaction.suppliers || [],
        buyers: transaction.buyers || [],
        updatedAt: new Date().toISOString()
      };
      
      await addTransaction(enhancedTransaction);
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
        suppliers: transaction.suppliers || [],
        buyers: transaction.buyers || [],
        updatedAt: new Date().toISOString()
      };
      
      await updateTransaction(enhancedTransaction);
    } catch (error) {
      console.error('Error updating transaction:', error);
      throw error;
    }
  },

  // Delete a transaction
  deleteTransaction: async (id: string): Promise<void> => {
    try {
      await deleteTransaction(id);
    } catch (error) {
      console.error('Error deleting transaction:', error);
      throw error;
    }
  },
};
