import { openDB } from 'idb';
import { v4 as uuidv4 } from 'uuid';
import { dbService } from './db-service';
import { 
  Transaction as OldTransaction,
  LoadBuy,
  LoadSold,
  Transportation as OldTransportation,
  Payment as OldPayment,
  Note,
  Attachment as OldAttachment,
  Buyer as OldBuyer,
  Supplier
} from './types-old'; // You'll need to create this file with the old types
import {
  Transaction,
  Purchase,
  Transportation,
  Sale,
  Payment,
  TransactionNote,
  Attachment
} from './types';

// Function to migrate data from old format to new format
export const migrateData = async (userId: string): Promise<boolean> => {
  try {
    console.log('Starting data migration...');
    
    // Open the old database
    const oldDb = await openDB('transactly-db', 1);
    
    // Get all transactions from the old database
    const oldTransactions = await oldDb.getAll('transactions');
    
    console.log(`Found ${oldTransactions.length} transactions to migrate`);
    
    // Migrate each transaction
    for (const oldTransaction of oldTransactions) {
      await migrateTransaction(oldTransaction as OldTransaction, userId);
    }
    
    console.log('Data migration completed successfully');
    
    return true;
  } catch (error) {
    console.error('Error migrating data:', error);
    return false;
  }
};

// Function to migrate a single transaction
const migrateTransaction = async (oldTransaction: OldTransaction, userId: string): Promise<void> => {
  try {
    console.log(`Migrating transaction: ${oldTransaction.id}`);
    
    // Create new transaction
    const newTransaction: Transaction = {
      id: oldTransaction.id,
      user_id: userId,
      name: oldTransaction.name,
      status: oldTransaction.status,
      created_at: oldTransaction.updatedAt || new Date().toISOString()
    };
    
    // Add transaction to the new database
    await dbService.updateTransaction(newTransaction);
    
    // Migrate load buy to purchases
    if (oldTransaction.loadBuy) {
      await migratePurchase(oldTransaction.id, oldTransaction.loadBuy);
    }
    
    // Migrate suppliers to purchases
    if (oldTransaction.suppliers && oldTransaction.suppliers.length > 0) {
      for (const supplier of oldTransaction.suppliers) {
        await migrateSupplier(oldTransaction.id, supplier);
      }
    }
    
    // Migrate transportation
    if (oldTransaction.transportation) {
      await migrateTransportation(oldTransaction.id, oldTransaction.transportation);
    }
    
    // Migrate load sold to sales
    if (oldTransaction.loadSold) {
      await migrateSale(oldTransaction.id, oldTransaction.loadSold);
    }
    
    // Migrate buyers to sales
    if (oldTransaction.buyers && oldTransaction.buyers.length > 0) {
      for (const buyer of oldTransaction.buyers) {
        await migrateBuyer(oldTransaction.id, buyer);
      }
    }
    
    // Migrate payments
    if (oldTransaction.payments && oldTransaction.payments.length > 0) {
      for (const payment of oldTransaction.payments) {
        await migratePayment(oldTransaction.id, payment);
      }
    }
    
    // Migrate notes
    if (oldTransaction.notes && oldTransaction.notes.length > 0) {
      for (const note of oldTransaction.notes) {
        await migrateNote(oldTransaction.id, note);
      }
    }
    
    // Migrate attachments
    if (oldTransaction.attachments && oldTransaction.attachments.length > 0) {
      for (const attachment of oldTransaction.attachments) {
        await migrateAttachment(oldTransaction.id, attachment);
      }
    }
    
    console.log(`Transaction ${oldTransaction.id} migrated successfully`);
  } catch (error) {
    console.error(`Error migrating transaction ${oldTransaction.id}:`, error);
    throw error;
  }
};

// Function to migrate load buy to purchase
const migratePurchase = async (transactionId: string, loadBuy: LoadBuy): Promise<void> => {
  try {
    const purchase: Purchase = {
      id: uuidv4(),
      transaction_id: transactionId,
      supplier_name: loadBuy.supplierName,
      contact_number: loadBuy.supplierContact,
      goods_name: loadBuy.goodsName,
      quantity: loadBuy.quantity,
      rate: loadBuy.purchaseRate,
      total_cost: loadBuy.totalCost,
      amount_paid: loadBuy.amountPaid,
      balance_due: loadBuy.balance,
      payment_due_date: loadBuy.paymentDueDate,
      payment_frequency: loadBuy.paymentFrequency
    };
    
    await dbService.addPurchase(purchase);
  } catch (error) {
    console.error(`Error migrating purchase for transaction ${transactionId}:`, error);
    throw error;
  }
};

// Function to migrate supplier to purchase
const migrateSupplier = async (transactionId: string, supplier: Supplier): Promise<void> => {
  try {
    const purchase: Purchase = {
      id: uuidv4(),
      transaction_id: transactionId,
      supplier_name: supplier.name,
      contact_number: supplier.contact,
      goods_name: supplier.goodsName,
      quantity: supplier.quantity,
      rate: supplier.purchaseRate,
      total_cost: supplier.totalCost,
      amount_paid: supplier.amountPaid,
      balance_due: supplier.balance,
      payment_due_date: supplier.paymentDueDate,
      payment_frequency: supplier.paymentFrequency
    };
    
    await dbService.addPurchase(purchase);
  } catch (error) {
    console.error(`Error migrating supplier for transaction ${transactionId}:`, error);
    throw error;
  }
};

// Function to migrate transportation
const migrateTransportation = async (transactionId: string, oldTransportation: OldTransportation): Promise<void> => {
  try {
    const transportation: Transportation = {
      id: uuidv4(),
      transaction_id: transactionId,
      vehicle_type: oldTransportation.vehicleType,
      number_plate: oldTransportation.vehicleNumber,
      empty_weight: oldTransportation.emptyWeight,
      loaded_weight: oldTransportation.loadedWeight,
      origin: oldTransportation.origin,
      distance: 0, // This field is new, no equivalent in old data
      departure_date: oldTransportation.departureDate,
      departure_time: oldTransportation.departureTime,
      expected_arrival_date: oldTransportation.arrivalDate,
      expected_arrival_time: oldTransportation.arrivalTime,
      transportation_charges: oldTransportation.charges,
      notes: oldTransportation.notes
    };
    
    await dbService.addTransportation(transportation);
  } catch (error) {
    console.error(`Error migrating transportation for transaction ${transactionId}:`, error);
    throw error;
  }
};

// Function to migrate load sold to sale
const migrateSale = async (transactionId: string, loadSold: LoadSold): Promise<void> => {
  try {
    const sale: Sale = {
      id: uuidv4(),
      transaction_id: transactionId,
      buyer_name: loadSold.buyerName,
      contact_number: loadSold.buyerContact,
      quantity: loadSold.quantitySold,
      rate: loadSold.saleRate,
      total_amount: loadSold.totalSaleAmount,
      amount_received: loadSold.amountReceived,
      balance_due: loadSold.pendingBalance,
      payment_due_date: loadSold.paymentDueDate,
      payment_frequency: loadSold.paymentFrequency
    };
    
    await dbService.addSale(sale);
  } catch (error) {
    console.error(`Error migrating sale for transaction ${transactionId}:`, error);
    throw error;
  }
};

// Function to migrate buyer to sale
const migrateBuyer = async (transactionId: string, buyer: OldBuyer): Promise<void> => {
  try {
    const sale: Sale = {
      id: uuidv4(),
      transaction_id: transactionId,
      buyer_name: buyer.name,
      contact_number: buyer.contact,
      quantity: buyer.quantitySold,
      rate: buyer.saleRate,
      total_amount: buyer.totalSaleAmount,
      amount_received: buyer.amountReceived,
      balance_due: buyer.pendingBalance,
      payment_due_date: buyer.paymentDueDate,
      payment_frequency: buyer.paymentFrequency
    };
    
    await dbService.addSale(sale);
  } catch (error) {
    console.error(`Error migrating buyer for transaction ${transactionId}:`, error);
    throw error;
  }
};

// Function to migrate payment
const migratePayment = async (transactionId: string, oldPayment: OldPayment): Promise<void> => {
  try {
    const payment: Payment = {
      id: oldPayment.id,
      transaction_id: transactionId,
      amount: oldPayment.amount,
      payment_mode: oldPayment.mode,
      counterparty: oldPayment.counterparty,
      direction: oldPayment.isIncoming ? 'incoming' : 'outgoing',
      payment_date: oldPayment.date,
      notes: oldPayment.notes,
      installment_number: oldPayment.installmentNumber,
      total_installments: oldPayment.totalInstallments
    };
    
    await dbService.addPayment(payment);
  } catch (error) {
    console.error(`Error migrating payment for transaction ${transactionId}:`, error);
    throw error;
  }
};

// Function to migrate note
const migrateNote = async (transactionId: string, note: Note): Promise<void> => {
  try {
    const transactionNote: TransactionNote = {
      id: note.id,
      transaction_id: transactionId,
      note: note.content,
      created_at: note.date
    };
    
    await dbService.addTransactionNote(transactionNote);
  } catch (error) {
    console.error(`Error migrating note for transaction ${transactionId}:`, error);
    throw error;
  }
};

// Function to migrate attachment
const migrateAttachment = async (transactionId: string, oldAttachment: OldAttachment): Promise<void> => {
  try {
    const attachment: Attachment = {
      id: oldAttachment.id,
      transaction_id: transactionId,
      name: oldAttachment.name,
      file_type: oldAttachment.type,
      uri: oldAttachment.uri,
      created_at: oldAttachment.date
    };
    
    await dbService.addAttachment(attachment);
  } catch (error) {
    console.error(`Error migrating attachment for transaction ${transactionId}:`, error);
    throw error;
  }
};
