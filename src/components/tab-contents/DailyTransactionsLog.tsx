import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Plus } from 'lucide-react';
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

type ValidationErrors = {
  recipient?: string;
  amount?: string;
  date?: string;
  thirdPartyName?: string;
};

type TimeFilter = 'all' | 'today' | 'yesterday' | 'thisWeek' | 'thisMonth';

interface DailyTransaction {
  id: string;
  type: 'upi' | 'cash' | 'bank_transfer' | 'other';
  date: string;
  recipient: string;
  amount: number;
  note?: string;
  paymentDestination: 'direct_seller' | 'third_party';
  thirdPartyName?: string;
  direction: 'incoming' | 'outgoing';
  attachment?: { name: string };
}

const DailyTransactionsLog: React.FC = () => {
  const [transactions, setTransactions] = useState<DailyTransaction[]>([]);
  const [newTransaction, setNewTransaction] = useState<Omit<DailyTransaction, 'id'>>({
    type: 'upi',
    date: new Date().toISOString().split('T')[0],
    recipient: '',
    amount: 0,
    paymentDestination: 'direct_seller',
    direction: 'outgoing',
    note: '',
    thirdPartyName: '',
  });
  const [showForm, setShowForm] = useState(false);
  const [thirdPartyNameInput, setThirdPartyNameInput] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all');
  const { toast } = useToast();

  const filteredTransactions = useMemo(() => {
    if (timeFilter === 'all') {
      return transactions;
    }
    
    const now = new Date();

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name } = e.target;
    if (validationErrors[name as keyof ValidationErrors]) {
      setValidationErrors(prev => ({ ...prev, [name]: undefined }));
    }
    const { value } = e.target;
    
    setNewTransaction(prev => ({
      ...prev,
      [name]: name === 'amount' ? parseFloat(value) || 0 : value,
    }));

    if (name === 'paymentDestination' && value !== 'third_party') {
      setThirdPartyNameInput('');
    }
    if (name === 'direction' && value === 'incoming') {
      setThirdPartyNameInput('');
    }
  };

  const handleSelectChange = (name: keyof Omit<DailyTransaction, 'id'>) => (value: string) => {
    setNewTransaction(prev => ({ ...prev, [name]: value }));
    if (name === 'paymentDestination' && value !== 'third_party') {
      setThirdPartyNameInput('');
    }
    if (name === 'direction' && value === 'incoming') {
      setThirdPartyNameInput('');
    }
  };

  const handleRadioChange = (value: string) => {
    const destination = value as 'direct_seller' | 'third_party';
    setNewTransaction(prev => ({ ...prev, paymentDestination: destination }));
    if (destination === 'direct_seller') {
      setThirdPartyNameInput('');
    }
  };

  const handleAddTransaction = () => {
    const errors: ValidationErrors = {};
    let isValid = true;

    setValidationErrors({});

    if (!newTransaction.recipient.trim()) {
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

    const transactionToAdd: DailyTransaction = {
      ...newTransaction,
      id: `dt-${Date.now()}`,
      thirdPartyName: newTransaction.paymentDestination === 'third_party' ? thirdPartyNameInput.trim() : undefined,
      attachment: selectedFile ? { name: selectedFile.name } : undefined,
    };

    setTransactions(prev => [transactionToAdd, ...prev]);

    setNewTransaction({
      type: 'upi',
      date: new Date().toISOString().split('T')[0],
      recipient: '',
      amount: 0,
      paymentDestination: 'direct_seller',
      direction: 'outgoing',
      note: '',
      thirdPartyName: '',
    });
    setThirdPartyNameInput('');
    setSelectedFile(null);
    const fileInput = document.getElementById('attachment') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
    setShowForm(false);

    toast({
      title: 'Success',
      description: 'Transaction logged successfully.',
    });
  };

  return (
    <Card className="relative pb-16">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Daily Business Transactions Log</CardTitle>
            <CardDescription>Log all incoming and outgoing money transactions.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {showForm && (
          <div className="space-y-4 mb-6 p-4 border rounded-md">
            <h3 className="text-lg font-medium mb-3">New Transaction Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            <div className="mt-4">
              <Label htmlFor="note">Note (Optional)</Label>
              <Textarea 
                id="note" 
                name="note" 
                placeholder="Add any relevant notes..." 
                value={newTransaction.note} 
                onChange={handleInputChange} 
              />
            </div>
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

        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium">Logged Transactions</h3>
          <ToggleGroup 
            type="single" 
            defaultValue="all" 
            value={timeFilter} 
            onValueChange={(value) => setTimeFilter((value as TimeFilter) || 'all')}
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
              {filteredTransactions.map((tx) => ( 
                <TableRow key={tx.id}>
                  <TableCell>{new Date(tx.date).toLocaleDateString()}</TableCell> 
                  <TableCell className={`capitalize font-medium ${tx.direction === 'incoming' ? 'text-green-600' : 'text-red-600'}`}>
                    {tx.direction}
                  </TableCell>
                  <TableCell className="capitalize">{tx.type.replace('_', ' ')}</TableCell>
                  <TableCell>{tx.recipient}</TableCell>
                  <TableCell className="text-right font-mono">
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
      <div className="absolute bottom-6 right-6">
        <Button 
          onClick={() => setShowForm(!showForm)} 
          size="icon" 
          className="h-12 w-12 rounded-full shadow-lg"
        >
          {showForm ? (
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-5 w-5">
              <path d="M11.7816 4.03157C12.0062 3.80702 12.0062 3.44295 11.7816 3.2184C11.5571 2.99385 11.193 2.99385 10.9685 3.2184L7.50005 6.68682L4.03164 3.2184C3.80708 2.99385 3.44301 2.99385 3.21846 3.2184C2.99391 3.44295 2.99391 3.80702 3.21846 4.03157L6.68688 7.49999L3.21846 10.9684C2.99391 11.193 2.99391 11.557 3.21846 11.7816C3.44301 12.0061 3.80708 12.0061 4.03164 11.7816L7.50005 8.31316L10.9685 11.7816C11.193 12.0061 11.5571 12.0061 11.7816 11.7816C12.0062 11.557 12.0062 11.193 11.7816 10.9684L8.31322 7.49999L11.7816 4.03157Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
            </svg>
          ) : (
            <Plus className="h-5 w-5" />
          )}
        </Button>
      </div>
    </Card>
  );
};

export default DailyTransactionsLog;
