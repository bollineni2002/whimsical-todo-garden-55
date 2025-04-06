
// Base types for database entities

export interface User {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  business_name: string;
  created_at?: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  name: string;
  status: 'pending' | 'completed' | 'cancelled';
  created_at?: string;
}

export interface Purchase {
  id: string;
  transaction_id: string;
  supplier_name: string;
  contact_number: string;
  goods_name: string;
  quantity: number;
  rate: number;
  total_cost: number;
  amount_paid: number;
  balance_due: number;
  payment_due_date?: string;
  payment_frequency?: 'one-time' | 'weekly' | 'monthly' | 'quarterly';
}

export interface Transportation {
  id: string;
  transaction_id: string;
  vehicle_type: string;
  number_plate: string;
  driver_phone?: string;
  empty_weight: number;
  loaded_weight: number;
  origin: string;
  distance: number;
  departure_date?: string;
  departure_time?: string;
  expected_arrival_date?: string;
  expected_arrival_time?: string;
  transportation_charges: number;
  notes?: string;
}

export interface Sale {
  id: string;
  transaction_id: string;
  buyer_name: string;
  contact_number: string;
  quantity: number;
  rate: number;
  total_amount: number;
  amount_received: number;
  balance_due: number;
  payment_due_date?: string;
  payment_frequency?: 'one-time' | 'weekly' | 'monthly' | 'quarterly';
}

export interface Payment {
  id: string;
  transaction_id: string;
  amount: number;
  payment_mode: 'cash' | 'cheque' | 'upi' | 'bank';
  counterparty: string;
  direction: 'incoming' | 'outgoing';
  payment_date?: string;
  notes?: string;
  installment_number?: number;
  total_installments?: number;
}

export interface TransactionNote {
  id: string;
  transaction_id: string;
  note: string;
  created_at?: string;
}

export interface Attachment {
  id: string;
  transaction_id: string;
  name: string;
  file_type: string;
  uri: string;
  created_at?: string;
}

export interface DailyLog {
  id: string;
  user_id: string;
  direction: 'paid' | 'received';
  payment_type: 'cash' | 'upi' | 'bank' | 'others';
  date: string;
  recipient_name: string;
  amount: number;
  is_third_party: boolean;
  third_party_name?: string;
  notes?: string;
  attachment_url?: string;
  created_at?: string;
}

export interface Buyer {
  id: string;
  user_id: string;
  name: string;
  email?: string;
  phone?: string;
}

export interface Seller {
  id: string;
  user_id: string;
  name: string;
  email?: string;
  phone?: string;
}

// Composite types for UI and data handling
export interface CompleteTransaction {
  transaction: Transaction;
  purchases: Purchase[];
  transportation?: Transportation;
  sales: Sale[];
  payments: Payment[];
  notes: TransactionNote[];
  attachments: Attachment[];
}

// Tab key enum for UI
export enum TabKey {
  PURCHASES = 'purchases',
  TRANSPORTATION = 'transportation',
  SALES = 'sales',
  PAYMENTS = 'payments',
  NOTES = 'notes',
  ATTACHMENTS = 'attachments'
}

export interface SyncStatus {
  lastSyncTime: number | null;
  isAllSynced: boolean;
}
