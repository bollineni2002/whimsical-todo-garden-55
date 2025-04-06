// Simple Supabase client without complex type definitions
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://unwisxczcoeoshwybktg.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVud2lzeGN6Y29lb3Nod3lia3RnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI5MTE2MzEsImV4cCI6MjA1ODQ4NzYzMX0.CQWn7zkuEHAIPCNPB8nIGCaZE1hut2umQEMdRkq3IFk";

// Create a simple client without complex type definitions
export const supabaseSimple = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
