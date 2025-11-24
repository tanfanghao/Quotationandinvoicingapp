import { useState } from 'react';
import { Plus, Edit2, Trash2, Search, Package, Wine, Wrench } from 'lucide-react';
import { Product, Glass, Accessory } from '../App';
import * as api from '../utils/api';

interface ProductsProps {
  products: Product[];
  onProductsChange: (products: Product[]) => void;
  glass: Glass[];
  onGlassChange: (glass: Glass[]) => void;
  accessories: Accessory[];
  onAccessoriesChange: (accessories: Accessory[]) => void;
}

type ProductSection = 'aluminum' | 'glass' | 'accessories';

export function Products({ products, onProductsChange, glass, onGlassChange, accessories, onAccessoriesChange }: ProductsProps) {
  const [activeSection, setActiveSection] = useState<ProductSection>('aluminum');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingGlass, setEditingGlass] = useState<Glass | null>(null);
  const [editingAccessory, setEditingAccessory] = useState<Accessory | null>(null);
  const [formData, setFormData] = useState<Omit<Product, 'id'>>({
    name: '',
    type: 'window',
    pricePerSqm: 0,
  });
  const [glassFormData, setGlassFormData] = useState<Omit<Glass, 'id'>>({
    name: '',
    type: '',
    thickness: 0,
    pricePerSqm: 0,
  });
  const [accessoryFormData, setAccessoryFormData] = useState<Omit<Accessory, 'id'>>({
    name: '',
    type: '',
    price: 0,
    category: 'Both',
  });

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.material.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredGlass = glass.filter((g) =>
    g.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    g.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    g.specifications.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredAccessories = accessories.filter((a) =>
    a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.specifications.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddProduct = async () => {
    const newProduct: Product = {
      ...formData,
      id: Date.now().toString(),
    };
    const success = await api.saveProduct(newProduct);
    if (success) {
      onProductsChange([...products, newProduct]);
      setShowAddForm(false);
      resetForm();
    } else {
      alert('Failed to save product. Please try again.');
    }
  };

  const handleUpdateProduct = async () => {
    if (editingProduct) {
      const updatedProduct = { ...formData, id: editingProduct.id };
      const success = await api.saveProduct(updatedProduct);
      if (success) {
        onProductsChange(products.map(p => p.id === editingProduct.id ? updatedProduct : p));
        setEditingProduct(null);
        resetForm();
        setShowAddForm(false);
      } else {
        alert('Failed to update product. Please try again.');
      }
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      const success = await api.deleteProduct(id);
      if (success) {
        onProductsChange(products.filter(p => p.id !== id));
      } else {
        alert('Failed to delete product. Please try again.');
      }
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      type: product.type,
      pricePerSqm: product.pricePerSqm,
      description: product.description,
      material: product.material,
      color: product.color,
    });
    setShowAddForm(true);
  };

  const handleAddGlass = async () => {
    const newGlass: Glass = {
      ...glassFormData,
      id: Date.now().toString(),
    };
    const success = await api.saveGlass(newGlass);
    if (success) {
      onGlassChange([...glass, newGlass]);
      setShowAddForm(false);
      resetGlassForm();
    } else {
      alert('Failed to save glass. Please try again.');
    }
  };

  const handleUpdateGlass = async () => {
    if (editingGlass) {
      const updatedGlass = { ...glassFormData, id: editingGlass.id };
      const success = await api.saveGlass(updatedGlass);
      if (success) {
        onGlassChange(glass.map(g => g.id === editingGlass.id ? updatedGlass : g));
        setEditingGlass(null);
        resetGlassForm();
        setShowAddForm(false);
      } else {
        alert('Failed to update glass. Please try again.');
      }
    }
  };

  const handleDeleteGlass = async (id: string) => {
    if (confirm('Are you sure you want to delete this glass?')) {
      const success = await api.deleteGlass(id);
      if (success) {
        onGlassChange(glass.filter(g => g.id !== id));
      } else {
        alert('Failed to delete glass. Please try again.');
      }
    }
  };

  const handleEditGlass = (g: Glass) => {
    setEditingGlass(g);
    setGlassFormData({
      name: g.name,
      type: g.type,
      thickness: g.thickness,
      pricePerSqm: g.pricePerSqm,
    });
    setShowAddForm(true);
  };

  const handleAddAccessory = async () => {
    const newAccessory: Accessory = {
      ...accessoryFormData,
      id: Date.now().toString(),
    };
    const success = await api.saveAccessory(newAccessory);
    if (success) {
      onAccessoriesChange([...accessories, newAccessory]);
      setShowAddForm(false);
      resetAccessoryForm();
    } else {
      alert('Failed to save accessory. Please try again.');
    }
  };

  const handleUpdateAccessory = async () => {
    if (editingAccessory) {
      const updatedAccessory = { ...accessoryFormData, id: editingAccessory.id };
      const success = await api.saveAccessory(updatedAccessory);
      if (success) {
        onAccessoriesChange(accessories.map(a => a.id === editingAccessory.id ? updatedAccessory : a));
        setEditingAccessory(null);
        resetAccessoryForm();
        setShowAddForm(false);
      } else {
        alert('Failed to update accessory. Please try again.');
      }
    }
  };

  const handleDeleteAccessory = async (id: string) => {
    if (confirm('Are you sure you want to delete this accessory?')) {
      const success = await api.deleteAccessory(id);
      if (success) {
        onAccessoriesChange(accessories.filter(a => a.id !== id));
      } else {
        alert('Failed to delete accessory. Please try again.');
      }
    }
  };

  const handleEditAccessory = (a: Accessory) => {
    setEditingAccessory(a);
    setAccessoryFormData({
      name: a.name,
      type: a.type,
      price: a.price,
      description: a.description,
      specifications: a.specifications,
      category: a.category,
    });
    setShowAddForm(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'window',
      pricePerSqm: 0,
    });
  };

  const resetGlassForm = () => {
    setGlassFormData({
      name: '',
      type: '',
      thickness: 0,
      pricePerSqm: 0,
    });
  };

  const resetAccessoryForm = () => {
    setAccessoryFormData({
      name: '',
      type: '',
      price: 0,
      category: 'Both',
    });
  };

  const handleCancel = () => {
    setShowAddForm(false);
    setEditingProduct(null);
    setEditingGlass(null);
    setEditingAccessory(null);
    resetForm();
    resetGlassForm();
    resetAccessoryForm();
  };

  const handleSectionChange = (section: ProductSection) => {
    setActiveSection(section);
    setShowAddForm(false);
    setEditingProduct(null);
    setEditingGlass(null);
    setEditingAccessory(null);
    resetForm();
    resetGlassForm();
    resetAccessoryForm();
    setSearchTerm('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-gray-900">Products</h2>
          <p className="text-gray-600 mt-1">
            {activeSection === 'aluminum' 
              ? 'Manage your aluminum windows and doors catalog'
              : activeSection === 'glass'
                ? 'Manage your glass products catalog'
                : 'Manage your accessories catalog'
            }
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          {activeSection === 'aluminum' ? 'Add Product' : activeSection === 'glass' ? 'Add Glass' : 'Add Accessory'}
        </button>
      </div>

      {/* Section Navigation */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="flex border-b">
          <button
            onClick={() => handleSectionChange('aluminum')}
            className={`flex items-center gap-2 px-6 py-4 transition-all border-b-2 ${
              activeSection === 'aluminum'
                ? 'border-blue-500 text-blue-600 bg-blue-50/50'
                : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <Package className="w-5 h-5" />
            <span>Aluminum Products</span>
            <span className="ml-2 px-2 py-0.5 bg-gray-100 text-gray-700 rounded-full text-sm">
              {products.length}
            </span>
          </button>
          <button
            onClick={() => handleSectionChange('glass')}
            className={`flex items-center gap-2 px-6 py-4 transition-all border-b-2 ${
              activeSection === 'glass'
                ? 'border-blue-500 text-blue-600 bg-blue-50/50'
                : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <Wine className="w-5 h-5" />
            <span>Glass</span>
            <span className="ml-2 px-2 py-0.5 bg-gray-100 text-gray-700 rounded-full text-sm">
              {glass.length}
            </span>
          </button>
          <button
            onClick={() => handleSectionChange('accessories')}
            className={`flex items-center gap-2 px-6 py-4 transition-all border-b-2 ${
              activeSection === 'accessories'
                ? 'border-blue-500 text-blue-600 bg-blue-50/50'
                : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <Wrench className="w-5 h-5" />
            <span>Accessories</span>
            <span className="ml-2 px-2 py-0.5 bg-gray-100 text-gray-700 rounded-full text-sm">
              {accessories.length}
            </span>
          </button>
        </div>
      </div>

      {/* Aluminum Products Section */}
      {activeSection === 'aluminum' && (
        <>
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search aluminum products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Add/Edit Form */}
          {showAddForm && (
            <div className="bg-white rounded-lg shadow-sm border p-6 space-y-4">
              <h3 className="text-gray-900">{editingProduct ? 'Edit Product' : 'Add New Product'}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 mb-2">Product Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Standard Sliding Window"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as 'window' | 'door' | 'balcony' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="window">Window</option>
                    <option value="door">Door</option>
                    <option value="balcony">Balcony</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">Price per m²</label>
                  <input
                    type="number"
                    value={formData.pricePerSqm || ''}
                    onChange={(e) => setFormData({ ...formData, pricePerSqm: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.00"
                    step="0.01"
                    min="0"
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
                  onClick={editingProduct ? handleUpdateProduct : handleAddProduct}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingProduct ? 'Update Product' : 'Add Product'}
                </button>
              </div>
            </div>
          )}

          {/* Products Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <div key={product.id} className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-gray-900 mb-1">{product.name}</h3>
                    <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm">
                      {product.type === 'window' ? 'Window' : product.type === 'door' ? 'Door' : 'Balcony'}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(product)}
                      className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(product.id)}
                      className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <p className="text-gray-600 text-sm mb-4">{product.description}</p>
                <div className="space-y-2 text-sm">
                  
                  
                  <div className="flex justify-between pt-2 border-t">
                    <span className="text-gray-600">Price per m²:</span>
                    <span className="text-blue-600">${product.pricePerSqm.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-12 bg-white rounded-lg border">
              <p className="text-gray-500">No products found. Add your first product to get started.</p>
            </div>
          )}
        </>
      )}

      {/* Glass Section */}
      {activeSection === 'glass' && (
        <>
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search glass products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Add/Edit Glass Form */}
          {showAddForm && (
            <div className="bg-white rounded-lg shadow-sm border p-6 space-y-4">
              <h3 className="text-gray-900">{editingGlass ? 'Edit Glass' : 'Add New Glass'}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 mb-2">Glass Name</label>
                  <input
                    type="text"
                    value={glassFormData.name}
                    onChange={(e) => setGlassFormData({ ...glassFormData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Tempered Clear Glass"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">Type</label>
                  <input
                    type="text"
                    value={glassFormData.type}
                    onChange={(e) => setGlassFormData({ ...glassFormData, type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Tempered, Laminated, Insulated"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">Thickness (mm)</label>
                  <input
                    type="number"
                    value={glassFormData.thickness || ''}
                    onChange={(e) => setGlassFormData({ ...glassFormData, thickness: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0"
                    step="0.1"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">Price per m²</label>
                  <input
                    type="number"
                    value={glassFormData.pricePerSqm || ''}
                    onChange={(e) => setGlassFormData({ ...glassFormData, pricePerSqm: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.00"
                    step="0.01"
                    min="0"
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
                  onClick={editingGlass ? handleUpdateGlass : handleAddGlass}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingGlass ? 'Update Glass' : 'Add Glass'}
                </button>
              </div>
            </div>
          )}

          {/* Glass Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGlass.map((g) => (
              <div key={g.id} className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-gray-900 mb-1">{g.name}</h3>
                    <span className="inline-block px-2 py-1 bg-teal-100 text-teal-700 rounded text-sm">
                      {g.type}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditGlass(g)}
                      className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteGlass(g.id)}
                      className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <p className="text-gray-600 text-sm mb-4">{g.description}</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Thickness:</span>
                    <span className="text-gray-900">{g.thickness} mm</span>
                  </div>
                  
                  <div className="flex justify-between pt-2 border-t">
                    <span className="text-gray-600">Price per m²:</span>
                    <span className="text-teal-600">${g.pricePerSqm.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredGlass.length === 0 && (
            <div className="text-center py-12 bg-white rounded-lg border">
              <p className="text-gray-500">No glass products found. Add your first glass product to get started.</p>
            </div>
          )}
        </>
      )}

      {/* Accessories Section */}
      {activeSection === 'accessories' && (
        <>
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search accessories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Add/Edit Accessory Form */}
          {showAddForm && (
            <div className="bg-white rounded-lg shadow-sm border p-6 space-y-4">
              <h3 className="text-gray-900">{editingAccessory ? 'Edit Accessory' : 'Add New Accessory'}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 mb-2">Accessory Name</label>
                  <input
                    type="text"
                    value={accessoryFormData.name}
                    onChange={(e) => setAccessoryFormData({ ...accessoryFormData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Lock"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">Type</label>
                  <input
                    type="text"
                    value={accessoryFormData.type}
                    onChange={(e) => setAccessoryFormData({ ...accessoryFormData, type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Lock, Handle, Hinge"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">Category</label>
                  <select
                    value={accessoryFormData.category}
                    onChange={(e) => setAccessoryFormData({ ...accessoryFormData, category: e.target.value as 'Window' | 'Door' | 'Balcony' | 'Window & Door' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="Window">Window</option>
                    <option value="Door">Door</option>
                    <option value="Balcony">Balcony</option>
                    <option value="Window & Door">Window & Door</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">Price</label>
                  <input
                    type="number"
                    value={accessoryFormData.price || ''}
                    onChange={(e) => setAccessoryFormData({ ...accessoryFormData, price: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.00"
                    step="0.01"
                    min="0"
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
                  onClick={editingAccessory ? handleUpdateAccessory : handleAddAccessory}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingAccessory ? 'Update Accessory' : 'Add Accessory'}
                </button>
              </div>
            </div>
          )}

          {/* Accessories Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAccessories.map((a) => (
              <div key={a.id} className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-gray-900 mb-1">{a.name}</h3>
                    <span className="inline-block px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm">
                      {a.type}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditAccessory(a)}
                      className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteAccessory(a.id)}
                      className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <p className="text-gray-600 text-sm mb-4">{a.description}</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Category:</span>
                    <span className="text-gray-900">{a.category}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t">
                    <span className="text-gray-600">Price:</span>
                    <span className="text-gray-900">${a.price.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredAccessories.length === 0 && (
            <div className="text-center py-12 bg-white rounded-lg border">
              <p className="text-gray-500">No accessories found. Add your first accessory to get started.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}