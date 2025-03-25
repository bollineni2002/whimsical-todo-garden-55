
-- Create a table for storing transactions
CREATE TABLE IF NOT EXISTS public.transactions (
  id TEXT PRIMARY KEY,
  name TEXT,
  date TIMESTAMP WITH TIME ZONE,
  status TEXT,
  "totalAmount" NUMERIC,
  "updatedAt" TIMESTAMP WITH TIME ZONE,
  "syncedAt" TIMESTAMP WITH TIME ZONE,
  "loadBuy" JSONB,
  "loadSold" JSONB,
  transportation JSONB,
  payments JSONB,
  notes JSONB,
  attachments JSONB,
  user_id UUID REFERENCES auth.users NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Create policy for users to select their own data
CREATE POLICY "Users can view their own transactions" 
  ON public.transactions 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Create policy for users to insert their own data
CREATE POLICY "Users can create their own transactions" 
  ON public.transactions 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Create policy for users to update their own data
CREATE POLICY "Users can update their own transactions" 
  ON public.transactions 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Create policy for users to delete their own data
CREATE POLICY "Users can delete their own transactions" 
  ON public.transactions 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Activate realtime features for this table
ALTER TABLE public.transactions REPLICA IDENTITY FULL;
