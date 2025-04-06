// Simple Supabase client without complex type definitions
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://unwisxczcoeoshwybktg.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVud2lzeGN6Y29lb3Nod3lia3RnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI5MTE2MzEsImV4cCI6MjA1ODQ4NzYzMX0.CQWn7zkuEHAIPCNPB8nIGCaZE1hut2umQEMdRkq3IFk";

// Initialize the Supabase client with better error handling
let supabaseClient;

try {
  // Create the client with storage options
  supabaseClient = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    },
    global: {
      headers: {
        'x-application-name': 'trade-book-ledger'
      }
    }
  });

  // Test if storage is available
  if (!supabaseClient.storage) {
    console.error('Supabase storage is not available in the client');
  } else {
    console.log('Supabase client initialized with storage support');
  }
} catch (error) {
  console.error('Error initializing Supabase client:', error);
  // Create a fallback client with minimal options
  supabaseClient = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
}

export const supabaseSimple = supabaseClient;
