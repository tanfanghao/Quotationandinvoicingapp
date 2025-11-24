import { DocumentData, LineItem } from '../App';
import { Plus, Trash2, Edit2, ChevronDown, Save, FileText, User, Package2, Settings } from 'lucide-react';
import { AddItemModal } from './AddItemModal';
import { useState } from 'react';
import { Product, Customer, Glass, Style, Colour, Accessory } from '../App';
import * as api from '../utils/api';

interface DocumentFormProps {
  documentData: DocumentData;
  onDataChange: (data: DocumentData) => void;
  products: Product[];
  customers: Customer[];
  onCustomersChange: (customers: Customer[]) => void;
  glass: Glass[];
  styles: Style[];
  colours: Colour[];
  accessories: Accessory[];
}

export function DocumentForm({ documentData, onDataChange, products, customers, onCustomersChange, glass, styles, colours, accessories }: DocumentFormProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<LineItem | null>(null);
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [customerSearchTerm, setCustomerSearchTerm] = useState('');

  const updateCustomer = (field: keyof DocumentData['customer'], value: string) => {
    onDataChange({
      ...documentData,
      customer: {
        ...documentData.customer,
        [field]: value,
      },
    });
  };

  const handleCustomerSelect = (customer: Customer) => {
    onDataChange({
      ...documentData,
      customer: {
        ...customer,
      },
    });
    setShowCustomerDropdown(false);
  };

  const handleSaveNewCustomer = async () => {
    if (!documentData.customer.name.trim()) {
      alert('Please enter a customer name');
      return;
    }
    
    const newCustomer: Customer = {
      id: Date.now().toString(),
      name: documentData.customer.name,
      email: documentData.customer.email,
      phone: documentData.customer.phone,
      address: documentData.customer.address,
      totalOrders: 0,
      totalSpent: 0,
    };
    
    const success = await api.saveCustomer(newCustomer);
    if (success) {
      onCustomersChange([...customers, newCustomer]);
      
      // Update document data with the new customer ID
      onDataChange({
        ...documentData,
        customer: newCustomer,
      });
      
      alert('Customer saved successfully!');
    } else {
      alert('Failed to save customer. Please try again.');
    }
  };

  // Check if the current customer is new (not in the customers list)
  const isNewCustomer = documentData.customer.name.trim() !== '' && 
    !customers.find(c => c.id === documentData.customer.id);

  const handleAddItem = (itemData: Omit<LineItem, 'id'>) => {
    if (editingItem) {
      // Update existing item
      onDataChange({
        ...documentData,
        lineItems: documentData.lineItems.map(item =>
          item.id === editingItem.id ? { ...itemData, id: item.id } : item
        ),
      });
      setEditingItem(null);
    } else {
      // Add new item
      const newItem: LineItem = {
        ...itemData,
        id: Date.now().toString(),
      };
      onDataChange({
        ...documentData,
        lineItems: [...documentData.lineItems, newItem],
      });
    }
  };

  const handleEditItem = (item: LineItem) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const removeLineItem = (id: string) => {
    onDataChange({
      ...documentData,
      lineItems: documentData.lineItems.filter(item => item.id !== id),
    });
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

  return (
    <div className="space-y-6">
      {/* Document Details Section */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="bg-gradient-to-r from-slate-50 to-gray-50 px-6 py-4 border-b">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-gray-900">Document Details</h2>
              <p className="text-sm text-gray-600">Basic document information</p>
            </div>
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 mb-2">
                Document Number
              </label>
              <input
                type="text"
                value={documentData.documentNumber}
                onChange={(e) => onDataChange({ ...documentData, documentNumber: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                key={documentData.documentNumber}
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-2">
                Date
              </label>
              <input
                type="date"
                value={documentData.date}
                onChange={(e) => onDataChange({ ...documentData, date: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Customer Details Section */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="bg-gradient-to-r from-slate-50 to-gray-50 px-6 py-4 border-b">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <User className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h2 className="text-gray-900">Customer Details</h2>
              <p className="text-sm text-gray-600">Customer information and contact details</p>
            </div>
          </div>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            <div className="relative">
              <label className="block text-gray-700 mb-2">
                Customer Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={documentData.customer.name}
                  onChange={(e) => {
                    updateCustomer('name', e.target.value);
                    setShowCustomerDropdown(true);
                  }}
                  onFocus={() => setShowCustomerDropdown(true)}
                  onBlur={() => setTimeout(() => setShowCustomerDropdown(false), 200)}
                  className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Select a customer or type manually"
                />
                <button
                  type="button"
                  onClick={() => setShowCustomerDropdown(!showCustomerDropdown)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                >
                  <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${showCustomerDropdown ? 'rotate-180' : ''}`} />
                </button>
                
                {showCustomerDropdown && customers.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
                    {customers
                      .filter(customer => 
                        customer.name.toLowerCase().includes(documentData.customer.name.toLowerCase())
                      )
                      .map((customer) => (
                        <button
                          key={customer.id}
                          type="button"
                          onClick={() => handleCustomerSelect(customer)}
                          className="w-full px-4 py-3 text-left hover:bg-blue-50 transition-colors border-b border-gray-100 last:border-b-0"
                        >
                          <div className="text-gray-900">{customer.name}</div>
                          <div className="text-sm text-gray-500">{customer.email}</div>
                        </button>
                      ))}
                    {customers.filter(customer => 
                      customer.name.toLowerCase().includes(documentData.customer.name.toLowerCase())
                    ).length === 0 && (
                      <div className="px-4 py-3 text-sm text-gray-500">
                        No matching customers found
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={documentData.customer.email}
                  onChange={(e) => updateCustomer('email', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="customer@email.com"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">
                  Phone
                </label>
                <input
                  type="tel"
                  value={documentData.customer.phone}
                  onChange={(e) => updateCustomer('phone', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="+248 2714555"
                />
              </div>
            </div>
            <div>
              <label className="block text-gray-700 mb-2">
                Address
              </label>
              <textarea
                value={documentData.customer.address}
                onChange={(e) => updateCustomer('address', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter customer address"
                rows={2}
              />
            </div>
            {isNewCustomer && (
              <div className="flex gap-3 items-center bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex-1 flex items-center text-sm text-gray-700">
                  <span>💡 This customer is not saved yet. Click "Save Customer" to add to your database.</span>
                </div>
                <button
                  onClick={handleSaveNewCustomer}
                  className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-sm flex-shrink-0"
                >
                  <Save className="w-4 h-4" />
                  Save Customer
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Product Description Section */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="bg-gradient-to-r from-slate-50 to-gray-50 px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Package2 className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h2 className="text-gray-900">Product Description</h2>
                <p className="text-sm text-gray-600">Line items and product specifications</p>
              </div>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Add Item
            </button>
          </div>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {documentData.lineItems.map((item, index) => (
              <div key={item.id} className="bg-gradient-to-br from-slate-50 to-gray-50 border border-gray-200 rounded-xl p-5 hover:shadow-md transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="inline-flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-lg text-sm">
                        {index + 1}
                      </span>
                      <span className="inline-block px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-sm">
                        {item.type === 'window' ? '🪟 Window' : item.type === 'door' ? '🚪 Door' : item.type === 'balcony' ? '🏢 Balcony' : '🔧 Accessory'}
                      </span>
                      {item.description && (
                        <span className="text-gray-900">{item.description}</span>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-x-8 gap-y-3 bg-white rounded-lg p-4 border border-gray-200">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Dimensions:</span>
                        <span className="text-gray-900">{item.width.toFixed(2)}m × {item.height.toFixed(2)}m</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Area:</span>
                        <span className="text-gray-900">{(item.width * item.height).toFixed(2)} m²</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Quantity:</span>
                        <span className="text-gray-900">{item.quantity}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Price/m²:</span>
                        <span className="text-gray-900">${item.pricePerSqm.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => handleEditItem(item)}
                      className="p-2.5 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                      title="Edit item"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => removeLineItem(item.id)}
                      className="p-2.5 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                      title="Delete item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="pt-4 border-t border-gray-300">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Line Total:</span>
                    <span className="text-xl text-blue-600">${(item.width * item.height * item.quantity * item.pricePerSqm).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            ))}

            {documentData.lineItems.length === 0 && (
              <div className="text-center py-16 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50">
                <Package2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-gray-900 mb-2">No items added yet</h3>
                <p className="text-gray-600 mb-4">Click "Add Item" to get started</p>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Your First Item
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Additional Details Section */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="bg-gradient-to-r from-slate-50 to-gray-50 px-6 py-4 border-b">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Settings className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <h2 className="text-gray-900">Additional Details</h2>
              <p className="text-sm text-gray-600">Tax, discount, and notes</p>
            </div>
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-gray-700 mb-2">
                Tax Rate (%)
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={documentData.taxRate || ''}
                  onChange={(e) => onDataChange({ ...documentData, taxRate: parseFloat(e.target.value) || 0 })}
                  className="w-full px-4 py-3 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0"
                  step="0.1"
                  min="0"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">%</span>
              </div>
            </div>
            <div>
              <label className="block text-gray-700 mb-2">
                Discount ($)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="number"
                  value={documentData.discount || ''}
                  onChange={(e) => onDataChange({ ...documentData, discount: parseFloat(e.target.value) || 0 })}
                  className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                />
              </div>
            </div>
          </div>
          <div>
            <label className="block text-gray-700 mb-2">
              Notes
            </label>
            <textarea
              value={documentData.notes}
              onChange={(e) => onDataChange({ ...documentData, notes: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Additional notes or terms and conditions"
              rows={3}
            />
          </div>
        </div>
      </div>

      <AddItemModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleAddItem}
        editingItem={editingItem}
        products={products}
        glass={glass}
        styles={styles}
        colours={colours}
        accessories={accessories}
      />
    </div>
  );
}