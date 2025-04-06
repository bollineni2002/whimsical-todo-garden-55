
// This file contains custom type definitions for Supabase tables
import {
  User,
  Transaction,
  Purchase,
  Transportation,
  Sale,
  Payment,
  TransactionNote,
  Attachment,
  DailyLog,
  Buyer,
  Seller
} from '@/lib/types';

// Define the custom Database interface that includes our tables
export interface CustomDatabase {
  public: {
    Tables: {
      users: {
        Row: User;
        Insert: Omit<User, 'created_at'>;
        Update: Partial<Omit<User, 'created_at'>>;
      };
      transactions: {
        Row: Transaction;
        Insert: Omit<Transaction, 'created_at'>;
        Update: Partial<Omit<Transaction, 'created_at'>>;
      };
      purchases: {
        Row: Purchase;
        Insert: Purchase;
        Update: Partial<Purchase>;
      };
      transportation: {
        Row: Transportation;
        Insert: Transportation;
        Update: Partial<Transportation>;
      };
      sales: {
        Row: Sale;
        Insert: Sale;
        Update: Partial<Sale>;
      };
      payments: {
        Row: Payment;
        Insert: Payment;
        Update: Partial<Payment>;
      };
      transaction_notes: {
        Row: TransactionNote;
        Insert: Omit<TransactionNote, 'created_at'>;
        Update: Partial<Omit<TransactionNote, 'created_at'>>;
      };
      attachments: {
        Row: Attachment;
        Insert: Omit<Attachment, 'created_at'>;
        Update: Partial<Omit<Attachment, 'created_at'>>;
      };
      daily_logs: {
        Row: DailyLog;
        Insert: Omit<DailyLog, 'created_at'>;
        Update: Partial<Omit<DailyLog, 'created_at'>>;
      };
      buyers: {
        Row: Buyer;
        Insert: Buyer;
        Update: Partial<Buyer>;
      };
      sellers: {
        Row: Seller;
        Insert: Seller;
        Update: Partial<Seller>;
      };
    };
  };
}
