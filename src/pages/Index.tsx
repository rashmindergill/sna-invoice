
import React, { useState } from 'react';
import { Truck, FileText, Users, DollarSign, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import InvoiceForm from '@/components/InvoiceForm';
import InvoiceHistory from '@/components/InvoiceHistory';
import DriverManagement from '@/components/DriverManagement';

const Index = () => {
  const [activeTab, setActiveTab] = useState('create');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 rounded-lg p-2">
                <Truck className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Haul-It Invoice Pro</h1>
                <p className="text-sm text-gray-500">Professional trucking invoice management</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">+2 from last week</p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Payment</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$8,450</div>
              <p className="text-xs text-muted-foreground">3 outstanding invoices</p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Drivers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">5</div>
              <p className="text-xs text-muted-foreground">All available</p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Month</CardTitle>
              <Truck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$24,850</div>
              <p className="text-xs text-muted-foreground">+12% from last month</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Interface */}
        <Card className="bg-white shadow-sm">
          <CardHeader>
            <CardTitle>Invoice Management</CardTitle>
            <CardDescription>
              Create new invoices, track payments, and manage your trucking business
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="create" className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Create Invoice
                </TabsTrigger>
                <TabsTrigger value="history" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Invoice History
                </TabsTrigger>
                <TabsTrigger value="drivers" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Drivers
                </TabsTrigger>
              </TabsList>

              <TabsContent value="create" className="mt-6">
                <InvoiceForm />
              </TabsContent>

              <TabsContent value="history" className="mt-6">
                <InvoiceHistory />
              </TabsContent>

              <TabsContent value="drivers" className="mt-6">
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
