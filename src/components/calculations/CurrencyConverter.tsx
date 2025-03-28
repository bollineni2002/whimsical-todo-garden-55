import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowRightLeft } from 'lucide-react';
// We don't need useCurrency here as Intl.NumberFormat handles specific currency codes
// import { useCurrency } from '@/context/CurrencyContext'; 

// Placeholder currencies - replace with dynamic list if integrating API
const currencies = ['USD', 'EUR', 'GBP', 'JPY', 'INR', 'CAD', 'AUD'];

const CurrencyConverter: React.FC = () => {
  // Placeholder state and logic
  const [amount, setAmount] = React.useState('');
  const [fromCurrency, setFromCurrency] = React.useState('USD');
  const [toCurrency, setToCurrency] = React.useState('INR');
  const [convertedAmount, setConvertedAmount] = React.useState<number | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  // Placeholder conversion logic - replace with API call
  const convertCurrency = async () => {
    setIsLoading(true);
    setConvertedAmount(null); 
    const numAmount = parseFloat(amount);

    if (isNaN(numAmount) || fromCurrency === toCurrency) {
      setIsLoading(false);
      // Optionally show a toast message for invalid input
      return;
    }

    // *** Placeholder: Simulate API call and conversion ***
    // In a real implementation, fetch rate from an API like ExchangeRate-API, Open Exchange Rates, etc.
    // Example: const rate = await fetchRate(fromCurrency, toCurrency);
    // const result = numAmount * rate;
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
    const placeholderRate = toCurrency === 'INR' ? 83.5 : 0.9; // Very basic placeholder rate
    const result = numAmount * placeholderRate; 
    // *** End Placeholder ***

    setConvertedAmount(result);
    setIsLoading(false);
  };

  const swapCurrencies = () => {
    const temp = fromCurrency;
    setFromCurrency(toCurrency);
    setToCurrency(temp);
    // Optionally trigger conversion again after swap
    // convertCurrency(); 
  };

  return (
    <Card className="border-none shadow-none">
      <CardHeader>
        <CardTitle>Currency Converter</CardTitle>
        <CardDescription>Convert amounts between different currencies.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="convert-amount">Amount</Label>
          <Input 
            id="convert-amount" 
            type="number" 
            placeholder="Enter amount to convert" 
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>
        
        <div className="flex items-end space-x-2">
          {/* From Currency */}
          <div className="flex-1 space-y-2">
            <Label htmlFor="from-currency">From</Label>
            <Select value={fromCurrency} onValueChange={setFromCurrency}>
              <SelectTrigger id="from-currency">
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                {currencies.map(curr => <SelectItem key={curr} value={curr}>{curr}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {/* Swap Button */}
          <Button variant="ghost" size="icon" onClick={swapCurrencies} aria-label="Swap currencies">
            <ArrowRightLeft className="h-4 w-4" />
          </Button>

          {/* To Currency */}
          <div className="flex-1 space-y-2">
            <Label htmlFor="to-currency">To</Label>
            <Select value={toCurrency} onValueChange={setToCurrency}>
              <SelectTrigger id="to-currency">
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                {currencies.map(curr => <SelectItem key={curr} value={curr}>{curr}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button onClick={convertCurrency} disabled={isLoading || !amount}>
          {isLoading ? 'Converting...' : 'Convert'}
        </Button>

        {convertedAmount !== null && !isLoading && (
          <div className="mt-4 p-3 bg-muted rounded-md">
            {/* Format the output using Intl.NumberFormat with the target currency */}
            <p className="font-semibold text-lg">
              {amount} {fromCurrency} = {new Intl.NumberFormat(undefined, { style: 'currency', currency: toCurrency }).format(convertedAmount)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              (Using placeholder conversion rate)
            </p>
          </div>
        )}
         <div className="mt-4 p-3 border rounded-md text-sm text-muted-foreground">
            Note: This converter currently uses placeholder rates. Integrating live exchange rates requires an external API subscription.
         </div>
      </CardContent>
    </Card>
  );
};

export default CurrencyConverter;
