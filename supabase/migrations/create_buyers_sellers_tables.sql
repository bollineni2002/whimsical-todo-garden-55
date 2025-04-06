-- Create buyers table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.buyers (
    id TEXT PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create index for user_id for faster queries
CREATE INDEX IF NOT EXISTS idx_buyers_user_id ON public.buyers(user_id);

-- Enable Row Level Security
ALTER TABLE public.buyers ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own buyers" ON public.buyers;
DROP POLICY IF EXISTS "Users can insert their own buyers" ON public.buyers;
DROP POLICY IF EXISTS "Users can update their own buyers" ON public.buyers;
DROP POLICY IF EXISTS "Users can delete their own buyers" ON public.buyers;

-- Create policies with proper access control
CREATE POLICY "Users can view their own buyers"
  ON public.buyers
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own buyers"
  ON public.buyers
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own buyers"
  ON public.buyers
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own buyers"
  ON public.buyers
  FOR DELETE
  USING (user_id = auth.uid());

-- Grant necessary permissions to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON public.buyers TO authenticated;

-- Create sellers table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.sellers (
    id TEXT PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create index for user_id for faster queries
CREATE INDEX IF NOT EXISTS idx_sellers_user_id ON public.sellers(user_id);

-- Enable Row Level Security
ALTER TABLE public.sellers ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own sellers" ON public.sellers;
DROP POLICY IF EXISTS "Users can insert their own sellers" ON public.sellers;
DROP POLICY IF EXISTS "Users can update their own sellers" ON public.sellers;
DROP POLICY IF EXISTS "Users can delete their own sellers" ON public.sellers;

-- Create policies with proper access control
CREATE POLICY "Users can view their own sellers"
  ON public.sellers
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own sellers"
  ON public.sellers
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own sellers"
  ON public.sellers
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own sellers"
  ON public.sellers
  FOR DELETE
  USING (user_id = auth.uid());

-- Grant necessary permissions to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON public.sellers TO authenticated;
