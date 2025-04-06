import { dbService } from './db-service';
import { supabaseService } from './supabase-service';
import { supabaseSimple as supabase } from '@/integrations/supabase/simple-client';
import {
  User,
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
  SyncStatus
} from './types';

// Check if online
const isOnline = (): boolean => {
  return navigator.onLine;
};

// Sync service for handling data synchronization
export const syncService = {
  // Sync status
  getSyncStatus: async (): Promise<SyncStatus> => {
    try {
      const tables = [
        'transactions',
        'purchases',
        'transportation',
        'sales',
        'payments',
        'transaction_notes',
        'attachments',
        'daily_logs',
        'buyers',
        'sellers'
      ];

      const statuses = await Promise.all(
        tables.map(async (table) => {
          const lastSyncTime = await dbService.getSyncStatus(table);
          return { table, lastSyncTime };
        })
      );

      const isAllSynced = statuses.every((status) => status.lastSyncTime !== null);
      const lastSyncTime = statuses.reduce(
        (min, status) => {
          if (status.lastSyncTime === null) return null;
          if (min === null) return status.lastSyncTime;
          return Math.min(min, status.lastSyncTime);
        },
        null as number | null
      );

      return {
        lastSyncTime,
        isAllSynced
      };
    } catch (error) {
      console.error('Error getting sync status:', error);
      return {
        lastSyncTime: null,
        isAllSynced: false
      };
    }
  },

  // Sync user data
  syncUserData: async (userId: string): Promise<boolean> => {
    try {
      if (!isOnline()) {
        console.log('Offline, skipping sync');
        return false;
      }

      // Get user from Supabase
      const supabaseUser = await supabaseService.getCurrentUser();

      // If user exists in Supabase, update local user
      if (supabaseUser) {
        const localUser = await dbService.getUser(userId);

        if (localUser) {
          // Update local user with Supabase data
          await dbService.updateUser(supabaseUser);
        } else {
          // Add Supabase user to local DB
          await dbService.addUser(supabaseUser);
        }
      }

      return true;
    } catch (error) {
      console.error('Error syncing user data:', error);
      return false;
    }
  },

  // Sync transactions
  syncTransactions: async (userId: string): Promise<boolean> => {
    try {
      if (!isOnline()) {
        console.log('Offline, skipping sync');
        return false;
      }

      console.log('Starting transaction sync for user:', userId);

      // Get transactions from Supabase
      const supabaseTransactions = await supabaseService.getTransactions(userId);
      console.log(`Retrieved ${supabaseTransactions.length} transactions from Supabase`);

      // Get local transactions
      const localTransactions = await dbService.getAllTransactions(userId);
      console.log(`Retrieved ${localTransactions.length} transactions from local database`);

      // Create a map of local transactions by ID
      const localTransactionsMap = new Map<string, Transaction>();
      localTransactions.forEach((transaction) => {
        localTransactionsMap.set(transaction.id, transaction);
      });

      // Create a map of Supabase transactions by ID
      const supabaseTransactionsMap = new Map<string, Transaction>();
      supabaseTransactions.forEach((transaction) => {
        supabaseTransactionsMap.set(transaction.id, transaction);
      });

      // Create maps for potential duplicate detection
      // Use name + date as a key for potential duplicates
      const localTransactionsByNameDate = new Map<string, Transaction[]>();
      localTransactions.forEach(transaction => {
        const dateStr = transaction.created_at ? new Date(transaction.created_at).toDateString() : 'unknown';
        const key = `${transaction.name}-${dateStr}`;
        if (!localTransactionsByNameDate.has(key)) {
          localTransactionsByNameDate.set(key, []);
        }
        localTransactionsByNameDate.get(key)?.push(transaction);
      });

      const supabaseTransactionsByNameDate = new Map<string, Transaction[]>();
      supabaseTransactions.forEach(transaction => {
        const dateStr = transaction.created_at ? new Date(transaction.created_at).toDateString() : 'unknown';
        const key = `${transaction.name}-${dateStr}`;
        if (!supabaseTransactionsByNameDate.has(key)) {
          supabaseTransactionsByNameDate.set(key, []);
        }
        supabaseTransactionsByNameDate.get(key)?.push(transaction);
      });

      // Sync transactions from Supabase to local
      console.log('Syncing transactions from Supabase to local...');
      for (const transaction of supabaseTransactions) {
        const localTransaction = localTransactionsMap.get(transaction.id);

        if (!localTransaction) {
          // Check if this might be a duplicate with a different ID
          const dateStr = transaction.created_at ? new Date(transaction.created_at).toDateString() : 'unknown';
          const key = `${transaction.name}-${dateStr}`;
          const potentialDuplicates = localTransactionsByNameDate.get(key) || [];

          if (potentialDuplicates.length > 0) {
            console.log(`Found potential duplicate for Supabase transaction ${transaction.id} (${transaction.name}) in local database`);
            // Use the first potential duplicate as the canonical version
            const canonicalTransaction = potentialDuplicates[0];
            console.log(`Using local transaction ${canonicalTransaction.id} as canonical version`);

            // Skip adding this transaction to avoid duplication
            continue;
          }

          console.log(`Adding Supabase transaction ${transaction.id} to local database`);
          // Add Supabase transaction to local DB
          await dbService.addTransaction(transaction);
        } else {
          console.log(`Updating local transaction ${transaction.id} with Supabase data`);
          // Update local transaction with Supabase data
          await dbService.updateTransaction(transaction);
        }
      }

      // Sync transactions from local to Supabase
      console.log('Syncing transactions from local to Supabase...');
      for (const transaction of localTransactions) {
        const supabaseTransaction = supabaseTransactionsMap.get(transaction.id);

        if (!supabaseTransaction) {
          // Check if this might be a duplicate with a different ID
          const dateStr = transaction.created_at ? new Date(transaction.created_at).toDateString() : 'unknown';
          const key = `${transaction.name}-${dateStr}`;
          const potentialDuplicates = supabaseTransactionsByNameDate.get(key) || [];

          if (potentialDuplicates.length > 0) {
            console.log(`Found potential duplicate for local transaction ${transaction.id} (${transaction.name}) in Supabase`);
            // Use the first potential duplicate as the canonical version
            const canonicalTransaction = potentialDuplicates[0];
            console.log(`Using Supabase transaction ${canonicalTransaction.id} as canonical version`);

            // Skip adding this transaction to avoid duplication
            continue;
          }

          console.log(`Adding local transaction ${transaction.id} to Supabase`);
          // Add local transaction to Supabase
          await supabaseService.createTransaction(transaction);
        }
      }

      // Update sync status
      await dbService.updateSyncStatus('transactions');
      console.log('Transaction sync status updated');

      return true;
    } catch (error) {
      console.error('Error syncing transactions:', error);
      return false;
    }
  },

  // Sync purchases for a transaction
  syncPurchases: async (transactionId: string): Promise<boolean> => {
    try {
      if (!isOnline()) {
        console.log('Offline, skipping sync');
        return false;
      }

      // Get purchases from Supabase
      const supabasePurchases = await supabaseService.getPurchases(transactionId);

      // Get local purchases
      const localPurchases = await dbService.getPurchasesByTransaction(transactionId);

      // Create maps for easier lookup
      const localPurchasesMap = new Map<string, Purchase>();
      localPurchases.forEach((purchase) => {
        localPurchasesMap.set(purchase.id, purchase);
      });

      const supabasePurchasesMap = new Map<string, Purchase>();
      supabasePurchases.forEach((purchase) => {
        supabasePurchasesMap.set(purchase.id, purchase);
      });

      // Sync purchases from Supabase to local
      for (const purchase of supabasePurchases) {
        const localPurchase = localPurchasesMap.get(purchase.id);

        if (!localPurchase) {
          // Add Supabase purchase to local DB
          await dbService.addPurchase(purchase);
        } else {
          // Update local purchase with Supabase data
          await dbService.updatePurchase(purchase);
        }
      }

      // Sync purchases from local to Supabase
      for (const purchase of localPurchases) {
        const supabasePurchase = supabasePurchasesMap.get(purchase.id);

        if (!supabasePurchase) {
          // Add local purchase to Supabase
          await supabaseService.createPurchase(purchase);
        }
      }

      // Update sync status
      await dbService.updateSyncStatus('purchases');

      return true;
    } catch (error) {
      console.error('Error syncing purchases:', error);
      return false;
    }
  },

  // Sync transportation for a transaction
  syncTransportation: async (transactionId: string): Promise<boolean> => {
    try {
      if (!isOnline()) {
        console.log('Offline, skipping sync');
        return false;
      }

      console.log(`Syncing transportation for transaction ${transactionId}`);

      // Get transportation from Supabase
      const supabaseTransportation = await supabaseService.getTransportation(transactionId);
      console.log('Supabase transportation:', supabaseTransportation);

      // Get local transportation
      const localTransportation = await dbService.getTransportationByTransaction(transactionId);
      console.log('Local transportation:', localTransportation);

      if (supabaseTransportation && localTransportation) {
        console.log('Both Supabase and local have transportation, comparing data...');

        // Compare the last modified timestamps if available, otherwise use local data as source of truth
        // For now, we'll use local data as the source of truth if both exist
        console.log('Updating Supabase with local transportation data');
        const result = await supabaseService.updateTransportation({
          ...supabaseTransportation,
          ...localTransportation,
          id: supabaseTransportation.id // Ensure we use the Supabase ID
        });
        console.log('Result of updating transportation in Supabase:', result);

        // Update local with the merged data from Supabase
        if (result) {
          await dbService.updateTransportation(result);
          console.log('Local transportation updated with merged data');
        }
      } else if (supabaseTransportation && !localTransportation) {
        console.log('Only Supabase has transportation, adding to local');
        // Only Supabase has it, add to local
        await dbService.addTransportation(supabaseTransportation);
        console.log('Added Supabase transportation to local database');
      } else if (!supabaseTransportation && localTransportation) {
        console.log('Only local has transportation, adding to Supabase');
        // Only local has it, add to Supabase
        const result = await supabaseService.createTransportation(localTransportation);
        console.log('Result of adding transportation to Supabase:', result);

        // If the creation was successful, update local with the Supabase data to ensure IDs match
        if (result) {
          await dbService.updateTransportation(result);
          console.log('Updated local transportation with Supabase data');
        }
      } else {
        console.log('Neither Supabase nor local have transportation for this transaction');
      }

      // Update sync status
      await dbService.updateSyncStatus('transportation');
      console.log('Transportation sync status updated');

      return true;
    } catch (error) {
      console.error('Error syncing transportation:', error);
      return false;
    }
  },

  // Sync sales for a transaction
  syncSales: async (transactionId: string): Promise<boolean> => {
    try {
      if (!isOnline()) {
        console.log('Offline, skipping sync');
        return false;
      }

      // Get sales from Supabase
      const supabaseSales = await supabaseService.getSales(transactionId);

      // Get local sales
      const localSales = await dbService.getSalesByTransaction(transactionId);

      // Create maps for easier lookup
      const localSalesMap = new Map<string, Sale>();
      localSales.forEach((sale) => {
        localSalesMap.set(sale.id, sale);
      });

      const supabaseSalesMap = new Map<string, Sale>();
      supabaseSales.forEach((sale) => {
        supabaseSalesMap.set(sale.id, sale);
      });

      // Sync sales from Supabase to local
      for (const sale of supabaseSales) {
        const localSale = localSalesMap.get(sale.id);

        if (!localSale) {
          // Add Supabase sale to local DB
          await dbService.addSale(sale);
        } else {
          // Update local sale with Supabase data
          await dbService.updateSale(sale);
        }
      }

      // Sync sales from local to Supabase
      for (const sale of localSales) {
        const supabaseSale = supabaseSalesMap.get(sale.id);

        if (!supabaseSale) {
          // Add local sale to Supabase
          await supabaseService.createSale(sale);
        }
      }

      // Update sync status
      await dbService.updateSyncStatus('sales');

      return true;
    } catch (error) {
      console.error('Error syncing sales:', error);
      return false;
    }
  },

  // Sync payments for a transaction
  syncPayments: async (transactionId: string): Promise<boolean> => {
    try {
      if (!isOnline()) {
        console.log('Offline, skipping sync');
        return false;
      }

      // Get payments from Supabase
      const supabasePayments = await supabaseService.getPayments(transactionId);

      // Get local payments
      const localPayments = await dbService.getPaymentsByTransaction(transactionId);

      // Create maps for easier lookup
      const localPaymentsMap = new Map<string, Payment>();
      localPayments.forEach((payment) => {
        localPaymentsMap.set(payment.id, payment);
      });

      const supabasePaymentsMap = new Map<string, Payment>();
      supabasePayments.forEach((payment) => {
        supabasePaymentsMap.set(payment.id, payment);
      });

      // Sync payments from Supabase to local
      for (const payment of supabasePayments) {
        const localPayment = localPaymentsMap.get(payment.id);

        if (!localPayment) {
          // Add Supabase payment to local DB
          await dbService.addPayment(payment);
        } else {
          // Update local payment with Supabase data
          await dbService.updatePayment(payment);
        }
      }

      // Sync payments from local to Supabase
      for (const payment of localPayments) {
        const supabasePayment = supabasePaymentsMap.get(payment.id);

        if (!supabasePayment) {
          // Add local payment to Supabase
          await supabaseService.createPayment(payment);
        }
      }

      // Update sync status
      await dbService.updateSyncStatus('payments');

      return true;
    } catch (error) {
      console.error('Error syncing payments:', error);
      return false;
    }
  },

  // Sync notes for a transaction
  syncNotes: async (transactionId: string): Promise<boolean> => {
    try {
      if (!isOnline()) {
        console.log('Offline, skipping sync');
        return false;
      }

      // Get notes from Supabase
      const supabaseNotes = await supabaseService.getNotes(transactionId);

      // Get local notes
      const localNotes = await dbService.getNotesByTransaction(transactionId);

      // Create maps for easier lookup
      const localNotesMap = new Map<string, TransactionNote>();
      localNotes.forEach((note) => {
        localNotesMap.set(note.id, note);
      });

      const supabaseNotesMap = new Map<string, TransactionNote>();
      supabaseNotes.forEach((note) => {
        supabaseNotesMap.set(note.id, note);
      });

      // Sync notes from Supabase to local
      for (const note of supabaseNotes) {
        const localNote = localNotesMap.get(note.id);

        if (!localNote) {
          // Add Supabase note to local DB
          await dbService.addTransactionNote({
            id: note.id,
            transaction_id: note.transaction_id,
            note: note.note
          });
        } else {
          // Update local note with Supabase data
          await dbService.updateTransactionNote(note);
        }
      }

      // Sync notes from local to Supabase
      for (const note of localNotes) {
        const supabaseNote = supabaseNotesMap.get(note.id);

        if (!supabaseNote) {
          // Add local note to Supabase
          await supabaseService.createNote({
            id: note.id,
            transaction_id: note.transaction_id,
            note: note.note
          });
        }
      }

      // Update sync status
      await dbService.updateSyncStatus('transaction_notes');

      return true;
    } catch (error) {
      console.error('Error syncing notes:', error);
      return false;
    }
  },

  // Sync attachments for a transaction
  syncAttachments: async (transactionId: string): Promise<boolean> => {
    try {
      if (!isOnline()) {
        console.log('Offline, skipping sync');
        return false;
      }

      console.log(`Syncing attachments for transaction ${transactionId}`);

      // Get attachments from Supabase
      let supabaseAttachments: Attachment[] = [];
      try {
        supabaseAttachments = await supabaseService.getAttachments(transactionId);
        console.log(`Retrieved ${supabaseAttachments.length} attachments from Supabase`);
      } catch (error) {
        console.error('Error fetching attachments from Supabase:', error);
        // Continue with local attachments only
      }

      // Get local attachments
      let localAttachments: Attachment[] = [];
      try {
        localAttachments = await dbService.getAttachmentsByTransaction(transactionId);
        console.log(`Retrieved ${localAttachments.length} attachments from local DB`);
      } catch (error) {
        console.error('Error fetching attachments from local DB:', error);
        // Continue with Supabase attachments only
      }

      // Create maps for easier lookup
      const localAttachmentsMap = new Map<string, Attachment>();
      localAttachments.forEach((attachment) => {
        localAttachmentsMap.set(attachment.id, attachment);
      });

      const supabaseAttachmentsMap = new Map<string, Attachment>();
      supabaseAttachments.forEach((attachment) => {
        supabaseAttachmentsMap.set(attachment.id, attachment);
      });

      // Sync attachments from Supabase to local
      for (const attachment of supabaseAttachments) {
        try {
          const localAttachment = localAttachmentsMap.get(attachment.id);

          if (!localAttachment) {
            // Add Supabase attachment to local DB
            console.log(`Adding Supabase attachment ${attachment.id} to local DB`);
            await dbService.addAttachment({
              id: attachment.id,
              transaction_id: attachment.transaction_id,
              name: attachment.name,
              file_type: attachment.file_type,
              uri: attachment.uri
            });
          } else {
            // Update local attachment with Supabase data
            console.log(`Updating local attachment ${attachment.id} with Supabase data`);
            await dbService.updateAttachment(attachment);
          }
        } catch (error) {
          console.error(`Error syncing Supabase attachment ${attachment.id} to local:`, error);
          // Continue with next attachment
        }
      }

      // Sync attachments from local to Supabase
      for (const attachment of localAttachments) {
        try {
          const supabaseAttachment = supabaseAttachmentsMap.get(attachment.id);

          if (!supabaseAttachment) {
            // Add local attachment to Supabase
            console.log(`Adding local attachment ${attachment.id} to Supabase`);
            await supabaseService.createAttachment({
              id: attachment.id,
              transaction_id: attachment.transaction_id,
              name: attachment.name,
              file_type: attachment.file_type,
              uri: attachment.uri
            });
          }
        } catch (error) {
          console.error(`Error syncing local attachment ${attachment.id} to Supabase:`, error);
          // Continue with next attachment
        }
      }

      // Update sync status
      try {
        await dbService.updateSyncStatus('attachments');
        console.log('Attachment sync status updated');
      } catch (error) {
        console.error('Error updating attachment sync status:', error);
      }

      console.log('Attachment synchronization completed');
      return true;
    } catch (error) {
      console.error('Error syncing attachments:', error);
      return false;
    }
  },

  // Sync daily logs for a user
  syncDailyLogs: async (userId: string): Promise<boolean> => {
    try {
      if (!isOnline()) {
        console.log('Offline, skipping daily logs sync');
        return false;
      }

      console.log(`Starting daily logs sync for user ${userId}`);

      // Get daily logs from Supabase
      const supabaseLogs = await supabaseService.getDailyLogs(userId);
      console.log(`Retrieved ${supabaseLogs.length} daily logs from Supabase`);

      // Get local daily logs
      const localLogs = await dbService.getDailyLogsByUser(userId);
      console.log(`Retrieved ${localLogs.length} daily logs from local database`);

      // Create maps for easier lookup
      const localLogsMap = new Map<string, DailyLog>();
      localLogs.forEach((log) => {
        localLogsMap.set(log.id, log);
      });

      const supabaseLogsMap = new Map<string, DailyLog>();
      supabaseLogs.forEach((log) => {
        supabaseLogsMap.set(log.id, log);
      });

      // Create maps for potential duplicate detection
      // Use recipient, amount, date, direction, and payment_type as a key for potential duplicates
      const localLogsByKey = new Map<string, DailyLog[]>();
      localLogs.forEach(log => {
        const dateStr = log.date ? new Date(log.date).toDateString() : 'unknown';
        const key = `${log.recipient_name}-${log.amount}-${dateStr}-${log.direction}-${log.payment_type}`;
        if (!localLogsByKey.has(key)) {
          localLogsByKey.set(key, []);
        }
        localLogsByKey.get(key)?.push(log);
      });

      const supabaseLogsByKey = new Map<string, DailyLog[]>();
      supabaseLogs.forEach(log => {
        const dateStr = log.date ? new Date(log.date).toDateString() : 'unknown';
        const key = `${log.recipient_name}-${log.amount}-${dateStr}-${log.direction}-${log.payment_type}`;
        if (!supabaseLogsByKey.has(key)) {
          supabaseLogsByKey.set(key, []);
        }
        supabaseLogsByKey.get(key)?.push(log);
      });

      // Sync logs from Supabase to local
      console.log('Syncing logs from Supabase to local...');
      for (const log of supabaseLogs) {
        const localLog = localLogsMap.get(log.id);

        if (!localLog) {
          // Check if this might be a duplicate with a different ID
          const dateStr = log.date ? new Date(log.date).toDateString() : 'unknown';
          const key = `${log.recipient_name}-${log.amount}-${dateStr}-${log.direction}-${log.payment_type}`;
          const potentialDuplicates = localLogsByKey.get(key) || [];

          if (potentialDuplicates.length > 0) {
            console.log(`Found potential duplicate for Supabase log ${log.id} in local database`);
            // Use the first potential duplicate as the canonical version
            const canonicalLog = potentialDuplicates[0];
            console.log(`Using local log ${canonicalLog.id} as canonical version`);

            // Skip adding this log to avoid duplication
            continue;
          }

          console.log(`Adding Supabase log ${log.id} to local database`);
          // Add Supabase log to local DB
          try {
            await dbService.addDailyLog({
              id: log.id,
              user_id: log.user_id,
              direction: log.direction,
              payment_type: log.payment_type,
              date: log.date,
              recipient_name: log.recipient_name,
              amount: log.amount,
              is_third_party: log.is_third_party,
              third_party_name: log.third_party_name,
              notes: log.notes,
              attachment_url: log.attachment_url
            });
            console.log(`Successfully added log ${log.id} to local database`);
          } catch (err) {
            console.error(`Error adding log ${log.id} to local database:`, err);
          }
        } else {
          console.log(`Updating local log ${log.id} with Supabase data`);
          // Update local log with Supabase data
          try {
            await dbService.updateDailyLog(log);
            console.log(`Successfully updated log ${log.id} in local database`);
          } catch (err) {
            console.error(`Error updating log ${log.id} in local database:`, err);
          }
        }
      }

      // Sync logs from local to Supabase
      console.log('Syncing logs from local to Supabase...');
      for (const log of localLogs) {
        const supabaseLog = supabaseLogsMap.get(log.id);

        if (!supabaseLog) {
          // Check if this might be a duplicate with a different ID
          const dateStr = log.date ? new Date(log.date).toDateString() : 'unknown';
          const key = `${log.recipient_name}-${log.amount}-${dateStr}-${log.direction}-${log.payment_type}`;
          const potentialDuplicates = supabaseLogsByKey.get(key) || [];

          if (potentialDuplicates.length > 0) {
            console.log(`Found potential duplicate for local log ${log.id} in Supabase`);
            // Use the first potential duplicate as the canonical version
            const canonicalLog = potentialDuplicates[0];
            console.log(`Using Supabase log ${canonicalLog.id} as canonical version`);

            // Skip adding this log to avoid duplication
            continue;
          }

          console.log(`Adding local log ${log.id} to Supabase`);
          // Add local log to Supabase
          try {
            const result = await supabaseService.createDailyLog({
              id: log.id,
              user_id: log.user_id,
              direction: log.direction,
              payment_type: log.payment_type,
              date: log.date,
              recipient_name: log.recipient_name,
              amount: log.amount,
              is_third_party: log.is_third_party,
              third_party_name: log.third_party_name,
              notes: log.notes,
              attachment_url: log.attachment_url
            });

            if (result) {
              console.log(`Successfully added log ${log.id} to Supabase`);
            } else {
              console.error(`Failed to add log ${log.id} to Supabase, result was null`);
            }
          } catch (err) {
            console.error(`Error adding log ${log.id} to Supabase:`, err);
          }
        }
      }

      // Update sync status
      await dbService.updateSyncStatus('daily_logs');
      console.log('Daily logs sync status updated');

      return true;
    } catch (error) {
      console.error('Error syncing daily logs:', error);
      return false;
    }
  },

  // Sync buyers for a user
  syncBuyers: async (userId: string): Promise<boolean> => {
    try {
      console.log('SYNC-SERVICE: syncBuyers called for user:', userId);

      if (!isOnline()) {
        console.log('SYNC-SERVICE: Offline, skipping buyers sync');
        return false;
      }

      console.log(`SYNC-SERVICE: Starting buyers sync for user ${userId}`);

      // Get buyers from Supabase
      const supabaseBuyers = await supabaseService.getBuyers(userId);
      console.log(`Retrieved ${supabaseBuyers.length} buyers from Supabase`);

      // Get local buyers
      const localBuyers = await dbService.getBuyersByUser(userId);
      console.log(`Retrieved ${localBuyers.length} buyers from local database`);

      // Create maps for easier lookup
      const localBuyersMap = new Map<string, Buyer>();
      localBuyers.forEach((buyer) => {
        localBuyersMap.set(buyer.id, buyer);
      });

      const supabaseBuyersMap = new Map<string, Buyer>();
      supabaseBuyers.forEach((buyer) => {
        supabaseBuyersMap.set(buyer.id, buyer);
      });

      // Sync buyers from Supabase to local
      console.log('Syncing buyers from Supabase to local...');
      for (const buyer of supabaseBuyers) {
        const localBuyer = localBuyersMap.get(buyer.id);

        if (!localBuyer) {
          console.log(`Adding Supabase buyer ${buyer.id} to local database`);
          // Add Supabase buyer to local DB
          try {
            await dbService.addBuyer(buyer);
            console.log(`Successfully added buyer ${buyer.id} to local database`);
          } catch (err) {
            console.error(`Error adding buyer ${buyer.id} to local database:`, err);
          }
        } else {
          console.log(`Updating local buyer ${buyer.id} with Supabase data`);
          // Update local buyer with Supabase data
          try {
            await dbService.updateBuyer(buyer);
            console.log(`Successfully updated buyer ${buyer.id} in local database`);
          } catch (err) {
            console.error(`Error updating buyer ${buyer.id} in local database:`, err);
          }
        }
      }

      // Sync buyers from local to Supabase
      console.log('Syncing buyers from local to Supabase...');
      for (const buyer of localBuyers) {
        const supabaseBuyer = supabaseBuyersMap.get(buyer.id);

        if (!supabaseBuyer) {
          console.log(`Adding local buyer ${buyer.id} to Supabase`);
          // Add local buyer to Supabase
          try {
            const result = await supabaseService.createBuyer(buyer);
            if (result) {
              console.log(`Successfully added buyer ${buyer.id} to Supabase`);
            } else {
              console.error(`Failed to add buyer ${buyer.id} to Supabase, result was null`);
            }
          } catch (err) {
            console.error(`Error adding buyer ${buyer.id} to Supabase:`, err);
          }
        }
      }

      // Update sync status
      await dbService.updateSyncStatus('buyers');
      console.log('Buyers sync status updated');

      return true;
    } catch (error) {
      console.error('Error syncing buyers:', error);
      return false;
    }
  },

  // Sync sellers for a user
  syncSellers: async (userId: string): Promise<boolean> => {
    try {
      if (!isOnline()) {
        console.log('Offline, skipping sellers sync');
        return false;
      }

      console.log(`Starting sellers sync for user ${userId}`);

      // Get sellers from Supabase
      const supabaseSellers = await supabaseService.getSellers(userId);
      console.log(`Retrieved ${supabaseSellers.length} sellers from Supabase`);

      // Get local sellers
      const localSellers = await dbService.getSellersByUser(userId);
      console.log(`Retrieved ${localSellers.length} sellers from local database`);

      // Create maps for easier lookup
      const localSellersMap = new Map<string, Seller>();
      localSellers.forEach((seller) => {
        localSellersMap.set(seller.id, seller);
      });

      const supabaseSellersMap = new Map<string, Seller>();
      supabaseSellers.forEach((seller) => {
        supabaseSellersMap.set(seller.id, seller);
      });

      // Sync sellers from Supabase to local
      console.log('Syncing sellers from Supabase to local...');
      for (const seller of supabaseSellers) {
        const localSeller = localSellersMap.get(seller.id);

        if (!localSeller) {
          console.log(`Adding Supabase seller ${seller.id} to local database`);
          // Add Supabase seller to local DB
          try {
            await dbService.addSeller(seller);
            console.log(`Successfully added seller ${seller.id} to local database`);
          } catch (err) {
            console.error(`Error adding seller ${seller.id} to local database:`, err);
          }
        } else {
          console.log(`Updating local seller ${seller.id} with Supabase data`);
          // Update local seller with Supabase data
          try {
            await dbService.updateSeller(seller);
            console.log(`Successfully updated seller ${seller.id} in local database`);
          } catch (err) {
            console.error(`Error updating seller ${seller.id} in local database:`, err);
          }
        }
      }

      // Sync sellers from local to Supabase
      console.log('Syncing sellers from local to Supabase...');
      for (const seller of localSellers) {
        const supabaseSeller = supabaseSellersMap.get(seller.id);

        if (!supabaseSeller) {
          console.log(`Adding local seller ${seller.id} to Supabase`);
          // Add local seller to Supabase
          try {
            const result = await supabaseService.createSeller(seller);
            if (result) {
              console.log(`Successfully added seller ${seller.id} to Supabase`);
            } else {
              console.error(`Failed to add seller ${seller.id} to Supabase, result was null`);
            }
          } catch (err) {
            console.error(`Error adding seller ${seller.id} to Supabase:`, err);
          }
        }
      }

      // Update sync status
      await dbService.updateSyncStatus('sellers');
      console.log('Sellers sync status updated');

      return true;
    } catch (error) {
      console.error('Error syncing sellers:', error);
      return false;
    }
  },

  // Force sync buyers, sellers, and daily logs
  // This version avoids using execute_sql which can cause issues
  forceSyncContacts: async (userId: string): Promise<boolean> => {
    try {
      if (!isOnline()) {
        console.log('Offline, skipping sync');
        return false;
      }

      console.log('Force syncing contacts...');

      // Get all buyers from local database
      console.log('Force syncing buyers...');
      const localBuyers = await dbService.getBuyersByUser(userId);
      console.log(`Found ${localBuyers.length} local buyers to sync`);

      // Check if the buyers table exists
      try {
        console.log('Checking if buyers table exists...');
        const { error: checkError } = await supabase.from('buyers').select('id').limit(1);

        if (checkError && checkError.message.includes('does not exist')) {
          console.log('Buyers table does not exist in Supabase');
          console.log('Please create the buyers table in Supabase using the SQL editor');
          console.log(`
            CREATE TABLE IF NOT EXISTS public.buyers (
              id TEXT PRIMARY KEY,
              user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
              name TEXT NOT NULL,
              email TEXT,
              phone TEXT,
              created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
            );

            ALTER TABLE public.buyers ENABLE ROW LEVEL SECURITY;

            CREATE POLICY "Users can manage their own buyers"
              ON public.buyers
              USING (user_id = auth.uid());

            GRANT SELECT, INSERT, UPDATE, DELETE ON public.buyers TO authenticated;
          `);
        } else {
          console.log('Buyers table exists in Supabase');
        }
      } catch (tableError) {
        console.error('Error checking buyers table:', tableError);
      }

      // Sync each buyer to Supabase using direct SQL insert
      let buyerSuccessCount = 0;
      let buyerFailureCount = 0;

      for (const buyer of localBuyers) {
        try {
          console.log(`Processing buyer ${buyer.id} (${buyer.name})`);

          // Try direct upsert
          console.log(`Trying direct upsert for buyer ${buyer.id}...`);

          // Check if the buyer already exists
          const { data: existingBuyer, error: checkError } = await supabase
            .from('buyers')
            .select('id')
            .eq('id', buyer.id)
            .maybeSingle();

          let sqlError = null;

          if (checkError) {
            console.error(`Error checking if buyer ${buyer.id} exists:`, checkError);
            sqlError = checkError;
          } else if (existingBuyer) {
            // Update existing buyer
            const { error: updateError } = await supabase
              .from('buyers')
              .update({
                name: buyer.name,
                email: buyer.email,
                phone: buyer.phone
              })
              .eq('id', buyer.id);

            if (updateError) {
              console.error(`Error updating buyer ${buyer.id}:`, updateError);
              sqlError = updateError;
            } else {
              console.log(`Successfully updated buyer ${buyer.id} directly`);
              buyerSuccessCount++;
            }
          } else {
            // Insert new buyer
            const { error: insertError } = await supabase
              .from('buyers')
              .insert({
                id: buyer.id,
                user_id: userId,
                name: buyer.name,
                email: buyer.email,
                phone: buyer.phone,
                created_at: buyer.created_at || new Date().toISOString()
              });

            if (insertError) {
              console.error(`Error inserting buyer ${buyer.id}:`, insertError);
              sqlError = insertError;
            } else {
              console.log(`Successfully inserted buyer ${buyer.id} directly`);
              buyerSuccessCount++;
            }
          }

          if (sqlError) {
            console.error(`Error upserting buyer ${buyer.id} via SQL:`, sqlError);

            // Try the regular API as fallback
            try {
              const result = await supabaseService.createBuyer(buyer);
              if (result) {
                console.log(`Successfully synced buyer ${buyer.id} via API`);
                buyerSuccessCount++;
              } else {
                console.error(`Failed to sync buyer ${buyer.id} via API`);
                buyerFailureCount++;
              }
            } catch (apiError) {
              console.error(`Error syncing buyer ${buyer.id} via API:`, apiError);
              buyerFailureCount++;
            }
          } else {
            console.log(`Successfully upserted buyer ${buyer.id} via SQL`);
            buyerSuccessCount++;
          }
        } catch (error) {
          console.error(`Error syncing buyer ${buyer.id} to Supabase:`, error);
          buyerFailureCount++;
        }
      }

      console.log(`Buyer sync summary: ${buyerSuccessCount} succeeded, ${buyerFailureCount} failed`);

      // Get all sellers from local database
      console.log('Force syncing sellers...');
      const localSellers = await dbService.getSellersByUser(userId);
      console.log(`Found ${localSellers.length} local sellers to sync`);

      // Check if the sellers table exists
      try {
        console.log('Checking if sellers table exists...');
        const { error: checkError } = await supabase.from('sellers').select('id').limit(1);

        if (checkError && checkError.message.includes('does not exist')) {
          console.log('Sellers table does not exist in Supabase');
          console.log('Please create the sellers table in Supabase using the SQL editor');
          console.log(`
            CREATE TABLE IF NOT EXISTS public.sellers (
              id TEXT PRIMARY KEY,
              user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
              name TEXT NOT NULL,
              email TEXT,
              phone TEXT,
              created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
            );

            ALTER TABLE public.sellers ENABLE ROW LEVEL SECURITY;

            CREATE POLICY "Users can manage their own sellers"
              ON public.sellers
              USING (user_id = auth.uid());

            GRANT SELECT, INSERT, UPDATE, DELETE ON public.sellers TO authenticated;
          `);
        } else {
          console.log('Sellers table exists in Supabase');
        }
      } catch (tableError) {
        console.error('Error checking sellers table:', tableError);
      }

      // Sync each seller to Supabase using direct SQL insert
      let sellerSuccessCount = 0;
      let sellerFailureCount = 0;

      for (const seller of localSellers) {
        try {
          console.log(`Processing seller ${seller.id} (${seller.name})`);

          // Try direct upsert
          console.log(`Trying direct insert for seller ${seller.id}...`);

          // Check if the seller already exists
          const { data: existingSeller, error: checkError } = await supabase
            .from('sellers')
            .select('id')
            .eq('id', seller.id)
            .maybeSingle();

          let sqlError = null;

          if (checkError) {
            console.error(`Error checking if seller ${seller.id} exists:`, checkError);
            sqlError = checkError;
          } else if (existingSeller) {
            // Update existing seller
            const { error: updateError } = await supabase
              .from('sellers')
              .update({
                name: seller.name,
                email: seller.email,
                phone: seller.phone
              })
              .eq('id', seller.id);

            if (updateError) {
              console.error(`Error updating seller ${seller.id}:`, updateError);
              sqlError = updateError;
            } else {
              console.log(`Successfully updated seller ${seller.id} directly`);
              sellerSuccessCount++;
            }
          } else {
            // Insert new seller
            const { error: insertError } = await supabase
              .from('sellers')
              .insert({
                id: seller.id,
                user_id: userId,
                name: seller.name,
                email: seller.email,
                phone: seller.phone,
                created_at: seller.created_at || new Date().toISOString()
              });

            if (insertError) {
              console.error(`Error inserting seller ${seller.id}:`, insertError);
              sqlError = insertError;
            } else {
              console.log(`Successfully inserted seller ${seller.id} directly`);
              sellerSuccessCount++;
            }
          }

          if (sqlError) {
            console.error(`Error upserting seller ${seller.id} via SQL:`, sqlError);

            // Try the regular API as fallback
            try {
              const result = await supabaseService.createSeller(seller);
              if (result) {
                console.log(`Successfully synced seller ${seller.id} via API`);
                sellerSuccessCount++;
              } else {
                console.error(`Failed to sync seller ${seller.id} via API`);
                sellerFailureCount++;
              }
            } catch (apiError) {
              console.error(`Error syncing seller ${seller.id} via API:`, apiError);
              sellerFailureCount++;
            }
          } else {
            console.log(`Successfully upserted seller ${seller.id} via SQL`);
            sellerSuccessCount++;
          }
        } catch (error) {
          console.error(`Error syncing seller ${seller.id} to Supabase:`, error);
          sellerFailureCount++;
        }
      }

      console.log(`Seller sync summary: ${sellerSuccessCount} succeeded, ${sellerFailureCount} failed`);

      // Get all daily logs from local database
      console.log('Force syncing daily logs...');
      const localLogs = await dbService.getDailyLogsByUser(userId);
      console.log(`Found ${localLogs.length} local daily logs to sync`);

      // Sync each daily log to Supabase
      for (const log of localLogs) {
        try {
          console.log(`Processing daily log ${log.id}`);
          // Check if log exists in Supabase
          const supabaseLogs = await supabaseService.getDailyLogs(userId);
          const existsInSupabase = supabaseLogs.some(l => l.id === log.id);

          if (existsInSupabase) {
            console.log(`Daily log ${log.id} exists in Supabase, updating...`);
            const result = await supabaseService.updateDailyLog(log);
            if (result) {
              console.log(`Successfully updated daily log ${log.id} in Supabase`);
            } else {
              console.error(`Failed to update daily log ${log.id} in Supabase`);
            }
          } else {
            console.log(`Daily log ${log.id} does not exist in Supabase, creating...`);
            const result = await supabaseService.createDailyLog(log);
            if (result) {
              console.log(`Successfully created daily log ${log.id} in Supabase`);
            } else {
              console.error(`Failed to create daily log ${log.id} in Supabase`);
            }
          }
        } catch (error) {
          console.error(`Error syncing daily log ${log.id} to Supabase:`, error);
        }
      }

      return true;
    } catch (error) {
      console.error('Error force syncing contacts and logs:', error);
      return false;
    }
  },

  // Clean up duplicate transactions and daily logs in both Supabase and local database
  cleanupDuplicateTransactions: async (userId: string): Promise<boolean> => {
    try {
      console.log('Starting duplicate data cleanup for user:', userId);

      // First, clean up local transaction duplicates
      console.log('Cleaning up local transaction duplicates...');
      const localTransactionDuplicatesRemoved = await dbService.cleanupDuplicateTransactions(userId);
      console.log(`Removed ${localTransactionDuplicatesRemoved} local duplicate transactions`);

      // Then, clean up local daily log duplicates
      console.log('Cleaning up local daily log duplicates...');
      const localDailyLogDuplicatesRemoved = await dbService.cleanupDuplicateDailyLogs(userId);
      console.log(`Removed ${localDailyLogDuplicatesRemoved} local duplicate daily logs`);

      // Then clean up Supabase duplicates if online
      if (!isOnline()) {
        console.log('Offline, skipping Supabase cleanup');
        return localTransactionDuplicatesRemoved > 0 || localDailyLogDuplicatesRemoved > 0; // Return true if we removed any local duplicates
      }

      console.log('Cleaning up Supabase duplicates...');
      // Get all transactions from Supabase
      const supabaseTransactions = await supabaseService.getTransactions(userId);
      console.log(`Retrieved ${supabaseTransactions.length} transactions from Supabase`);

      // Group transactions by name and date
      const transactionGroups = new Map<string, Transaction[]>();

      supabaseTransactions.forEach(transaction => {
        const dateStr = transaction.created_at ? new Date(transaction.created_at).toDateString() : 'unknown';
        const key = `${transaction.name}-${dateStr}`;

        if (!transactionGroups.has(key)) {
          transactionGroups.set(key, []);
        }
        transactionGroups.get(key)?.push(transaction);
      });

      // Find groups with duplicates
      let duplicatesFound = 0;
      let duplicatesRemoved = 0;

      for (const [key, transactions] of transactionGroups.entries()) {
        if (transactions.length > 1) {
          console.log(`Found ${transactions.length} duplicate transactions for key: ${key}`);
          duplicatesFound += transactions.length - 1;

          // Sort by ID to ensure consistent results
          transactions.sort((a, b) => a.id.localeCompare(b.id));

          // Keep the first transaction, delete the rest
          const transactionToKeep = transactions[0];
          console.log(`Keeping transaction ${transactionToKeep.id}`);

          for (let i = 1; i < transactions.length; i++) {
            const duplicateTransaction = transactions[i];
            console.log(`Deleting duplicate transaction ${duplicateTransaction.id}`);

            try {
              await supabaseService.deleteTransaction(duplicateTransaction.id);
              duplicatesRemoved++;
            } catch (error) {
              console.error(`Error deleting duplicate transaction ${duplicateTransaction.id}:`, error);
            }
          }
        }
      }

      console.log(`Supabase transaction cleanup complete. Found ${duplicatesFound} duplicates, removed ${duplicatesRemoved}`);

      // Now clean up duplicate daily logs in Supabase
      console.log('Cleaning up duplicate daily logs in Supabase...');

      // Get all daily logs from Supabase
      const supabaseDailyLogs = await supabaseService.getDailyLogs(userId);
      console.log(`Retrieved ${supabaseDailyLogs.length} daily logs from Supabase`);

      // Group daily logs by recipient, amount, date, and direction
      const dailyLogGroups = new Map<string, DailyLog[]>();

      supabaseDailyLogs.forEach(log => {
        const dateStr = log.date ? new Date(log.date).toDateString() : 'unknown';
        // Create a unique key based on the important fields
        const key = `${log.recipient_name}-${log.amount}-${dateStr}-${log.direction}-${log.payment_type}`;

        if (!dailyLogGroups.has(key)) {
          dailyLogGroups.set(key, []);
        }
        dailyLogGroups.get(key)?.push(log);
      });

      // Find groups with duplicates
      let dailyLogDuplicatesFound = 0;
      let dailyLogDuplicatesRemoved = 0;

      for (const [key, logs] of dailyLogGroups.entries()) {
        if (logs.length > 1) {
          console.log(`Found ${logs.length} duplicate daily logs for key: ${key}`);
          dailyLogDuplicatesFound += logs.length - 1;

          // Sort by ID to ensure consistent results
          logs.sort((a, b) => a.id.localeCompare(b.id));

          // Keep the first log, delete the rest
          const logToKeep = logs[0];
          console.log(`Keeping daily log ${logToKeep.id}`);

          for (let i = 1; i < logs.length; i++) {
            const duplicateLog = logs[i];
            console.log(`Deleting duplicate daily log ${duplicateLog.id}`);

            try {
              await supabaseService.deleteDailyLog(duplicateLog.id);
              dailyLogDuplicatesRemoved++;
            } catch (error) {
              console.error(`Error deleting duplicate daily log ${duplicateLog.id}:`, error);
            }
          }
        }
      }

      console.log(`Supabase daily log cleanup complete. Found ${dailyLogDuplicatesFound} duplicates, removed ${dailyLogDuplicatesRemoved}`);

      // Return true if we removed any duplicates (either local or Supabase)
      return localTransactionDuplicatesRemoved > 0 || localDailyLogDuplicatesRemoved > 0 || duplicatesRemoved > 0 || dailyLogDuplicatesRemoved > 0;
    } catch (error) {
      console.error('Error cleaning up duplicate transactions:', error);
      return false;
    }
  },

  // Sync all data for a user
  syncAll: async (userId: string): Promise<boolean> => {
    try {
      if (!isOnline()) {
        console.log('Offline, skipping sync');
        return false;
      }

      // First, clean up any duplicate transactions
      await syncService.cleanupDuplicateTransactions(userId);

      // Sync user data
      await syncService.syncUserData(userId);

      // Sync transactions
      await syncService.syncTransactions(userId);

      // Get all transactions
      const transactions = await dbService.getAllTransactions(userId);

      // Sync related data for each transaction
      for (const transaction of transactions) {
        await syncService.syncPurchases(transaction.id);
        await syncService.syncTransportation(transaction.id);
        await syncService.syncSales(transaction.id);
        await syncService.syncPayments(transaction.id);
        await syncService.syncNotes(transaction.id);
        await syncService.syncAttachments(transaction.id);
      }

      // Sync other data
      await syncService.syncDailyLogs(userId);
      await syncService.syncBuyers(userId);
      await syncService.syncSellers(userId);

      return true;
    } catch (error) {
      console.error('Error syncing all data:', error);
      return false;
    }
  },

  // Sync a complete transaction
  syncCompleteTransaction: async (transactionId: string): Promise<boolean> => {
    try {
      if (!isOnline()) {
        console.log('Offline, skipping sync');
        return false;
      }

      // Sync transaction
      const transaction = await dbService.getTransaction(transactionId);
      if (!transaction) {
        console.error('Transaction not found:', transactionId);
        return false;
      }

      // Sync related data
      await syncService.syncPurchases(transactionId);
      await syncService.syncTransportation(transactionId);
      await syncService.syncSales(transactionId);
      await syncService.syncPayments(transactionId);
      await syncService.syncNotes(transactionId);
      await syncService.syncAttachments(transactionId);

      return true;
    } catch (error) {
      console.error('Error syncing complete transaction:', error);
      return false;
    }
  }
};
