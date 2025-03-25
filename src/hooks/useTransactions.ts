
import { useState, useEffect } from 'react';
import { Transaction } from '@/lib/types';
import { dbManager } from '@/lib/db';
import { useToast } from '@/hooks/use-toast';

export const useTransactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const { toast } = useToast();

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const data = await dbManager.getAllTransactions();
      
      if (data.length === 0) {
        // Add mock transaction if there are no transactions
        const mockTransaction: Transaction = {
          id: 'txn-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 5),
          name: 'Sample Wheat Transaction',
          date: new Date().toISOString(),
          totalAmount: 85000,
          status: 'pending',
          loadBuy: {
            supplierName: 'Northern Farms Ltd.',
            supplierContact: '+91 98765 43210',
            goodsName: 'Premium Wheat',
            quantity: 10,
            purchaseRate: 2500,
            totalCost: 25000,
            amountPaid: 15000,
            balance: 10000
          },
          transportation: {
            vehicleType: 'Truck - Medium',
            vehicleNumber: 'MH 04 AB 1234',
            emptyWeight: 5000,
            loadedWeight: 15000,
            origin: 'Mumbai',
            destination: 'Pune',
            charges: 5000,
            notes: 'Scheduled for delivery on time'
          },
          loadSold: {
            buyerName: 'City Mills',
            buyerContact: '+91 98765 12345',
            quantitySold: 10,
            saleRate: 3500,
            totalSaleAmount: 35000,
            amountReceived: 20000,
            pendingBalance: 15000
          },
          payments: [
            {
              id: 'pay-' + Date.now().toString(36),
              date: new Date().toISOString(),
              amount: 15000,
              mode: 'upi',
              counterparty: 'Northern Farms Ltd.',
              isIncoming: false,
              notes: 'Initial payment for wheat purchase',
              paymentTime: new Date().toTimeString().split(' ')[0],
              installmentNumber: 1,
              totalInstallments: 2
            },
            {
              id: 'pay-' + (Date.now() + 1).toString(36),
              date: new Date().toISOString(),
              amount: 20000,
              mode: 'bank',
              counterparty: 'City Mills',
              isIncoming: true,
              notes: 'Advance payment for wheat delivery',
              paymentTime: new Date().toTimeString().split(' ')[0],
              installmentNumber: 1,
              totalInstallments: 2
            }
          ],
          notes: [
            {
              id: 'note-' + Date.now().toString(36),
              date: new Date().toISOString(),
              content: 'Quality inspection completed. Grade A wheat confirmed.'
            }
          ],
          attachments: [
            {
              id: 'att-' + Date.now().toString(36),
              name: 'Invoice_123.pdf',
              type: 'application/pdf',
              uri: 'https://via.placeholder.com/150',
              date: new Date().toISOString()
            }
          ],
          businessName: 'TransactLy'
        };
        
        await dbManager.addTransaction(mockTransaction);
        setTransactions([mockTransaction]);
        setFilteredTransactions([mockTransaction]);
      } else {
        setTransactions(data);
        setFilteredTransactions(data);
      }
    } catch (error) {
      console.error('Failed to load transactions:', error);
      toast({
        title: 'Error',
        description: 'Failed to load transactions',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Filter transactions when searchQuery or statusFilter changes
  useEffect(() => {
    let filtered = transactions;
    
    // Status filter based on keywords like "pending", "completed", "success", etc.
    if (statusFilter) {
      filtered = filtered.filter(transaction => 
        transaction.status === statusFilter
      );
    }
    
    // Text search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      
      // Special case handling for status keywords in search
      if (query === 'pending' || query === 'pending transaction') {
        filtered = filtered.filter(transaction => transaction.status === 'pending');
      } else if (query === 'completed' || query === 'success' || query === 'successful' || query === 'successful transaction') {
        filtered = filtered.filter(transaction => transaction.status === 'completed');
      } else if (query === 'cancelled' || query === 'canceled' || query === 'cancelled transaction') {
        filtered = filtered.filter(transaction => transaction.status === 'cancelled');
      } else {
        // Regular search across multiple fields
        filtered = filtered.filter(transaction => 
          transaction.name?.toLowerCase().includes(query) ||
          transaction.id.toLowerCase().includes(query) ||
          (transaction.loadBuy?.supplierName?.toLowerCase().includes(query)) ||
          (transaction.loadSold?.buyerName?.toLowerCase().includes(query)) ||
          (transaction.loadBuy?.goodsName?.toLowerCase().includes(query))
        );
      }
    }
    
    setFilteredTransactions(filtered);
  }, [searchQuery, statusFilter, transactions]);

  // Load transactions on component mount
  useEffect(() => {
    loadTransactions();
  }, []);

  return {
    transactions,
    filteredTransactions,
    loading,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    loadTransactions
  };
};
