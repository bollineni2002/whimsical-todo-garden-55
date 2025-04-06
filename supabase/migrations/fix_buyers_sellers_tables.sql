-- Check if buyers table exists and add created_at column if missing
DO $$
BEGIN
  -- Check if buyers table exists
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'buyers') THEN
    -- Check if created_at column exists
    IF NOT EXISTS (
      SELECT FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'buyers' 
      AND column_name = 'created_at'
    ) THEN
      -- Add created_at column
      ALTER TABLE public.buyers 
      ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL;
      
      RAISE NOTICE 'Added created_at column to buyers table';
    ELSE
      RAISE NOTICE 'created_at column already exists in buyers table';
    END IF;
  ELSE
    -- Create buyers table with all required columns
    CREATE TABLE public.buyers (
      id TEXT PRIMARY KEY,
      user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      email TEXT,
      phone TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
    );
    
    -- Enable Row Level Security
    ALTER TABLE public.buyers ENABLE ROW LEVEL SECURITY;
    
    -- Create policy
    CREATE POLICY "Users can manage their own buyers"
      ON public.buyers
      USING (user_id = auth.uid());
      
    GRANT SELECT, INSERT, UPDATE, DELETE ON public.buyers TO authenticated;
    
    RAISE NOTICE 'Created buyers table with all columns';
  END IF;
  
  -- Check if sellers table exists
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'sellers') THEN
    -- Check if created_at column exists
    IF NOT EXISTS (
      SELECT FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'sellers' 
      AND column_name = 'created_at'
    ) THEN
      -- Add created_at column
      ALTER TABLE public.sellers 
      ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL;
      
      RAISE NOTICE 'Added created_at column to sellers table';
    ELSE
      RAISE NOTICE 'created_at column already exists in sellers table';
    END IF;
  ELSE
    -- Create sellers table with all required columns
    CREATE TABLE public.sellers (
      id TEXT PRIMARY KEY,
      user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      email TEXT,
      phone TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
    );
    
    -- Enable Row Level Security
    ALTER TABLE public.sellers ENABLE ROW LEVEL SECURITY;
    
    -- Create policy
    CREATE POLICY "Users can manage their own sellers"
      ON public.sellers
      USING (user_id = auth.uid());
      
    GRANT SELECT, INSERT, UPDATE, DELETE ON public.sellers TO authenticated;
    
    RAISE NOTICE 'Created sellers table with all columns';
  END IF;
END
$$;
