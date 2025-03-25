
export interface Transaction {
  id: string;
  name: string; // New field for transaction name
  date: string;
  totalAmount: number;
  status: 'completed' | 'pending' | 'cancelled';
  loadBuy?: LoadBuy;
  transportation?: Transportation;
  loadSold?: LoadSold;
  payments: Payment[];
  notes: Note[];
  attachments: Attachment[];
  businessName?: string;
  syncedAt?: string; // Timestamp of last sync
  updatedAt?: string; // Timestamp of last update
  user_id?: string; // User ID for cloud storage
}

export interface LoadBuy {
  supplierName: string;
  supplierContact: string;
  goodsName: string;
  quantity: number;
  purchaseRate: number;
  totalCost: number;
  amountPaid: number;
  balance: number;
  paymentDueDate?: string;
  paymentFrequency?: 'one-time' | 'weekly' | 'monthly' | 'quarterly';
}

export interface Transportation {
  vehicleType: string;
  vehicleNumber: string;
  emptyWeight: number;
  loadedWeight: number;
  origin: string;
  destination: string;
  charges: number;
  notes?: string; // New field for transportation notes
  departureDate?: string;
  departureTime?: string;
  arrivalDate?: string;
  arrivalTime?: string;
}

export interface LoadSold {
  buyerName: string;
  buyerContact: string;
  quantitySold: number;
  saleRate: number;
  totalSaleAmount: number;
  amountReceived: number;
  pendingBalance: number;
  paymentDueDate?: string;
  paymentFrequency?: 'one-time' | 'weekly' | 'monthly' | 'quarterly';
}

export interface Payment {
  id: string;
  date: string;
  amount: number;
  mode: 'cash' | 'cheque' | 'upi' | 'bank';
  counterparty: string;
  isIncoming: boolean;
  notes?: string;
  paymentTime?: string;
  installmentNumber?: number;
  totalInstallments?: number;
}

export interface Note {
  id: string;
  date: string;
  content: string;
}

export interface Attachment {
  id: string;
  name: string;
  type: string;
  uri: string;
  date: string;
}

// Convert TabKey from a type to an enum so it can be used as a value
export enum TabKey {
  LOAD_BUY = 'loadBuy',
  TRANSPORTATION = 'transportation',
  LOAD_SOLD = 'loadSold',
  PAYMENTS = 'payments',
  NOTES = 'notes',
  ATTACHMENTS = 'attachments'
}

export interface SyncStatus {
  lastSyncTime: number | null;
  isAllSynced: boolean;
}
