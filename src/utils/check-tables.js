// Script to check and create necessary Supabase tables
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase URL or key not found in environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAndCreateTables() {
  console.log('Checking if buyers and sellers tables exist in Supabase...');

  try {
    // Check if buyers table exists
    const { error: buyersError } = await supabase
      .from('buyers')
      .select('id')
      .limit(1);

    if (buyersError && buyersError.message.includes('does not exist')) {
      console.log('Buyers table does not exist. Creating it...');

      // Create buyers table using SQL
      const { error: createBuyersError } = await supabase.rpc('execute_sql', {
        sql: `
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
        `
      });

      if (createBuyersError) {
        console.error('Error creating buyers table:', createBuyersError);
      } else {
        console.log('Buyers table created successfully');
      }
    } else {
      console.log('Buyers table already exists');
    }

    // Check if sellers table exists
    const { error: sellersError } = await supabase
      .from('sellers')
      .select('id')
      .limit(1);

    if (sellersError && sellersError.message.includes('does not exist')) {
      console.log('Sellers table does not exist. Creating it...');

      // Create sellers table using SQL
      const { error: createSellersError } = await supabase.rpc('execute_sql', {
        sql: `
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
        `
      });

      if (createSellersError) {
        console.error('Error creating sellers table:', createSellersError);
      } else {
        console.log('Sellers table created successfully');
      }
    } else {
      console.log('Sellers table already exists');
    }

    // Check if RPC functions exist and create them if they don't
    console.log('Checking if RPC functions exist...');

    // Create insert_buyer function
    const { error: createBuyerRpcError } = await supabase.rpc('execute_sql', {
      sql: `
        CREATE OR REPLACE FUNCTION public.insert_buyer(
          buyer_id TEXT,
          buyer_user_id UUID,
          buyer_name TEXT,
          buyer_email TEXT DEFAULT NULL,
          buyer_phone TEXT DEFAULT NULL
        ) RETURNS BOOLEAN AS $$
        BEGIN
          -- Make sure the buyers table exists
          BEGIN
            -- Try to insert the buyer
            INSERT INTO public.buyers (id, user_id, name, email, phone, created_at)
            VALUES (
              buyer_id,
              buyer_user_id,
              buyer_name,
              buyer_email,
              buyer_phone,
              NOW()
            );
            RETURN TRUE;
          EXCEPTION
            WHEN undefined_table THEN
              -- Table doesn't exist, create it first
              CREATE TABLE IF NOT EXISTS public.buyers (
                id TEXT PRIMARY KEY,
                user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
                name TEXT NOT NULL,
                email TEXT,
                phone TEXT,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
              );

              -- Enable RLS
              ALTER TABLE public.buyers ENABLE ROW LEVEL SECURITY;

              -- Create policy
              CREATE POLICY "Users can manage their own buyers"
                ON public.buyers
                USING (user_id = auth.uid());

              -- Grant permissions
              GRANT SELECT, INSERT, UPDATE, DELETE ON public.buyers TO authenticated;

              -- Try again
              INSERT INTO public.buyers (id, user_id, name, email, phone, created_at)
              VALUES (
                buyer_id,
                buyer_user_id,
                buyer_name,
                buyer_email,
                buyer_phone,
                NOW()
              );
              RETURN TRUE;
            WHEN OTHERS THEN
              RAISE;
          END;
        END;
        $$ LANGUAGE plpgsql SECURITY DEFINER;
      `
    });

    if (createBuyerRpcError) {
      console.error('Error creating insert_buyer function:', createBuyerRpcError);
    } else {
      console.log('insert_buyer function created or updated successfully');
    }

    // Create insert_seller function
    const { error: createSellerRpcError } = await supabase.rpc('execute_sql', {
      sql: `
        CREATE OR REPLACE FUNCTION public.insert_seller(
          seller_id TEXT,
          seller_user_id UUID,
          seller_name TEXT,
          seller_email TEXT DEFAULT NULL,
          seller_phone TEXT DEFAULT NULL
        ) RETURNS BOOLEAN AS $$
        BEGIN
          -- Make sure the sellers table exists
          BEGIN
            -- Try to insert the seller
            INSERT INTO public.sellers (id, user_id, name, email, phone, created_at)
            VALUES (
              seller_id,
              seller_user_id,
              seller_name,
              seller_email,
              seller_phone,
              NOW()
            );
            RETURN TRUE;
          EXCEPTION
            WHEN undefined_table THEN
              -- Table doesn't exist, create it first
              CREATE TABLE IF NOT EXISTS public.sellers (
                id TEXT PRIMARY KEY,
                user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
                name TEXT NOT NULL,
                email TEXT,
                phone TEXT,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
              );

              -- Enable RLS
              ALTER TABLE public.sellers ENABLE ROW LEVEL SECURITY;

              -- Create policy
              CREATE POLICY "Users can manage their own sellers"
                ON public.sellers
                USING (user_id = auth.uid());

              -- Grant permissions
              GRANT SELECT, INSERT, UPDATE, DELETE ON public.sellers TO authenticated;

              -- Try again
              INSERT INTO public.sellers (id, user_id, name, email, phone, created_at)
              VALUES (
                seller_id,
                seller_user_id,
                seller_name,
                seller_email,
                seller_phone,
                NOW()
              );
              RETURN TRUE;
            WHEN OTHERS THEN
              RAISE;
          END;
        END;
        $$ LANGUAGE plpgsql SECURITY DEFINER;
      `
    });

    if (createSellerRpcError) {
      console.error('Error creating insert_seller function:', createSellerRpcError);
    } else {
      console.log('insert_seller function created or updated successfully');
    }

    console.log('Table and function check completed');
  } catch (error) {
    console.error('Error checking or creating tables:', error);
  }
}

// Run the function
checkAndCreateTables()
  .then(() => {
    console.log('Done');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  });
