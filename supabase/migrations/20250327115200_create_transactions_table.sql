
-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  total_amount NUMERIC,
  status TEXT CHECK (status IN ('completed', 'pending', 'cancelled')),
  load_buy JSONB,
  transportation JSONB,
  load_sold JSONB,
  payments JSONB,
  notes JSONB,
  attachments JSONB,
  business_name TEXT,
  synced_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create index for user_id for faster queries
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);

-- Set up Row Level Security (RLS)
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to view their own transactions
CREATE POLICY "Users can view their own transactions" 
  ON transactions 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Create policy to allow users to insert their own transactions
CREATE POLICY "Users can insert their own transactions" 
  ON transactions 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Create policy to allow users to update their own transactions
CREATE POLICY "Users can update their own transactions" 
  ON transactions 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Create policy to allow users to delete their own transactions
CREATE POLICY "Users can delete their own transactions" 
  ON transactions 
  FOR DELETE 
  USING (auth.uid() = user_id);
