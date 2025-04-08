import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { PersistentInput, PersistentTextarea } from '@/components/ui/persistent-input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { ArrowUpRight, ArrowDownLeft, AlertCircle, Edit, Trash2, MoreVertical } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import {
  isToday,
  isYesterday,
  isThisWeek,
  isThisMonth,
  parseISO,
  isValid as isValidDate
} from 'date-fns';
import { Dialog, DialogContent, DialogTitle, DialogHeader, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { dbService } from '@/lib/db-service';
import { supabaseService } from '@/lib/supabase-service';
import { syncService } from '@/lib/sync-service';
import { useAuth } from '@/context/AuthContext';
import { DailyLog } from '@/lib/types';
import { v4 as uuidv4 } from 'uuid';

type ValidationErrors = {
  recipient?: string;
  amount?: string;
  date?: string;
  thirdPartyName?: string;
};

type TimeFilter = 'all' | 'today' | 'yesterday' | 'thisWeek' | 'thisMonth';

interface DailyTransactionsLogProps {
  isFormOpen?: boolean;
  setIsFormOpen?: (open: boolean) => void;
  dialogModeRef?: { current: boolean };
}

const PersistentDailyTransactionsLog: React.FC<DailyTransactionsLogProps> = ({
  isFormOpen: externalIsFormOpen,
  setIsFormOpen: externalSetIsFormOpen,
  dialogModeRef
}) => {
  const [transactions, setTransactions] = useState<DailyLog[]>([]);
  const [newTransaction, setNewTransaction] = useState<Omit<DailyLog, 'id' | 'created_at'>>({
    user_id: '',
    direction: 'paid',
    payment_type: 'cash',
    date: new Date().toISOString().split('T')[0],
    recipient_name: '',
    amount: 0,
    is_third_party: false,
    third_party_name: '',
    notes: '',
  });

  const [internalIsFormOpen, setInternalIsFormOpen] = useState(false);
  const isFormOpen = externalIsFormOpen !== undefined ? externalIsFormOpen : internalIsFormOpen;
  const setIsFormOpen = externalSetIsFormOpen || setInternalIsFormOpen;

  // Track whether we're using dialog mode or inline form
  const [isDialogMode, setIsDialogMode] = useState(true); // Default to dialog mode

  const [thirdPartyNameInput, setThirdPartyNameInput] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<DailyLog | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  // Load transactions on component mount
  useEffect(() => {
    if (user?.id) {
      loadTransactions();
    }
  }, [user]);

  // Set dialog mode based on dialogModeRef
  useEffect(() => {
    if (dialogModeRef && isFormOpen) {
      setIsDialogMode(dialogModeRef.current);
    }
  }, [dialogModeRef, isFormOpen]);

  const loadTransactions = async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      console.log('Loading daily logs from local database...');
      const logs = await dbService.getDailyLogsByUser(user.id);
      console.log(`Loaded ${logs.length} daily logs from local database`);

      // Sort logs by date (newest first)
      const sortedLogs = [...logs].sort((a, b) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );

      setTransactions(sortedLogs);
    } catch (error) {
      console.error('Error loading daily logs:', error);
      toast({
        title: 'Error',
        description: 'Failed to load transaction history',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredTransactions = useMemo(() => {
    if (timeFilter === 'all') {
      return transactions;
    }

    return transactions.filter(tx => {
      try {
        const txDate = parseISO(tx.date);
        if (!isValidDate(txDate)) return false;

        switch (timeFilter) {
          case 'today':
            return isToday(txDate);
          case 'yesterday':
            return isYesterday(txDate);
          case 'thisWeek':
            return isThisWeek(txDate);
          case 'thisMonth':
            return isThisMonth(txDate);
          default:
            return true;
        }
      } catch (error) {
        console.error("Error parsing date for filtering:", tx.date, error);
        return false;
      }
    });
  }, [transactions, timeFilter]);

  // Handle input changes
  const handleInputChange = (field: string, value: string) => {
    // Clear validation errors for this field if any
    if (validationErrors[field as keyof ValidationErrors]) {
      setValidationErrors(prev => ({ ...prev, [field]: undefined }));
    }

    // Update the transaction state
    setNewTransaction(prev => ({
      ...prev,
      [field]: field === 'amount' ? parseFloat(value) || 0 : value,
    }));

    // Handle special cases
    if (field === 'is_third_party' && value !== 'true') {
      setThirdPartyNameInput('');
    }
    if (field === 'direction' && value === 'received') {
      setThirdPartyNameInput('');
    }
  };

  // Handle select changes
  const handleSelectChange = (name: string) => (value: string) => {
    setNewTransaction(prev => ({ ...prev, [name]: value }));
    if (name === 'is_third_party' && value !== 'true') {
      setThirdPartyNameInput('');
    }
    if (name === 'direction' && value === 'received') {
      setThirdPartyNameInput('');
    }
  };

  // Handle radio button changes
  const handleRadioChange = (value: string) => {
    const isThirdParty = value === 'true';
    setNewTransaction(prev => ({ ...prev, is_third_party: isThirdParty }));
    if (!isThirdParty) {
      setThirdPartyNameInput('');
    }
  };

  // Handle editing a transaction
  const handleEditTransaction = (transaction: DailyLog) => {
    setSelectedTransaction(transaction);
    setIsEditMode(true);

    // Populate the form with the transaction data
    setNewTransaction({
      user_id: transaction.user_id,
      direction: transaction.direction,
      payment_type: transaction.payment_type,
      date: transaction.date,
      recipient_name: transaction.recipient_name,
      amount: transaction.amount,
      is_third_party: transaction.is_third_party,
      third_party_name: transaction.third_party_name,
      notes: transaction.notes || '',
    });

    // Set third party name if it exists
    if (transaction.is_third_party && transaction.third_party_name) {
      setThirdPartyNameInput(transaction.third_party_name);
    } else {
      setThirdPartyNameInput('');
    }

    // Open the form in dialog mode
    setIsDialogMode(true);
    setIsFormOpen(true);
  };

  // Handle deleting a transaction
  const handleDeleteClick = (transaction: DailyLog) => {
    setSelectedTransaction(transaction);
    setIsDeleteDialogOpen(true);
  };

  // Confirm deletion of a transaction
  const confirmDelete = async () => {
    if (!selectedTransaction) return;

    try {
      setIsLoading(true);
      console.log(`Deleting transaction ${selectedTransaction.id}...`);

      // Delete from local database
      await dbService.deleteDailyLog(selectedTransaction.id);

      // If online, also delete from Supabase
      if (navigator.onLine) {
        try {
          await supabaseService.deleteDailyLog(selectedTransaction.id);
          console.log('Successfully deleted from Supabase');
        } catch (error) {
          console.error('Error deleting from Supabase:', error);
          // Continue even if Supabase delete fails
        }
      }

      // Reload transactions
      await loadTransactions();

      toast({
        title: 'Success',
        description: 'Transaction deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting transaction:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete transaction',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
      setIsDeleteDialogOpen(false);
      setSelectedTransaction(null);
    }
  };

  // Cancel form and reset state
  const cancelForm = () => {
    setIsFormOpen(false);
    setIsEditMode(false);
    setSelectedTransaction(null);
    // Reset dialog mode based on dialogModeRef if provided
    if (dialogModeRef) {
      setIsDialogMode(dialogModeRef.current);
    }
    setNewTransaction({
      user_id: user?.id || '',
      direction: 'paid',
      payment_type: 'cash',
      date: new Date().toISOString().split('T')[0],
      recipient_name: '',
      amount: 0,
      is_third_party: false,
      third_party_name: '',
      notes: '',
    });
    setThirdPartyNameInput('');
    setValidationErrors({});
  };

  // Save transaction (add new or update existing)
  const handleSaveTransaction = async () => {
    if (!user?.id) {
      toast({
        title: 'Error',
        description: 'You must be logged in to add transactions',
        variant: 'destructive',
      });
      return;
    }

    const errors: ValidationErrors = {};
    let isValid = true;

    setValidationErrors({});

    if (!newTransaction.recipient_name.trim()) {
      errors.recipient = 'Recipient/Source name is required.';
      isValid = false;
    }

    if (newTransaction.amount <= 0) {
      errors.amount = 'Amount must be greater than zero.';
      isValid = false;
    }

    if (!newTransaction.date) {
      errors.date = 'Date is required.';
      isValid = false;
    }

    if (newTransaction.direction === 'paid' && newTransaction.is_third_party && !thirdPartyNameInput.trim()) {
      errors.thirdPartyName = 'Third-party name is required for this destination.';
      isValid = false;
    }

    if (!isValid) {
      setValidationErrors(errors);
      toast({
        title: 'Validation Error',
        description: 'Please fix the errors indicated below.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsLoading(true);

      // Prepare the log object with common properties
      const logData: Omit<DailyLog, 'id' | 'created_at'> = {
        ...newTransaction,
        user_id: user.id,
        third_party_name: newTransaction.is_third_party ? thirdPartyNameInput.trim() : undefined,
        // Handle attachment if needed
        attachment_url: selectedFile ? URL.createObjectURL(selectedFile) :
                        (isEditMode && selectedTransaction ? selectedTransaction.attachment_url : undefined),
      };

      if (isEditMode && selectedTransaction) {
        // Update existing transaction
        console.log(`Updating transaction ${selectedTransaction.id}...`);

        // Create updated log with the ID from the selected transaction
        const updatedLog: DailyLog = {
          ...logData,
          id: selectedTransaction.id,
          created_at: selectedTransaction.created_at,
        };

        // Update in local database
        await dbService.updateDailyLog(updatedLog);
        console.log('Successfully updated log in local database');

        // If online, also update in Supabase
        if (navigator.onLine) {
          console.log('Online, syncing updated log to Supabase...');
          try {
            const result = await supabaseService.updateDailyLog(updatedLog);
            if (result) {
              console.log('Successfully synced updated log to Supabase');
            } else {
              console.error('Failed to sync updated log to Supabase: result was null');
            }
          } catch (error) {
            console.error('Error syncing updated log to Supabase:', error);
            // Continue even if Supabase sync fails
          }
        } else {
          console.log('Offline, skipping Supabase sync');
        }

        toast({
          title: 'Success',
          description: 'Transaction updated successfully.',
        });
      } else {
        // Add new transaction
        console.log('Adding new daily log...');

        // Check for potential duplicates before adding
        const dateStr = new Date(logData.date).toDateString();
        const potentialDuplicates = transactions.filter(log =>
          log.recipient_name === logData.recipient_name &&
          log.amount === logData.amount &&
          new Date(log.date).toDateString() === dateStr &&
          log.direction === logData.direction &&
          log.payment_type === logData.payment_type
        );

        if (potentialDuplicates.length > 0) {
          console.log('Found potential duplicate daily log:', potentialDuplicates[0]);
          toast({
            title: 'Duplicate Detected',
            description: 'A similar transaction already exists for this date, recipient, and amount.',
            variant: 'destructive',
          });
          setIsLoading(false);
          return;
        }

        // Add to local database
        const createdLog = await dbService.addDailyLog(logData);
        console.log('Successfully added log to local database:', createdLog);

        // If online, also add to Supabase
        if (navigator.onLine) {
          console.log('Online, syncing daily log to Supabase...');
          try {
            const result = await supabaseService.createDailyLog(createdLog);
            if (result) {
              console.log('Successfully synced daily log to Supabase:', result);
            } else {
              console.error('Failed to sync daily log to Supabase: result was null');
            }
          } catch (error) {
            console.error('Error syncing daily log to Supabase:', error);
            // Continue even if Supabase sync fails
          }
        } else {
          console.log('Offline, skipping Supabase sync');
        }

        toast({
          title: 'Success',
          description: 'Transaction logged successfully.',
        });
      }

      // Reload transactions
      await loadTransactions();

      // Reset form and state
      setNewTransaction({
        user_id: user.id,
        direction: 'paid',
        payment_type: 'cash',
        date: new Date().toISOString().split('T')[0],
        recipient_name: '',
        amount: 0,
        is_third_party: false,
        third_party_name: '',
        notes: '',
      });
      setThirdPartyNameInput('');
      setSelectedFile(null);
      setIsEditMode(false);
      setSelectedTransaction(null);

      const fileInput = document.getElementById('attachment') as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }
      setIsFormOpen(false);

      // Force sync to ensure data is in Supabase
      if (navigator.onLine) {
        console.log('Forcing sync of all data...');
        try {
          await syncService.forceSyncContacts(user.id);
          console.log('Force sync completed successfully');
        } catch (syncError) {
          console.error('Error during force sync:', syncError);
        }
      }
    } catch (error) {
      console.error(`Error ${isEditMode ? 'updating' : 'adding'} transaction:`, error);
      toast({
        title: 'Error',
        description: `Failed to ${isEditMode ? 'update' : 'add'} transaction`,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const TransactionForm = () => (
    <div className="space-y-4 mb-4 p-4 border border-border/40 rounded-lg bg-background/50 backdrop-blur-sm">
      <h3 className="text-base font-medium mb-3">
        {isEditMode ? 'Edit Transaction' : 'Transaction Details'}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="direction" className="text-xs text-muted-foreground">Direction</Label>
          <Select
            name="direction"
            value={newTransaction.direction}
            onValueChange={handleSelectChange('direction')}
          >
            <SelectTrigger id="direction" className="h-9">
              <SelectValue placeholder="Select direction" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="paid">Outgoing (Paid)</SelectItem>
              <SelectItem value="received">Incoming (Received)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="payment_type" className="text-xs text-muted-foreground">Type</Label>
          <Select
            name="payment_type"
            value={newTransaction.payment_type}
            onValueChange={handleSelectChange('payment_type')}
          >
            <SelectTrigger id="payment_type" className="h-9">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="upi">UPI</SelectItem>
              <SelectItem value="cash">Cash</SelectItem>
              <SelectItem value="bank">Bank Transfer</SelectItem>
              <SelectItem value="others">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="date" className="text-xs text-muted-foreground">Date</Label>
          <PersistentInput
            id="date"
            name="date"
            type="date"
            value={newTransaction.date}
            onChange={(value) => handleInputChange('date', value)}
            className={cn("h-9", validationErrors.date && 'border-red-500 focus:border-red-500')}
          />
          {validationErrors.date && <p className="text-xs text-red-600 mt-1">{validationErrors.date}</p>}
        </div>
        <div>
          <Label htmlFor="recipient_name" className="text-xs text-muted-foreground">
            {newTransaction.direction === 'paid' ? 'Recipient Name' : 'Source Name'}
          </Label>
          <PersistentInput
            id="recipient_name"
            name="recipient_name"
            placeholder={newTransaction.direction === 'paid' ? 'Enter recipient name' : 'Enter source name'}
            value={newTransaction.recipient_name}
            onChange={(value) => handleInputChange('recipient_name', value)}
            className={cn("h-9", validationErrors.recipient && 'border-red-500 focus:border-red-500')}
          />
          {validationErrors.recipient && <p className="text-xs text-red-600 mt-1">{validationErrors.recipient}</p>}
        </div>
        <div>
          <Label htmlFor="amount" className="text-xs text-muted-foreground">Amount</Label>
          <PersistentInput
            id="amount"
            name="amount"
            type="number"
            placeholder="Enter amount"
            value={newTransaction.amount.toString()}
            onChange={(value) => handleInputChange('amount', value)}
            min="0.01"
            step="0.01"
            className={cn("h-9", validationErrors.amount && 'border-red-500 focus:border-red-500')}
          />
          {validationErrors.amount && <p className="text-xs text-red-600 mt-1">{validationErrors.amount}</p>}
        </div>
        {newTransaction.direction === 'paid' && (
          <div>
            <Label className="text-xs text-muted-foreground">Payment Destination</Label>
            <RadioGroup
              value={newTransaction.is_third_party ? 'true' : 'false'}
              onValueChange={handleRadioChange}
              className="flex items-center space-x-4 mt-2"
            >
              <div className="flex items-center space-x-1">
                <RadioGroupItem value="false" id="dest_direct" className="h-3.5 w-3.5" />
                <Label htmlFor="dest_direct" className="text-xs">Direct to Recipient</Label>
              </div>
              <div className="flex items-center space-x-1">
                <RadioGroupItem value="true" id="dest_third_party" className="h-3.5 w-3.5" />
                <Label htmlFor="dest_third_party" className="text-xs">To Third-Party</Label>
              </div>
            </RadioGroup>
          </div>
        )}
        {newTransaction.is_third_party && (
          <div>
            <Label htmlFor="third_party_name" className="text-xs text-muted-foreground">Third-Party Name</Label>
            <PersistentInput
              id="third_party_name"
              name="third_party_name"
              placeholder="Enter third-party name"
              value={thirdPartyNameInput}
              onChange={(value) => {
                setThirdPartyNameInput(value);
                if (validationErrors.thirdPartyName) {
                  setValidationErrors(prev => ({ ...prev, thirdPartyName: undefined }));
                }
              }}
              className={cn("h-9", validationErrors.thirdPartyName && 'border-red-500 focus:border-red-500')}
            />
            {validationErrors.thirdPartyName && <p className="text-xs text-red-600 mt-1">{validationErrors.thirdPartyName}</p>}
          </div>
        )}
      </div>
      <div>
        <Label htmlFor="notes" className="text-xs text-muted-foreground">Note (Optional)</Label>
        <PersistentTextarea
          id="notes"
          name="notes"
          placeholder="Add any relevant notes..."
          value={newTransaction.notes || ''}
          onChange={(value) => handleInputChange('notes', value)}
          className="resize-none min-h-[60px]"
        />
      </div>
      <div>
        <Label htmlFor="attachment" className="text-xs text-muted-foreground">Attachment (Optional)</Label>
        <input
          id="attachment"
          name="attachment"
          type="file"
          onChange={(e) => setSelectedFile(e.target.files ? e.target.files[0] : null)}
          className="text-xs mt-1 w-full"
        />
        {selectedFile && <p className="text-xs text-muted-foreground mt-1">Selected: {selectedFile.name}</p>}
      </div>

      <div className="flex justify-end mt-4 gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={cancelForm}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button
          size="sm"
          onClick={handleSaveTransaction}
          disabled={isLoading}
        >
          {isLoading ? 'Saving...' : isEditMode ? 'Update Transaction' : 'Save Transaction'}
        </Button>
      </div>
    </div>
  );

  return (
    <Card className="border-0 shadow-none bg-transparent mt-0">
      <div className="flex items-center">
        <h2 className="text-xl font-bold">History</h2>
      </div>

      <CardContent className="p-0 mt-2">
        {/* Only show the inline form when not in dialog mode */}
        {isFormOpen && !isDialogMode && <TransactionForm />}

        <div className="flex items-center justify-between mt-2 mb-3">
          <ToggleGroup
            type="single"
            defaultValue="all"
            value={timeFilter}
            onValueChange={(value) => setTimeFilter((value as TimeFilter) || 'all')}
            className="bg-muted/20 rounded-lg p-0.5"
            size="sm"
          >
            <ToggleGroupItem value="all" className="text-xs px-2.5 rounded-md" aria-label="Show all">All</ToggleGroupItem>
            <ToggleGroupItem value="today" className="text-xs px-2.5 rounded-md" aria-label="Show today">Today</ToggleGroupItem>
            <ToggleGroupItem value="yesterday" className="text-xs px-2.5 rounded-md" aria-label="Show yesterday">Yesterday</ToggleGroupItem>
            <ToggleGroupItem value="thisWeek" className="text-xs px-2.5 rounded-md" aria-label="Show this week">This Week</ToggleGroupItem>
          </ToggleGroup>
        </div>

        {isLoading ? (
          <div className="text-center py-4 md:py-8 bg-muted/10 rounded-lg">
            <p className="text-muted-foreground text-xs md:text-sm">Loading transactions...</p>
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="text-center py-4 md:py-8 bg-muted/10 rounded-lg">
            <AlertCircle className="w-6 h-6 md:w-8 md:h-8 text-muted-foreground/50 mx-auto mb-1 md:mb-2" />
            <p className="text-muted-foreground text-xs md:text-sm px-2">
              {transactions.length === 0
                ? 'No transactions logged yet. Use the + button to add one.'
                : `No transactions found for the selected filter (${timeFilter}).`}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto -mx-4 px-4">
            {/* Mobile view for small screens */}
            <div className="md:hidden space-y-1">
              {filteredTransactions.map((tx) => (
                <div key={tx.id} className="mobile-transaction-item">
                  <div className="transaction-header">
                    <div className="flex items-center">
                      {tx.direction === 'received' ? (
                        <ArrowDownLeft className="h-3 w-3 text-green-500 mr-0.5" />
                      ) : (
                        <ArrowUpRight className="h-3 w-3 text-red-500 mr-0.5" />
                      )}
                      <span className={`text-xs font-medium ${tx.direction === 'received' ? 'text-green-500' : 'text-red-500'}`}>
                        {tx.direction === 'received' ? 'Received' : 'Paid'}
                      </span>
                      <span className="text-xs text-muted-foreground mx-0.5">•</span>
                      <span className="text-xs capitalize">{tx.payment_type.replace('_', ' ')}</span>
                    </div>
                    <div className="text-xs font-mono font-medium">
                      {tx.amount.toFixed(2)}
                    </div>
                  </div>

                  <div className="transaction-details">
                    <div className="flex items-center">
                      <span className="text-muted-foreground mr-0.5">
                        {tx.direction === 'received' ? 'From:' : 'To:'}
                      </span>
                      <span className="font-medium">{tx.recipient_name}</span>
                    </div>
                    <div className="text-muted-foreground">
                      {new Date(tx.date).toLocaleDateString()}
                    </div>
                  </div>

                  {tx.direction === 'paid' && tx.is_third_party && tx.third_party_name && (
                    <div className="flex items-center text-xs">
                      <span className="text-muted-foreground mr-0.5">Third Party:</span>
                      <span>{tx.third_party_name}</span>
                    </div>
                  )}

                  <div className="transaction-actions">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="action-button"
                      onClick={() => handleEditTransaction(tx)}
                    >
                      <Edit className="h-3 w-3 mr-0.5" />
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="action-button text-destructive hover:bg-destructive/10"
                      onClick={() => handleDeleteClick(tx)}
                    >
                      <Trash2 className="h-3 w-3 mr-0.5" />
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop view for larger screens */}
            <Table className="min-w-full border border-border/30 rounded-lg overflow-hidden hidden md:table">
              <TableHeader className="bg-muted/10">
                <TableRow className="hover:bg-transparent border-border/30">
                  <TableHead className="w-24 py-2 text-xs">Date</TableHead>
                  <TableHead className="w-28 py-2 text-xs">Direction</TableHead>
                  <TableHead className="w-24 py-2 text-xs">Type</TableHead>
                  <TableHead className="py-2 text-xs">Recipient/Source</TableHead>
                  <TableHead className="py-2 text-xs text-right">Amount</TableHead>
                  <TableHead className="w-16 py-2 text-xs text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.map((tx) => (
                  <TableRow key={tx.id} className="border-border/30 hover:bg-muted/5">
                    <TableCell className="py-2 text-xs">{new Date(tx.date).toLocaleDateString()}</TableCell>
                    <TableCell className="py-2 text-xs">
                      <div className="flex items-center">
                        {tx.direction === 'received' ? (
                          <ArrowDownLeft className="h-3.5 w-3.5 text-green-500 mr-1.5" />
                        ) : (
                          <ArrowUpRight className="h-3.5 w-3.5 text-red-500 mr-1.5" />
                        )}
                        <span className={`${tx.direction === 'received' ? 'text-green-500' : 'text-red-500'}`}>
                          {tx.direction === 'received' ? 'Received' : 'Paid'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="py-2 text-xs capitalize">{tx.payment_type.replace('_', ' ')}</TableCell>
                    <TableCell className="py-2 text-xs font-medium">
                      {tx.recipient_name}
                      {tx.direction === 'paid' && tx.is_third_party && tx.third_party_name && (
                        <span className="text-muted-foreground ml-2 text-xs">
                          → {tx.third_party_name}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="py-2 text-xs font-mono text-right">
                      {tx.amount.toFixed(2)}
                    </TableCell>
                    <TableCell className="py-2 text-xs text-right">
                      <div className="flex justify-end items-center space-x-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => handleEditTransaction(tx)}
                          title="Edit"
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive hover:text-destructive"
                          onClick={() => handleDeleteClick(tx)}
                          title="Delete"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>

      {/* Transaction Form Dialog */}
      <Dialog open={isFormOpen && isDialogMode} onOpenChange={(open) => {
        if (!open) cancelForm();
        else {
          setIsFormOpen(open);
          setIsDialogMode(true);
        }
      }}>
        <DialogContent className="sm:max-w-lg">
          <TransactionForm />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the transaction
              {selectedTransaction && (
                <span className="font-medium"> for {selectedTransaction.recipient_name}</span>
              )}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={isLoading}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isLoading ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};

export default PersistentDailyTransactionsLog;
