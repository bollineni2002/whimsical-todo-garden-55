
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import AuthHeader from '@/components/AuthHeader';
import { useToast } from '@/hooks/use-toast';
import { 
  ArrowLeft, 
  Calculator, 
  Percent, 
  TrendingUp,
  RefreshCcw
} from 'lucide-react';
import { useLanguage } from '@/lib/languages';
import { currencies, useUserPreferences } from '@/context/UserPreferencesContext';

const Calculations = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLanguage();
  const { preferences } = useUserPreferences();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AuthHeader businessName="TransactLy" onEditName={() => {}} />
      
      <div className="container max-w-4xl mx-auto flex-1 p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center mb-6">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/')}
              className="mr-2"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t('back_to_dashboard')}
            </Button>
            <h1 className="text-3xl font-bold">{t('calculations')}</h1>
          </div>
          
          <Tabs defaultValue="tax" className="space-y-6">
            <TabsList className="grid grid-cols-3 w-full">
              <TabsTrigger value="tax" className="flex items-center gap-2">
                <Percent className="h-4 w-4" />
                <span>{t('tax_calculator')}</span>
              </TabsTrigger>
              <TabsTrigger value="interest" className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                <span>{t('interest_calculator')}</span>
              </TabsTrigger>
              <TabsTrigger value="currency" className="flex items-center gap-2">
                <RefreshCcw className="h-4 w-4" />
                <span>{t('currency_converter')}</span>
              </TabsTrigger>
            </TabsList>
            
            {/* Tax Calculator */}
            <TabsContent value="tax">
              <TaxCalculator />
            </TabsContent>
            
            {/* Interest Calculator */}
            <TabsContent value="interest">
              <InterestCalculator />
            </TabsContent>
            
            {/* Currency Converter */}
            <TabsContent value="currency">
              <CurrencyConverter />
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
};

const TaxCalculator = () => {
  const [amount, setAmount] = useState<number | ''>('');
  const [taxRate, setTaxRate] = useState<number | ''>('');
  const [taxAmount, setTaxAmount] = useState<number | null>(null);
  const [totalAmount, setTotalAmount] = useState<number | null>(null);
  const { toast } = useToast();
  const { t } = useLanguage();
  const { preferences } = useUserPreferences();
  
  const currencySymbol = currencies.find(c => c.code === preferences.currency)?.symbol || '₹';
  
  const calculateTax = () => {
    if (amount === '' || taxRate === '') {
      toast({
        title: "Missing values",
        description: "Please enter both amount and tax rate.",
        variant: "destructive",
      });
      return;
    }
    
    const calculatedTaxAmount = (Number(amount) * Number(taxRate)) / 100;
    const calculatedTotalAmount = Number(amount) + calculatedTaxAmount;
    
    setTaxAmount(calculatedTaxAmount);
    setTotalAmount(calculatedTotalAmount);
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('tax_calculator')}</CardTitle>
        <CardDescription>
          Calculate tax amount based on percentage
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-muted-foreground">
                {currencySymbol}
              </span>
              <Input
                id="amount"
                type="number"
                min="0"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value ? parseFloat(e.target.value) : '')}
                className="pl-8"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="tax-rate">Tax Rate (%)</Label>
            <div className="relative">
              <Input
                id="tax-rate"
                type="number"
                min="0"
                step="0.01"
                value={taxRate}
                onChange={(e) => setTaxRate(e.target.value ? parseFloat(e.target.value) : '')}
              />
              <span className="absolute right-3 top-2.5 text-muted-foreground">
                %
              </span>
            </div>
          </div>
          
          <Button 
            onClick={calculateTax}
            className="w-full"
          >
            <Calculator className="mr-2 h-4 w-4" />
            {t('calculate')}
          </Button>
        </div>
        
        {taxAmount !== null && totalAmount !== null && (
          <div className="mt-6 p-4 bg-muted rounded-lg space-y-3">
            <h3 className="font-medium text-lg">{t('result')}</h3>
            <div className="grid grid-cols-2 gap-2">
              <div className="text-sm text-muted-foreground">Tax Amount:</div>
              <div className="text-sm font-medium">{currencySymbol}{taxAmount.toFixed(2)}</div>
              
              <div className="text-sm text-muted-foreground">Total Amount:</div>
              <div className="text-sm font-medium">{currencySymbol}{totalAmount.toFixed(2)}</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const InterestCalculator = () => {
  const [principal, setPrincipal] = useState<number | ''>('');
  const [rate, setRate] = useState<number | ''>('');
  const [time, setTime] = useState<number | ''>('');
  const [timeUnit, setTimeUnit] = useState<'years' | 'months' | 'days'>('years');
  const [interestType, setInterestType] = useState<'simple' | 'compound'>('simple');
  const [compoundFrequency, setCompoundFrequency] = useState<'annually' | 'semi-annually' | 'quarterly' | 'monthly' | 'daily'>('annually');
  const [interest, setInterest] = useState<number | null>(null);
  const [totalAmount, setTotalAmount] = useState<number | null>(null);
  
  const { toast } = useToast();
  const { t } = useLanguage();
  const { preferences } = useUserPreferences();
  
  const currencySymbol = currencies.find(c => c.code === preferences.currency)?.symbol || '₹';
  
  const calculateInterest = () => {
    if (principal === '' || rate === '' || time === '') {
      toast({
        title: "Missing values",
        description: "Please enter all required fields.",
        variant: "destructive",
      });
      return;
    }
    
    const p = Number(principal);
    const r = Number(rate) / 100; // Convert percentage to decimal
    let t = Number(time);
    
    // Convert time to years based on the selected unit
    if (timeUnit === 'months') {
      t = t / 12;
    } else if (timeUnit === 'days') {
      t = t / 365;
    }
    
    let calculatedInterest = 0;
    let calculatedTotalAmount = 0;
    
    if (interestType === 'simple') {
      // Simple interest calculation: P * r * t
      calculatedInterest = p * r * t;
      calculatedTotalAmount = p + calculatedInterest;
    } else {
      // Compound interest calculation: P * (1 + r/n)^(n*t) - P
      let n = 1; // Compounding frequency
      
      switch (compoundFrequency) {
        case 'annually':
          n = 1;
          break;
        case 'semi-annually':
          n = 2;
          break;
        case 'quarterly':
          n = 4;
          break;
        case 'monthly':
          n = 12;
          break;
        case 'daily':
          n = 365;
          break;
      }
      
      calculatedTotalAmount = p * Math.pow(1 + r/n, n * t);
      calculatedInterest = calculatedTotalAmount - p;
    }
    
    setInterest(calculatedInterest);
    setTotalAmount(calculatedTotalAmount);
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('interest_calculator')}</CardTitle>
        <CardDescription>
          Calculate simple or compound interest
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="principal">Principal Amount</Label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-muted-foreground">
                {currencySymbol}
              </span>
              <Input
                id="principal"
                type="number"
                min="0"
                step="0.01"
                value={principal}
                onChange={(e) => setPrincipal(e.target.value ? parseFloat(e.target.value) : '')}
                className="pl-8"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="interest-type">Interest Type</Label>
            <Select 
              value={interestType} 
              onValueChange={(value) => setInterestType(value as 'simple' | 'compound')}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select interest type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="simple">Simple Interest</SelectItem>
                <SelectItem value="compound">Compound Interest</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {interestType === 'compound' && (
            <div className="space-y-2">
              <Label htmlFor="compound-frequency">Compounding Frequency</Label>
              <Select 
                value={compoundFrequency} 
                onValueChange={(value) => setCompoundFrequency(value as any)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select compounding frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="annually">Annually</SelectItem>
                  <SelectItem value="semi-annually">Semi-Annually</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="interest-rate">Interest Rate (%)</Label>
            <div className="relative">
              <Input
                id="interest-rate"
                type="number"
                min="0"
                step="0.01"
                value={rate}
                onChange={(e) => setRate(e.target.value ? parseFloat(e.target.value) : '')}
              />
              <span className="absolute right-3 top-2.5 text-muted-foreground">
                %
              </span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="time-period">Time Period</Label>
              <Input
                id="time-period"
                type="number"
                min="0"
                step="1"
                value={time}
                onChange={(e) => setTime(e.target.value ? parseFloat(e.target.value) : '')}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="time-unit">Unit</Label>
              <Select 
                value={timeUnit} 
                onValueChange={(value) => setTimeUnit(value as any)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select time unit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="years">Years</SelectItem>
                  <SelectItem value="months">Months</SelectItem>
                  <SelectItem value="days">Days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <Button 
            onClick={calculateInterest}
            className="w-full"
          >
            <Calculator className="mr-2 h-4 w-4" />
            {t('calculate')}
          </Button>
        </div>
        
        {interest !== null && totalAmount !== null && (
          <div className="mt-6 p-4 bg-muted rounded-lg space-y-3">
            <h3 className="font-medium text-lg">{t('result')}</h3>
            <div className="grid grid-cols-2 gap-2">
              <div className="text-sm text-muted-foreground">Interest Amount:</div>
              <div className="text-sm font-medium">{currencySymbol}{interest.toFixed(2)}</div>
              
              <div className="text-sm text-muted-foreground">Total Amount:</div>
              <div className="text-sm font-medium">{currencySymbol}{totalAmount.toFixed(2)}</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const CurrencyConverter = () => {
  const [amount, setAmount] = useState<number | ''>('');
  const [fromCurrency, setFromCurrency] = useState('INR');
  const [toCurrency, setToCurrency] = useState('USD');
  const [result, setResult] = useState<number | null>(null);
  const [exchangeRate, setExchangeRate] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const { toast } = useToast();
  const { t } = useLanguage();
  
  // Mock exchange rates (in a real app, these would come from an API)
  const mockExchangeRates = {
    'INR': { 'USD': 0.012, 'EUR': 0.011, 'GBP': 0.0095, 'JPY': 1.79 },
    'USD': { 'INR': 83.11, 'EUR': 0.92, 'GBP': 0.79, 'JPY': 149.82 },
    'EUR': { 'INR': 90.39, 'USD': 1.09, 'GBP': 0.86, 'JPY': 162.98 },
    'GBP': { 'INR': 105.61, 'USD': 1.27, 'EUR': 1.17, 'JPY': 189.92 },
    'JPY': { 'INR': 0.56, 'USD': 0.0067, 'EUR': 0.0061, 'GBP': 0.0053 },
  };
  
  const convertCurrency = () => {
    if (amount === '') {
      toast({
        title: "Missing amount",
        description: "Please enter an amount to convert.",
        variant: "destructive",
      });
      return;
    }
    
    if (fromCurrency === toCurrency) {
      setResult(Number(amount));
      setExchangeRate(1);
      return;
    }
    
    setIsLoading(true);
    
    // Simulate API call with a delay
    setTimeout(() => {
      try {
        const rate = mockExchangeRates[fromCurrency as keyof typeof mockExchangeRates][toCurrency as keyof typeof mockExchangeRates[keyof typeof mockExchangeRates]];
        const convertedAmount = Number(amount) * rate;
        
        setResult(convertedAmount);
        setExchangeRate(rate);
        setIsLoading(false);
      } catch (error) {
        toast({
          title: "Conversion error",
          description: "Could not perform the conversion. Please try again.",
          variant: "destructive",
        });
        setIsLoading(false);
      }
    }, 500); // Simulate network delay
  };
  
  const swapCurrencies = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
    // Reset result
    setResult(null);
    setExchangeRate(null);
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('currency_converter')}</CardTitle>
        <CardDescription>
          Convert between different currencies
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount-to-convert">Amount</Label>
            <div className="relative">
              <Input
                id="amount-to-convert"
                type="number"
                min="0"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value ? parseFloat(e.target.value) : '')}
                className="pl-3"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-[1fr,auto,1fr] gap-2 items-end">
            <div className="space-y-2">
              <Label htmlFor="from-currency">From</Label>
              <Select 
                value={fromCurrency} 
                onValueChange={setFromCurrency}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  {currencies.map((currency) => (
                    <SelectItem key={currency.code} value={currency.code}>
                      {currency.symbol} {currency.code} - {currency.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <Button 
              variant="outline" 
              size="icon" 
              onClick={swapCurrencies}
              className="h-10 w-10 rounded-full"
            >
              <RefreshCcw className="h-4 w-4" />
            </Button>
            
            <div className="space-y-2">
              <Label htmlFor="to-currency">To</Label>
              <Select 
                value={toCurrency} 
                onValueChange={setToCurrency}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  {currencies.map((currency) => (
                    <SelectItem key={currency.code} value={currency.code}>
                      {currency.symbol} {currency.code} - {currency.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <Button 
            onClick={convertCurrency}
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Converting...
              </div>
            ) : (
              <>
                <Calculator className="mr-2 h-4 w-4" />
                {t('calculate')}
              </>
            )}
          </Button>
        </div>
        
        {result !== null && exchangeRate !== null && (
          <div className="mt-6 p-4 bg-muted rounded-lg space-y-3">
            <h3 className="font-medium text-lg">{t('result')}</h3>
            <div className="text-center text-2xl font-bold py-2">
              {amount} {fromCurrency} = {result.toFixed(2)} {toCurrency}
            </div>
            <div className="text-center text-sm text-muted-foreground">
              1 {fromCurrency} = {exchangeRate.toFixed(4)} {toCurrency}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default Calculations;
