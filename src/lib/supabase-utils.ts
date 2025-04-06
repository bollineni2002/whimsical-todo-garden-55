import { supabaseSimple as supabase } from '@/integrations/supabase/simple-client';

/**
 * Utility functions for Supabase
 */
export const supabaseUtils = {
  /**
   * Check if Supabase storage is available
   */
  isStorageAvailable: (): boolean => {
    try {
      return !!supabase && !!supabase.storage;
    } catch (error) {
      console.error('Error checking Supabase storage availability:', error);
      return false;
    }
  },

  /**
   * Check if a storage bucket exists
   */
  checkBucketExists: async (bucketName: string): Promise<boolean> => {
    try {
      if (!supabaseUtils.isStorageAvailable()) {
        console.error('Supabase storage is not available');
        return false;
      }

      // Try to get bucket info
      const { data, error } = await supabase.storage.getBucket(bucketName);
      
      if (error) {
        if (error.message && error.message.includes('does not exist')) {
          console.error(`Bucket '${bucketName}' does not exist`);
          return false;
        }
        console.error(`Error checking bucket '${bucketName}':`, error);
        return false;
      }
      
      return !!data;
    } catch (error) {
      console.error(`Error checking bucket '${bucketName}':`, error);
      return false;
    }
  },

  /**
   * Create a storage bucket if it doesn't exist
   */
  ensureBucketExists: async (bucketName: string, isPublic: boolean = false): Promise<boolean> => {
    try {
      if (!supabaseUtils.isStorageAvailable()) {
        console.error('Supabase storage is not available');
        return false;
      }

      // Check if bucket exists
      const bucketExists = await supabaseUtils.checkBucketExists(bucketName);
      
      if (bucketExists) {
        console.log(`Bucket '${bucketName}' already exists`);
        return true;
      }

      // Create bucket
      const { data, error } = await supabase.storage.createBucket(bucketName, {
        public: isPublic,
      });

      if (error) {
        console.error(`Error creating bucket '${bucketName}':`, error);
        return false;
      }

      console.log(`Bucket '${bucketName}' created successfully`);
      return true;
    } catch (error) {
      console.error(`Error ensuring bucket '${bucketName}' exists:`, error);
      return false;
    }
  },

  /**
   * Initialize storage buckets needed by the application
   */
  initializeStorage: async (): Promise<boolean> => {
    try {
      if (!supabaseUtils.isStorageAvailable()) {
        console.error('Supabase storage is not available');
        return false;
      }

      // Create required buckets
      const attachmentsBucketCreated = await supabaseUtils.ensureBucketExists('attachments', true);
      
      return attachmentsBucketCreated;
    } catch (error) {
      console.error('Error initializing Supabase storage:', error);
      return false;
    }
  }
};
