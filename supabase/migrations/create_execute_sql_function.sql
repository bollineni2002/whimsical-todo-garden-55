-- Create a function to execute arbitrary SQL
-- Note: This is potentially dangerous and should only be used for debugging
CREATE OR REPLACE FUNCTION public.execute_sql(sql_query TEXT)
RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  -- Only allow authenticated users to execute SQL
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  
  -- Execute the SQL and capture the result
  EXECUTE 'WITH result AS (' || sql_query || ') SELECT jsonb_agg(r) FROM result r' INTO result;
  
  -- Return the result
  RETURN result;
EXCEPTION
  WHEN OTHERS THEN
    -- Return the error message
    RETURN jsonb_build_object('error', SQLERRM, 'detail', SQLSTATE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
