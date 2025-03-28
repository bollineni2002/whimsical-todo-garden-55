import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCurrency } from '@/context/CurrencyContext'; // Import useCurrency hook

const InterestCalculator: React.FC = () => {
  // Placeholder state and logic
  const [principal, setPrincipal] = React.useState('');
  const [rate, setRate] = React.useState('');
  const [time, setTime] = React.useState('');
  const [timeUnit, setTimeUnit] = React.useState<'years' | 'months'>('years');
  const [interest, setInterest] = React.useState<number | null>(null);
  const { formatCurrency } = useCurrency(); // Get formatCurrency from context

  const calculateInterest = () => {
    const p = parseFloat(principal);
    const r = parseFloat(rate) / 100; // Convert rate to decimal
    let t = parseFloat(time);

    if (isNaN(p) || isNaN(r) || isNaN(t)) {
      setInterest(null);
      return;
    }

    // Convert time to years if needed
    if (timeUnit === 'months') {
      t = t / 12;
    }

    // Simple Interest Calculation: I = P * R * T
    const calculatedInterest = p * r * t;
    setInterest(calculatedInterest);
  };

  return (
    <Card className="border-none shadow-none">
      <CardHeader>
        <CardTitle>Simple Interest Calculator</CardTitle>
        <CardDescription>Calculate simple interest based on principal, rate, and time.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="principal">Principal Amount</Label>
          <Input 
            id="principal" 
            type="number" 
            placeholder="Enter principal amount" 
            value={principal}
            onChange={(e) => setPrincipal(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="interest-rate">Annual Interest Rate (%)</Label>
          <Input 
            id="interest-rate" 
            type="number" 
            placeholder="Enter annual rate" 
            value={rate}
            onChange={(e) => setRate(e.target.value)}
          />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2 col-span-2">
            <Label htmlFor="time">Time Period</Label>
            <Input 
              id="time" 
              type="number" 
              placeholder="Enter time period" 
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="time-unit">Unit</Label>
            <Select value={timeUnit} onValueChange={(value) => setTimeUnit(value as 'years' | 'months')}>
              <SelectTrigger id="time-unit">
                <SelectValue placeholder="Select unit" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="years">Years</SelectItem>
                <SelectItem value="months">Months</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <Button onClick={calculateInterest}>Calculate Interest</Button>
        {interest !== null && principal && ( // Ensure principal is also present for total calculation
          <div className="mt-4 p-3 bg-muted rounded-md">
            {/* Apply formatting */}
            <p>Calculated Interest: <span className="font-semibold">{formatCurrency(interest)}</span></p> 
            <p>Total Amount (Principal + Interest): <span className="font-semibold">{formatCurrency(parseFloat(principal) + interest)}</span></p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default InterestCalculator;
