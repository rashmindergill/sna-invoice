
import React, { useState, useEffect } from 'react';
import { Truck, FileText, Users, DollarSign, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import InvoiceForm from '@/components/InvoiceForm';
import InvoiceHistory from '@/components/InvoiceHistory';
import DriverManagement from '@/components/DriverManagement';

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

const Index = () => {
  const [activeTab, setActiveTab] = useState('create');
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [stats, setStats] = useState({
    totalInvoices: 0,
    pendingPayment: 0,
    activeDrivers: 5,
    thisMonth: 0,
  });

  useEffect(() => {
    const savedInvoices = JSON.parse(localStorage.getItem('invoices') || '[]');
    setInvoices(savedInvoices);
    
    // Calculate statistics
    const totalInvoices = savedInvoices.length;
    
    const pendingPayment = savedInvoices
      .filter((inv: Invoice) => inv.status === 'unpaid' || inv.status === 'partial')
      .reduce((sum: number, inv: Invoice) => {
        if (inv.status === 'unpaid') {
          return sum + inv.rate;
        } else if (inv.status === 'partial' && inv.paidAmount) {
          return sum + (inv.rate - inv.paidAmount);
        }
        return sum;
      }, 0);

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const thisMonth = savedInvoices
      .filter((inv: Invoice) => {
        const invoiceDate = new Date(inv.createdAt);
        return invoiceDate.getMonth() === currentMonth && 
               invoiceDate.getFullYear() === currentYear;
      })
      .reduce((sum: number, inv: Invoice) => sum + inv.rate, 0);

    setStats({
      totalInvoices,
      pendingPayment,
      activeDrivers: 5,
      thisMonth,
    });
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="bg-black rounded-lg p-2">
                <Truck className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">Haul-It Pro</h1>
                <p className="text-gray-500 text-sm">Professional trucking invoice management</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Invoices</CardTitle>
              <div className="p-1.5 bg-gray-100 rounded-md">
                <FileText className="h-4 w-4 text-gray-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold text-gray-900">{stats.totalInvoices}</div>
              <p className="text-xs text-gray-500 mt-1">All time</p>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Pending Payment</CardTitle>
              <div className="p-1.5 bg-gray-100 rounded-md">
                <DollarSign className="h-4 w-4 text-gray-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold text-gray-900">{formatCurrency(stats.pendingPayment)}</div>
              <p className="text-xs text-gray-500 mt-1">Outstanding balance</p>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Active Drivers</CardTitle>
              <div className="p-1.5 bg-gray-100 rounded-md">
                <Users className="h-4 w-4 text-gray-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold text-gray-900">{stats.activeDrivers}</div>
              <p className="text-xs text-gray-500 mt-1">All available</p>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">This Month</CardTitle>
              <div className="p-1.5 bg-gray-100 rounded-md">
                <Truck className="h-4 w-4 text-gray-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold text-gray-900">{formatCurrency(stats.thisMonth)}</div>
              <p className="text-xs text-gray-500 mt-1">Total revenue</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Interface */}
        <Card className="border border-gray-200 shadow-sm">
          <CardHeader className="border-b border-gray-100">
            <CardTitle className="text-xl font-medium text-gray-900">Invoice Management</CardTitle>
            <CardDescription className="text-gray-500">
              Create new invoices, track payments, and manage your trucking business
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-gray-50 m-4 mb-0 h-10">
                <TabsTrigger 
                  value="create" 
                  className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm font-medium text-sm"
                >
                  <Plus className="h-4 w-4" />
                  Create Invoice
                </TabsTrigger>
                <TabsTrigger 
                  value="history" 
                  className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm font-medium text-sm"
                >
                  <FileText className="h-4 w-4" />
                  Invoice History
                </TabsTrigger>
                <TabsTrigger 
                  value="drivers" 
                  className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm font-medium text-sm"
                >
                  <Users className="h-4 w-4" />
                  Drivers
                </TabsTrigger>
              </TabsList>

              <TabsContent value="create" className="mt-0 p-4">
                <InvoiceForm />
              </TabsContent>

              <TabsContent value="history" className="mt-0 p-4">
                <InvoiceHistory />
              </TabsContent>

              <TabsContent value="drivers" className="mt-0 p-4">
                <DriverManagement />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Index;
