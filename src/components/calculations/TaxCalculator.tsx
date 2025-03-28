import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useCurrency } from '@/context/CurrencyContext'; // Import useCurrency hook

const TaxCalculator: React.FC = () => {
  // Placeholder state and logic
  const [amount, setAmount] = React.useState('');
  const [rate, setRate] = React.useState('');
  const [taxAmount, setTaxAmount] = React.useState<number | null>(null);
  const { formatCurrency } = useCurrency(); // Get formatCurrency from context

  const calculateTax = () => {
    const numAmount = parseFloat(amount);
    const numRate = parseFloat(rate);
    if (!isNaN(numAmount) && !isNaN(numRate)) {
      setTaxAmount((numAmount * numRate) / 100);
    } else {
      setTaxAmount(null);
    }
  };

  return (
    <Card className="border-none shadow-none">
      <CardHeader>
        <CardTitle>Tax Calculator</CardTitle>
        <CardDescription>Calculate tax based on amount and rate.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="tax-amount">Amount</Label>
          <Input 
            id="tax-amount" 
            type="number" 
            placeholder="Enter amount" 
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="tax-rate">Tax Rate (%)</Label>
          <Input 
            id="tax-rate" 
            type="number" 
            placeholder="Enter tax rate" 
            value={rate}
            onChange={(e) => setRate(e.target.value)}
          />
        </div>
        <Button onClick={calculateTax}>Calculate Tax</Button>
        {taxAmount !== null && amount && ( // Ensure amount is also present for total calculation
          <div className="mt-4 p-3 bg-muted rounded-md">
            {/* Apply formatting */}
            <p>Calculated Tax: <span className="font-semibold">{formatCurrency(taxAmount)}</span></p> 
            <p>Total Amount (incl. Tax): <span className="font-semibold">{formatCurrency(parseFloat(amount) + taxAmount)}</span></p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TaxCalculator;
