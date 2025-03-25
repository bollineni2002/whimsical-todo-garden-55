
import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DetailedView from '@/components/DetailedView';
import ThemeToggle from '@/components/ThemeToggle';
import { Transaction } from '@/lib/types';
import { dbManager } from '@/lib/db';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import ButtonIcon from '@/components/ui/ButtonIcon';
import { Button } from '@/components/ui/button';

const TransactionDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  const loadTransaction = useCallback(async () => {
    if (!id) {
      navigate('/');
      return;
    }

    try {
      setLoading(true);
      const data = await dbManager.getTransaction(id);
      if (data) {
        // Initialize all required transaction properties to prevent blank screens
        const updatedTransaction = {
          ...data,
          loadBuy: data.loadBuy || undefined,
          transportation: data.transportation || undefined,
          loadSold: data.loadSold || undefined,
          payments: data.payments || [],
          notes: data.notes || [],
          attachments: data.attachments || [],
        };
        setTransaction(updatedTransaction);
      } else {
        toast({
          title: 'Error',
          description: 'Transaction not found',
          variant: 'destructive',
        });
        navigate('/');
      }
    } catch (error) {
      console.error('Failed to load transaction:', error);
      toast({
        title: 'Error',
        description: 'Failed to load transaction details',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [id, navigate, toast]);

  // Refresh transaction wrapper for child components
  const refreshTransaction = async () => {
    await loadTransaction();
  };

  useEffect(() => {
    loadTransaction();
  }, [loadTransaction]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen flex flex-col"
    >
      <header className="glass border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <ButtonIcon 
              variant="ghost" 
              onClick={() => navigate('/')}
              aria-label="Go back"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5"></path>
                <path d="M12 19l-7-7 7-7"></path>
              </svg>
            </ButtonIcon>
            <h1 className="text-2xl font-semibold">Transaction Details</h1>
          </div>
          <ThemeToggle />
        </div>
      </header>
      
      <main className="flex-1 flex overflow-hidden">
        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="animate-pulse-subtle">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="2" x2="12" y2="6"></line>
                <line x1="12" y1="18" x2="12" y2="22"></line>
                <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line>
                <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line>
                <line x1="2" y1="12" x2="6" y2="12"></line>
                <line x1="18" y1="12" x2="22" y2="12"></line>
                <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line>
                <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line>
              </svg>
            </div>
          </div>
        ) : transaction ? (
          <DetailedView 
            transaction={transaction}
            refreshTransaction={refreshTransaction}
          />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-4 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-muted-foreground mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <h3 className="text-lg font-medium mb-2">Transaction Not Found</h3>
            <p className="text-muted-foreground mb-4">
              The transaction you're looking for doesn't exist or has been deleted.
            </p>
            <Button
              onClick={() => navigate('/')}
              className="inline-flex items-center justify-center px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Return to Dashboard
            </Button>
          </div>
        )}
      </main>
    </motion.div>
  );
};

export default TransactionDetail;
