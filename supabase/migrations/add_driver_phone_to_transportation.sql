-- Add driver_phone column to transportation table
ALTER TABLE transportation ADD COLUMN driver_phone TEXT;

-- Add comment to the column
COMMENT ON COLUMN transportation.driver_phone IS 'Phone number of the driver';

-- Update RLS policies to include the new column
-- First, drop existing policies if they're too restrictive
DROP POLICY IF EXISTS "Users can view their own transportation" ON transportation;
DROP POLICY IF EXISTS "Users can insert their own transportation" ON transportation;
DROP POLICY IF EXISTS "Users can update their own transportation" ON transportation;
DROP POLICY IF EXISTS "Users can delete their own transportation" ON transportation;

-- Recreate policies with access to the new column
CREATE POLICY "Users can view their own transportation"
  ON transportation
  FOR SELECT
  USING (
    transaction_id IN (
      SELECT id FROM transactions WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own transportation"
  ON transportation
  FOR INSERT
  WITH CHECK (
    transaction_id IN (
      SELECT id FROM transactions WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own transportation"
  ON transportation
  FOR UPDATE
  USING (
    transaction_id IN (
      SELECT id FROM transactions WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    transaction_id IN (
      SELECT id FROM transactions WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own transportation"
  ON transportation
  FOR DELETE
  USING (
    transaction_id IN (
      SELECT id FROM transactions WHERE user_id = auth.uid()
    )
  );
