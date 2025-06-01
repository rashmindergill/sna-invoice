
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Download, Calendar, DollarSign, Plus, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generateInvoicePDF } from '@/utils/pdfGenerator';

interface Driver {
  id: string;
  name: string;
  truckNumber: string;
}

interface AdditionalCost {
  name: string;
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
  includePickupInfo?: boolean;
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
  const [includePickupInfo, setIncludePickupInfo] = useState(true);
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
  const [filteredBrokers, setFilteredBrokers] = useState<string[]>([]);
  const [showBrokerSuggestions, setShowBrokerSuggestions] = useState(false);

  useEffect(() => {
    // Load saved brokers from localStorage
    const saved = JSON.parse(localStorage.getItem('savedBrokers') || '[]');
    setSavedBrokers(saved);
  }, []);

  useEffect(() => {
    if (formData.driver) {
      const driver = drivers.find(d => d.id === formData.driver);
      setSelectedDriver(driver || null);
    }
  }, [formData.driver, drivers]);

  useEffect(() => {
    if (formData.broker) {
      const filtered = savedBrokers.filter(broker =>
        broker.toLowerCase().includes(formData.broker.toLowerCase())
      );
      setFilteredBrokers(filtered);
      setShowBrokerSuggestions(filtered.length > 0 && formData.broker !== '');
    } else {
      setShowBrokerSuggestions(false);
    }
  }, [formData.broker, savedBrokers]);

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

  const handleBrokerSelect = (broker: string) => {
    setFormData(prev => ({ ...prev, broker }));
    setShowBrokerSuggestions(false);
  };

  const addAdditionalCost = () => {
    setAdditionalCosts([...additionalCosts, { name: '', amount: 0 }]);
  };

  const updateAdditionalCost = (index: number, field: 'name' | 'amount', value: string | number) => {
    const updated = [...additionalCosts];
    updated[index] = { ...updated[index], [field]: value };
    setAdditionalCosts(updated);
  };

  const removeAdditionalCost = (index: number) => {
    setAdditionalCosts(additionalCosts.filter((_, i) => i !== index));
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
      additionalCosts: additionalCosts.filter(cost => cost.name && cost.amount),
      includePickupInfo,
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
      description: `Invoice ${invoiceNumber} has been generated and will download shortly.`,
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
    setIncludePickupInfo(true);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Load Information */}
        <Card className="border border-gray-200 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-medium">Load Information</CardTitle>
            <CardDescription>Enter the basic load details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="loadNumber" className="text-sm font-medium mb-2 block">Load Number *</Label>
              <Input
                id="loadNumber"
                value={formData.loadNumber}
                onChange={(e) => handleInputChange('loadNumber', e.target.value)}
                placeholder="L-2024-001"
                required
                className="h-10"
              />
              {formData.loadNumber && (
                <p className="text-sm text-gray-500 mt-1">
                  Invoice #: {generateInvoiceNumber(formData.loadNumber)}
                </p>
              )}
            </div>

            <div className="relative">
              <Label htmlFor="broker" className="text-sm font-medium mb-2 block">Broker *</Label>
              <Input
                id="broker"
                value={formData.broker}
                onChange={(e) => handleInputChange('broker', e.target.value)}
                placeholder="Enter or select broker"
                required
                className="h-10"
              />
              {showBrokerSuggestions && (
                <div className="absolute z-10 w-full bg-white border border-gray-200 rounded-lg mt-1 shadow-lg overflow-hidden">
                  {filteredBrokers.map((broker, index) => (
                    <button
                      key={index}
                      type="button"
                      className="w-full px-3 py-2 text-left hover:bg-gray-50 transition-colors"
                      onClick={() => handleBrokerSelect(broker)}
                    >
                      {broker}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="rate" className="text-sm font-medium mb-2 block">Rate ($) *</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="rate"
                  type="number"
                  step="0.01"
                  value={formData.rate}
                  onChange={(e) => handleInputChange('rate', e.target.value)}
                  placeholder="0.00"
                  className="h-10 pl-10"
                  required
                />
              </div>
            </div>

            {/* Additional Costs */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label className="text-sm font-medium">Additional Costs</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addAdditionalCost}
                  className="h-8 px-3"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add
                </Button>
              </div>
              {additionalCosts.map((cost, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <Input
                    placeholder="e.g., Detention, Lumper"
                    value={cost.name}
                    onChange={(e) => updateAdditionalCost(index, 'name', e.target.value)}
                    className="h-8"
                  />
                  <div className="relative">
                    <DollarSign className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-400" />
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={cost.amount || ''}
                      onChange={(e) => updateAdditionalCost(index, 'amount', parseFloat(e.target.value) || 0)}
                      className="h-8 pl-6 w-24"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeAdditionalCost(index)}
                    className="h-8 w-8 p-0"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Driver and Truck */}
        <Card className="border border-gray-200 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-medium">Driver & Truck</CardTitle>
            <CardDescription>Select driver and view truck assignment</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="driver" className="text-sm font-medium mb-2 block">Driver *</Label>
              <Select value={formData.driver} onValueChange={(value) => handleInputChange('driver', value)}>
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Select driver" />
                </SelectTrigger>
                <SelectContent>
                  {drivers.map((driver) => (
                    <SelectItem key={driver.id} value={driver.id}>
                      {driver.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedDriver && (
              <div>
                <Label className="text-sm font-medium mb-2 block">Truck Number</Label>
                <Input
                  value={selectedDriver.truckNumber}
                  readOnly
                  className="h-10 bg-gray-50"
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Pickup Information Toggle */}
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-medium">Route Information</CardTitle>
              <CardDescription>Pickup and delivery details</CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Label htmlFor="pickup-toggle" className="text-sm font-medium">Include pickup info</Label>
              <Switch
                id="pickup-toggle"
                checked={includePickupInfo}
                onCheckedChange={setIncludePickupInfo}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {includePickupInfo && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="pickupLocation" className="text-sm font-medium mb-2 block">Pickup Location</Label>
                <Input
                  id="pickupLocation"
                  value={formData.pickupLocation}
                  onChange={(e) => handleInputChange('pickupLocation', e.target.value)}
                  placeholder="City, State"
                  className="h-10"
                />
              </div>
              <div>
                <Label htmlFor="pickupDate" className="text-sm font-medium mb-2 block">Pickup Date</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="pickupDate"
                    type="date"
                    value={formData.pickupDate}
                    onChange={(e) => handleInputChange('pickupDate', e.target.value)}
                    className="h-10 pl-10"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="deliveryLocation" className="text-sm font-medium mb-2 block">Delivery Location</Label>
              <Input
                id="deliveryLocation"
                value={formData.deliveryLocation}
                onChange={(e) => handleInputChange('deliveryLocation', e.target.value)}
                placeholder="City, State"
                className="h-10"
              />
            </div>
            <div>
              <Label htmlFor="deliveryDate" className="text-sm font-medium mb-2 block">Delivery Date</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="deliveryDate"
                  type="date"
                  value={formData.deliveryDate}
                  onChange={(e) => handleInputChange('deliveryDate', e.target.value)}
                  className="h-10 pl-10"
                />
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="notes" className="text-sm font-medium mb-2 block">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Additional notes or special instructions"
              rows={3}
              className="resize-none"
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button 
          type="submit" 
          className="bg-black hover:bg-gray-800 text-white px-6 py-2 h-10 font-medium"
        >
          <Download className="h-4 w-4 mr-2" />
          Generate Invoice PDF
        </Button>
      </div>
    </form>
  );
};

export default InvoiceForm;
