
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { UserPlus, Edit, Trash2, Truck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Driver {
  id: string;
  name: string;
  truckNumber: string;
  licenseNumber: string;
  phone: string;
  email: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

const DriverManagement = () => {
  const { toast } = useToast();
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    truckNumber: '',
    licenseNumber: '',
    phone: '',
    email: '',
    status: 'active' as 'active' | 'inactive',
  });

  useEffect(() => {
    // Load drivers from localStorage or set default drivers
    const savedDrivers = localStorage.getItem('drivers');
    if (savedDrivers) {
      setDrivers(JSON.parse(savedDrivers));
    } else {
      const defaultDrivers: Driver[] = [
        {
          id: '1',
          name: 'John Smith',
          truckNumber: 'TRK-001',
          licenseNumber: 'CDL123456',
          phone: '(555) 123-4567',
          email: 'john.smith@email.com',
          status: 'active',
          createdAt: new Date().toISOString(),
        },
        {
          id: '2',
          name: 'Mike Johnson',
          truckNumber: 'TRK-002',
          licenseNumber: 'CDL789012',
          phone: '(555) 234-5678',
          email: 'mike.johnson@email.com',
          status: 'active',
          createdAt: new Date().toISOString(),
        },
        {
          id: '3',
          name: 'Sarah Davis',
          truckNumber: 'TRK-003',
          licenseNumber: 'CDL345678',
          phone: '(555) 345-6789',
          email: 'sarah.davis@email.com',
          status: 'active',
          createdAt: new Date().toISOString(),
        },
        {
          id: '4',
          name: 'Robert Wilson',
          truckNumber: 'TRK-004',
          licenseNumber: 'CDL901234',
          phone: '(555) 456-7890',
          email: 'robert.wilson@email.com',
          status: 'active',
          createdAt: new Date().toISOString(),
        },
        {
          id: '5',
          name: 'Lisa Anderson',
          truckNumber: 'TRK-005',
          licenseNumber: 'CDL567890',
          phone: '(555) 567-8901',
          email: 'lisa.anderson@email.com',
          status: 'active',
          createdAt: new Date().toISOString(),
        },
      ];
      setDrivers(defaultDrivers);
      localStorage.setItem('drivers', JSON.stringify(defaultDrivers));
    }
  }, []);

  const resetForm = () => {
    setFormData({
      name: '',
      truckNumber: '',
      licenseNumber: '',
      phone: '',
      email: '',
      status: 'active',
    });
    setEditingDriver(null);
  };

  const handleAdd = () => {
    resetForm();
    setDialogOpen(true);
  };

  const handleEdit = (driver: Driver) => {
    setFormData({
      name: driver.name,
      truckNumber: driver.truckNumber,
      licenseNumber: driver.licenseNumber,
      phone: driver.phone,
      email: driver.email,
      status: driver.status,
    });
    setEditingDriver(driver);
    setDialogOpen(true);
  };

  const handleDelete = (driverId: string) => {
    const updatedDrivers = drivers.filter(d => d.id !== driverId);
    setDrivers(updatedDrivers);
    localStorage.setItem('drivers', JSON.stringify(updatedDrivers));
    
    toast({
      title: "Driver Removed",
      description: "Driver has been successfully removed.",
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.truckNumber) {
      toast({
        title: "Missing Information",
        description: "Please fill in at least the name and truck number.",
        variant: "destructive",
      });
      return;
    }

    let updatedDrivers;
    
    if (editingDriver) {
      // Update existing driver
      updatedDrivers = drivers.map(d => 
        d.id === editingDriver.id 
          ? { ...d, ...formData }
          : d
      );
      toast({
        title: "Driver Updated",
        description: "Driver information has been successfully updated.",
      });
    } else {
      // Add new driver
      const newDriver: Driver = {
        id: Date.now().toString(),
        ...formData,
        createdAt: new Date().toISOString(),
      };
      updatedDrivers = [...drivers, newDriver];
      toast({
        title: "Driver Added",
        description: "New driver has been successfully added.",
      });
    }

    setDrivers(updatedDrivers);
    localStorage.setItem('drivers', JSON.stringify(updatedDrivers));
    setDialogOpen(false);
    resetForm();
  };

  const getStatusBadge = (status: string) => {
    return status === 'active' 
      ? <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>
      : <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">Inactive</Badge>;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-lg">Driver Management</CardTitle>
              <CardDescription>Manage your drivers and truck assignments</CardDescription>
            </div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={handleAdd} className="bg-blue-600 hover:bg-blue-700">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add Driver
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingDriver ? 'Edit Driver' : 'Add New Driver'}
                  </DialogTitle>
                  <DialogDescription>
                    {editingDriver 
                      ? 'Update driver information and truck assignment'
                      : 'Add a new driver to your fleet'
                    }
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Full Name *</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="John Doe"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="truckNumber">Truck Number *</Label>
                        <div className="relative">
                          <Truck className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="truckNumber"
                            value={formData.truckNumber}
                            onChange={(e) => setFormData(prev => ({ ...prev, truckNumber: e.target.value }))}
                            placeholder="TRK-001"
                            className="pl-10"
                            required
                          />
                        </div>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="licenseNumber">CDL License Number</Label>
                      <Input
                        id="licenseNumber"
                        value={formData.licenseNumber}
                        onChange={(e) => setFormData(prev => ({ ...prev, licenseNumber: e.target.value }))}
                        placeholder="CDL123456789"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                          placeholder="(555) 123-4567"
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                          placeholder="driver@email.com"
                        />
                      </div>
                    </div>
                  </div>
                  <DialogFooter className="mt-6">
                    <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">
                      {editingDriver ? 'Update Driver' : 'Add Driver'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Truck Number</TableHead>
                  <TableHead>CDL License</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Added</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {drivers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No drivers found. Add your first driver to get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  drivers.map((driver) => (
                    <TableRow key={driver.id}>
                      <TableCell className="font-medium">{driver.name}</TableCell>
                      <TableCell>{driver.truckNumber}</TableCell>
                      <TableCell>{driver.licenseNumber}</TableCell>
                      <TableCell>{driver.phone}</TableCell>
                      <TableCell>{driver.email}</TableCell>
                      <TableCell>{getStatusBadge(driver.status)}</TableCell>
                      <TableCell>{formatDate(driver.createdAt)}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(driver)}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(driver.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-3 w-3" />
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
    </div>
  );
};

export default DriverManagement;
