import { useState, useEffect } from 'react';
import { X, Package } from 'lucide-react';
import { LineItem, Product, Glass, Style, Colour, Accessory } from '../App';

interface AddItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: Omit<LineItem, 'id'>) => void;
  editingItem?: LineItem | null;
  products: Product[];
  glass: Glass[];
  styles: Style[];
  colours: Colour[];
  accessories: Accessory[];
}

export function AddItemModal({ isOpen, onClose, onSave, editingItem, products, glass, styles, colours, accessories }: AddItemModalProps) {
  const [formData, setFormData] = useState<Omit<LineItem, 'id'>>({
    type: 'window',
    width: 0,
    height: 0,
    quantity: 1,
    pricePerSqm: 0,
    description: '',
    colour: '',
    glass: '',
    style: '',
    accessories: '',
  });
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [basePrice, setBasePrice] = useState<number>(0); // Track base product price

  useEffect(() => {
    if (editingItem) {
      setFormData({
        type: editingItem.type,
        width: editingItem.width,
        height: editingItem.height,
        quantity: editingItem.quantity,
        pricePerSqm: editingItem.pricePerSqm,
        description: editingItem.description,
        colour: editingItem.colour || '',
        glass: editingItem.glass || '',
        style: editingItem.style || '',
        accessories: editingItem.accessories || '',
      });
      setSelectedProductId('');
    } else {
      setFormData({
        type: 'window',
        width: 0,
        height: 0,
        quantity: 1,
        pricePerSqm: 0,
        description: '',
        colour: '',
        glass: '',
        style: '',
        accessories: '',
      });
      setSelectedProductId('');
    }
  }, [editingItem, isOpen]);

  // Filter products by type - when type is 'accessories', show accessories instead
  const availableProducts = formData.type === 'accessories' 
    ? [] 
    : products.filter(p => p.type === formData.type);

  // Available accessories for the "Select Product" dropdown when type is 'accessories'
  const availableAccessoriesForProduct = formData.type === 'accessories' 
    ? accessories 
    : [];

  // Get colour options from the Colours section in Styles tab
  const colourOptions = colours.map(c => c.name);

  // Get glass options
  const glassOptions = glass.map(g => g.name);

  // Style options
  const styleOptions = styles.map(s => s.name);

  // Filter accessories by type - show accessories for the specific type or "Window & Door"
  const availableAccessories = accessories.filter(a => 
    a.category === 'Window & Door' || 
    (formData.type === 'window' && a.category === 'Window') ||
    (formData.type === 'door' && a.category === 'Door') ||
    (formData.type === 'balcony' && a.category === 'Balcony')
  );
  const accessoryOptions = availableAccessories.map(a => a.name);

  // Handle product selection
  const handleProductSelect = (productId: string) => {
    setSelectedProductId(productId);
    if (productId) {
      if (formData.type === 'accessories') {
        // Handle accessory selection
        const accessory = accessories.find(a => a.id === productId);
        if (accessory) {
          setFormData({
            ...formData,
            pricePerSqm: accessory.price,
            description: `${accessory.name} - ${accessory.type}`,
          });
        }
      } else {
        // Handle regular product selection
        const product = products.find(p => p.id === productId);
        if (product) {
          setFormData({
            ...formData,
            pricePerSqm: product.pricePerSqm,
            colour: product.color,
            description: `${product.name} - ${product.material}${formData.colour ? ', ' + formData.colour : ''}${formData.glass ? ', ' + formData.glass : ''}${formData.style ? ', ' + formData.style : ''}`,
          });
          setBasePrice(product.pricePerSqm); // Set base price
        }
      }
    }
  };

  // Update description when selections change
  const handleDescriptionChange = (newFormData: Partial<Omit<LineItem, 'id'>>) => {
    // Merge with existing formData
    const merged = { ...formData, ...newFormData };
    
    // Build description from selected options
    const parts: string[] = [];
    
    // Use base name if available
    if (selectedProductId && merged.type !== 'accessories') {
      const product = products.find(p => p.id === selectedProductId);
      if (product) {
        parts.push(product.name);
      }
    }
    
    if (merged.colour) parts.push(merged.colour);
    if (merged.glass) parts.push(merged.glass);
    if (merged.style) parts.push(merged.style);
    if (merged.accessories) parts.push(merged.accessories);
    
    // Calculate total price per sqm including glass and style
    let totalPrice = basePrice;
    
    // Add glass price if selected
    if (merged.glass) {
      const selectedGlass = glass.find(g => g.name === merged.glass);
      if (selectedGlass) {
        totalPrice += selectedGlass.pricePerSqm;
      }
    }
    
    // Add style price if selected
    if (merged.style) {
      const selectedStyle = styles.find(s => s.name === merged.style);
      if (selectedStyle) {
        totalPrice += selectedStyle.pricePerSqm;
      }
    }
    
    // Calculate accessory price (total, not per sqm)
    let accessoryPrice = 0;
    if (merged.accessories) {
      const selectedAccessory = accessories.find(a => a.name === merged.accessories);
      if (selectedAccessory) {
        accessoryPrice = selectedAccessory.price * merged.quantity;
      }
    }
    
    setFormData({
      ...merged,
      description: parts.join(', '),
      pricePerSqm: totalPrice,
      accessoryPrice: accessoryPrice,
    });
  };

  // Handle type change
  const handleTypeChange = (type: 'window' | 'door' | 'balcony' | 'accessories') => {
    setFormData({ ...formData, type });
    setSelectedProductId('');
  };

  const handleSave = () => {
    onSave(formData);
    onClose();
  };

  const calculateArea = () => {
    return ((formData.width * formData.height) / 1000000).toFixed(2);
  };

  const calculateTotal = () => {
    const area = (formData.width * formData.height) / 1000000; // Area in m²
    const priceForOne = area * formData.pricePerSqm; // Price for one item
    const areaTotal = priceForOne * formData.quantity; // Total for all items
    const accessoryTotal = formData.accessoryPrice || 0;
    return (areaTotal + accessoryTotal).toFixed(2);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-white/30 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6 rounded-t-xl flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/20 rounded-lg">
                <Package className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-white text-xl">
                  {editingItem ? 'Edit Item Configuration' : 'Add Item Configuration'}
                </h2>
                <p className="text-blue-100 text-sm">Configure product specifications and pricing</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Form - Scrollable */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-8 space-y-6">
            {/* Product Type */}
            <div>
              <label className="block text-gray-700 mb-3">Product Type</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleTypeChange('window')}
                  className={`px-4 py-3 rounded-lg border-2 transition-all ${
                    formData.type === 'window'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                  }`}
                >
                  🪟 Window
                </button>
                <button
                  type="button"
                  onClick={() => handleTypeChange('door')}
                  className={`px-4 py-3 rounded-lg border-2 transition-all ${
                    formData.type === 'door'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                  }`}
                >
                  🚪 Door
                </button>
                <button
                  type="button"
                  onClick={() => handleTypeChange('balcony')}
                  className={`px-4 py-3 rounded-lg border-2 transition-all ${
                    formData.type === 'balcony'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                  }`}
                >
                  🏢 Balcony
                </button>
                <button
                  type="button"
                  onClick={() => handleTypeChange('accessories')}
                  className={`px-4 py-3 rounded-lg border-2 transition-all ${
                    formData.type === 'accessories'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                  }`}
                >
                  🔧 Accessories
                </button>
              </div>
            </div>

            {/* Customization */}
            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
              <label className="block text-gray-700 mb-4">Product Customization</label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-600 text-sm mb-2">Select Product</label>
                  <select
                    value={selectedProductId}
                    onChange={(e) => handleProductSelect(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select a product</option>
                    {availableProducts.map(product => (
                      <option key={product.id} value={product.id}>
                        {product.name} - {product.material}, {product.color}
                      </option>
                    ))}
                    {availableAccessoriesForProduct.map(accessory => (
                      <option key={accessory.id} value={accessory.id}>
                        {accessory.name} - {accessory.type}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-gray-600 text-sm mb-2">Colour</label>
                  <select
                    value={formData.colour}
                    onChange={(e) => handleDescriptionChange({ colour: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select a colour</option>
                    {colourOptions.map((color, index) => (
                      <option key={`color-${index}-${color}`} value={color}>
                        {color}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-gray-600 text-sm mb-2">Glass</label>
                  <select
                    value={formData.glass}
                    onChange={(e) => handleDescriptionChange({ glass: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select glass type</option>
                    {glassOptions.map((glassType, index) => (
                      <option key={`glass-${index}-${glassType}`} value={glassType}>
                        {glassType}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-gray-600 text-sm mb-2">Style</label>
                  <select
                    value={formData.style}
                    onChange={(e) => handleDescriptionChange({ style: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select a style</option>
                    {styleOptions.map((style, index) => (
                      <option key={`style-${index}-${style}`} value={style}>
                        {style}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-gray-600 text-sm mb-2">Accessories</label>
                  <select
                    value={formData.accessories}
                    onChange={(e) => handleDescriptionChange({ accessories: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select accessories</option>
                    {accessoryOptions.map((accessory, index) => (
                      <option key={`accessory-${index}-${accessory}`} value={accessory}>
                        {accessory}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Dimensions */}
            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
              <label className="block text-gray-700 mb-4">Dimensions</label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-600 text-sm mb-2">Width (millimeters)</label>
                  <input
                    type="number"
                    value={formData.width || ''}
                    onChange={(e) => setFormData({ ...formData, width: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0"
                    step="1"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-gray-600 text-sm mb-2">Height (millimeters)</label>
                  <input
                    type="number"
                    value={formData.height || ''}
                    onChange={(e) => setFormData({ ...formData, height: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0"
                    step="1"
                    min="0"
                  />
                </div>
              </div>
              {formData.width > 0 && formData.height > 0 && (
                <div className="mt-4 px-4 py-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-blue-700">Calculated Area</span>
                    <span className="text-blue-900">{calculateArea()} m²</span>
                  </div>
                </div>
              )}
            </div>

            {/* Quantity and Price */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 mb-2">Quantity</label>
                <input
                  type="number"
                  value={formData.quantity || ''}
                  onChange={(e) => {
                    const newQuantity = parseInt(e.target.value) || 0;
                    // Recalculate accessory price when quantity changes
                    let accessoryPrice = formData.accessoryPrice || 0;
                    if (formData.accessories) {
                      const selectedAccessory = accessories.find(a => a.name === formData.accessories);
                      if (selectedAccessory) {
                        accessoryPrice = selectedAccessory.price * newQuantity;
                      }
                    }
                    setFormData({ ...formData, quantity: newQuantity, accessoryPrice });
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="1"
                  min="1"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Price per m²</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">SCR</span>
                  <input
                    type="number"
                    value={formData.pricePerSqm}
                    onChange={(e) => setFormData({ ...formData, pricePerSqm: parseFloat(e.target.value) || 0 })}
                    className="w-full pl-14 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                  />
                </div>
              </div>
            </div>

            {/* Total Calculation */}
            {formData.width > 0 && formData.height > 0 && formData.pricePerSqm > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 space-y-3">
                <div className="flex items-center justify-between text-gray-700">
                  <span>Sub-Total</span>
                  <span className="text-gray-900">SCR {(((formData.width * formData.height) / 1000000 * formData.pricePerSqm) * formData.quantity).toFixed(2)}</span>
                </div>
                {formData.accessoryPrice && formData.accessoryPrice > 0 && (
                  <div className="flex items-center justify-between text-gray-700">
                    <span>Accessories</span>
                    <span className="text-gray-900">SCR {formData.accessoryPrice.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex items-center justify-between border-t border-blue-200 pt-3">
                  <span className="text-blue-900">Line Total</span>
                  <span className="text-2xl text-blue-900">SCR {calculateTotal()}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-8 py-6 bg-gray-50 border-t rounded-b-xl flex-shrink-0">
          <button
            onClick={onClose}
            className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors text-gray-700"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Package className="w-5 h-5" />
            <span>{editingItem ? 'Update Item' : 'Add Item'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}