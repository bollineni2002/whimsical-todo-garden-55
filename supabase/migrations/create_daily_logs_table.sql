-- Create daily_logs table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.daily_logs (
    id TEXT PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    direction TEXT NOT NULL CHECK (direction IN ('paid', 'received')),
    payment_type TEXT NOT NULL CHECK (payment_type IN ('cash', 'upi', 'bank', 'others')),
    date TEXT NOT NULL,
    recipient_name TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    is_third_party BOOLEAN NOT NULL DEFAULT false,
    third_party_name TEXT,
    notes TEXT,
    attachment_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create index for user_id for faster queries
CREATE INDEX IF NOT EXISTS idx_daily_logs_user_id ON public.daily_logs(user_id);

-- Enable Row Level Security
ALTER TABLE public.daily_logs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own daily logs" ON public.daily_logs;
DROP POLICY IF EXISTS "Users can insert their own daily logs" ON public.daily_logs;
DROP POLICY IF EXISTS "Users can update their own daily logs" ON public.daily_logs;
DROP POLICY IF EXISTS "Users can delete their own daily logs" ON public.daily_logs;

-- Create policies with proper access control
CREATE POLICY "Users can view their own daily logs"
  ON public.daily_logs
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own daily logs"
  ON public.daily_logs
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own daily logs"
  ON public.daily_logs
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own daily logs"
  ON public.daily_logs
  FOR DELETE
  USING (user_id = auth.uid());

-- Grant necessary permissions to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON public.daily_logs TO authenticated;
