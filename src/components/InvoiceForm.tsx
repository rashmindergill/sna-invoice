
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, Calendar, DollarSign, Plus, X, MapPin } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generateInvoicePDF } from '@/utils/pdfGenerator';

interface Driver {
  id: string;
  name: string;
  truckNumber: string;
}

interface AdditionalCost {
  description: string;
  amount: number;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  loadNumber: string;
  broker: string;
  driver: string;
  truckNumber: string;
  rate: number;
  pickupLocation: string;
  deliveryLocation: string;
  pickupDate: string;
  deliveryDate: string;
  notes: string;
  status: 'unpaid' | 'paid' | 'partial';
  paymentMethod?: string;
  paymentDate?: string;
  paidAmount?: number;
  createdAt: string;
  additionalCosts?: AdditionalCost[];
  includeRouteInfo?: boolean;
}

const InvoiceForm = () => {
  const { toast } = useToast();
  const [drivers] = useState<Driver[]>([
    { id: '1', name: 'John Smith', truckNumber: 'TRK-001' },
    { id: '2', name: 'Mike Johnson', truckNumber: 'TRK-002' },
    { id: '3', name: 'Sarah Davis', truckNumber: 'TRK-003' },
    { id: '4', name: 'Robert Wilson', truckNumber: 'TRK-004' },
    { id: '5', name: 'Lisa Anderson', truckNumber: 'TRK-005' },
  ]);

  const [savedBrokers, setSavedBrokers] = useState<string[]>([]);
  const [includeRouteInfo, setIncludeRouteInfo] = useState(true);
  const [additionalCosts, setAdditionalCosts] = useState<AdditionalCost[]>([]);

  const [formData, setFormData] = useState({
    loadNumber: '',
    broker: '',
    driver: '',
    rate: '',
    pickupLocation: '',
    deliveryLocation: '',
    pickupDate: '',
    deliveryDate: '',
    notes: '',
  });

  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);

  useEffect(() => {
    // Load saved brokers
    const brokers = JSON.parse(localStorage.getItem('savedBrokers') || '[]');
    setSavedBrokers(brokers);
  }, []);

  useEffect(() => {
    if (formData.driver) {
      const driver = drivers.find(d => d.id === formData.driver);
      setSelectedDriver(driver || null);
    }
  }, [formData.driver, drivers]);

  const generateInvoiceNumber = (loadNumber: string) => {
    if (!loadNumber) return '';
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    return `INV-${year}${month}-${loadNumber}`;
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addAdditionalCost = () => {
    setAdditionalCosts(prev => [...prev, { description: '', amount: 0 }]);
  };

  const updateAdditionalCost = (index: number, field: 'description' | 'amount', value: string | number) => {
    setAdditionalCosts(prev => prev.map((cost, i) => 
      i === index ? { ...cost, [field]: value } : cost
    ));
  };

  const removeAdditionalCost = (index: number) => {
    setAdditionalCosts(prev => prev.filter((_, i) => i !== index));
  };

  const calculateTotal = () => {
    const baseRate = parseFloat(formData.rate) || 0;
    const additionalTotal = additionalCosts.reduce((sum, cost) => sum + (cost.amount || 0), 0);
    return baseRate + additionalTotal;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.loadNumber || !formData.broker || !formData.driver || !formData.rate) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const invoiceNumber = generateInvoiceNumber(formData.loadNumber);
    
    const invoice: Invoice = {
      id: Date.now().toString(),
      invoiceNumber,
      loadNumber: formData.loadNumber,
      broker: formData.broker,
      driver: selectedDriver?.name || '',
      truckNumber: selectedDriver?.truckNumber || '',
      rate: parseFloat(formData.rate),
      pickupLocation: formData.pickupLocation,
      deliveryLocation: formData.deliveryLocation,
      pickupDate: formData.pickupDate,
      deliveryDate: formData.deliveryDate,
      notes: formData.notes,
      status: 'unpaid',
      createdAt: new Date().toISOString(),
      additionalCosts: additionalCosts.filter(cost => cost.description && cost.amount > 0),
      includeRouteInfo,
    };

    // Save to localStorage
    const existingInvoices = JSON.parse(localStorage.getItem('invoices') || '[]');
    existingInvoices.push(invoice);
    localStorage.setItem('invoices', JSON.stringify(existingInvoices));

    // Add broker to saved brokers if not already there
    if (!savedBrokers.includes(formData.broker)) {
      const updatedBrokers = [...savedBrokers, formData.broker];
      setSavedBrokers(updatedBrokers);
      localStorage.setItem('savedBrokers', JSON.stringify(updatedBrokers));
    }

    // Generate PDF
    await generateInvoicePDF(invoice);

    toast({
      title: "Invoice Created",
      description: `Invoice ${invoiceNumber} has been generated successfully.`,
    });

    // Reset form
    setFormData({
      loadNumber: '',
      broker: '',
      driver: '',
      rate: '',
      pickupLocation: '',
      deliveryLocation: '',
      pickupDate: '',
      deliveryDate: '',
      notes: '',
    });
    setSelectedDriver(null);
    setAdditionalCosts([]);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Create New Invoice</h2>
        </div>

        {/* Basic Information */}
        <Card className="border-0 shadow-sm bg-white dark:bg-slate-800">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="loadNumber" className="text-sm font-medium text-slate-700 dark:text-slate-300">Load Number *</Label>
                <Input
                  id="loadNumber"
                  value={formData.loadNumber}
                  onChange={(e) => handleInputChange('loadNumber', e.target.value)}
                  placeholder="L-2024-001"
                  required
                  className="mt-1 bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600"
                />
                {formData.loadNumber && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Invoice #: {generateInvoiceNumber(formData.loadNumber)}
                  </p>
                )}
              </div>

              <div>
  <Label htmlFor="broker" className="text-sm font-medium text-slate-700 dark:text-slate-300">
    Broker *
  </Label>
  <input
    list="broker-options"
    id="broker"
    name="broker"
    value={formData.broker}
    onChange={(e) => handleInputChange('broker', e.target.value)}
    placeholder="Select or enter broker"
    className="mt-1 w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded"
  />
  <datalist id="broker-options">
    {savedBrokers.map((broker, index) => (
      <option key={index} value={broker} />
    ))}
  </datalist>
</div>

            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="driver" className="text-sm font-medium text-slate-700 dark:text-slate-300">Driver *</Label>
                <Select value={formData.driver} onValueChange={(value) => handleInputChange('driver', value)}>
                  <SelectTrigger className="mt-1 bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600">
                    <SelectValue placeholder="Select driver" />
                  </SelectTrigger>
                  <SelectContent>
                    {drivers.map((driver) => (
                      <SelectItem key={driver.id} value={driver.id}>
                        {driver.name} - {driver.truckNumber}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="rate" className="text-sm font-medium text-slate-700 dark:text-slate-300">Base Rate *</Label>
                <div className="relative mt-1">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    id="rate"
                    type="number"
                    step="0.01"
                    value={formData.rate}
                    onChange={(e) => handleInputChange('rate', e.target.value)}
                    placeholder="0.00"
                    className="pl-10 bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600"
                    required
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Additional Costs */}
        <Card className="border-0 shadow-sm bg-white dark:bg-slate-800">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">Additional Costs</CardTitle>
              <Button
                type="button"
                onClick={addAdditionalCost}
                variant="outline"
                size="sm"
                className="border-slate-200 dark:border-slate-600"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Cost
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {additionalCosts.map((cost, index) => (
              <div key={index} className="flex gap-3 items-end">
                <div className="flex-1">
                  <Input
                    placeholder="Description (e.g., Detention, Lumper)"
                    value={cost.description}
                    onChange={(e) => updateAdditionalCost(index, 'description', e.target.value)}
                    className="bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600"
                  />
                </div>
                <div className="w-32">
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={cost.amount || ''}
                      onChange={(e) => updateAdditionalCost(index, 'amount', parseFloat(e.target.value) || 0)}
                      className="pl-10 bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600"
                    />
                  </div>
                </div>
                <Button
                  type="button"
                  onClick={() => removeAdditionalCost(index)}
                  variant="outline"
                  size="sm"
                  className="border-slate-200 dark:border-slate-600 text-red-600 hover:text-red-700"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
            
            {calculateTotal() > 0 && (
              <div className="pt-3 border-t border-slate-200 dark:border-slate-600">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-slate-900 dark:text-white">Total Amount:</span>
                  <span className="text-xl font-bold text-slate-900 dark:text-white">
                    ${calculateTotal().toFixed(2)}
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Route Information Toggle */}
        <Card className="border-0 shadow-sm bg-white dark:bg-slate-800">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">Route Information</CardTitle>
                <CardDescription className="text-slate-600 dark:text-slate-400">
                  Include pickup and delivery details on invoice
                </CardDescription>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={includeRouteInfo}
                  onCheckedChange={setIncludeRouteInfo}
                />
                <Label className="text-sm text-slate-700 dark:text-slate-300">
                  {includeRouteInfo ? 'Included' : 'Excluded'}
                </Label>
              </div>
            </div>
          </CardHeader>
          {includeRouteInfo && (
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="pickupLocation" className="text-sm font-medium text-slate-700 dark:text-slate-300">Pickup Location</Label>
                  <div className="relative mt-1">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      id="pickupLocation"
                      value={formData.pickupLocation}
                      onChange={(e) => handleInputChange('pickupLocation', e.target.value)}
                      placeholder="City, State"
                      className="pl-10 bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="deliveryLocation" className="text-sm font-medium text-slate-700 dark:text-slate-300">Delivery Location</Label>
                  <div className="relative mt-1">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      id="deliveryLocation"
                      value={formData.deliveryLocation}
                      onChange={(e) => handleInputChange('deliveryLocation', e.target.value)}
                      placeholder="City, State"
                      className="pl-10 bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="pickupDate" className="text-sm font-medium text-slate-700 dark:text-slate-300">Pickup Date</Label>
                  <div className="relative mt-1">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      id="pickupDate"
                      type="date"
                      value={formData.pickupDate}
                      onChange={(e) => handleInputChange('pickupDate', e.target.value)}
                      className="pl-10 bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="deliveryDate" className="text-sm font-medium text-slate-700 dark:text-slate-300">Delivery Date</Label>
                  <div className="relative mt-1">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      id="deliveryDate"
                      type="date"
                      value={formData.deliveryDate}
                      onChange={(e) => handleInputChange('deliveryDate', e.target.value)}
                      className="pl-10 bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Notes */}
        <Card className="border-0 shadow-sm bg-white dark:bg-slate-800">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Additional notes or special instructions"
              rows={3}
              className="bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600 resize-none"
            />
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end">
          <Button 
            type="submit" 
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 h-auto font-semibold"
          >
            <Download className="h-5 w-5 mr-2" />
            Generate Invoice PDF
          </Button>
        </div>
      </form>
    </div>
  );
};

export default InvoiceForm;
