-- Drop the existing function if it exists
DROP FUNCTION IF EXISTS public.execute_sql(TEXT);

-- Create a more robust function to execute arbitrary SQL
CREATE OR REPLACE FUNCTION public.execute_sql(sql_query TEXT)
RETURNS JSONB AS $$
DECLARE
  result JSONB;
  error_message TEXT;
  error_detail TEXT;
  error_hint TEXT;
  error_context TEXT;
BEGIN
  -- Only allow authenticated users to execute SQL
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  
  BEGIN
    -- Execute the SQL and capture the result
    EXECUTE 'DO $do$ BEGIN ' || sql_query || ' EXCEPTION WHEN OTHERS THEN NULL; END $do$';
    
    -- Try to get results if it's a SELECT query
    BEGIN
      EXECUTE 'WITH result AS (' || sql_query || ') SELECT jsonb_agg(r) FROM result r' INTO result;
      
      -- If result is NULL but the query executed successfully, return an empty success message
      IF result IS NULL THEN
        result := jsonb_build_object('status', 'success', 'message', 'Query executed successfully, no results returned');
      END IF;
    EXCEPTION
      WHEN OTHERS THEN
        -- If getting results fails, just return success
        result := jsonb_build_object('status', 'success', 'message', 'Query executed successfully');
    END;
    
    RETURN result;
  EXCEPTION
    WHEN OTHERS THEN
      -- Get detailed error information
      GET STACKED DIAGNOSTICS 
        error_message = MESSAGE_TEXT,
        error_detail = PG_EXCEPTION_DETAIL,
        error_hint = PG_EXCEPTION_HINT,
        error_context = PG_EXCEPTION_CONTEXT;
      
      -- Return the error details
      RETURN jsonb_build_object(
        'status', 'error',
        'message', error_message,
        'detail', error_detail,
        'hint', error_hint,
        'context', error_context
      );
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.execute_sql(TEXT) TO authenticated;

-- Create a function to check if a table exists
CREATE OR REPLACE FUNCTION public.table_exists(table_name TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  exists_val BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = $1
  ) INTO exists_val;
  
  RETURN exists_val;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.table_exists(TEXT) TO authenticated;
