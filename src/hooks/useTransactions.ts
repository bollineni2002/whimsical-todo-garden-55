
import { useState, useEffect } from 'react';
import { Transaction } from '@/lib/types';
import { dbManager } from '@/lib/db';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';

export const useTransactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const loadTransactions = async () => {
    try {
      setLoading(true);
      // Get transactions for the current user only
      const data = await dbManager.getAllTransactions(user?.id);
      
      // No mock transaction creation - just set the actual user data
      setTransactions(data);
      setFilteredTransactions(data);
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

  // Load transactions on component mount or when user changes
  useEffect(() => {
    if (user) {
      loadTransactions();
    }
  }, [user]);

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
