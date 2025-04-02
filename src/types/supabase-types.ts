
// This file contains custom type definitions for Supabase tables
import { Transaction } from '@/lib/types';

// Define the custom Database interface that includes our tables
export interface CustomDatabase {
  public: {
    Tables: {
      transactions: {
        Row: Transaction & { 
          user_id: string;
          buyers: BuyerType[];
          suppliers: SupplierType[];
        };
        Insert: Transaction & { 
          user_id: string;
          buyers?: BuyerType[];
          suppliers?: SupplierType[];
        };
        Update: Partial<Transaction & { 
          user_id: string;
          buyers?: BuyerType[];
          suppliers?: SupplierType[];
        }>;
      };
    };
    Types: {
      buyer_type: BuyerType;
      supplier_type: SupplierType;
    };
  };
}

export interface BuyerType {
  name: string;
  contact: string;
  quantitySold: number;
  saleRate: number;
  totalSaleAmount: number;
  amountReceived: number;
  pendingBalance: number;
  paymentDueDate?: string;
  paymentFrequency?: 'one-time' | 'weekly' | 'monthly' | 'quarterly';
}

export interface SupplierType {
  name: string;
  contact: string;
  goodsName: string;
  quantity: number;
  purchaseRate: number;
  totalCost: number;
  amountPaid: number;
  balance: number;
  paymentDueDate?: string;
  paymentFrequency?: 'one-time' | 'weekly' | 'monthly' | 'quarterly';
}
