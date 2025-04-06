import { dbService } from './db-service';
import { supabaseService } from './supabase-service';
import { syncService } from './sync-service';
import { migrateData } from './data-migration';
import { openDB } from 'idb';

// Check if the old database exists
const oldDatabaseExists = async (): Promise<boolean> => {
  try {
    const oldDb = await openDB('transactly-db', 1, {
      upgrade(db) {
        // Do nothing, just checking if it exists
      },
    });

    oldDb.close();
    return true;
  } catch (error) {
    return false;
  }
};

// Initialize the database
export const initializeDatabase = async (userId: string, minimalSync: boolean = false): Promise<void> => {
  try {
    console.log('Initializing database...');

    // Check if the old database exists
    const hasOldData = await oldDatabaseExists();

    if (hasOldData) {
      console.log('Old database found, migrating data...');

      // Migrate data from old database to new database
      await migrateData(userId);

      console.log('Data migration completed');
    }

    // Sync with Supabase if online
    if (navigator.onLine) {
      if (minimalSync) {
        console.log('Online, performing minimal sync with Supabase...');

        // Only sync user data and basic transaction info
        // This is much faster than syncing everything
        await syncService.syncUserData(userId);

        // Schedule a full sync to happen in the background after the app loads
        setTimeout(() => {
          console.log('Performing full background sync...');
          syncService.syncAll(userId)
            .then(() => console.log('Background sync completed'))
            .catch(err => console.error('Background sync error:', err));
        }, 5000); // Wait 5 seconds after initialization

        console.log('Minimal sync completed');
      } else {
        console.log('Online, syncing with Supabase...');

        // Sync all data
        await syncService.syncAll(userId);

        console.log('Full sync completed');
      }
    } else {
      console.log('Offline, skipping sync');
    }

    console.log('Database initialization completed');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
};

// Create user profile if it doesn't exist
export const ensureUserProfile = async (
  userId: string,
  email: string,
  fullName?: string,
  phone?: string,
  businessName?: string
): Promise<void> => {
  try {
    // Check if user exists in local database
    const localUser = await dbService.getUser(userId);

    if (!localUser) {
      console.log('User not found in local database, creating...');

      // Create user in local database
      await dbService.addUser({
        id: userId,
        full_name: fullName || email.split('@')[0],
        email,
        phone: phone || '',
        business_name: businessName || '',
      });

      // Create user in Supabase if online
      if (navigator.onLine) {
        console.log('Online, creating user in Supabase...');

        // Check if user exists in Supabase
        const supabaseUser = await supabaseService.getCurrentUser();

        if (!supabaseUser) {
          // Create user in Supabase
          await supabaseService.createUserProfile({
            id: userId,
            full_name: fullName || email.split('@')[0],
            email,
            phone: phone || '',
            business_name: businessName || '',
          });
        }
      }
    }
  } catch (error) {
    console.error('Error ensuring user profile:', error);
    throw error;
  }
};
