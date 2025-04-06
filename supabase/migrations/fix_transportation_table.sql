-- First, check if the transportation table exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'transportation') THEN
        -- Create the transportation table if it doesn't exist
        CREATE TABLE public.transportation (
            id UUID PRIMARY KEY,
            transaction_id UUID NOT NULL REFERENCES public.transactions(id) ON DELETE CASCADE,
            vehicle_type TEXT NOT NULL,
            number_plate TEXT NOT NULL,
            driver_phone TEXT,
            empty_weight NUMERIC NOT NULL,
            loaded_weight NUMERIC NOT NULL,
            origin TEXT NOT NULL,
            distance NUMERIC NOT NULL,
            departure_date TEXT,
            departure_time TEXT,
            expected_arrival_date TEXT,
            expected_arrival_time TEXT,
            transportation_charges NUMERIC NOT NULL,
            notes TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
        );
    ELSE
        -- Add driver_phone column if it doesn't exist
        IF NOT EXISTS (SELECT FROM information_schema.columns 
                      WHERE table_schema = 'public' 
                      AND table_name = 'transportation' 
                      AND column_name = 'driver_phone') THEN
            ALTER TABLE public.transportation ADD COLUMN driver_phone TEXT;
        END IF;
    END IF;
END
$$;

-- Add comment to the driver_phone column
COMMENT ON COLUMN public.transportation.driver_phone IS 'Phone number of the driver';

-- Enable Row Level Security
ALTER TABLE public.transportation ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own transportation" ON public.transportation;
DROP POLICY IF EXISTS "Users can insert their own transportation" ON public.transportation;
DROP POLICY IF EXISTS "Users can update their own transportation" ON public.transportation;
DROP POLICY IF EXISTS "Users can delete their own transportation" ON public.transportation;

-- Create policies with proper access control
CREATE POLICY "Users can view their own transportation"
  ON public.transportation
  FOR SELECT
  USING (
    transaction_id IN (
      SELECT id FROM public.transactions WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own transportation"
  ON public.transportation
  FOR INSERT
  WITH CHECK (
    transaction_id IN (
      SELECT id FROM public.transactions WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own transportation"
  ON public.transportation
  FOR UPDATE
  USING (
    transaction_id IN (
      SELECT id FROM public.transactions WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    transaction_id IN (
      SELECT id FROM public.transactions WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own transportation"
  ON public.transportation
  FOR DELETE
  USING (
    transaction_id IN (
      SELECT id FROM public.transactions WHERE user_id = auth.uid()
    )
  );

-- Create an index on transaction_id for better performance
CREATE INDEX IF NOT EXISTS idx_transportation_transaction_id ON public.transportation(transaction_id);

-- Grant necessary permissions to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON public.transportation TO authenticated;
