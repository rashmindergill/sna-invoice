
import React, { useState, useEffect } from 'react';
import { Truck, FileText, Users, DollarSign, Plus, Moon, Sun, LogOut, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import InvoiceForm from '@/components/InvoiceForm';
import InvoiceHistory from '@/components/InvoiceHistory';
import DriverManagement from '@/components/DriverManagement';
import { useAuth } from '@/context/AuthContext';

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

const Index = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('create');
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [darkMode, setDarkMode] = useState(false);
  const [stats, setStats] = useState({
    totalInvoices: 0,
    pendingPayment: 0,
    activeDrivers: 5,
    thisMonth: 0,
  });

  useEffect(() => {
    // Load dark mode preference
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    setDarkMode(savedDarkMode);
    if (savedDarkMode) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  useEffect(() => {
    const savedInvoices = JSON.parse(localStorage.getItem('invoices') || '[]');
    setInvoices(savedInvoices);
    
    // Calculate statistics based on actual invoice data
    const totalInvoices = savedInvoices.length;
    
    const pendingPayment = savedInvoices
      .filter((inv: Invoice) => inv.status === 'unpaid' || inv.status === 'partial')
      .reduce((sum: number, inv: Invoice) => {
        const baseAmount = inv.rate || 0;
        const additionalAmount = (inv.additionalCosts || []).reduce((acc, cost) => acc + (cost.amount || 0), 0);
        const totalAmount = baseAmount + additionalAmount;
        
        if (inv.status === 'unpaid') {
          return sum + totalAmount;
        } else if (inv.status === 'partial' && inv.paidAmount) {
          return sum + (totalAmount - inv.paidAmount);
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
      .reduce((sum: number, inv: Invoice) => {
        const baseAmount = inv.rate || 0;
        const additionalAmount = (inv.additionalCosts || []).reduce((acc, cost) => acc + (cost.amount || 0), 0);
        return sum + baseAmount + additionalAmount;
      }, 0);

    setStats({
      totalInvoices,
      pendingPayment,
      activeDrivers: 5,
      thisMonth,
    });
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('darkMode', newDarkMode.toString());
    
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="bg-blue-600 rounded-xl p-3">
                <Truck className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Haul-It Pro</h1>
                <p className="text-slate-600 dark:text-slate-400 text-sm">Professional trucking management</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Sun className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                <Switch checked={darkMode} onCheckedChange={toggleDarkMode} />
                <Moon className="h-4 w-4 text-slate-600 dark:text-slate-400" />
              </div>
              
              <div className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-400">
                <span>Welcome, {user?.username}</span>
              </div>
              
              <Button
                onClick={logout}
                variant="outline"
                size="sm"
                className="border-slate-200 dark:border-slate-600"
              >
                <LogOut className="h-4 w-4 mr-1" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-white dark:bg-slate-800 border-0 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Invoices</CardTitle>
              <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900 dark:text-white">{stats.totalInvoices}</div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">All time</p>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-slate-800 border-0 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">Pending Payment</CardTitle>
              <div className="p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                <DollarSign className="h-4 w-4 text-orange-600 dark:text-orange-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900 dark:text-white">{formatCurrency(stats.pendingPayment)}</div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Outstanding balance</p>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-slate-800 border-0 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">Active Drivers</CardTitle>
              <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <Users className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900 dark:text-white">{stats.activeDrivers}</div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">All available</p>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-slate-800 border-0 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">This Month</CardTitle>
              <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <Truck className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900 dark:text-white">{formatCurrency(stats.thisMonth)}</div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Total revenue</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Interface */}
        <Card className="bg-white dark:bg-slate-800 border-0 shadow-sm">
          <CardHeader className="border-b border-slate-200 dark:border-slate-700">
            <CardTitle className="text-xl font-semibold text-slate-900 dark:text-white">Invoice Management</CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-400">
              Create new invoices, track payments, and manage your trucking business
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-slate-100 dark:bg-slate-700 m-4 mb-0 h-11">
                <TabsTrigger 
                  value="create" 
                  className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-600 font-medium"
                >
                  <Plus className="h-4 w-4" />
                  Create Invoice
                </TabsTrigger>
                <TabsTrigger 
                  value="history" 
                  className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-600 font-medium"
                >
                  <FileText className="h-4 w-4" />
                  Invoice History
                </TabsTrigger>
                <TabsTrigger 
                  value="drivers" 
                  className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-600 font-medium"
                >
                  <Users className="h-4 w-4" />
                  Drivers
                </TabsTrigger>
              </TabsList>

              <TabsContent value="create" className="mt-0 p-6">
                <InvoiceForm />
              </TabsContent>

              <TabsContent value="history" className="mt-0 p-6">
                <InvoiceHistory />
              </TabsContent>

              <TabsContent value="drivers" className="mt-0 p-6">
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
