import { supabaseUtils } from './supabase-utils';

/**
 * Initialize Supabase storage
 * This function ensures that all required storage buckets exist
 */
export const initializeStorage = async (): Promise<boolean> => {
  try {
    console.log('Initializing Supabase storage...');
    
    // Check if storage is available
    if (!supabaseUtils.isStorageAvailable()) {
      console.error('Supabase storage is not available');
      return false;
    }
    
    // Create required buckets
    const attachmentsBucketCreated = await supabaseUtils.ensureBucketExists('attachments', true);
    
    if (!attachmentsBucketCreated) {
      console.error('Failed to create attachments bucket');
      return false;
    }
    
    console.log('Supabase storage initialized successfully');
    return true;
  } catch (error) {
    console.error('Error initializing Supabase storage:', error);
    return false;
  }
};
