import React, { useState, useMemo } from 'react'; // Import useMemo
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'; // Import ToggleGroup
import { Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils'; // Import cn for conditional classes
import { 
  isToday, 
  isYesterday, 
  isThisWeek, 
  isThisMonth, 
  parseISO, 
  isValid as isValidDate 
} from 'date-fns'; // Import date-fns functions

// Define a type for validation errors
type ValidationErrors = {
  recipient?: string;
  amount?: string;
  date?: string;
  thirdPartyName?: string;
};

// Define type for time filter values
type TimeFilter = 'all' | 'today' | 'yesterday' | 'thisWeek' | 'thisMonth';

// Define the structure for a daily transaction
interface DailyTransaction {
  id: string;
  type: 'upi' | 'cash' | 'bank_transfer' | 'other';
  date: string; // Store as ISO string or YYYY-MM-DD
  recipient: string;
  amount: number;
  note?: string; // Renamed from cashNote, now for all types
  paymentDestination: 'direct_seller' | 'third_party';
  thirdPartyName?: string; // Name if destination is third_party
  direction: 'incoming' | 'outgoing'; // To capture received or paid
  attachment?: { name: string }; // Basic attachment info (name for now)
}

const DailyTransactionsLog: React.FC = () => {
  const [transactions, setTransactions] = useState<DailyTransaction[]>([]);
  const [newTransaction, setNewTransaction] = useState<Omit<DailyTransaction, 'id'>>({
    type: 'upi',
    date: new Date().toISOString().split('T')[0], // Default to today
    recipient: '',
    amount: 0,
    paymentDestination: 'direct_seller',
    direction: 'outgoing', // Default to outgoing
    note: '', // Renamed from cashNote
    thirdPartyName: '',
    // attachment state will be handled separately if needed for preview etc.
  });
  const [showForm, setShowForm] = useState(false);
  const [thirdPartyNameInput, setThirdPartyNameInput] = useState(''); // Separate state for the input
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({}); // State for errors
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all'); // State for time filter
  const { toast } = useToast();

  // Memoized filtered transactions based on timeFilter
  const filteredTransactions = useMemo(() => {
    if (timeFilter === 'all') {
      return transactions;
    }
    
    const now = new Date(); // Use a consistent 'now' for comparisons within the filter run

    return transactions.filter(tx => {
      try {
        const txDate = parseISO(tx.date); // Assumes date is stored as 'YYYY-MM-DD'
        if (!isValidDate(txDate)) return false; // Skip invalid dates

        switch (timeFilter) {
          case 'today':
            return isToday(txDate);
          case 'yesterday':
            return isYesterday(txDate);
          case 'thisWeek':
            // Assuming week starts on Sunday by default for isThisWeek
            // Add { weekStartsOn: 1 } if Monday start is needed: isThisWeek(txDate, { weekStartsOn: 1 })
            return isThisWeek(txDate); 
          case 'thisMonth':
            return isThisMonth(txDate);
          default:
            return true; // Should not happen if filter is 'all', but good fallback
        }
      } catch (error) {
        console.error("Error parsing date for filtering:", tx.date, error);
        return false; // Exclude transactions with date parsing errors
      }
    });
  }, [transactions, timeFilter]);


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    // Clear validation error for the field being changed
    const { name } = e.target;
    if (validationErrors[name as keyof ValidationErrors]) {
      setValidationErrors(prev => ({ ...prev, [name]: undefined }));
    }
    // We already destructured name and value above, reuse them
    const { value } = e.target; 
    
    // Update the main transaction state
    setNewTransaction(prev => ({
      ...prev,
      [name]: name === 'amount' ? parseFloat(value) || 0 : value,
    }));

    // Note: Input change doesn't handle paymentDestination directly here, 
    // that's handled by handleSelectChange and handleRadioChange.
    // The previous logic for clearing thirdPartyNameInput here was incorrect.
  };

  const handleSelectChange = (name: keyof Omit<DailyTransaction, 'id'>) => (value: string) => {
    // Update the transaction state for the select input
    setNewTransaction(prev => ({ ...prev, [name]: value }));

    // Clear third party name input if switching away from third_party destination via Select
    // (Though paymentDestination is usually a RadioGroup, handling here for robustness if UI changes)
    if (name === 'paymentDestination' && value !== 'third_party') {
       setThirdPartyNameInput('');
    }
    // Also clear if changing direction to incoming
    if (name === 'direction' && value === 'incoming') {
      setThirdPartyNameInput('');
    }
  };

  const handleRadioChange = (value: string) => {
    const destination = value as 'direct_seller' | 'third_party';
    setNewTransaction(prev => ({ ...prev, paymentDestination: destination }));
    // Clear third party name if switching back to direct seller
    if (destination === 'direct_seller') {
      setThirdPartyNameInput('');
    }
  };

  const handleAddTransaction = () => {
    const errors: ValidationErrors = {};
    let isValid = true;

    // Clear previous errors
    setValidationErrors({});

    // Validate Recipient/Source Name
    if (!newTransaction.recipient.trim()) {
      errors.recipient = 'Recipient/Source name is required.';
      isValid = false;
    }

    // Validate Amount
    if (newTransaction.amount <= 0) {
      errors.amount = 'Amount must be greater than zero.';
      isValid = false;
    }

    // Validate Date
    if (!newTransaction.date) {
      // Basic check, could add format validation if needed
      errors.date = 'Date is required.';
      isValid = false;
    }

    // Validate Third Party Name (conditionally)
    if (newTransaction.direction === 'outgoing' && newTransaction.paymentDestination === 'third_party' && !thirdPartyNameInput.trim()) {
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

    // If validation passes:
    const transactionToAdd: DailyTransaction = {
      ...newTransaction,
      id: `dt-${Date.now()}`, // Simple unique ID
      thirdPartyName: newTransaction.paymentDestination === 'third_party' ? thirdPartyNameInput.trim() : undefined,
      attachment: selectedFile ? { name: selectedFile.name } : undefined,
    };

    setTransactions(prev => [transactionToAdd, ...prev]); // Add to the top of the list

    // Reset form (consider extracting form state reset logic)
    setNewTransaction({
      type: 'upi',
      date: new Date().toISOString().split('T')[0],
      recipient: '',
      amount: 0,
      paymentDestination: 'direct_seller',
      direction: 'outgoing',
      note: '', // Renamed
      thirdPartyName: '',
    });
    setThirdPartyNameInput(''); // Reset third party name input
    setSelectedFile(null); // Reset file input
    // Clear the file input visually (requires accessing the DOM element, often via a ref)
    const fileInput = document.getElementById('attachment') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = ''; 
    }
    setShowForm(false); // Hide form after adding

    toast({
      title: 'Success',
      description: 'Transaction logged successfully.',
    });
    
    // TODO: Persist transactions (e.g., localStorage or database)
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Daily Business Transactions Log</CardTitle>
            <CardDescription>Log all incoming and outgoing money transactions.</CardDescription>
          </div>
          <Button onClick={() => setShowForm(!showForm)} variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            {showForm ? 'Cancel' : 'Add Transaction'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {showForm && (
          <div className="space-y-4 mb-6 p-4 border rounded-md">
            <h3 className="text-lg font-medium mb-3">New Transaction Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Transaction Direction */}
              <div>
                <Label htmlFor="direction">Direction</Label>
                <Select 
                  name="direction" 
                  value={newTransaction.direction} 
                  onValueChange={handleSelectChange('direction')}
                >
                  <SelectTrigger id="direction">
                    <SelectValue placeholder="Select direction" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="outgoing">Outgoing (Paid)</SelectItem>
                    <SelectItem value="incoming">Incoming (Received)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {/* Transaction Type */}
              <div>
                <Label htmlFor="type">Type</Label>
                <Select 
                  name="type" 
                  value={newTransaction.type} 
                  onValueChange={handleSelectChange('type')}
                >
                  <SelectTrigger id="type">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="upi">UPI</SelectItem>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {/* Date */}
              <div>
                <Label htmlFor="date">Date</Label>
                <Input 
                  id="date" 
                  name="date" 
                  type="date" 
                  value={newTransaction.date} 
                  onChange={handleInputChange}
                  className={cn(validationErrors.date && 'border-red-500 focus:border-red-500')}
                />
                {validationErrors.date && <p className="text-sm text-red-600 mt-1">{validationErrors.date}</p>}
              </div>
              {/* Recipient/Source Name */}
              <div>
                <Label htmlFor="recipient">{newTransaction.direction === 'outgoing' ? 'Recipient Name' : 'Source Name'}</Label>
                <Input 
                  id="recipient" 
                  name="recipient" 
                  placeholder={newTransaction.direction === 'outgoing' ? 'Enter recipient name' : 'Enter source name'}
                  value={newTransaction.recipient} 
                  onChange={handleInputChange}
                  className={cn(validationErrors.recipient && 'border-red-500 focus:border-red-500')}
                />
                {validationErrors.recipient && <p className="text-sm text-red-600 mt-1">{validationErrors.recipient}</p>}
              </div>
              {/* Amount */}
              <div>
                <Label htmlFor="amount">Amount</Label>
                <Input 
                  id="amount" 
                  name="amount" 
                  type="number" 
                  placeholder="Enter amount" 
                  value={newTransaction.amount} 
                  onChange={handleInputChange} 
                  min="0.01" 
                  step="0.01"
                  className={cn(validationErrors.amount && 'border-red-500 focus:border-red-500')}
                />
                {validationErrors.amount && <p className="text-sm text-red-600 mt-1">{validationErrors.amount}</p>}
              </div>
              {/* Payment Destination (Only for Outgoing) */}
              {newTransaction.direction === 'outgoing' && (
                <div>
                  <Label>Payment Destination</Label>
                  <RadioGroup 
                    value={newTransaction.paymentDestination} 
                    onValueChange={handleRadioChange} 
                    className="flex items-center space-x-4 mt-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="direct_seller" id="dest_direct" />
                      <Label htmlFor="dest_direct">Direct to Seller/Recipient</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="third_party" id="dest_third_party" />
                      <Label htmlFor="dest_third_party">To Third-Party</Label>
                    </div>
                  </RadioGroup>
                </div>
              )}
               {/* Third Party Name Input (Conditional) */}
              {newTransaction.paymentDestination === 'third_party' && (
                 <div>
                  <Label htmlFor="thirdPartyName">Third-Party Name</Label>
                  <Input 
                    id="thirdPartyName" 
                    name="thirdPartyName" 
                    placeholder="Enter third-party name" 
                    value={thirdPartyNameInput} 
                    onChange={(e) => {
                      setThirdPartyNameInput(e.target.value);
                      // Clear validation error on input change
                      if (validationErrors.thirdPartyName) {
                        setValidationErrors(prev => ({ ...prev, thirdPartyName: undefined }));
                      }
                    }}
                    className={cn(validationErrors.thirdPartyName && 'border-red-500 focus:border-red-500')}
                  />
                  {validationErrors.thirdPartyName && <p className="text-sm text-red-600 mt-1">{validationErrors.thirdPartyName}</p>}
                </div>
              )}
            </div>
             {/* Note - Now always visible */}
            <div className="mt-4">
              <Label htmlFor="note">Note (Optional)</Label>
              <Textarea 
                id="note" 
                name="note" // Ensure name matches state key
                placeholder="Add any relevant notes..." 
                value={newTransaction.note} 
                onChange={handleInputChange} 
              />
            </div>
             {/* Attachment Input */}
            <div className="mt-4">
              <Label htmlFor="attachment">Attachment (Optional)</Label>
              <Input 
                id="attachment" 
                name="attachment" 
                type="file" 
                onChange={(e) => setSelectedFile(e.target.files ? e.target.files[0] : null)}
                className="mt-1"
              />
              {selectedFile && <p className="text-sm text-muted-foreground mt-1">Selected: {selectedFile.name}</p>}
            </div>

            <div className="flex justify-end mt-4">
              <Button onClick={handleAddTransaction}>Log Transaction</Button>
            </div>
          </div>
        )}

        {/* Transaction List Filters */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium">Logged Transactions</h3>
          <ToggleGroup 
            type="single" 
            defaultValue="all" 
            value={timeFilter} 
            onValueChange={(value) => setTimeFilter((value as TimeFilter) || 'all')} // Ensure 'all' if empty
            aria-label="Filter transactions by time"
            size="sm"
          >
            <ToggleGroupItem value="all" aria-label="Show all">All</ToggleGroupItem>
            <ToggleGroupItem value="today" aria-label="Show today">Today</ToggleGroupItem>
            <ToggleGroupItem value="yesterday" aria-label="Show yesterday">Yesterday</ToggleGroupItem>
            <ToggleGroupItem value="thisWeek" aria-label="Show this week">This Week</ToggleGroupItem>
            <ToggleGroupItem value="thisMonth" aria-label="Show this month">This Month</ToggleGroupItem>
          </ToggleGroup>
        </div>

        {/* Transaction List Table */}
        {filteredTransactions.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            {transactions.length === 0 
              ? 'No transactions logged yet. Click "Add Transaction" to start.'
              : `No transactions found for the selected filter (${timeFilter}).`}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Direction</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>{newTransaction.direction === 'outgoing' ? 'Recipient' : 'Source'}</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Destination</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead>Attachment</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* Map over filteredTransactions */}
              {filteredTransactions.map((tx) => ( 
                <TableRow key={tx.id}>
                  <TableCell>{new Date(tx.date).toLocaleDateString()}</TableCell> 
                  <TableCell className={`capitalize font-medium ${tx.direction === 'incoming' ? 'text-green-600' : 'text-red-600'}`}>
                    {tx.direction}
                  </TableCell>
                  <TableCell className="capitalize">{tx.type.replace('_', ' ')}</TableCell>
                  <TableCell>{tx.recipient}</TableCell>
                  <TableCell className="text-right font-mono">
                    {/* TODO: Add currency formatting */}
                    {tx.amount.toFixed(2)} 
                  </TableCell>
                  <TableCell className="capitalize">
                    {tx.direction === 'outgoing' 
                      ? tx.paymentDestination === 'third_party' 
                        ? `Third Party (${tx.thirdPartyName || 'N/A'})` 
                        : 'Direct Recipient' 
                      : 'N/A'}
                  </TableCell>
                  <TableCell>{tx.note || 'N/A'}</TableCell>
                  <TableCell>{tx.attachment ? tx.attachment.name : 'N/A'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
      {/* Footer can be used for summary or actions if needed later */}
      {/* <CardFooter>
        <p>Total Logged: {transactions.length}</p>
      </CardFooter> */}
    </Card>
  );
};

export default DailyTransactionsLog;
