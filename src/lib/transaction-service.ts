import { dbService } from './db-service';
import { supabaseService } from './supabase-service';
import { syncService } from './sync-service';
import {
  Transaction,
  Purchase,
  Transportation,
  Sale,
  Payment,
  TransactionNote,
  Attachment,
  CompleteTransaction
} from './types';
import { v4 as uuidv4 } from 'uuid';

// Check if online
const isOnline = (): boolean => {
  return navigator.onLine;
};

// Transaction service for handling transaction operations
export const transactionService = {
  // Get all transactions for a user
  getAllTransactions: async (userId: string): Promise<Transaction[]> => {
    try {
      // Get transactions from local database
      const transactions = await dbService.getAllTransactions(userId);

      // Try to sync with Supabase if online
      if (isOnline()) {
        try {
          console.log('Syncing transactions with Supabase...');
          const syncResult = await syncService.syncTransactions(userId);

          if (syncResult) {
            console.log('Sync successful, fetching updated transactions');
            // Only fetch again if sync was successful
            return await dbService.getAllTransactions(userId);
          } else {
            console.log('Sync was not successful, using local transactions');
            return transactions;
          }
        } catch (error) {
          console.error('Error syncing transactions:', error);
          // Return local transactions if sync fails
          return transactions;
        }
      }

      return transactions;
    } catch (error) {
      console.error('Error getting all transactions:', error);
      return [];
    }
  },

  // Get a transaction by ID
  getTransaction: async (id: string): Promise<Transaction | null> => {
    try {
      // Get transaction from local database
      const transaction = await dbService.getTransaction(id);

      // Try to sync with Supabase if online
      if (isOnline() && transaction) {
        try {
          await syncService.syncCompleteTransaction(id);
          // Get updated transaction after sync
          return await dbService.getTransaction(id);
        } catch (error) {
          console.error('Error syncing transaction:', error);
          // Return local transaction if sync fails
          return transaction;
        }
      }

      return transaction;
    } catch (error) {
      console.error('Error getting transaction:', error);
      return null;
    }
  },

  // Get complete transaction with all related data
  getCompleteTransaction: async (id: string): Promise<CompleteTransaction | null> => {
    try {
      // Get complete transaction from local database
      const completeTransaction = await dbService.getCompleteTransaction(id);

      // Try to sync with Supabase if online
      if (isOnline() && completeTransaction) {
        try {
          await syncService.syncCompleteTransaction(id);
          // Get updated complete transaction after sync
          return await dbService.getCompleteTransaction(id);
        } catch (error) {
          console.error('Error syncing complete transaction:', error);
          // Return local complete transaction if sync fails
          return completeTransaction;
        }
      }

      return completeTransaction;
    } catch (error) {
      console.error('Error getting complete transaction:', error);
      return null;
    }
  },

  // Create a new transaction
  createTransaction: async (userId: string, name: string): Promise<Transaction | null> => {
    try {
      console.log(`Creating new transaction for user ${userId} with name: ${name}`);

      // Create transaction in local database
      const transaction: Omit<Transaction, 'id'> = {
        user_id: userId,
        name,
        status: 'pending',
        created_at: new Date().toISOString()
      };

      // Check if a transaction with the same name already exists for this user
      const existingTransactions = await dbService.getAllTransactions(userId);
      const duplicateTransaction = existingTransactions.find(t =>
        t.name === name &&
        new Date(t.created_at || '').toDateString() === new Date().toDateString()
      );

      if (duplicateTransaction) {
        console.log(`Found duplicate transaction with name ${name}, returning existing transaction`);
        return duplicateTransaction;
      }

      const newTransaction = await dbService.addTransaction(transaction);
      console.log(`Created new transaction with ID: ${newTransaction.id}`);

      // Try to sync with Supabase if online
      if (isOnline()) {
        try {
          console.log(`Syncing new transaction ${newTransaction.id} to Supabase`);
          await supabaseService.createTransaction(newTransaction);
          console.log(`Successfully synced transaction ${newTransaction.id} to Supabase`);
        } catch (error) {
          console.error('Error syncing new transaction to Supabase:', error);
          // Transaction is still saved locally even if sync fails
        }
      }

      return newTransaction;
    } catch (error) {
      console.error('Error creating transaction:', error);
      return null;
    }
  },

  // Update a transaction
  updateTransaction: async (transaction: Transaction): Promise<Transaction | null> => {
    try {
      // Update transaction in local database
      const updatedTransaction = await dbService.updateTransaction(transaction);

      // Try to sync with Supabase if online
      if (isOnline()) {
        try {
          await supabaseService.updateTransaction(transaction);
        } catch (error) {
          console.error('Error syncing updated transaction to Supabase:', error);
          // Transaction is still updated locally even if sync fails
        }
      }

      return updatedTransaction;
    } catch (error) {
      console.error('Error updating transaction:', error);
      return null;
    }
  },

  // Delete a transaction
  deleteTransaction: async (id: string): Promise<boolean> => {
    try {
      // Delete transaction from local database
      await dbService.deleteTransaction(id);

      // Try to sync with Supabase if online
      if (isOnline()) {
        try {
          await supabaseService.deleteTransaction(id);
        } catch (error) {
          console.error('Error syncing deleted transaction to Supabase:', error);
          // Transaction is still deleted locally even if sync fails
        }
      }

      return true;
    } catch (error) {
      console.error('Error deleting transaction:', error);
      return false;
    }
  },

  // Add a purchase to a transaction
  addPurchase: async (purchase: Omit<Purchase, 'id'>): Promise<Purchase | null> => {
    try {
      // Add purchase to local database
      const newPurchase = await dbService.addPurchase(purchase);

      // Try to sync with Supabase if online
      if (isOnline()) {
        try {
          await supabaseService.createPurchase(newPurchase);
        } catch (error) {
          console.error('Error syncing new purchase to Supabase:', error);
          // Purchase is still saved locally even if sync fails
        }
      }

      return newPurchase;
    } catch (error) {
      console.error('Error adding purchase:', error);
      return null;
    }
  },

  // Update a purchase
  updatePurchase: async (purchase: Purchase): Promise<Purchase | null> => {
    try {
      // Update purchase in local database
      const updatedPurchase = await dbService.updatePurchase(purchase);

      // Try to sync with Supabase if online
      if (isOnline()) {
        try {
          await supabaseService.updatePurchase(purchase);
        } catch (error) {
          console.error('Error syncing updated purchase to Supabase:', error);
          // Purchase is still updated locally even if sync fails
        }
      }

      return updatedPurchase;
    } catch (error) {
      console.error('Error updating purchase:', error);
      return null;
    }
  },

  // Delete a purchase
  deletePurchase: async (id: string): Promise<boolean> => {
    try {
      // Delete purchase from local database
      await dbService.deletePurchase(id);

      // Try to sync with Supabase if online
      if (isOnline()) {
        try {
          await supabaseService.deletePurchase(id);
        } catch (error) {
          console.error('Error syncing deleted purchase to Supabase:', error);
          // Purchase is still deleted locally even if sync fails
        }
      }

      return true;
    } catch (error) {
      console.error('Error deleting purchase:', error);
      return false;
    }
  },

  // Add or update transportation for a transaction
  saveTransportation: async (transportation: Omit<Transportation, 'id'> | Transportation): Promise<Transportation | null> => {
    try {
      let result: Transportation;
      console.log('Saving transportation:', transportation);

      // Prepare transportation data for saving
      // Make a copy to avoid modifying the original object
      const transportationData = { ...transportation };

      // Check if transportation has an ID (update) or not (add)
      if ('id' in transportationData) {
        console.log('Updating existing transportation with ID:', transportationData.id);
        // Update transportation in local database
        result = await dbService.updateTransportation(transportationData as Transportation);
        console.log('Transportation updated in local database:', result);

        // Try to sync with Supabase if online
        if (isOnline()) {
          try {
            console.log('Syncing updated transportation to Supabase...');
            const supabaseResult = await supabaseService.updateTransportation(transportationData as Transportation);
            console.log('Supabase update result:', supabaseResult);

            // Force sync the transportation data to ensure it's properly synced
            await syncService.syncTransportation(transportationData.transaction_id);
          } catch (error) {
            console.error('Error syncing updated transportation to Supabase:', error);
            // Transportation is still updated locally even if sync fails
          }
        }
      } else {
        console.log('Adding new transportation for transaction:', transportationData.transaction_id);
        // Add transportation to local database
        const newTransportation: Transportation = {
          ...transportationData,
          id: uuidv4()
        };

        result = await dbService.addTransportation(newTransportation);
        console.log('Transportation added to local database:', result);

        // Try to sync with Supabase if online
        if (isOnline()) {
          try {
            console.log('Syncing new transportation to Supabase...');
            const supabaseResult = await supabaseService.createTransportation(newTransportation);
            console.log('Supabase create result:', supabaseResult);

            // If sync was successful, update local record with Supabase data
            if (supabaseResult) {
              await dbService.updateTransportation(supabaseResult);
              console.log('Updated local transportation with Supabase data');
              result = supabaseResult;
            } else {
              // Force sync the transportation data to ensure it's properly synced
              await syncService.syncTransportation(transportationData.transaction_id);
            }
          } catch (error) {
            console.error('Error syncing new transportation to Supabase:', error);
            // Transportation is still saved locally even if sync fails
          }
        }
      }

      return result;
    } catch (error) {
      console.error('Error saving transportation:', error);
      return null;
    }
  },

  // Delete transportation
  deleteTransportation: async (id: string): Promise<boolean> => {
    try {
      // Delete transportation from local database
      await dbService.deleteTransportation(id);

      // Try to sync with Supabase if online
      if (isOnline()) {
        try {
          await supabaseService.deleteTransportation(id);
        } catch (error) {
          console.error('Error syncing deleted transportation to Supabase:', error);
          // Transportation is still deleted locally even if sync fails
        }
      }

      return true;
    } catch (error) {
      console.error('Error deleting transportation:', error);
      return false;
    }
  },

  // Add a sale to a transaction
  addSale: async (sale: Omit<Sale, 'id'>): Promise<Sale | null> => {
    try {
      // Add sale to local database
      const newSale = await dbService.addSale(sale);

      // Try to sync with Supabase if online
      if (isOnline()) {
        try {
          await supabaseService.createSale(newSale);
        } catch (error) {
          console.error('Error syncing new sale to Supabase:', error);
          // Sale is still saved locally even if sync fails
        }
      }

      return newSale;
    } catch (error) {
      console.error('Error adding sale:', error);
      return null;
    }
  },

  // Update a sale
  updateSale: async (sale: Sale): Promise<Sale | null> => {
    try {
      // Update sale in local database
      const updatedSale = await dbService.updateSale(sale);

      // Try to sync with Supabase if online
      if (isOnline()) {
        try {
          await supabaseService.updateSale(sale);
        } catch (error) {
          console.error('Error syncing updated sale to Supabase:', error);
          // Sale is still updated locally even if sync fails
        }
      }

      return updatedSale;
    } catch (error) {
      console.error('Error updating sale:', error);
      return null;
    }
  },

  // Delete a sale
  deleteSale: async (id: string): Promise<boolean> => {
    try {
      // Delete sale from local database
      await dbService.deleteSale(id);

      // Try to sync with Supabase if online
      if (isOnline()) {
        try {
          await supabaseService.deleteSale(id);
        } catch (error) {
          console.error('Error syncing deleted sale to Supabase:', error);
          // Sale is still deleted locally even if sync fails
        }
      }

      return true;
    } catch (error) {
      console.error('Error deleting sale:', error);
      return false;
    }
  },

  // Add a payment to a transaction
  addPayment: async (payment: Omit<Payment, 'id'>): Promise<Payment | null> => {
    try {
      // Add payment to local database
      const newPayment = await dbService.addPayment(payment);

      // Try to sync with Supabase if online
      if (isOnline()) {
        try {
          await supabaseService.createPayment(newPayment);
        } catch (error) {
          console.error('Error syncing new payment to Supabase:', error);
          // Payment is still saved locally even if sync fails
        }
      }

      return newPayment;
    } catch (error) {
      console.error('Error adding payment:', error);
      return null;
    }
  },

  // Update a payment
  updatePayment: async (payment: Payment): Promise<Payment | null> => {
    try {
      // Update payment in local database
      const updatedPayment = await dbService.updatePayment(payment);

      // Try to sync with Supabase if online
      if (isOnline()) {
        try {
          await supabaseService.updatePayment(payment);
        } catch (error) {
          console.error('Error syncing updated payment to Supabase:', error);
          // Payment is still updated locally even if sync fails
        }
      }

      return updatedPayment;
    } catch (error) {
      console.error('Error updating payment:', error);
      return null;
    }
  },

  // Delete a payment
  deletePayment: async (id: string): Promise<boolean> => {
    try {
      // Delete payment from local database
      await dbService.deletePayment(id);

      // Try to sync with Supabase if online
      if (isOnline()) {
        try {
          await supabaseService.deletePayment(id);
        } catch (error) {
          console.error('Error syncing deleted payment to Supabase:', error);
          // Payment is still deleted locally even if sync fails
        }
      }

      return true;
    } catch (error) {
      console.error('Error deleting payment:', error);
      return false;
    }
  },

  // Add a note to a transaction
  addNote: async (transactionId: string, noteText: string): Promise<TransactionNote | null> => {
    try {
      // Create note object
      const note: Omit<TransactionNote, 'id' | 'created_at'> = {
        transaction_id: transactionId,
        note: noteText
      };

      // Add note to local database
      const newNote = await dbService.addTransactionNote(note);

      // Try to sync with Supabase if online
      if (isOnline()) {
        try {
          await supabaseService.createNote(newNote);
        } catch (error) {
          console.error('Error syncing new note to Supabase:', error);
          // Note is still saved locally even if sync fails
        }
      }

      return newNote;
    } catch (error) {
      console.error('Error adding note:', error);
      return null;
    }
  },

  // Update a note
  updateNote: async (note: TransactionNote): Promise<TransactionNote | null> => {
    try {
      // Update note in local database
      const updatedNote = await dbService.updateTransactionNote(note);

      // Try to sync with Supabase if online
      if (isOnline()) {
        try {
          await supabaseService.updateNote(note);
        } catch (error) {
          console.error('Error syncing updated note to Supabase:', error);
          // Note is still updated locally even if sync fails
        }
      }

      return updatedNote;
    } catch (error) {
      console.error('Error updating note:', error);
      return null;
    }
  },

  // Delete a note
  deleteNote: async (id: string): Promise<boolean> => {
    try {
      // Delete note from local database
      await dbService.deleteTransactionNote(id);

      // Try to sync with Supabase if online
      if (isOnline()) {
        try {
          await supabaseService.deleteNote(id);
        } catch (error) {
          console.error('Error syncing deleted note to Supabase:', error);
          // Note is still deleted locally even if sync fails
        }
      }

      return true;
    } catch (error) {
      console.error('Error deleting note:', error);
      return false;
    }
  },

  // Add an attachment to a transaction
  addAttachment: async (
    transactionId: string,
    userId: string,
    file: File,
    name: string,
    fileType: string
  ): Promise<Attachment | null> => {
    try {
      let uri = URL.createObjectURL(file);

      // If online, upload to Supabase storage
      if (isOnline()) {
        try {
          const uploadedUrl = await supabaseService.uploadAttachmentFile(
            userId,
            file,
            `${Date.now()}_${name}`
          );

          if (uploadedUrl) {
            uri = uploadedUrl;
          }
        } catch (error) {
          console.error('Error uploading attachment to Supabase storage:', error);
          // Continue with local URI if upload fails
        }
      }

      // Create attachment object
      const attachment: Omit<Attachment, 'id' | 'created_at'> = {
        transaction_id: transactionId,
        name,
        file_type: fileType,
        uri
      };

      // Add attachment to local database
      const newAttachment = await dbService.addAttachment(attachment);

      // Try to sync with Supabase if online
      if (isOnline()) {
        try {
          await supabaseService.createAttachment(newAttachment);
        } catch (error) {
          console.error('Error syncing new attachment to Supabase:', error);
          // Attachment is still saved locally even if sync fails
        }
      }

      return newAttachment;
    } catch (error) {
      console.error('Error adding attachment:', error);
      return null;
    }
  },

  // Delete an attachment
  deleteAttachment: async (id: string): Promise<boolean> => {
    try {
      // Get attachment to get the URI
      const attachment = await dbService.getAttachment(id);

      // Delete attachment from local database
      await dbService.deleteAttachment(id);

      // Try to sync with Supabase if online
      if (isOnline()) {
        try {
          await supabaseService.deleteAttachment(id);

          // If the attachment was stored in Supabase storage, we should delete it
          // This would require additional code to extract the path from the URI
          // and delete it from storage
        } catch (error) {
          console.error('Error syncing deleted attachment to Supabase:', error);
          // Attachment is still deleted locally even if sync fails
        }
      }

      return true;
    } catch (error) {
      console.error('Error deleting attachment:', error);
      return false;
    }
  },

  // Force sync a transaction with all its related data
  syncTransaction: async (id: string): Promise<boolean> => {
    try {
      if (!isOnline()) {
        console.log('Offline, skipping sync');
        return false;
      }

      return await syncService.syncCompleteTransaction(id);
    } catch (error) {
      console.error('Error syncing transaction:', error);
      return false;
    }
  },

  // Get sync status
  getSyncStatus: async (): Promise<boolean> => {
    try {
      const status = await syncService.getSyncStatus();
      return status.isAllSynced;
    } catch (error) {
      console.error('Error getting sync status:', error);
      return false;
    }
  }
};
