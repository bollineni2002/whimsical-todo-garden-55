import { supabaseSimple as supabase } from '@/integrations/supabase/simple-client';
import { supabaseErrorHandler } from './supabase-error-handler';
import { dbService } from './db-service';
import { supabaseService } from './supabase-service';

/**
 * Utility to fix common errors in the application
 */
export const errorFixer = {
  /**
   * Fix the buyers and sellers tables
   */
  async fixBuyersSellersTable(userId: string): Promise<{ success: boolean; message: string; details: string[] }> {
    const details: string[] = [];
    let success = true;

    try {
      // Step 1: Check if the buyers table exists
      console.log('Checking buyers table...');
      details.push('Checking buyers table...');

      try {
        const { error: buyersError } = await supabase.from('buyers').select('id').limit(1);

        if (buyersError && buyersError.message.includes('does not exist')) {
          // Table doesn't exist, create it
          console.log('Buyers table does not exist, creating it...');
          details.push('Buyers table does not exist, creating it...');

          const createBuyersSQL = `
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
          `;

          const { error: createError } = await supabase.rpc('execute_sql', { sql_query: createBuyersSQL });

          if (createError) {
            console.error('Error creating buyers table:', createError);
            details.push(`Error creating buyers table: ${createError.message}`);
            success = false;
          } else {
            console.log('Successfully created buyers table');
            details.push('Successfully created buyers table');
          }
        } else if (buyersError) {
          // Some other error
          console.error('Error checking buyers table:', buyersError);
          details.push(`Error checking buyers table: ${buyersError.message}`);
        } else {
          // Table exists, check if it has the created_at column
          console.log('Buyers table exists, checking for created_at column...');
          details.push('Buyers table exists, checking for created_at column...');

          // Try to add the created_at column if it doesn't exist
          const addColumnSQL = `
            DO $$
            BEGIN
              BEGIN
                ALTER TABLE public.buyers ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL;
              EXCEPTION
                WHEN duplicate_column THEN
                  -- Column already exists, do nothing
                WHEN others THEN
                  RAISE;
              END;
            END
            $$;
          `;

          const { error: addColumnError } = await supabase.rpc('execute_sql', { sql_query: addColumnSQL });

          if (addColumnError) {
            console.error('Error adding created_at column to buyers table:', addColumnError);
            details.push(`Error adding created_at column to buyers table: ${addColumnError.message}`);
            success = false;
          } else {
            console.log('Successfully ensured created_at column exists in buyers table');
            details.push('Successfully ensured created_at column exists in buyers table');
          }
        }
      } catch (buyersError) {
        console.error('Unexpected error checking buyers table:', buyersError);
        details.push(`Unexpected error checking buyers table: ${buyersError instanceof Error ? buyersError.message : String(buyersError)}`);
        success = false;
      }

      // Step 2: Check if the sellers table exists
      console.log('Checking sellers table...');
      details.push('Checking sellers table...');

      try {
        const { error: sellersError } = await supabase.from('sellers').select('id').limit(1);

        if (sellersError && sellersError.message.includes('does not exist')) {
          // Table doesn't exist, create it
          console.log('Sellers table does not exist, creating it...');
          details.push('Sellers table does not exist, creating it...');

          const createSellersSQL = `
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
          `;

          const { error: createError } = await supabase.rpc('execute_sql', { sql_query: createSellersSQL });

          if (createError) {
            console.error('Error creating sellers table:', createError);
            details.push(`Error creating sellers table: ${createError.message}`);
            success = false;
          } else {
            console.log('Successfully created sellers table');
            details.push('Successfully created sellers table');
          }
        } else if (sellersError) {
          // Some other error
          console.error('Error checking sellers table:', sellersError);
          details.push(`Error checking sellers table: ${sellersError.message}`);
        } else {
          // Table exists, check if it has the created_at column
          console.log('Sellers table exists, checking for created_at column...');
          details.push('Sellers table exists, checking for created_at column...');

          // Try to add the created_at column if it doesn't exist
          const addColumnSQL = `
            DO $$
            BEGIN
              BEGIN
                ALTER TABLE public.sellers ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL;
              EXCEPTION
                WHEN duplicate_column THEN
                  -- Column already exists, do nothing
                WHEN others THEN
                  RAISE;
              END;
            END
            $$;
          `;

          const { error: addColumnError } = await supabase.rpc('execute_sql', { sql_query: addColumnSQL });

          if (addColumnError) {
            console.error('Error adding created_at column to sellers table:', addColumnError);
            details.push(`Error adding created_at column to sellers table: ${addColumnError.message}`);
            success = false;
          } else {
            console.log('Successfully ensured created_at column exists in sellers table');
            details.push('Successfully ensured created_at column exists in sellers table');
          }
        }
      } catch (sellersError) {
        console.error('Unexpected error checking sellers table:', sellersError);
        details.push(`Unexpected error checking sellers table: ${sellersError instanceof Error ? sellersError.message : String(sellersError)}`);
        success = false;
      }

      // Step 3: Sync local buyers and sellers to Supabase
      if (userId) {
        console.log('Syncing local buyers and sellers to Supabase...');
        details.push('Syncing local buyers and sellers to Supabase...');

        try {
          // Get local buyers
          const localBuyers = await dbService.getBuyersByUser(userId);
          console.log(`Found ${localBuyers.length} local buyers`);
          details.push(`Found ${localBuyers.length} local buyers`);

          // Sync each buyer
          let buyerSuccessCount = 0;
          let buyerFailureCount = 0;

          for (const buyer of localBuyers) {
            try {
              // Add created_at if missing
              const buyerWithCreatedAt = {
                ...buyer,
                created_at: buyer.created_at || new Date().toISOString()
              };

              const result = await supabaseService.createBuyer(buyerWithCreatedAt);

              if (result) {
                buyerSuccessCount++;
              } else {
                buyerFailureCount++;
              }
            } catch (buyerError) {
              console.error(`Error syncing buyer ${buyer.id}:`, buyerError);
              buyerFailureCount++;
            }
          }

          console.log(`Synced ${buyerSuccessCount} buyers successfully, ${buyerFailureCount} failed`);
          details.push(`Synced ${buyerSuccessCount} buyers successfully, ${buyerFailureCount} failed`);

          // Get local sellers
          const localSellers = await dbService.getSellersByUser(userId);
          console.log(`Found ${localSellers.length} local sellers`);
          details.push(`Found ${localSellers.length} local sellers`);

          // Sync each seller
          let sellerSuccessCount = 0;
          let sellerFailureCount = 0;

          for (const seller of localSellers) {
            try {
              // Add created_at if missing
              const sellerWithCreatedAt = {
                ...seller,
                created_at: seller.created_at || new Date().toISOString()
              };

              const result = await supabaseService.createSeller(sellerWithCreatedAt);

              if (result) {
                sellerSuccessCount++;
              } else {
                sellerFailureCount++;
              }
            } catch (sellerError) {
              console.error(`Error syncing seller ${seller.id}:`, sellerError);
              sellerFailureCount++;
            }
          }

          console.log(`Synced ${sellerSuccessCount} sellers successfully, ${sellerFailureCount} failed`);
          details.push(`Synced ${sellerSuccessCount} sellers successfully, ${sellerFailureCount} failed`);
        } catch (syncError) {
          console.error('Error syncing buyers and sellers:', syncError);
          details.push(`Error syncing buyers and sellers: ${syncError instanceof Error ? syncError.message : String(syncError)}`);
          success = false;
        }
      }

      return {
        success,
        message: success ? 'Successfully fixed buyers and sellers tables' : 'Some errors occurred while fixing buyers and sellers tables',
        details
      };
    } catch (error) {
      console.error('Error fixing buyers and sellers tables:', error);
      return {
        success: false,
        message: `Error fixing buyers and sellers tables: ${error instanceof Error ? error.message : String(error)}`,
        details
      };
    }
  },
  /**
   * Fix common errors in the application
   */
  async fixCommonErrors(): Promise<{ success: boolean; message: string; fixes: string[] }> {
    const fixes: string[] = [];
    let success = true;

    try {
      // Fix 1: Check Supabase connection
      console.log('Checking Supabase connection...');
      const connectionResult = await supabaseErrorHandler.checkConnection();

      if (!connectionResult.success) {
        console.log('Fixing Supabase connection...');
        const fixResult = await supabaseErrorHandler.fixConnectionIssues();
        fixes.push(`Connection check: ${fixResult.message}`);

        if (!fixResult.success) {
          success = false;
        }
      } else {
        fixes.push(`Connection check: ${connectionResult.message}`);
      }

      // Fix 2: Ensure buyers table exists
      console.log('Checking buyers table...');
      const { data: buyersExists, error: buyersError } = await supabase.rpc('table_exists', { table_name: 'buyers' });

      if (buyersError) {
        console.error('Error checking buyers table:', buyersError);
        fixes.push(`Buyers table check: Error - ${buyersError.message}`);
        success = false;
      } else if (!buyersExists) {
        console.log('Creating buyers table...');
        const createBuyersSQL = `
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
        `;

        const { data: createResult, error: createError } = await supabase.rpc('execute_sql', { sql_query: createBuyersSQL });

        if (createError) {
          console.error('Error creating buyers table:', createError);
          fixes.push(`Buyers table creation: Failed - ${createError.message}`);
          success = false;
        } else {
          fixes.push('Buyers table creation: Success');
        }
      } else {
        fixes.push('Buyers table check: Table exists');
      }

      // Fix 3: Ensure sellers table exists
      console.log('Checking sellers table...');
      const { data: sellersExists, error: sellersError } = await supabase.rpc('table_exists', { table_name: 'sellers' });

      if (sellersError) {
        console.error('Error checking sellers table:', sellersError);
        fixes.push(`Sellers table check: Error - ${sellersError.message}`);
        success = false;
      } else if (!sellersExists) {
        console.log('Creating sellers table...');
        const createSellersSQL = `
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
        `;

        const { data: createResult, error: createError } = await supabase.rpc('execute_sql', { sql_query: createSellersSQL });

        if (createError) {
          console.error('Error creating sellers table:', createError);
          fixes.push(`Sellers table creation: Failed - ${createError.message}`);
          success = false;
        } else {
          fixes.push('Sellers table creation: Success');
        }
      } else {
        fixes.push('Sellers table check: Table exists');
      }

      // Fix 4: Clear localStorage if it contains invalid data
      try {
        console.log('Checking localStorage...');
        const keys = Object.keys(localStorage);
        let cleanedItems = 0;

        for (const key of keys) {
          if (key.startsWith('supabase.auth.token')) {
            try {
              const value = localStorage.getItem(key);
              if (value) {
                const parsed = JSON.parse(value);

                // Check if the token is expired
                if (parsed.expiresAt && parsed.expiresAt < Date.now() / 1000) {
                  console.log(`Removing expired token: ${key}`);
                  localStorage.removeItem(key);
                  cleanedItems++;
                }
              }
            } catch (parseError) {
              console.error(`Error parsing localStorage item ${key}:`, parseError);
              localStorage.removeItem(key);
              cleanedItems++;
            }
          }
        }

        if (cleanedItems > 0) {
          fixes.push(`localStorage cleanup: Removed ${cleanedItems} invalid items`);
        } else {
          fixes.push('localStorage check: No issues found');
        }
      } catch (storageError) {
        console.error('Error checking localStorage:', storageError);
        fixes.push(`localStorage check: Error - ${storageError instanceof Error ? storageError.message : String(storageError)}`);
      }

      return {
        success,
        message: success ? 'All fixes applied successfully' : 'Some fixes failed',
        fixes
      };
    } catch (error) {
      console.error('Error fixing common errors:', error);
      return {
        success: false,
        message: `Error fixing common errors: ${error instanceof Error ? error.message : String(error)}`,
        fixes
      };
    }
  }
};
