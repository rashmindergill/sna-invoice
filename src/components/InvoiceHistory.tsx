
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
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Paid</Badge>;
      case 'partial':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Partial</Badge>;
      default:
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Unpaid</Badge>;
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
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filter Invoices</CardTitle>
          <CardDescription>Search and filter your invoice history</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search invoices..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
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
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Invoice History</CardTitle>
          <CardDescription>
            {filteredInvoices.length} invoice{filteredInvoices.length !== 1 ? 's' : ''} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice #</TableHead>
                  <TableHead>Load #</TableHead>
                  <TableHead>Broker</TableHead>
                  <TableHead>Driver</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No invoices found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredInvoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                      <TableCell>{invoice.loadNumber}</TableCell>
                      <TableCell>{invoice.broker}</TableCell>
                      <TableCell>{invoice.driver}</TableCell>
                      <TableCell>{formatCurrency(invoice.rate)}</TableCell>
                      <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                      <TableCell>{formatDate(invoice.createdAt)}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownloadPDF(invoice)}
                          >
                            <Download className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePaymentUpdate(invoice)}
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Payment Status</DialogTitle>
            <DialogDescription>
              Update payment information for invoice {selectedInvoice?.invoiceNumber}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="paymentStatus">Payment Status</Label>
              <Select 
                value={paymentForm.status} 
                onValueChange={(value: 'paid' | 'partial') => 
                  setPaymentForm(prev => ({ ...prev, status: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="partial">Partial Payment</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="paymentMethod">Payment Method</Label>
              <Input
                id="paymentMethod"
                value={paymentForm.method}
                onChange={(e) => setPaymentForm(prev => ({ ...prev, method: e.target.value }))}
                placeholder="e.g., Check, Wire Transfer, ACH"
              />
            </div>
            <div>
              <Label htmlFor="paymentDate">Payment Date</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="paymentDate"
                  type="date"
                  value={paymentForm.date}
                  onChange={(e) => setPaymentForm(prev => ({ ...prev, date: e.target.value }))}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="paymentAmount">Amount Paid</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="paymentAmount"
                  type="number"
                  step="0.01"
                  value={paymentForm.amount}
                  onChange={(e) => setPaymentForm(prev => ({ ...prev, amount: e.target.value }))}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPaymentDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={savePaymentUpdate}>
              Update Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InvoiceHistory;
