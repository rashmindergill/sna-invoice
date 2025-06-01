import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { FileText, Download, Edit, Search, DollarSign, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generateInvoicePDF } from '@/utils/pdfGenerator';

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

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(invoice =>
        invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.loadNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.broker.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.driver.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(invoice => invoice.status === statusFilter);
    }

    setFilteredInvoices(filtered);
  }, [invoices, searchTerm, statusFilter]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-50 text-green-700 hover:bg-green-50 border-0 rounded-lg font-medium">Paid</Badge>;
      case 'partial':
        return <Badge className="bg-orange-50 text-orange-700 hover:bg-orange-50 border-0 rounded-lg font-medium">Partial</Badge>;
      default:
        return <Badge className="bg-red-50 text-red-700 hover:bg-red-50 border-0 rounded-lg font-medium">Unpaid</Badge>;
    }
  };

  const handleDownloadPDF = async (invoice: Invoice) => {
    await generateInvoicePDF(invoice);
    toast({
      title: "PDF Downloaded",
      description: `Invoice ${invoice.invoiceNumber} has been downloaded.`,
    });
  };

  const handlePaymentUpdate = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setPaymentForm({
      status: 'paid',
      method: '',
      date: new Date().toISOString().split('T')[0],
      amount: invoice.rate.toString(),
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
    <div className="space-y-8">
      {/* Filters */}
      <Card className="bg-gray-50 border-0 rounded-2xl">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold text-gray-900">Filter Invoices</CardTitle>
          <CardDescription className="text-gray-500">Search and filter your invoice history</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <Label htmlFor="search" className="text-sm font-medium text-gray-700 mb-2 block">Search</Label>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Search invoices..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="border-0 bg-white rounded-xl shadow-sm focus:shadow-md transition-shadow h-12 pl-12"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="status" className="text-sm font-medium text-gray-700 mb-2 block">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="border-0 bg-white rounded-xl shadow-sm focus:shadow-md transition-shadow h-12">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-0 rounded-xl shadow-lg">
                  <SelectItem value="all" className="rounded-lg">All Statuses</SelectItem>
                  <SelectItem value="unpaid" className="rounded-lg">Unpaid</SelectItem>
                  <SelectItem value="partial" className="rounded-lg">Partial</SelectItem>
                  <SelectItem value="paid" className="rounded-lg">Paid</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Invoice Table */}
      <Card className="bg-white border-0 shadow-sm rounded-2xl overflow-hidden">
        <CardHeader className="border-b border-gray-100 bg-gray-50">
          <CardTitle className="text-lg font-semibold text-gray-900">Invoice History</CardTitle>
          <CardDescription className="text-gray-500">
            {filteredInvoices.length} invoice{filteredInvoices.length !== 1 ? 's' : ''} found
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-gray-100 hover:bg-transparent">
                  <TableHead className="font-semibold text-gray-700 h-14">Invoice #</TableHead>
                  <TableHead className="font-semibold text-gray-700">Load #</TableHead>
                  <TableHead className="font-semibold text-gray-700">Broker</TableHead>
                  <TableHead className="font-semibold text-gray-700">Driver</TableHead>
                  <TableHead className="font-semibold text-gray-700">Amount</TableHead>
                  <TableHead className="font-semibold text-gray-700">Status</TableHead>
                  <TableHead className="font-semibold text-gray-700">Created</TableHead>
                  <TableHead className="font-semibold text-gray-700">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-12 text-gray-500">
                      <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-lg font-medium">No invoices found</p>
                      <p className="text-sm">Create your first invoice to get started</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredInvoices.map((invoice) => (
                    <TableRow key={invoice.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                      <TableCell className="font-semibold text-gray-900 h-16">{invoice.invoiceNumber}</TableCell>
                      <TableCell className="text-gray-700">{invoice.loadNumber}</TableCell>
                      <TableCell className="text-gray-700">{invoice.broker}</TableCell>
                      <TableCell className="text-gray-700">{invoice.driver}</TableCell>
                      <TableCell className="font-semibold text-gray-900">{formatCurrency(invoice.rate)}</TableCell>
                      <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                      <TableCell className="text-gray-500">{formatDate(invoice.createdAt)}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownloadPDF(invoice)}
                            className="border-0 bg-gray-100 hover:bg-gray-200 rounded-lg h-8 w-8 p-0"
                          >
                            <Download className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePaymentUpdate(invoice)}
                            className="border-0 bg-gray-100 hover:bg-gray-200 rounded-lg h-8 w-8 p-0"
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
        <DialogContent className="border-0 rounded-2xl shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-gray-900">Update Payment Status</DialogTitle>
            <DialogDescription className="text-gray-500">
              Update payment information for invoice {selectedInvoice?.invoiceNumber}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            <div>
              <Label htmlFor="paymentStatus" className="text-sm font-medium text-gray-700 mb-2 block">Payment Status</Label>
              <Select 
                value={paymentForm.status} 
                onValueChange={(value: 'paid' | 'partial') => 
                  setPaymentForm(prev => ({ ...prev, status: value }))
                }
              >
                <SelectTrigger className="border-0 bg-gray-50 rounded-xl h-12">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-0 rounded-xl shadow-lg">
                  <SelectItem value="paid" className="rounded-lg">Paid</SelectItem>
                  <SelectItem value="partial" className="rounded-lg">Partial Payment</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="paymentMethod" className="text-sm font-medium text-gray-700 mb-2 block">Payment Method</Label>
              <Input
                id="paymentMethod"
                value={paymentForm.method}
                onChange={(e) => setPaymentForm(prev => ({ ...prev, method: e.target.value }))}
                placeholder="e.g., Check, Wire Transfer, ACH"
                className="border-0 bg-gray-50 rounded-xl h-12"
              />
            </div>
            <div>
              <Label htmlFor="paymentDate" className="text-sm font-medium text-gray-700 mb-2 block">Payment Date</Label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  id="paymentDate"
                  type="date"
                  value={paymentForm.date}
                  onChange={(e) => setPaymentForm(prev => ({ ...prev, date: e.target.value }))}
                  className="border-0 bg-gray-50 rounded-xl h-12 pl-12"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="paymentAmount" className="text-sm font-medium text-gray-700 mb-2 block">Amount Paid</Label>
              <div className="relative">
                <DollarSign className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  id="paymentAmount"
                  type="number"
                  step="0.01"
                  value={paymentForm.amount}
                  onChange={(e) => setPaymentForm(prev => ({ ...prev, amount: e.target.value }))}
                  className="border-0 bg-gray-50 rounded-xl h-12 pl-12 text-lg font-semibold"
                />
              </div>
            </div>
          </div>
          <DialogFooter className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={() => setPaymentDialogOpen(false)}
              className="border border-gray-200 bg-white hover:bg-gray-50 rounded-xl px-6"
            >
              Cancel
            </Button>
            <Button 
              onClick={savePaymentUpdate}
              className="bg-gray-900 hover:bg-gray-800 text-white rounded-xl px-6"
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
