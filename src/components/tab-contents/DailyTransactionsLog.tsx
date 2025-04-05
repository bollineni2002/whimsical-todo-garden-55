import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { ArrowUpRight, ArrowDownLeft, AlertCircle } from 'lucide-react';
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
import { Dialog, DialogContent } from '@/components/ui/dialog';

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

interface DailyTransactionsLogProps {
  isFormOpen?: boolean;
  setIsFormOpen?: (open: boolean) => void;
}

const DailyTransactionsLog: React.FC<DailyTransactionsLogProps> = ({ 
  isFormOpen: externalIsFormOpen, 
  setIsFormOpen: externalSetIsFormOpen 
}) => {
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
  
  const [internalIsFormOpen, setInternalIsFormOpen] = useState(false);
  const isFormOpen = externalIsFormOpen !== undefined ? externalIsFormOpen : internalIsFormOpen;
  const setIsFormOpen = externalSetIsFormOpen || setInternalIsFormOpen;
  
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
    setIsFormOpen(false);

    toast({
      title: 'Success',
      description: 'Transaction logged successfully.',
    });
  };

  const TransactionForm = () => (
    <div className="space-y-4 mb-4 p-4 border border-border/40 rounded-lg bg-background/50 backdrop-blur-sm">
      <h3 className="text-base font-medium mb-3">Transaction Details</h3>
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
              <SelectItem value="outgoing">Outgoing (Paid)</SelectItem>
              <SelectItem value="incoming">Incoming (Received)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="type" className="text-xs text-muted-foreground">Type</Label>
          <Select 
            name="type" 
            value={newTransaction.type} 
            onValueChange={handleSelectChange('type')}
          >
            <SelectTrigger id="type" className="h-9">
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
          <Label htmlFor="date" className="text-xs text-muted-foreground">Date</Label>
          <Input 
            id="date" 
            name="date" 
            type="date" 
            value={newTransaction.date} 
            onChange={handleInputChange}
            className={cn("h-9", validationErrors.date && 'border-red-500 focus:border-red-500')}
          />
          {validationErrors.date && <p className="text-xs text-red-600 mt-1">{validationErrors.date}</p>}
        </div>
        <div>
          <Label htmlFor="recipient" className="text-xs text-muted-foreground">
            {newTransaction.direction === 'outgoing' ? 'Recipient Name' : 'Source Name'}
          </Label>
          <Input 
            id="recipient" 
            name="recipient" 
            placeholder={newTransaction.direction === 'outgoing' ? 'Enter recipient name' : 'Enter source name'}
            value={newTransaction.recipient} 
            onChange={handleInputChange}
            className={cn("h-9", validationErrors.recipient && 'border-red-500 focus:border-red-500')}
          />
          {validationErrors.recipient && <p className="text-xs text-red-600 mt-1">{validationErrors.recipient}</p>}
        </div>
        <div>
          <Label htmlFor="amount" className="text-xs text-muted-foreground">Amount</Label>
          <Input 
            id="amount" 
            name="amount" 
            type="number" 
            placeholder="Enter amount" 
            value={newTransaction.amount} 
            onChange={handleInputChange} 
            min="0.01" 
            step="0.01"
            className={cn("h-9", validationErrors.amount && 'border-red-500 focus:border-red-500')}
          />
          {validationErrors.amount && <p className="text-xs text-red-600 mt-1">{validationErrors.amount}</p>}
        </div>
        {newTransaction.direction === 'outgoing' && (
          <div>
            <Label className="text-xs text-muted-foreground">Payment Destination</Label>
            <RadioGroup 
              value={newTransaction.paymentDestination} 
              onValueChange={handleRadioChange} 
              className="flex items-center space-x-4 mt-2"
            >
              <div className="flex items-center space-x-1">
                <RadioGroupItem value="direct_seller" id="dest_direct" className="h-3.5 w-3.5" />
                <Label htmlFor="dest_direct" className="text-xs">Direct to Recipient</Label>
              </div>
              <div className="flex items-center space-x-1">
                <RadioGroupItem value="third_party" id="dest_third_party" className="h-3.5 w-3.5" />
                <Label htmlFor="dest_third_party" className="text-xs">To Third-Party</Label>
              </div>
            </RadioGroup>
          </div>
        )}
        {newTransaction.paymentDestination === 'third_party' && (
          <div>
            <Label htmlFor="thirdPartyName" className="text-xs text-muted-foreground">Third-Party Name</Label>
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
              className={cn("h-9", validationErrors.thirdPartyName && 'border-red-500 focus:border-red-500')}
            />
            {validationErrors.thirdPartyName && <p className="text-xs text-red-600 mt-1">{validationErrors.thirdPartyName}</p>}
          </div>
        )}
      </div>
      <div>
        <Label htmlFor="note" className="text-xs text-muted-foreground">Note (Optional)</Label>
        <Textarea 
          id="note" 
          name="note" 
          placeholder="Add any relevant notes..." 
          value={newTransaction.note} 
          onChange={handleInputChange} 
          className="resize-none min-h-[60px]"
        />
      </div>
      <div>
        <Label htmlFor="attachment" className="text-xs text-muted-foreground">Attachment (Optional)</Label>
        <Input 
          id="attachment" 
          name="attachment" 
          type="file" 
          onChange={(e) => setSelectedFile(e.target.files ? e.target.files[0] : null)}
          className="text-xs mt-1"
        />
        {selectedFile && <p className="text-xs text-muted-foreground mt-1">Selected: {selectedFile.name}</p>}
      </div>

      <div className="flex justify-end mt-4 gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setIsFormOpen(false)}
        >
          Cancel
        </Button>
        <Button 
          size="sm" 
          onClick={handleAddTransaction}
        >
          Save Transaction
        </Button>
      </div>
    </div>
  );

  return (
    <Card className="border-0 shadow-none bg-transparent">
      <CardHeader className="p-0">
        <div className="flex items-center">
          <CardTitle className="text-xl font-bold">Logged Transactions</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {isFormOpen && <TransactionForm />}

        <div className="flex items-center justify-between mt-2 mb-4">
          <h3 className="text-base font-medium">Transaction History</h3>
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

        {filteredTransactions.length === 0 ? (
          <div className="text-center py-8 bg-muted/10 rounded-lg">
            <AlertCircle className="w-8 h-8 text-muted-foreground/50 mx-auto mb-2" />
            <p className="text-muted-foreground text-sm">
              {transactions.length === 0 
                ? 'No transactions logged yet. Use the + button to add one.'
                : `No transactions found for the selected filter (${timeFilter}).`}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto -mx-4 px-4">
            <Table className="min-w-full border border-border/30 rounded-lg overflow-hidden">
              <TableHeader className="bg-muted/10">
                <TableRow className="hover:bg-transparent border-border/30">
                  <TableHead className="w-24 py-2 text-xs">Date</TableHead>
                  <TableHead className="w-28 py-2 text-xs">Direction</TableHead>
                  <TableHead className="w-24 py-2 text-xs">Type</TableHead>
                  <TableHead className="py-2 text-xs">Recipient/Source</TableHead>
                  <TableHead className="py-2 text-xs text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.map((tx) => ( 
                  <TableRow key={tx.id} className="border-border/30 hover:bg-muted/5">
                    <TableCell className="py-2 text-xs">{new Date(tx.date).toLocaleDateString()}</TableCell> 
                    <TableCell className="py-2 text-xs">
                      <div className="flex items-center">
                        {tx.direction === 'incoming' ? (
                          <ArrowDownLeft className="h-3.5 w-3.5 text-green-500 mr-1.5" />
                        ) : (
                          <ArrowUpRight className="h-3.5 w-3.5 text-red-500 mr-1.5" />
                        )}
                        <span className={`${tx.direction === 'incoming' ? 'text-green-500' : 'text-red-500'}`}>
                          {tx.direction === 'incoming' ? 'Received' : 'Paid'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="py-2 text-xs capitalize">{tx.type.replace('_', ' ')}</TableCell>
                    <TableCell className="py-2 text-xs font-medium">
                      {tx.recipient}
                      {tx.direction === 'outgoing' && tx.paymentDestination === 'third_party' && tx.thirdPartyName && (
                        <span className="text-muted-foreground ml-2 text-xs">
                          → {tx.thirdPartyName}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="py-2 text-xs font-mono text-right">
                      {tx.amount.toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-lg">
          <TransactionForm />
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default DailyTransactionsLog;
