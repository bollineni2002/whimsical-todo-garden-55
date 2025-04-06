-- Create a function to insert a buyer
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

-- Create a function to insert a seller
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
