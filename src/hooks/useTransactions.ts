
import { useState, useEffect } from 'react';
import { Transaction } from '@/lib/types';
import { transactionService } from '@/lib/transaction-service';
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
      if (!user?.id) return;

      setLoading(true);
      console.log('Loading transactions for user:', user.id);

      // Get transactions for the current user only using the transaction service
      const data = await transactionService.getAllTransactions(user.id);
      console.log(`Loaded ${data.length} transactions:`, data.map(t => ({ id: t.id, name: t.name })));

      // Check for duplicates before setting state
      const uniqueTransactions = removeDuplicateTransactions(data);
      if (uniqueTransactions.length !== data.length) {
        console.log(`Removed ${data.length - uniqueTransactions.length} duplicate transactions`);
      }

      setTransactions(uniqueTransactions);
      setFilteredTransactions(uniqueTransactions);
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

  // Helper function to remove duplicate transactions
  const removeDuplicateTransactions = (transactions: Transaction[]): Transaction[] => {
    const uniqueIds = new Set<string>();
    return transactions.filter(transaction => {
      if (uniqueIds.has(transaction.id)) {
        return false;
      }
      uniqueIds.add(transaction.id);
      return true;
    });
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
        // Regular search across transaction name and ID
        filtered = filtered.filter(transaction =>
          transaction.name?.toLowerCase().includes(query) ||
          transaction.id.toLowerCase().includes(query)
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
