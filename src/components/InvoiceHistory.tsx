
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FileText, Download, Edit, Search, DollarSign, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generateInvoicePDF } from '@/utils/pdfGenerator';

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

const InvoiceHistory = () => {
  const { toast } = useToast();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    status: 'paid' as 'paid' | 'partial',
    method: '',
    date: '',
    amount: '',
  });

  useEffect(() => {
    const savedInvoices = JSON.parse(localStorage.getItem('invoices') || '[]');
    setInvoices(savedInvoices);
    setFilteredInvoices(savedInvoices);
  }, []);

  useEffect(() => {
    let filtered = invoices;

    if (searchTerm) {
      filtered = filtered.filter(invoice =>
        invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.loadNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.broker.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.driver.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(invoice => invoice.status === statusFilter);
    }

    setFilteredInvoices(filtered);
  }, [invoices, searchTerm, statusFilter]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100 hover:bg-green-100 dark:hover:bg-green-900">Paid</Badge>;
      case 'partial':
        return <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100 hover:bg-orange-100 dark:hover:bg-orange-900">Partial</Badge>;
      default:
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100 hover:bg-red-100 dark:hover:bg-red-900">Unpaid</Badge>;
    }
  };

  const calculateInvoiceTotal = (invoice: Invoice) => {
    const baseRate = invoice.rate || 0;
    const additionalTotal = (invoice.additionalCosts || []).reduce((sum, cost) => sum + (cost.amount || 0), 0);
    return baseRate + additionalTotal;
  };

  const handleDownloadPDF = async (invoice: Invoice) => {
    await generateInvoicePDF(invoice);
    toast({
      title: "PDF Downloaded",
      description: `Invoice ${invoice.invoiceNumber} has been downloaded.`,
    });
  };

  const handlePaymentUpdate = (invoice: Invoice) => {
    const total = calculateInvoiceTotal(invoice);
    setSelectedInvoice(invoice);
    setPaymentForm({
      status: 'paid',
      method: '',
      date: new Date().toISOString().split('T')[0],
      amount: total.toString(),
    });
    setPaymentDialogOpen(true);
  };

  const savePaymentUpdate = () => {
    if (!selectedInvoice) return;

    const updatedInvoices = invoices.map(inv => {
      if (inv.id === selectedInvoice.id) {
        return {
          ...inv,
          status: paymentForm.status,
          paymentMethod: paymentForm.method,
          paymentDate: paymentForm.date,
          paidAmount: parseFloat(paymentForm.amount),
        };
      }
      return inv;
    });

    setInvoices(updatedInvoices);
    localStorage.setItem('invoices', JSON.stringify(updatedInvoices));
    setPaymentDialogOpen(false);
    setSelectedInvoice(null);

    toast({
      title: "Payment Updated",
      description: `Payment status for invoice ${selectedInvoice.invoiceNumber} has been updated.`,
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card className="bg-slate-50 dark:bg-slate-700 border-0 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">Filter Invoices</CardTitle>
          <CardDescription className="text-slate-600 dark:text-slate-400">Search and filter your invoice history</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="search" className="text-sm font-medium text-slate-700 dark:text-slate-300">Search</Label>
              <div className="relative mt-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  id="search"
                  placeholder="Search invoices..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white dark:bg-slate-600 border-slate-200 dark:border-slate-500"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="status" className="text-sm font-medium text-slate-700 dark:text-slate-300">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="mt-1 bg-white dark:bg-slate-600 border-slate-200 dark:border-slate-500">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="unpaid">Unpaid</SelectItem>
                  <SelectItem value="partial">Partial</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Invoice Table */}
      <Card className="bg-white dark:bg-slate-800 border-0 shadow-sm overflow-hidden">
        <CardHeader className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700">
          <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">Invoice History</CardTitle>
          <CardDescription className="text-slate-600 dark:text-slate-400">
            {filteredInvoices.length} invoice{filteredInvoices.length !== 1 ? 's' : ''} found
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-slate-200 dark:border-slate-700 hover:bg-transparent">
                  <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Invoice #</TableHead>
                  <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Load #</TableHead>
                  <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Broker</TableHead>
                  <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Driver</TableHead>
                  <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Amount</TableHead>
                  <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Status</TableHead>
                  <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Created</TableHead>
                  <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-12 text-slate-500 dark:text-slate-400">
                      <FileText className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                      <p className="text-lg font-medium">No invoices found</p>
                      <p className="text-sm">Create your first invoice to get started</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredInvoices.map((invoice) => (
                    <TableRow key={invoice.id} className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50">
                      <TableCell className="font-semibold text-slate-900 dark:text-white">{invoice.invoiceNumber}</TableCell>
                      <TableCell className="text-slate-700 dark:text-slate-300">{invoice.loadNumber}</TableCell>
                      <TableCell className="text-slate-700 dark:text-slate-300">{invoice.broker}</TableCell>
                      <TableCell className="text-slate-700 dark:text-slate-300">{invoice.driver}</TableCell>
                      <TableCell className="font-semibold text-slate-900 dark:text-white">{formatCurrency(calculateInvoiceTotal(invoice))}</TableCell>
                      <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                      <TableCell className="text-slate-500 dark:text-slate-400">{formatDate(invoice.createdAt)}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownloadPDF(invoice)}
                            className="border-slate-200 dark:border-slate-600 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 h-8 w-8 p-0"
                          >
                            <Download className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePaymentUpdate(invoice)}
                            className="border-slate-200 dark:border-slate-600 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 h-8 w-8 p-0"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Payment Update Dialog */}
      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-slate-900 dark:text-white">Update Payment Status</DialogTitle>
            <DialogDescription className="text-slate-600 dark:text-slate-400">
              Update payment information for invoice {selectedInvoice?.invoiceNumber}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="paymentStatus" className="text-sm font-medium text-slate-700 dark:text-slate-300">Payment Status</Label>
              <Select 
                value={paymentForm.status} 
                onValueChange={(value: 'paid' | 'partial') => 
                  setPaymentForm(prev => ({ ...prev, status: value }))
                }
              >
                <SelectTrigger className="mt-1 bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="partial">Partial Payment</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="paymentMethod" className="text-sm font-medium text-slate-700 dark:text-slate-300">Payment Method</Label>
              <Input
                id="paymentMethod"
                value={paymentForm.method}
                onChange={(e) => setPaymentForm(prev => ({ ...prev, method: e.target.value }))}
                placeholder="e.g., Check, Wire Transfer, ACH"
                className="mt-1 bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600"
              />
            </div>
            <div>
              <Label htmlFor="paymentDate" className="text-sm font-medium text-slate-700 dark:text-slate-300">Payment Date</Label>
              <div className="relative mt-1">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  id="paymentDate"
                  type="date"
                  value={paymentForm.date}
                  onChange={(e) => setPaymentForm(prev => ({ ...prev, date: e.target.value }))}
                  className="pl-10 bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="paymentAmount" className="text-sm font-medium text-slate-700 dark:text-slate-300">Amount Paid</Label>
              <div className="relative mt-1">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  id="paymentAmount"
                  type="number"
                  step="0.01"
                  value={paymentForm.amount}
                  onChange={(e) => setPaymentForm(prev => ({ ...prev, amount: e.target.value }))}
                  className="pl-10 bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600"
                />
              </div>
            </div>
          </div>
          <DialogFooter className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={() => setPaymentDialogOpen(false)}
              className="border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600"
            >
              Cancel
            </Button>
            <Button 
              onClick={savePaymentUpdate}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Update Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InvoiceHistory;
