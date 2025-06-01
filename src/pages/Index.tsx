
import React, { useState, useEffect } from 'react';
import { Truck, FileText, Users, DollarSign, Plus, Moon, Sun, LogOut, Menu, X } from 'lucide-react';
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Mobile Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50 safe-area-top">
        <div className="px-4 sm:px-6">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 rounded-xl p-2">
                <Truck className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900 dark:text-white">Haul-It Pro</h1>
              </div>
            </div>
            
            {/* Mobile menu button */}
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden"
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
              
              {/* Desktop controls */}
              <div className="hidden md:flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Sun className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                  <Switch checked={darkMode} onCheckedChange={toggleDarkMode} />
                  <Moon className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                </div>
                
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                  <span>Welcome, {user?.username}</span>
                </div>
                
                <Button
                  onClick={logout}
                  variant="outline"
                  size="sm"
                  className="border-gray-200 dark:border-gray-600"
                >
                  <LogOut className="h-4 w-4 mr-1" />
                  Logout
                </Button>
              </div>
            </div>
          </div>

          {/* Mobile dropdown menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-gray-200 dark:border-gray-700">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Dark Mode</span>
                  <div className="flex items-center space-x-2">
                    <Sun className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                    <Switch checked={darkMode} onCheckedChange={toggleDarkMode} />
                    <Moon className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                  </div>
                </div>
                
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Welcome, {user?.username}
                </div>
                
                <Button
                  onClick={logout}
                  variant="outline"
                  size="sm"
                  className="w-full border-gray-200 dark:border-gray-600"
                >
                  <LogOut className="h-4 w-4 mr-1" />
                  Logout
                </Button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 sm:px-6 py-4 safe-area-bottom">
        {/* Stats Cards - Mobile Optimized */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm">
            <CardHeader className="pb-2 px-3 pt-3">
              <div className="flex items-center justify-between">
                <div className="p-1.5 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <FileText className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <CardTitle className="text-xs font-medium text-gray-600 dark:text-gray-400">Total Invoices</CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-3">
              <div className="text-xl font-bold text-gray-900 dark:text-white">{stats.totalInvoices}</div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm">
            <CardHeader className="pb-2 px-3 pt-3">
              <div className="flex items-center justify-between">
                <div className="p-1.5 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                  <DollarSign className="h-3 w-3 text-orange-600 dark:text-orange-400" />
                </div>
              </div>
              <CardTitle className="text-xs font-medium text-gray-600 dark:text-gray-400">Pending</CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-3">
              <div className="text-lg font-bold text-gray-900 dark:text-white">{formatCurrency(stats.pendingPayment)}</div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm">
            <CardHeader className="pb-2 px-3 pt-3">
              <div className="flex items-center justify-between">
                <div className="p-1.5 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <Users className="h-3 w-3 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <CardTitle className="text-xs font-medium text-gray-600 dark:text-gray-400">Drivers</CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-3">
              <div className="text-xl font-bold text-gray-900 dark:text-white">{stats.activeDrivers}</div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm">
            <CardHeader className="pb-2 px-3 pt-3">
              <div className="flex items-center justify-between">
                <div className="p-1.5 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <Truck className="h-3 w-3 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
              <CardTitle className="text-xs font-medium text-gray-600 dark:text-gray-400">This Month</CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-3">
              <div className="text-lg font-bold text-gray-900 dark:text-white">{formatCurrency(stats.thisMonth)}</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Interface - Mobile Optimized */}
        <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm">
          <CardContent className="p-0">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-gray-100 dark:bg-gray-700 m-3 mb-0 h-12 rounded-xl">
                <TabsTrigger 
                  value="create" 
                  className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-600 font-medium rounded-lg text-xs sm:text-sm"
                >
                  <Plus className="h-4 w-4" />
                  <span className="hidden sm:inline">Create</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="history" 
                  className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-600 font-medium rounded-lg text-xs sm:text-sm"
                >
                  <FileText className="h-4 w-4" />
                  <span className="hidden sm:inline">History</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="drivers" 
                  className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-600 font-medium rounded-lg text-xs sm:text-sm"
                >
                  <Users className="h-4 w-4" />
                  <span className="hidden sm:inline">Drivers</span>
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
