import { useState } from 'react';
import { Plus, Edit2, Trash2, Search, Mail, Phone, MapPin } from 'lucide-react';
import { Customer } from '../App';
import * as api from '../utils/api';

interface CustomersProps {
  customers: Customer[];
  onCustomersChange: (customers: Customer[]) => void;
}

export function Customers({ customers, onCustomersChange }: CustomersProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [formData, setFormData] = useState<Omit<Customer, 'id' | 'totalOrders' | 'totalSpent'>>({
    name: '',
    email: '',
    phone: '',
    address: '',
  });

  const filteredCustomers = customers.filter((customer) =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone.includes(searchTerm)
  );

  const handleAddCustomer = async () => {
    const newCustomer: Customer = {
      ...formData,
      id: Date.now().toString(),
      totalOrders: 0,
      totalSpent: 0,
    };
    const success = await api.saveCustomer(newCustomer);
    if (success) {
      onCustomersChange([...customers, newCustomer]);
      setShowAddForm(false);
      resetForm();
    } else {
      alert('Failed to save customer. Please try again.');
    }
  };

  const handleUpdateCustomer = async () => {
    if (editingCustomer) {
      const updatedCustomer = { 
        ...formData, 
        id: editingCustomer.id, 
        totalOrders: editingCustomer.totalOrders, 
        totalSpent: editingCustomer.totalSpent 
      };
      const success = await api.saveCustomer(updatedCustomer);
      if (success) {
        onCustomersChange(customers.map(c => c.id === editingCustomer.id ? updatedCustomer : c));
        setEditingCustomer(null);
        resetForm();
        setShowAddForm(false);
      } else {
        alert('Failed to update customer. Please try again.');
      }
    }
  };

  const handleDeleteCustomer = async (id: string) => {
    if (confirm('Are you sure you want to delete this customer?')) {
      const success = await api.deleteCustomer(id);
      if (success) {
        onCustomersChange(customers.filter(c => c.id !== id));
      } else {
        alert('Failed to delete customer. Please try again.');
      }
    }
  };

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setFormData({
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      address: customer.address,
    });
    setShowAddForm(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      address: '',
    });
  };

  const handleCancel = () => {
    setShowAddForm(false);
    setEditingCustomer(null);
    resetForm();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-gray-900">Customers</h2>
          <p className="text-gray-600 mt-1">Manage your customer database</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Customer
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search customers..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="bg-white rounded-lg shadow-sm border p-6 space-y-4">
          <h3 className="text-gray-900">{editingCustomer ? 'Edit Customer' : 'Add New Customer'}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-gray-700 mb-2">Customer Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., John Smith"
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="customer@email.com"
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-2">Phone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="+248 2714555"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-gray-700 mb-2">Address</label>
              <textarea
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Customer address..."
                rows={2}
              />
            </div>
          </div>
          <div className="flex gap-3 justify-end">
            <button
              onClick={handleCancel}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={editingCustomer ? handleUpdateCustomer : handleAddCustomer}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {editingCustomer ? 'Update Customer' : 'Add Customer'}
            </button>
          </div>
        </div>
      )}

      {/* Customers Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-gray-700">Customer</th>
              <th className="px-6 py-3 text-left text-gray-700">Contact</th>
              <th className="px-6 py-3 text-left text-gray-700">Address</th>
              <th className="px-6 py-3 text-right text-gray-700">Orders</th>
              <th className="px-6 py-3 text-right text-gray-700">Total Spent</th>
              <th className="px-6 py-3 text-right text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCustomers.map((customer) => (
              <tr key={customer.id} className="border-b hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="text-gray-900">{customer.name}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Mail className="w-3 h-3" />
                      {customer.email}
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Phone className="w-3 h-3" />
                      {customer.phone}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-start gap-2 text-sm text-gray-600">
                    <MapPin className="w-3 h-3 mt-1 flex-shrink-0" />
                    <span>{customer.address}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-right text-gray-900">
                  {customer.totalOrders}
                </td>
                <td className="px-6 py-4 text-right text-gray-900">
                  SCR {customer.totalSpent.toLocaleString()}
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={() => handleEdit(customer)}
                      className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteCustomer(customer.id)}
                      className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredCustomers.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg border">
          <p className="text-gray-500">No customers found. Add your first customer to get started.</p>
        </div>
      )}
    </div>
  );
}