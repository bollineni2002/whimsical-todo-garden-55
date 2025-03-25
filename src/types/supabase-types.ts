
// This file contains custom type definitions for Supabase tables
import { Transaction } from '@/lib/types';

// Define the custom Database interface that includes our tables
export interface CustomDatabase {
  public: {
    Tables: {
      transactions: {
        Row: Transaction;
        Insert: Transaction;
        Update: Partial<Transaction>;
      };
    };
  };
}
