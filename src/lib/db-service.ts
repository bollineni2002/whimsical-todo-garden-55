import { openDB, DBSchema, IDBPDatabase } from 'idb';
import {
  Transaction,
  Purchase,
  Transportation,
  Sale,
  Payment,
  TransactionNote,
  Attachment,
  DailyLog,
  Buyer,
  Seller,
  User,
  CompleteTransaction
} from './types';
import { v4 as uuidv4 } from 'uuid';

// Define the database schema
interface AppDatabase extends DBSchema {
  users: {
    key: string;
    value: User;
    indexes: { 'by-email': string };
  };
  transactions: {
    key: string;
    value: Transaction;
    indexes: { 'by-user-id': string };
  };
  purchases: {
    key: string;
    value: Purchase;
    indexes: { 'by-transaction-id': string };
  };
  transportation: {
    key: string;
    value: Transportation;
    indexes: { 'by-transaction-id': string };
  };
  sales: {
    key: string;
    value: Sale;
    indexes: { 'by-transaction-id': string };
  };
  payments: {
    key: string;
    value: Payment;
    indexes: { 'by-transaction-id': string };
  };
  transaction_notes: {
    key: string;
    value: TransactionNote;
    indexes: { 'by-transaction-id': string };
  };
  attachments: {
    key: string;
    value: Attachment;
    indexes: { 'by-transaction-id': string };
  };
  daily_logs: {
    key: string;
    value: DailyLog;
    indexes: { 'by-user-id': string };
  };
  buyers: {
    key: string;
    value: Buyer;
    indexes: { 'by-user-id': string };
  };
  sellers: {
    key: string;
    value: Seller;
    indexes: { 'by-user-id': string };
  };
  sync_status: {
    key: string;
    value: {
      table: string;
      lastSyncTime: number;
    };
  };
}

const DB_NAME = 'business-sales-db';
const DB_VERSION = 1;

// Open the database
const openDatabase = async (): Promise<IDBPDatabase<AppDatabase>> => {
  return openDB<AppDatabase>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Create object stores if they don't exist
      if (!db.objectStoreNames.contains('users')) {
        const userStore = db.createObjectStore('users', { keyPath: 'id' });
        userStore.createIndex('by-email', 'email');
      }

      if (!db.objectStoreNames.contains('transactions')) {
        const transactionStore = db.createObjectStore('transactions', { keyPath: 'id' });
        transactionStore.createIndex('by-user-id', 'user_id');
      }

      if (!db.objectStoreNames.contains('purchases')) {
        const purchaseStore = db.createObjectStore('purchases', { keyPath: 'id' });
        purchaseStore.createIndex('by-transaction-id', 'transaction_id');
      }

      if (!db.objectStoreNames.contains('transportation')) {
        const transportationStore = db.createObjectStore('transportation', { keyPath: 'id' });
        transportationStore.createIndex('by-transaction-id', 'transaction_id');
      }

      if (!db.objectStoreNames.contains('sales')) {
        const salesStore = db.createObjectStore('sales', { keyPath: 'id' });
        salesStore.createIndex('by-transaction-id', 'transaction_id');
      }

      if (!db.objectStoreNames.contains('payments')) {
        const paymentsStore = db.createObjectStore('payments', { keyPath: 'id' });
        paymentsStore.createIndex('by-transaction-id', 'transaction_id');
      }

      if (!db.objectStoreNames.contains('transaction_notes')) {
        const notesStore = db.createObjectStore('transaction_notes', { keyPath: 'id' });
        notesStore.createIndex('by-transaction-id', 'transaction_id');
      }

      if (!db.objectStoreNames.contains('attachments')) {
        const attachmentsStore = db.createObjectStore('attachments', { keyPath: 'id' });
        attachmentsStore.createIndex('by-transaction-id', 'transaction_id');
      }

      if (!db.objectStoreNames.contains('daily_logs')) {
        const logsStore = db.createObjectStore('daily_logs', { keyPath: 'id' });
        logsStore.createIndex('by-user-id', 'user_id');
      }

      if (!db.objectStoreNames.contains('buyers')) {
        const buyersStore = db.createObjectStore('buyers', { keyPath: 'id' });
        buyersStore.createIndex('by-user-id', 'user_id');
      }

      if (!db.objectStoreNames.contains('sellers')) {
        const sellersStore = db.createObjectStore('sellers', { keyPath: 'id' });
        sellersStore.createIndex('by-user-id', 'user_id');
      }

      if (!db.objectStoreNames.contains('sync_status')) {
        db.createObjectStore('sync_status', { keyPath: 'table' });
      }
    },
  });
};

// Generic function to add an item to a store
const addItem = async <T>(storeName: string, item: T): Promise<T> => {
  const db = await openDatabase();
  const tx = db.transaction(storeName, 'readwrite');
  const store = tx.objectStore(storeName);
  await store.add(item);
  await tx.done;
  db.close();
  return item;
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
const updateItem = async <T>(storeName: string, item: T): Promise<T> => {
  const db = await openDatabase();
  const tx = db.transaction(storeName, 'readwrite');
  const store = tx.objectStore(storeName);
  await store.put(item);
  await tx.done;
  db.close();
  return item;
};

// Generic function to delete an item from a store
const deleteItem = async (storeName: string, id: string): Promise<void> => {
  const db = await openDatabase();
  const tx = db.transaction(storeName, 'readwrite');
  const store = tx.objectStore(storeName);
  await store.delete(id);
  await tx.done;
  db.close();
};

// Generic function to get items by index
const getItemsByIndex = async <T>(
  storeName: string,
  indexName: string,
  value: string
): Promise<T[]> => {
  const db = await openDatabase();
  const tx = db.transaction(storeName, 'readonly');
  const store = tx.objectStore(storeName);
  const index = store.index(indexName);
  const items = await index.getAll(value);
  db.close();
  return items;
};

// Update sync status for a table
const updateSyncStatus = async (table: string): Promise<void> => {
  const db = await openDatabase();
  const tx = db.transaction('sync_status', 'readwrite');
  const store = tx.objectStore('sync_status');
  await store.put({
    table,
    lastSyncTime: Date.now(),
  });
  await tx.done;
  db.close();
};

// Get sync status for a table
const getSyncStatus = async (table: string): Promise<number | null> => {
  const db = await openDatabase();
  const tx = db.transaction('sync_status', 'readonly');
  const store = tx.objectStore('sync_status');
  const status = await store.get(table);
  db.close();
  return status ? status.lastSyncTime : null;
};

// Generate a UUID
const generateId = (): string => {
  return uuidv4();
};

// Clean up duplicate transactions in local database
const cleanupDuplicateTransactions = async (userId: string): Promise<number> => {
  try {
    console.log('Starting local duplicate transaction cleanup for user:', userId);

    // Get all transactions for the user
    const transactions = await getItemsByIndex<Transaction>('transactions', 'by-user-id', userId);
    console.log(`Retrieved ${transactions.length} transactions from local database`);

    // Group transactions by name and date
    const transactionGroups = new Map<string, Transaction[]>();

    transactions.forEach(transaction => {
      const dateStr = transaction.created_at ? new Date(transaction.created_at).toDateString() : 'unknown';
      const key = `${transaction.name}-${dateStr}`;

      if (!transactionGroups.has(key)) {
        transactionGroups.set(key, []);
      }
      transactionGroups.get(key)?.push(transaction);
    });

    // Find groups with duplicates
    let duplicatesRemoved = 0;

    for (const [key, groupTransactions] of transactionGroups.entries()) {
      if (groupTransactions.length > 1) {
        console.log(`Found ${groupTransactions.length} duplicate transactions for key: ${key}`);

        // Sort by ID to ensure consistent results
        groupTransactions.sort((a, b) => a.id.localeCompare(b.id));

        // Keep the first transaction, delete the rest
        const transactionToKeep = groupTransactions[0];
        console.log(`Keeping transaction ${transactionToKeep.id}`);

        for (let i = 1; i < groupTransactions.length; i++) {
          const duplicateTransaction = groupTransactions[i];
          console.log(`Deleting duplicate transaction ${duplicateTransaction.id}`);

          try {
            await deleteItem('transactions', duplicateTransaction.id);
            duplicatesRemoved++;
          } catch (error) {
            console.error(`Error deleting duplicate transaction ${duplicateTransaction.id}:`, error);
          }
        }
      }
    }

    console.log(`Local transaction cleanup complete. Removed ${duplicatesRemoved} duplicates`);
    return duplicatesRemoved;
  } catch (error) {
    console.error('Error cleaning up local duplicate transactions:', error);
    return 0;
  }
};

// Clean up duplicate daily logs in local database
const cleanupDuplicateDailyLogs = async (userId: string): Promise<number> => {
  try {
    console.log('Starting local duplicate daily log cleanup for user:', userId);

    // Get all daily logs for the user
    const dailyLogs = await getItemsByIndex<DailyLog>('daily_logs', 'by-user-id', userId);
    console.log(`Retrieved ${dailyLogs.length} daily logs from local database`);

    // Group daily logs by recipient, amount, date, and direction
    const dailyLogGroups = new Map<string, DailyLog[]>();

    dailyLogs.forEach(log => {
      const dateStr = log.date ? new Date(log.date).toDateString() : 'unknown';
      // Create a unique key based on the important fields
      const key = `${log.recipient_name}-${log.amount}-${dateStr}-${log.direction}-${log.payment_type}`;

      if (!dailyLogGroups.has(key)) {
        dailyLogGroups.set(key, []);
      }
      dailyLogGroups.get(key)?.push(log);
    });

    // Find groups with duplicates
    let duplicatesRemoved = 0;

    for (const [key, groupLogs] of dailyLogGroups.entries()) {
      if (groupLogs.length > 1) {
        console.log(`Found ${groupLogs.length} duplicate daily logs for key: ${key}`);

        // Sort by ID to ensure consistent results
        groupLogs.sort((a, b) => a.id.localeCompare(b.id));

        // Keep the first log, delete the rest
        const logToKeep = groupLogs[0];
        console.log(`Keeping daily log ${logToKeep.id}`);

        for (let i = 1; i < groupLogs.length; i++) {
          const duplicateLog = groupLogs[i];
          console.log(`Deleting duplicate daily log ${duplicateLog.id}`);

          try {
            await deleteItem('daily_logs', duplicateLog.id);
            duplicatesRemoved++;
          } catch (error) {
            console.error(`Error deleting duplicate daily log ${duplicateLog.id}:`, error);
          }
        }
      }
    }

    console.log(`Local daily log cleanup complete. Removed ${duplicatesRemoved} duplicates`);
    return duplicatesRemoved;
  } catch (error) {
    console.error('Error cleaning up local duplicate daily logs:', error);
    return 0;
  }
};

// Database service
export const dbService = {
  // User operations
  getUser: async (id: string): Promise<User | null> => {
    try {
      return await getItem<User>('users', id);
    } catch (error) {
      console.error('Error getting user:', error);
      return null;
    }
  },

  getUserByEmail: async (email: string): Promise<User | null> => {
    try {
      const db = await openDatabase();
      const tx = db.transaction('users', 'readonly');
      const store = tx.objectStore('users');
      const index = store.index('by-email');
      const users = await index.getAll(email);
      db.close();
      return users.length > 0 ? users[0] : null;
    } catch (error) {
      console.error('Error getting user by email:', error);
      return null;
    }
  },

  addUser: async (user: User): Promise<User> => {
    try {
      return await addItem<User>('users', user);
    } catch (error) {
      console.error('Error adding user:', error);
      throw error;
    }
  },

  updateUser: async (user: User): Promise<User> => {
    try {
      return await updateItem<User>('users', user);
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  },

  // Transaction operations
  getTransaction: async (id: string): Promise<Transaction | null> => {
    try {
      return await getItem<Transaction>('transactions', id);
    } catch (error) {
      console.error('Error getting transaction:', error);
      return null;
    }
  },

  getAllTransactions: async (userId?: string): Promise<Transaction[]> => {
    try {
      if (userId) {
        return await getItemsByIndex<Transaction>('transactions', 'by-user-id', userId);
      } else {
        return await getAllItems<Transaction>('transactions');
      }
    } catch (error) {
      console.error('Error getting all transactions:', error);
      return [];
    }
  },

  addTransaction: async (transaction: Omit<Transaction, 'id'>): Promise<Transaction> => {
    try {
      const newTransaction: Transaction = {
        ...transaction,
        id: generateId(),
      };
      return await addItem<Transaction>('transactions', newTransaction);
    } catch (error) {
      console.error('Error adding transaction:', error);
      throw error;
    }
  },

  updateTransaction: async (transaction: Transaction): Promise<Transaction> => {
    try {
      return await updateItem<Transaction>('transactions', transaction);
    } catch (error) {
      console.error('Error updating transaction:', error);
      throw error;
    }
  },

  deleteTransaction: async (id: string): Promise<void> => {
    try {
      // Delete the transaction and all related records
      const purchases = await getItemsByIndex<Purchase>('purchases', 'by-transaction-id', id);
      const transportation = await getItemsByIndex<Transportation>('transportation', 'by-transaction-id', id);
      const sales = await getItemsByIndex<Sale>('sales', 'by-transaction-id', id);
      const payments = await getItemsByIndex<Payment>('payments', 'by-transaction-id', id);
      const notes = await getItemsByIndex<TransactionNote>('transaction_notes', 'by-transaction-id', id);
      const attachments = await getItemsByIndex<Attachment>('attachments', 'by-transaction-id', id);

      // Delete related records
      for (const purchase of purchases) {
        await deleteItem('purchases', purchase.id);
      }

      for (const item of transportation) {
        await deleteItem('transportation', item.id);
      }

      for (const sale of sales) {
        await deleteItem('sales', sale.id);
      }

      for (const payment of payments) {
        await deleteItem('payments', payment.id);
      }

      for (const note of notes) {
        await deleteItem('transaction_notes', note.id);
      }

      for (const attachment of attachments) {
        await deleteItem('attachments', attachment.id);
      }

      // Delete the transaction
      await deleteItem('transactions', id);
    } catch (error) {
      console.error('Error deleting transaction:', error);
      throw error;
    }
  },

  // Get complete transaction with all related data
  getCompleteTransaction: async (id: string): Promise<CompleteTransaction | null> => {
    try {
      const transaction = await getItem<Transaction>('transactions', id);
      if (!transaction) return null;

      const purchases = await getItemsByIndex<Purchase>('purchases', 'by-transaction-id', id);
      const transportationItems = await getItemsByIndex<Transportation>('transportation', 'by-transaction-id', id);
      const sales = await getItemsByIndex<Sale>('sales', 'by-transaction-id', id);
      const payments = await getItemsByIndex<Payment>('payments', 'by-transaction-id', id);
      const notes = await getItemsByIndex<TransactionNote>('transaction_notes', 'by-transaction-id', id);
      const attachments = await getItemsByIndex<Attachment>('attachments', 'by-transaction-id', id);

      return {
        transaction,
        purchases,
        transportation: transportationItems.length > 0 ? transportationItems[0] : undefined,
        sales,
        payments,
        notes,
        attachments
      };
    } catch (error) {
      console.error('Error getting complete transaction:', error);
      return null;
    }
  },

  // Purchase operations
  getPurchase: async (id: string): Promise<Purchase | null> => {
    try {
      return await getItem<Purchase>('purchases', id);
    } catch (error) {
      console.error('Error getting purchase:', error);
      return null;
    }
  },

  getPurchasesByTransaction: async (transactionId: string): Promise<Purchase[]> => {
    try {
      return await getItemsByIndex<Purchase>('purchases', 'by-transaction-id', transactionId);
    } catch (error) {
      console.error('Error getting purchases by transaction:', error);
      return [];
    }
  },

  addPurchase: async (purchase: Omit<Purchase, 'id'>): Promise<Purchase> => {
    try {
      const newPurchase: Purchase = {
        ...purchase,
        id: generateId(),
      };
      return await addItem<Purchase>('purchases', newPurchase);
    } catch (error) {
      console.error('Error adding purchase:', error);
      throw error;
    }
  },

  updatePurchase: async (purchase: Purchase): Promise<Purchase> => {
    try {
      return await updateItem<Purchase>('purchases', purchase);
    } catch (error) {
      console.error('Error updating purchase:', error);
      throw error;
    }
  },

  deletePurchase: async (id: string): Promise<void> => {
    try {
      await deleteItem('purchases', id);
    } catch (error) {
      console.error('Error deleting purchase:', error);
      throw error;
    }
  },

  // Transportation operations
  getTransportation: async (id: string): Promise<Transportation | null> => {
    try {
      return await getItem<Transportation>('transportation', id);
    } catch (error) {
      console.error('Error getting transportation:', error);
      return null;
    }
  },

  getTransportationByTransaction: async (transactionId: string): Promise<Transportation | null> => {
    try {
      const items = await getItemsByIndex<Transportation>('transportation', 'by-transaction-id', transactionId);
      return items.length > 0 ? items[0] : null;
    } catch (error) {
      console.error('Error getting transportation by transaction:', error);
      return null;
    }
  },

  addTransportation: async (transportation: Omit<Transportation, 'id'>): Promise<Transportation> => {
    try {
      const newTransportation: Transportation = {
        ...transportation,
        id: generateId(),
      };
      return await addItem<Transportation>('transportation', newTransportation);
    } catch (error) {
      console.error('Error adding transportation:', error);
      throw error;
    }
  },

  updateTransportation: async (transportation: Transportation): Promise<Transportation> => {
    try {
      return await updateItem<Transportation>('transportation', transportation);
    } catch (error) {
      console.error('Error updating transportation:', error);
      throw error;
    }
  },

  deleteTransportation: async (id: string): Promise<void> => {
    try {
      await deleteItem('transportation', id);
    } catch (error) {
      console.error('Error deleting transportation:', error);
      throw error;
    }
  },

  // Sale operations
  getSale: async (id: string): Promise<Sale | null> => {
    try {
      return await getItem<Sale>('sales', id);
    } catch (error) {
      console.error('Error getting sale:', error);
      return null;
    }
  },

  getSalesByTransaction: async (transactionId: string): Promise<Sale[]> => {
    try {
      return await getItemsByIndex<Sale>('sales', 'by-transaction-id', transactionId);
    } catch (error) {
      console.error('Error getting sales by transaction:', error);
      return [];
    }
  },

  addSale: async (sale: Omit<Sale, 'id'>): Promise<Sale> => {
    try {
      const newSale: Sale = {
        ...sale,
        id: generateId(),
      };
      return await addItem<Sale>('sales', newSale);
    } catch (error) {
      console.error('Error adding sale:', error);
      throw error;
    }
  },

  updateSale: async (sale: Sale): Promise<Sale> => {
    try {
      return await updateItem<Sale>('sales', sale);
    } catch (error) {
      console.error('Error updating sale:', error);
      throw error;
    }
  },

  deleteSale: async (id: string): Promise<void> => {
    try {
      await deleteItem('sales', id);
    } catch (error) {
      console.error('Error deleting sale:', error);
      throw error;
    }
  },

  // Payment operations
  getPayment: async (id: string): Promise<Payment | null> => {
    try {
      return await getItem<Payment>('payments', id);
    } catch (error) {
      console.error('Error getting payment:', error);
      return null;
    }
  },

  getPaymentsByTransaction: async (transactionId: string): Promise<Payment[]> => {
    try {
      return await getItemsByIndex<Payment>('payments', 'by-transaction-id', transactionId);
    } catch (error) {
      console.error('Error getting payments by transaction:', error);
      return [];
    }
  },

  addPayment: async (payment: Omit<Payment, 'id'>): Promise<Payment> => {
    try {
      const newPayment: Payment = {
        ...payment,
        id: generateId(),
      };
      return await addItem<Payment>('payments', newPayment);
    } catch (error) {
      console.error('Error adding payment:', error);
      throw error;
    }
  },

  updatePayment: async (payment: Payment): Promise<Payment> => {
    try {
      return await updateItem<Payment>('payments', payment);
    } catch (error) {
      console.error('Error updating payment:', error);
      throw error;
    }
  },

  deletePayment: async (id: string): Promise<void> => {
    try {
      await deleteItem('payments', id);
    } catch (error) {
      console.error('Error deleting payment:', error);
      throw error;
    }
  },

  // Transaction Note operations
  getTransactionNote: async (id: string): Promise<TransactionNote | null> => {
    try {
      return await getItem<TransactionNote>('transaction_notes', id);
    } catch (error) {
      console.error('Error getting transaction note:', error);
      return null;
    }
  },

  getNotesByTransaction: async (transactionId: string): Promise<TransactionNote[]> => {
    try {
      return await getItemsByIndex<TransactionNote>('transaction_notes', 'by-transaction-id', transactionId);
    } catch (error) {
      console.error('Error getting notes by transaction:', error);
      return [];
    }
  },

  addTransactionNote: async (note: Omit<TransactionNote, 'id' | 'created_at'>): Promise<TransactionNote> => {
    try {
      const newNote: TransactionNote = {
        ...note,
        id: generateId(),
        created_at: new Date().toISOString(),
      };
      return await addItem<TransactionNote>('transaction_notes', newNote);
    } catch (error) {
      console.error('Error adding transaction note:', error);
      throw error;
    }
  },

  updateTransactionNote: async (note: TransactionNote): Promise<TransactionNote> => {
    try {
      return await updateItem<TransactionNote>('transaction_notes', note);
    } catch (error) {
      console.error('Error updating transaction note:', error);
      throw error;
    }
  },

  deleteTransactionNote: async (id: string): Promise<void> => {
    try {
      await deleteItem('transaction_notes', id);
    } catch (error) {
      console.error('Error deleting transaction note:', error);
      throw error;
    }
  },

  // Attachment operations
  getAttachment: async (id: string): Promise<Attachment | null> => {
    try {
      return await getItem<Attachment>('attachments', id);
    } catch (error) {
      console.error('Error getting attachment:', error);
      return null;
    }
  },

  getAttachmentsByTransaction: async (transactionId: string): Promise<Attachment[]> => {
    try {
      return await getItemsByIndex<Attachment>('attachments', 'by-transaction-id', transactionId);
    } catch (error) {
      console.error('Error getting attachments by transaction:', error);
      return [];
    }
  },

  addAttachment: async (attachment: Omit<Attachment, 'id' | 'created_at'>): Promise<Attachment> => {
    try {
      const newAttachment: Attachment = {
        ...attachment,
        id: generateId(),
        created_at: new Date().toISOString(),
      };
      return await addItem<Attachment>('attachments', newAttachment);
    } catch (error) {
      console.error('Error adding attachment:', error);
      throw error;
    }
  },

  updateAttachment: async (attachment: Attachment): Promise<Attachment> => {
    try {
      return await updateItem<Attachment>('attachments', attachment);
    } catch (error) {
      console.error('Error updating attachment:', error);
      throw error;
    }
  },

  deleteAttachment: async (id: string): Promise<void> => {
    try {
      await deleteItem('attachments', id);
    } catch (error) {
      console.error('Error deleting attachment:', error);
      throw error;
    }
  },

  // Daily Log operations
  getDailyLog: async (id: string): Promise<DailyLog | null> => {
    try {
      return await getItem<DailyLog>('daily_logs', id);
    } catch (error) {
      console.error('Error getting daily log:', error);
      return null;
    }
  },

  getDailyLogsByUser: async (userId: string): Promise<DailyLog[]> => {
    try {
      return await getItemsByIndex<DailyLog>('daily_logs', 'by-user-id', userId);
    } catch (error) {
      console.error('Error getting daily logs by user:', error);
      return [];
    }
  },

  addDailyLog: async (log: Omit<DailyLog, 'id' | 'created_at'>): Promise<DailyLog> => {
    try {
      const newLog: DailyLog = {
        ...log,
        id: generateId(),
        created_at: new Date().toISOString(),
      };
      return await addItem<DailyLog>('daily_logs', newLog);
    } catch (error) {
      console.error('Error adding daily log:', error);
      throw error;
    }
  },

  updateDailyLog: async (log: DailyLog): Promise<DailyLog> => {
    try {
      return await updateItem<DailyLog>('daily_logs', log);
    } catch (error) {
      console.error('Error updating daily log:', error);
      throw error;
    }
  },

  deleteDailyLog: async (id: string): Promise<void> => {
    try {
      await deleteItem('daily_logs', id);
    } catch (error) {
      console.error('Error deleting daily log:', error);
      throw error;
    }
  },

  // Buyer operations
  getBuyer: async (id: string): Promise<Buyer | null> => {
    try {
      return await getItem<Buyer>('buyers', id);
    } catch (error) {
      console.error('Error getting buyer:', error);
      return null;
    }
  },

  getBuyersByUser: async (userId: string): Promise<Buyer[]> => {
    try {
      return await getItemsByIndex<Buyer>('buyers', 'by-user-id', userId);
    } catch (error) {
      console.error('Error getting buyers by user:', error);
      return [];
    }
  },

  addBuyer: async (buyer: Omit<Buyer, 'id'>): Promise<Buyer> => {
    try {
      const newBuyer: Buyer = {
        ...buyer,
        id: generateId(),
      };
      return await addItem<Buyer>('buyers', newBuyer);
    } catch (error) {
      console.error('Error adding buyer:', error);
      throw error;
    }
  },

  updateBuyer: async (buyer: Buyer): Promise<Buyer> => {
    try {
      return await updateItem<Buyer>('buyers', buyer);
    } catch (error) {
      console.error('Error updating buyer:', error);
      throw error;
    }
  },

  deleteBuyer: async (id: string): Promise<void> => {
    try {
      await deleteItem('buyers', id);
    } catch (error) {
      console.error('Error deleting buyer:', error);
      throw error;
    }
  },

  // Seller operations
  getSeller: async (id: string): Promise<Seller | null> => {
    try {
      return await getItem<Seller>('sellers', id);
    } catch (error) {
      console.error('Error getting seller:', error);
      return null;
    }
  },

  getSellersByUser: async (userId: string): Promise<Seller[]> => {
    try {
      return await getItemsByIndex<Seller>('sellers', 'by-user-id', userId);
    } catch (error) {
      console.error('Error getting sellers by user:', error);
      return [];
    }
  },

  addSeller: async (seller: Omit<Seller, 'id'>): Promise<Seller> => {
    try {
      const newSeller: Seller = {
        ...seller,
        id: generateId(),
      };
      return await addItem<Seller>('sellers', newSeller);
    } catch (error) {
      console.error('Error adding seller:', error);
      throw error;
    }
  },

  updateSeller: async (seller: Seller): Promise<Seller> => {
    try {
      return await updateItem<Seller>('sellers', seller);
    } catch (error) {
      console.error('Error updating seller:', error);
      throw error;
    }
  },

  deleteSeller: async (id: string): Promise<void> => {
    try {
      await deleteItem('sellers', id);
    } catch (error) {
      console.error('Error deleting seller:', error);
      throw error;
    }
  },

  // Sync status operations
  updateSyncStatus,
  getSyncStatus,

  // Clean up duplicate transactions
  cleanupDuplicateTransactions: async (userId: string): Promise<number> => {
    try {
      return await cleanupDuplicateTransactions(userId);
    } catch (error) {
      console.error('Error cleaning up duplicate transactions:', error);
      return 0;
    }
  },

  // Clean up duplicate daily logs
  cleanupDuplicateDailyLogs: async (userId: string): Promise<number> => {
    try {
      return await cleanupDuplicateDailyLogs(userId);
    } catch (error) {
      console.error('Error cleaning up duplicate daily logs:', error);
      return 0;
    }
  },
};
