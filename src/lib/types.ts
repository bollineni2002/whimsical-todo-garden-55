
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

export type TabKey = 'loadBuy' | 'transportation' | 'loadSold' | 'payments' | 'notes' | 'attachments';
