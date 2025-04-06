import { supabaseSimple as supabase } from '@/integrations/supabase/simple-client';
import { supabaseUtils } from './supabase-utils';
import { dbService } from './db-service';
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
  CompleteTransaction
} from './types';

// Supabase service for handling data synchronization
export const supabaseService = {
  // User operations
  getCurrentUser: async (): Promise<User | null> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching user:', error);
        return null;
      }

      return data as User;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  },

  createUserProfile: async (user: Omit<User, 'created_at'>): Promise<User | null> => {
    try {
      const { data, error } = await supabase
        .from('users')
        .insert(user)
        .select()
        .single();

      if (error) {
        console.error('Error creating user profile:', error);
        return null;
      }

      return data as User;
    } catch (error) {
      console.error('Error creating user profile:', error);
      return null;
    }
  },

  updateUserProfile: async (user: Partial<User>): Promise<User | null> => {
    try {
      const { data, error } = await supabase
        .from('users')
        .update(user)
        .eq('id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating user profile:', error);
        return null;
      }

      return data as User;
    } catch (error) {
      console.error('Error updating user profile:', error);
      return null;
    }
  },

  // Transaction operations
  getTransactions: async (userId: string): Promise<Transaction[]> => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId);

      if (error) {
        console.error('Error fetching transactions:', error);
        return [];
      }

      return data as Transaction[];
    } catch (error) {
      console.error('Error getting transactions:', error);
      return [];
    }
  },

  getTransaction: async (id: string): Promise<Transaction | null> => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching transaction:', error);
        return null;
      }

      return data as Transaction;
    } catch (error) {
      console.error('Error getting transaction:', error);
      return null;
    }
  },

  createTransaction: async (transaction: Omit<Transaction, 'created_at'>): Promise<Transaction | null> => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .insert(transaction)
        .select()
        .single();

      if (error) {
        console.error('Error creating transaction:', error);
        return null;
      }

      return data as Transaction;
    } catch (error) {
      console.error('Error creating transaction:', error);
      return null;
    }
  },

  updateTransaction: async (transaction: Partial<Transaction>): Promise<Transaction | null> => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .update(transaction)
        .eq('id', transaction.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating transaction:', error);
        return null;
      }

      return data as Transaction;
    } catch (error) {
      console.error('Error updating transaction:', error);
      return null;
    }
  },

  deleteTransaction: async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting transaction:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error deleting transaction:', error);
      return false;
    }
  },

  // Purchase operations
  getPurchases: async (transactionId: string): Promise<Purchase[]> => {
    try {
      const { data, error } = await supabase
        .from('purchases')
        .select('*')
        .eq('transaction_id', transactionId);

      if (error) {
        console.error('Error fetching purchases:', error);
        return [];
      }

      return data as Purchase[];
    } catch (error) {
      console.error('Error getting purchases:', error);
      return [];
    }
  },

  createPurchase: async (purchase: Purchase): Promise<Purchase | null> => {
    try {
      const { data, error } = await supabase
        .from('purchases')
        .insert(purchase)
        .select()
        .single();

      if (error) {
        console.error('Error creating purchase:', error);
        return null;
      }

      return data as Purchase;
    } catch (error) {
      console.error('Error creating purchase:', error);
      return null;
    }
  },

  updatePurchase: async (purchase: Partial<Purchase>): Promise<Purchase | null> => {
    try {
      const { data, error } = await supabase
        .from('purchases')
        .update(purchase)
        .eq('id', purchase.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating purchase:', error);
        return null;
      }

      return data as Purchase;
    } catch (error) {
      console.error('Error updating purchase:', error);
      return null;
    }
  },

  deletePurchase: async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('purchases')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting purchase:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error deleting purchase:', error);
      return false;
    }
  },

  // Transportation operations
  getTransportation: async (transactionId: string): Promise<Transportation | null> => {
    try {
      const { data, error } = await supabase
        .from('transportation')
        .select('*')
        .eq('transaction_id', transactionId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "No rows returned" error
        console.error('Error fetching transportation:', error);
        return null;
      }

      return data as Transportation;
    } catch (error) {
      console.error('Error getting transportation:', error);
      return null;
    }
  },

  createTransportation: async (transportation: Transportation): Promise<Transportation | null> => {
    try {
      console.log('Creating transportation in Supabase:', transportation);

      // First, check if a transportation record already exists for this transaction
      const existingTransportation = await supabaseService.getTransportation(transportation.transaction_id);

      if (existingTransportation) {
        console.log('Transportation already exists, updating instead:', existingTransportation);
        // Make sure to preserve the ID from the existing record
        return await supabaseService.updateTransportation({
          ...existingTransportation,
          ...transportation,
          id: existingTransportation.id // Ensure we use the existing ID
        });
      }

      // Clean up the transportation data before sending to Supabase
      const cleanedTransportation = { ...transportation };

      // Handle empty date and time fields - set them to null instead of empty strings
      if (cleanedTransportation.departure_date === '') cleanedTransportation.departure_date = null;
      if (cleanedTransportation.expected_arrival_date === '') cleanedTransportation.expected_arrival_date = null;
      if (cleanedTransportation.departure_time === '') cleanedTransportation.departure_time = null;
      if (cleanedTransportation.expected_arrival_time === '') cleanedTransportation.expected_arrival_time = null;

      // If no existing record, create a new one
      console.log('No existing transportation found, creating new record with cleaned data:', cleanedTransportation);
      const { data, error } = await supabase
        .from('transportation')
        .insert(cleanedTransportation)
        .select()
        .single();

      if (error) {
        console.error('Error creating transportation:', error);
        // Log more details about the error
        console.error('Error details:', JSON.stringify(error, null, 2));
        console.error('Transportation data:', JSON.stringify(cleanedTransportation, null, 2));

        // Check if this is a duplicate key error, which might happen if the record was created in another session
        if (error.code === '23505') { // PostgreSQL unique violation error code
          console.log('Duplicate key error, trying to update instead');
          // Try to get the record again and update it
          const retryExisting = await supabaseService.getTransportation(transportation.transaction_id);
          if (retryExisting) {
            return await supabaseService.updateTransportation({
              ...retryExisting,
              ...cleanedTransportation,
              id: retryExisting.id
            });
          }
        }
        return null;
      }

      console.log('Transportation created successfully:', data);
      return data as Transportation;
    } catch (error) {
      console.error('Error creating transportation:', error);
      return null;
    }
  },

  updateTransportation: async (transportation: Partial<Transportation>): Promise<Transportation | null> => {
    try {
      console.log('Updating transportation in Supabase:', transportation);

      // Clean up the transportation data before sending to Supabase
      const cleanedTransportation = { ...transportation };

      // Handle empty date and time fields - set them to null instead of empty strings
      if (cleanedTransportation.departure_date === '') cleanedTransportation.departure_date = null;
      if (cleanedTransportation.expected_arrival_date === '') cleanedTransportation.expected_arrival_date = null;
      if (cleanedTransportation.departure_time === '') cleanedTransportation.departure_time = null;
      if (cleanedTransportation.expected_arrival_time === '') cleanedTransportation.expected_arrival_time = null;

      console.log('Updating with cleaned data:', cleanedTransportation);

      const { data, error } = await supabase
        .from('transportation')
        .update(cleanedTransportation)
        .eq('id', cleanedTransportation.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating transportation:', error);
        // Log more details about the error
        console.error('Error details:', JSON.stringify(error, null, 2));
        console.error('Transportation data:', JSON.stringify(cleanedTransportation, null, 2));
        return null;
      }

      console.log('Transportation updated successfully:', data);
      return data as Transportation;
    } catch (error) {
      console.error('Error updating transportation:', error);
      return null;
    }
  },

  deleteTransportation: async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('transportation')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting transportation:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error deleting transportation:', error);
      return false;
    }
  },

  // Sale operations
  getSales: async (transactionId: string): Promise<Sale[]> => {
    try {
      const { data, error } = await supabase
        .from('sales')
        .select('*')
        .eq('transaction_id', transactionId);

      if (error) {
        console.error('Error fetching sales:', error);
        return [];
      }

      return data as Sale[];
    } catch (error) {
      console.error('Error getting sales:', error);
      return [];
    }
  },

  createSale: async (sale: Sale): Promise<Sale | null> => {
    try {
      const { data, error } = await supabase
        .from('sales')
        .insert(sale)
        .select()
        .single();

      if (error) {
        console.error('Error creating sale:', error);
        return null;
      }

      return data as Sale;
    } catch (error) {
      console.error('Error creating sale:', error);
      return null;
    }
  },

  updateSale: async (sale: Partial<Sale>): Promise<Sale | null> => {
    try {
      const { data, error } = await supabase
        .from('sales')
        .update(sale)
        .eq('id', sale.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating sale:', error);
        return null;
      }

      return data as Sale;
    } catch (error) {
      console.error('Error updating sale:', error);
      return null;
    }
  },

  deleteSale: async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('sales')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting sale:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error deleting sale:', error);
      return false;
    }
  },

  // Payment operations
  getPayments: async (transactionId: string): Promise<Payment[]> => {
    try {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('transaction_id', transactionId);

      if (error) {
        console.error('Error fetching payments:', error);
        return [];
      }

      return data as Payment[];
    } catch (error) {
      console.error('Error getting payments:', error);
      return [];
    }
  },

  createPayment: async (payment: Payment): Promise<Payment | null> => {
    try {
      const { data, error } = await supabase
        .from('payments')
        .insert(payment)
        .select()
        .single();

      if (error) {
        console.error('Error creating payment:', error);
        return null;
      }

      return data as Payment;
    } catch (error) {
      console.error('Error creating payment:', error);
      return null;
    }
  },

  updatePayment: async (payment: Partial<Payment>): Promise<Payment | null> => {
    try {
      const { data, error } = await supabase
        .from('payments')
        .update(payment)
        .eq('id', payment.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating payment:', error);
        return null;
      }

      return data as Payment;
    } catch (error) {
      console.error('Error updating payment:', error);
      return null;
    }
  },

  deletePayment: async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('payments')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting payment:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error deleting payment:', error);
      return false;
    }
  },

  // Transaction Note operations
  getNotes: async (transactionId: string): Promise<TransactionNote[]> => {
    try {
      const { data, error } = await supabase
        .from('transaction_notes')
        .select('*')
        .eq('transaction_id', transactionId);

      if (error) {
        console.error('Error fetching notes:', error);
        return [];
      }

      return data as TransactionNote[];
    } catch (error) {
      console.error('Error getting notes:', error);
      return [];
    }
  },

  createNote: async (note: Omit<TransactionNote, 'created_at'>): Promise<TransactionNote | null> => {
    try {
      const { data, error } = await supabase
        .from('transaction_notes')
        .insert(note)
        .select()
        .single();

      if (error) {
        console.error('Error creating note:', error);
        return null;
      }

      return data as TransactionNote;
    } catch (error) {
      console.error('Error creating note:', error);
      return null;
    }
  },

  updateNote: async (note: Partial<TransactionNote>): Promise<TransactionNote | null> => {
    try {
      const { data, error } = await supabase
        .from('transaction_notes')
        .update(note)
        .eq('id', note.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating note:', error);
        return null;
      }

      return data as TransactionNote;
    } catch (error) {
      console.error('Error updating note:', error);
      return null;
    }
  },

  deleteNote: async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('transaction_notes')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting note:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error deleting note:', error);
      return false;
    }
  },

  // Attachment operations
  getAttachments: async (transactionId: string): Promise<Attachment[]> => {
    try {
      const { data, error } = await supabase
        .from('attachments')
        .select('*')
        .eq('transaction_id', transactionId);

      if (error) {
        console.error('Error fetching attachments:', error);
        return [];
      }

      return data as Attachment[];
    } catch (error) {
      console.error('Error getting attachments:', error);
      return [];
    }
  },

  createAttachment: async (attachment: Omit<Attachment, 'created_at'>): Promise<Attachment | null> => {
    try {
      const { data, error } = await supabase
        .from('attachments')
        .insert(attachment)
        .select()
        .single();

      if (error) {
        console.error('Error creating attachment:', error);
        return null;
      }

      return data as Attachment;
    } catch (error) {
      console.error('Error creating attachment:', error);
      return null;
    }
  },

  updateAttachment: async (attachment: Partial<Attachment>): Promise<Attachment | null> => {
    try {
      const { data, error } = await supabase
        .from('attachments')
        .update(attachment)
        .eq('id', attachment.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating attachment:', error);
        return null;
      }

      return data as Attachment;
    } catch (error) {
      console.error('Error updating attachment:', error);
      return null;
    }
  },

  deleteAttachment: async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('attachments')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting attachment:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error deleting attachment:', error);
      return false;
    }
  },

  // Check if a storage bucket exists
  checkStorageBucket: async (bucketName: string): Promise<boolean> => {
    return await supabaseUtils.checkBucketExists(bucketName);
  },

  // Upload attachment file to Supabase storage
  uploadAttachmentFile: async (
    userId: string,
    file: File,
    fileName: string
  ): Promise<string | null> => {
    try {
      // Check if storage is available
      if (!supabaseUtils.isStorageAvailable()) {
        console.error('Supabase storage is not available');
        return URL.createObjectURL(file);
      }

      // Ensure the bucket exists
      await supabaseUtils.ensureBucketExists('attachments', true);

      const filePath = `${userId}/${fileName}`;

      // Safely access the storage bucket
      const storageClient = supabase.storage.from('attachments');
      if (!storageClient) {
        console.error("Failed to get storage client for 'attachments' bucket");
        return URL.createObjectURL(file);
      }

      console.log(`Uploading file to path: ${filePath}`);
      const { data, error } = await storageClient.upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
      });

      if (error) {
        console.error('Error uploading file:', error);
        // Return a local URL as fallback
        return URL.createObjectURL(file);
      }

      if (!data || !data.path) {
        console.error('Upload succeeded but no data or path returned');
        return URL.createObjectURL(file);
      }

      console.log(`File uploaded successfully to: ${data.path}`);

      // Get public URL
      try {
        const { data: urlData } = storageClient.getPublicUrl(data.path);
        if (!urlData || !urlData.publicUrl) {
          console.error('Failed to get public URL');
          return URL.createObjectURL(file);
        }
        console.log(`Got public URL: ${urlData.publicUrl}`);
        return urlData.publicUrl;
      } catch (urlError) {
        console.error('Error getting public URL:', urlError);
        return URL.createObjectURL(file);
      }
    } catch (error) {
      console.error('Error uploading attachment file:', error);
      // Return a local URL as fallback
      return URL.createObjectURL(file);
    }
  },

  // Daily Log operations
  getDailyLogs: async (userId: string): Promise<DailyLog[]> => {
    try {
      console.log(`Fetching daily logs for user ${userId}`);
      const { data, error } = await supabase
        .from('daily_logs')
        .select('*')
        .eq('user_id', userId);

      if (error) {
        console.error('Error fetching daily logs:', error);
        console.error('Error details:', JSON.stringify(error, null, 2));
        return [];
      }

      console.log(`Successfully fetched ${data?.length || 0} daily logs`);
      return data as DailyLog[];
    } catch (error) {
      console.error('Error getting daily logs:', error);
      return [];
    }
  },

  createDailyLog: async (log: Omit<DailyLog, 'created_at'>): Promise<DailyLog | null> => {
    try {
      console.log('Creating daily log in Supabase:', log);

      // Check if the table exists by making a small query first
      const { error: tableCheckError } = await supabase
        .from('daily_logs')
        .select('id')
        .limit(1);

      if (tableCheckError) {
        console.error('Error checking daily_logs table:', tableCheckError);
        console.error('The daily_logs table might not exist in Supabase');
        return null;
      }

      const { data, error } = await supabase
        .from('daily_logs')
        .insert(log)
        .select()
        .single();

      if (error) {
        console.error('Error creating daily log:', error);
        console.error('Error details:', JSON.stringify(error, null, 2));
        console.error('Log data:', JSON.stringify(log, null, 2));
        return null;
      }

      console.log('Daily log created successfully:', data);
      return data as DailyLog;
    } catch (error) {
      console.error('Error creating daily log:', error);
      return null;
    }
  },

  updateDailyLog: async (log: Partial<DailyLog>): Promise<DailyLog | null> => {
    try {
      console.log('Updating daily log in Supabase:', log);

      const { data, error } = await supabase
        .from('daily_logs')
        .update(log)
        .eq('id', log.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating daily log:', error);
        console.error('Error details:', JSON.stringify(error, null, 2));
        console.error('Log data:', JSON.stringify(log, null, 2));
        return null;
      }

      console.log('Daily log updated successfully:', data);
      return data as DailyLog;
    } catch (error) {
      console.error('Error updating daily log:', error);
      return null;
    }
  },

  deleteDailyLog: async (id: string): Promise<boolean> => {
    try {
      console.log(`Deleting daily log with ID ${id} from Supabase`);

      const { error } = await supabase
        .from('daily_logs')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting daily log:', error);
        console.error('Error details:', JSON.stringify(error, null, 2));
        return false;
      }

      console.log('Daily log deleted successfully');
      return true;
    } catch (error) {
      console.error('Error deleting daily log:', error);
      return false;
    }
  },

  // Buyer operations
  getBuyers: async (userId: string): Promise<Buyer[]> => {
    try {
      console.log(`Fetching buyers for user ${userId}`);

      // Check if the table exists by making a small query first
      const { error: tableCheckError } = await supabase
        .from('buyers')
        .select('id')
        .limit(1);

      if (tableCheckError) {
        console.error('Error checking buyers table:', tableCheckError);
        console.error('The buyers table might not exist in Supabase');
        return [];
      }

      const { data, error } = await supabase
        .from('buyers')
        .select('*')
        .eq('user_id', userId);

      if (error) {
        console.error('Error fetching buyers:', error);
        console.error('Error details:', JSON.stringify(error, null, 2));
        return [];
      }

      console.log(`Successfully fetched ${data?.length || 0} buyers`);
      return data as Buyer[];
    } catch (error) {
      console.error('Error getting buyers:', error);
      return [];
    }
  },

  createBuyer: async (buyer: Buyer): Promise<Buyer | null> => {
    try {
      console.log('SUPABASE-SERVICE: Creating buyer in Supabase:', buyer);
      console.log('SUPABASE-SERVICE: Buyer ID:', buyer.id);
      console.log('SUPABASE-SERVICE: User ID:', buyer.user_id);

      // Make sure we have a valid user_id
      if (!buyer.user_id) {
        console.error('Cannot create buyer: Missing user_id');
        return null;
      }

      // Check if the buyer already exists
      const { data: existingBuyer, error: checkError } = await supabase
        .from('buyers')
        .select('*')
        .eq('id', buyer.id)
        .maybeSingle();

      if (checkError) {
        // If the error is about the table not existing, log it clearly
        if (checkError.message.includes('does not exist')) {
          console.error('The buyers table does not exist in Supabase!');
          console.error('Please run the SQL migration script to create the table');
          return null;
        }

        console.error('Error checking if buyer exists:', checkError);
        return null;
      }

      // If the buyer already exists, update it instead
      if (existingBuyer) {
        console.log('Buyer already exists, updating instead:', existingBuyer);
        return await supabaseService.updateBuyer(buyer);
      }

      // Prepare the buyer data - remove date field which isn't in Supabase schema
      const { date, ...buyerWithoutDate } = buyer;
      const buyerData = {
        ...buyerWithoutDate,
        // Ensure created_at is set
        created_at: buyer.created_at || new Date().toISOString()
      };

      console.log('Inserting buyer into Supabase (without date):', buyerData);

      const { data, error } = await supabase
        .from('buyers')
        .insert(buyerData)
        .select()
        .single();

      if (error) {
        console.error('Error creating buyer:', error);
        console.error('Error details:', JSON.stringify(error, null, 2));
        console.error('Buyer data:', JSON.stringify(buyerData, null, 2));

        // Try a direct RPC call as a fallback
        try {
          console.log('Trying fallback method with RPC call...');
          const { data: rpcData, error: rpcError } = await supabase
            .rpc('insert_buyer', {
              buyer_id: buyerData.id,
              buyer_user_id: buyerData.user_id,
              buyer_name: buyerData.name,
              buyer_email: buyerData.email || null,
              buyer_phone: buyerData.phone || null
            });

          if (rpcError) {
            console.error('RPC fallback also failed:', rpcError);
            return null;
          }

          console.log('RPC call successful:', rpcData);
          return buyerData; // Return the original data since RPC might not return it
        } catch (rpcError) {
          console.error('Error in RPC fallback:', rpcError);
          return null;
        }
      }

      console.log('Buyer created successfully:', data);
      return data as Buyer;
    } catch (error) {
      console.error('Error creating buyer:', error);
      return null;
    }
  },

  updateBuyer: async (buyer: Partial<Buyer>): Promise<Buyer | null> => {
    try {
      console.log('Updating buyer in Supabase:', buyer);

      // Create a copy of the buyer object without the date field
      const { date, ...buyerWithoutDate } = buyer;
      console.log('Sending buyer data to Supabase (without date):', buyerWithoutDate);

      const { data, error } = await supabase
        .from('buyers')
        .update(buyerWithoutDate)
        .eq('id', buyer.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating buyer:', error);
        console.error('Error details:', JSON.stringify(error, null, 2));
        console.error('Buyer data:', JSON.stringify(buyerWithoutDate, null, 2));
        return null;
      }

      console.log('Buyer updated successfully:', data);
      return data as Buyer;
    } catch (error) {
      console.error('Error updating buyer:', error);
      return null;
    }
  },

  deleteBuyer: async (id: string): Promise<boolean> => {
    try {
      console.log(`Deleting buyer with ID ${id} from Supabase`);

      const { error } = await supabase
        .from('buyers')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting buyer:', error);
        console.error('Error details:', JSON.stringify(error, null, 2));
        return false;
      }

      console.log('Buyer deleted successfully');
      return true;
    } catch (error) {
      console.error('Error deleting buyer:', error);
      return false;
    }
  },

  // Seller operations
  getSellers: async (userId: string): Promise<Seller[]> => {
    try {
      console.log(`Fetching sellers for user ${userId}`);

      // Check if the table exists by making a small query first
      const { error: tableCheckError } = await supabase
        .from('sellers')
        .select('id')
        .limit(1);

      if (tableCheckError) {
        console.error('Error checking sellers table:', tableCheckError);
        console.error('The sellers table might not exist in Supabase');
        return [];
      }

      const { data, error } = await supabase
        .from('sellers')
        .select('*')
        .eq('user_id', userId);

      if (error) {
        console.error('Error fetching sellers:', error);
        console.error('Error details:', JSON.stringify(error, null, 2));
        return [];
      }

      console.log(`Successfully fetched ${data?.length || 0} sellers`);
      return data as Seller[];
    } catch (error) {
      console.error('Error getting sellers:', error);
      return [];
    }
  },

  createSeller: async (seller: Seller): Promise<Seller | null> => {
    try {
      console.log('Creating seller in Supabase:', seller);

      // Make sure we have a valid user_id
      if (!seller.user_id) {
        console.error('Cannot create seller: Missing user_id');
        return null;
      }

      // Check if the seller already exists
      const { data: existingSeller, error: checkError } = await supabase
        .from('sellers')
        .select('*')
        .eq('id', seller.id)
        .maybeSingle();

      if (checkError) {
        // If the error is about the table not existing, log it clearly
        if (checkError.message.includes('does not exist')) {
          console.error('The sellers table does not exist in Supabase!');
          console.error('Please run the SQL migration script to create the table');
          return null;
        }

        console.error('Error checking if seller exists:', checkError);
        return null;
      }

      // If the seller already exists, update it instead
      if (existingSeller) {
        console.log('Seller already exists, updating instead:', existingSeller);
        return await supabaseService.updateSeller(seller);
      }

      // Prepare the seller data - remove date field which isn't in Supabase schema
      const { date, ...sellerWithoutDate } = seller;
      const sellerData = {
        ...sellerWithoutDate,
        // Ensure created_at is set
        created_at: seller.created_at || new Date().toISOString()
      };

      console.log('Inserting seller into Supabase (without date):', sellerData);

      const { data, error } = await supabase
        .from('sellers')
        .insert(sellerData)
        .select()
        .single();

      if (error) {
        console.error('Error creating seller:', error);
        console.error('Error details:', JSON.stringify(error, null, 2));
        console.error('Seller data:', JSON.stringify(sellerData, null, 2));

        // Try a direct RPC call as a fallback
        try {
          console.log('Trying fallback method with RPC call...');
          const { data: rpcData, error: rpcError } = await supabase
            .rpc('insert_seller', {
              seller_id: sellerData.id,
              seller_user_id: sellerData.user_id,
              seller_name: sellerData.name,
              seller_email: sellerData.email || null,
              seller_phone: sellerData.phone || null
            });

          if (rpcError) {
            console.error('RPC fallback also failed:', rpcError);
            return null;
          }

          console.log('RPC call successful:', rpcData);
          return sellerData; // Return the original data since RPC might not return it
        } catch (rpcError) {
          console.error('Error in RPC fallback:', rpcError);
          return null;
        }
      }

      console.log('Seller created successfully:', data);
      return data as Seller;
    } catch (error) {
      console.error('Error creating seller:', error);
      return null;
    }
  },

  updateSeller: async (seller: Partial<Seller>): Promise<Seller | null> => {
    try {
      console.log('Updating seller in Supabase:', seller);

      // Create a copy of the seller object without the date field
      const { date, ...sellerWithoutDate } = seller;
      console.log('Sending seller data to Supabase (without date):', sellerWithoutDate);

      const { data, error } = await supabase
        .from('sellers')
        .update(sellerWithoutDate)
        .eq('id', seller.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating seller:', error);
        console.error('Error details:', JSON.stringify(error, null, 2));
        console.error('Seller data:', JSON.stringify(sellerWithoutDate, null, 2));
        return null;
      }

      console.log('Seller updated successfully:', data);
      return data as Seller;
    } catch (error) {
      console.error('Error updating seller:', error);
      return null;
    }
  },

  deleteSeller: async (id: string): Promise<boolean> => {
    try {
      console.log(`Deleting seller with ID ${id} from Supabase`);

      const { error } = await supabase
        .from('sellers')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting seller:', error);
        console.error('Error details:', JSON.stringify(error, null, 2));
        return false;
      }

      console.log('Seller deleted successfully');
      return true;
    } catch (error) {
      console.error('Error deleting seller:', error);
      return false;
    }
  },

  // Get complete transaction with all related data
  getCompleteTransaction: async (id: string): Promise<CompleteTransaction | null> => {
    try {
      // Get transaction
      const transaction = await supabaseService.getTransaction(id);
      if (!transaction) return null;

      // Get related data
      const purchases = await supabaseService.getPurchases(id);
      const transportation = await supabaseService.getTransportation(id);
      const sales = await supabaseService.getSales(id);
      const payments = await supabaseService.getPayments(id);
      const notes = await supabaseService.getNotes(id);
      const attachments = await supabaseService.getAttachments(id);

      return {
        transaction,
        purchases,
        transportation,
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
};
