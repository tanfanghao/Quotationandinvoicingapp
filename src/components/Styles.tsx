import { useState } from 'react';
import { Plus, Edit2, Trash2, Search, Palette, Pipette } from 'lucide-react';
import { Style, Colour } from '../App';
import * as api from '../utils/api';

interface StylesProps {
  styles: Style[];
  onStylesChange: (styles: Style[]) => void;
  colours: Colour[];
  onColoursChange: (colours: Colour[]) => void;
}

type StyleSection = 'styles' | 'colours';

export function Styles({ styles, onStylesChange, colours, onColoursChange }: StylesProps) {
  const [activeSection, setActiveSection] = useState<StyleSection>('styles');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingStyle, setEditingStyle] = useState<Style | null>(null);
  const [editingColour, setEditingColour] = useState<Colour | null>(null);
  const [formData, setFormData] = useState<Omit<Style, 'id'>>({
    name: '',
    description: '',
    category: 'Window',
    pricePerSqm: 0,
  });
  const [colourFormData, setColourFormData] = useState<Omit<Colour, 'id'>>({
    name: '',
    description: '',
    hexCode: '#000000',
    pricePerSqm: 0,
  });

  const filteredStyles = styles.filter((style) =>
    style.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    style.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    style.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredColours = colours.filter((colour) =>
    colour.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    colour.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    colour.hexCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSectionChange = (section: StyleSection) => {
    setActiveSection(section);
    setShowAddForm(false);
    setEditingStyle(null);
    setEditingColour(null);
    setFormData({ name: '', description: '', category: 'Window', pricePerSqm: 0 });
    setColourFormData({ name: '', description: '', hexCode: '#000000', pricePerSqm: 0 });
    setSearchTerm('');
  };

  // Style handlers
  const handleAddStyle = async () => {
    if (!formData.name || !formData.category) {
      alert('Please fill in all required fields');
      return;
    }

    const newStyle: Style = {
      id: Date.now().toString(),
      ...formData,
    };

    const success = await api.saveStyle(newStyle);
    if (!success) {
      alert('Failed to save style. Please try again.');
      return;
    }

    onStylesChange([...styles, newStyle]);
    setFormData({ name: '', description: '', category: 'Window', pricePerSqm: 0 });
    setShowAddForm(false);
  };

  const handleEditStyle = async () => {
    if (!editingStyle || !formData.name || !formData.category) {
      alert('Please fill in all required fields');
      return;
    }

    const updatedStyle: Style = {
      id: editingStyle.id,
      ...formData,
    };

    const success = await api.saveStyle(updatedStyle);
    if (!success) {
      alert('Failed to update style. Please try again.');
      return;
    }

    onStylesChange(styles.map(s => s.id === editingStyle.id ? updatedStyle : s));
    setFormData({ name: '', description: '', category: 'Window', pricePerSqm: 0 });
    setEditingStyle(null);
    setShowAddForm(false);
  };

  const handleDeleteStyle = async (id: string) => {
    if (!confirm('Are you sure you want to delete this style?')) return;

    const success = await api.deleteStyle(id);
    if (!success) {
      alert('Failed to delete style. Please try again.');
      return;
    }

    onStylesChange(styles.filter(s => s.id !== id));
  };

  const startEditStyle = (style: Style) => {
    setEditingStyle(style);
    setFormData({
      name: style.name,
      description: style.description,
      category: style.category,
      pricePerSqm: style.pricePerSqm,
    });
    setShowAddForm(true);
  };

  // Colour handlers
  const handleAddColour = async () => {
    if (!colourFormData.name) {
      alert('Please fill in all required fields');
      return;
    }

    const newColour: Colour = {
      id: Date.now().toString(),
      ...colourFormData,
    };

    const success = await api.saveColour(newColour);
    if (!success) {
      alert('Failed to save colour. Please try again.');
      return;
    }

    onColoursChange([...colours, newColour]);
    setColourFormData({ name: '', description: '', hexCode: '#000000', pricePerSqm: 0 });
    setShowAddForm(false);
  };

  const handleEditColour = async () => {
    if (!editingColour || !colourFormData.name) {
      alert('Please fill in all required fields');
      return;
    }

    const updatedColour: Colour = {
      id: editingColour.id,
      ...colourFormData,
    };

    const success = await api.saveColour(updatedColour);
    if (!success) {
      alert('Failed to update colour. Please try again.');
      return;
    }

    onColoursChange(colours.map(c => c.id === editingColour.id ? updatedColour : c));
    setColourFormData({ name: '', description: '', hexCode: '#000000', pricePerSqm: 0 });
    setEditingColour(null);
    setShowAddForm(false);
  };

  const handleDeleteColour = async (id: string) => {
    if (!confirm('Are you sure you want to delete this colour?')) return;

    const success = await api.deleteColour(id);
    if (!success) {
      alert('Failed to delete colour. Please try again.');
      return;
    }

    onColoursChange(colours.filter(c => c.id !== id));
  };

  const startEditColour = (colour: Colour) => {
    setEditingColour(colour);
    setColourFormData({
      name: colour.name,
      description: colour.description,
      hexCode: colour.hexCode,
      pricePerSqm: colour.pricePerSqm,
    });
    setShowAddForm(true);
  };

  const handleCancel = () => {
    setShowAddForm(false);
    setEditingStyle(null);
    setEditingColour(null);
    setFormData({ name: '', description: '', category: 'Window', pricePerSqm: 0 });
    setColourFormData({ name: '', description: '', hexCode: '#000000', pricePerSqm: 0 });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-gray-900">Style & Colour Management</h2>
          <p className="text-gray-600 mt-1">
            {activeSection === 'styles' 
              ? 'Manage window and door style options'
              : 'Manage colour options for aluminum frames'
            }
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          {activeSection === 'styles' ? 'Add Style' : 'Add Colour'}
        </button>
      </div>

      {/* Section Navigation */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="flex border-b">
          <button
            onClick={() => handleSectionChange('styles')}
            className={`flex items-center gap-2 px-6 py-4 transition-all border-b-2 ${
              activeSection === 'styles'
                ? 'border-blue-500 text-blue-600 bg-blue-50/50'
                : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <Palette className="w-5 h-5" />
            <span>Styles</span>
            <span className="ml-2 px-2 py-0.5 bg-gray-100 text-gray-700 rounded-full text-sm">
              {styles.length}
            </span>
          </button>
          <button
            onClick={() => handleSectionChange('colours')}
            className={`flex items-center gap-2 px-6 py-4 transition-all border-b-2 ${
              activeSection === 'colours'
                ? 'border-blue-500 text-blue-600 bg-blue-50/50'
                : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <Pipette className="w-5 h-5" />
            <span>Colours</span>
            <span className="ml-2 px-2 py-0.5 bg-gray-100 text-gray-700 rounded-full text-sm">
              {colours.length}
            </span>
          </button>
        </div>
      </div>

      {/* Styles Section */}
      {activeSection === 'styles' && (
        <>
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search styles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Summary */}
          <div className="bg-gray-50 border rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-gray-600 text-sm">Total Styles</p>
                <p className="text-gray-900 text-xl">{styles.length}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Window Styles</p>
                <p className="text-gray-900 text-xl">
                  {styles.filter(s => s.category === 'Window' || s.category === 'Both').length}
                </p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Door Styles</p>
                <p className="text-gray-900 text-xl">
                  {styles.filter(s => s.category === 'Door' || s.category === 'Both').length}
                </p>
              </div>
            </div>
          </div>

          {/* Add/Edit Form */}
          {showAddForm && (
            <div className="bg-white border rounded-lg shadow-sm p-6">
              <h3 className="text-gray-900 mb-4">
                {editingStyle ? 'Edit Style' : 'Add New Style'}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 mb-2">Style Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Sliding, Casement, Awning"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="Window">Window</option>
                    <option value="Door">Door</option>
                    <option value="Both">Both</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-gray-700 mb-2">Price per Sqm</label>
                  <input
                    type="number"
                    value={formData.pricePerSqm || ''}
                    onChange={(e) => setFormData({ ...formData, pricePerSqm: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={editingStyle ? handleEditStyle : handleAddStyle}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingStyle ? 'Update Style' : 'Add Style'}
                </button>
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Styles Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredStyles.length === 0 ? (
              <div className="col-span-full text-center py-12 bg-white rounded-lg border border-gray-200">
                <Palette className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">No styles found</p>
                <p className="text-gray-500 text-sm mt-1">
                  {searchTerm ? 'Try a different search term' : 'Add your first style to get started'}
                </p>
              </div>
            ) : (
              filteredStyles.map((style) => (
                <div
                  key={style.id}
                  className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-gray-900">{style.name}</h3>
                      <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm mt-2">
                        {style.category}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => startEditStyle(style)}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteStyle(style.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  {style.description && (
                    <p className="text-gray-600 text-sm mb-2">{style.description}</p>
                  )}
                  <div className="mt-3 pt-3 border-t">
                    <p className="text-gray-600 text-sm">Price per Sqm</p>
                    <p className="text-gray-900">${style.pricePerSqm.toFixed(2)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}

      {/* Colours Section */}
      {activeSection === 'colours' && (
        <>
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search colours..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Summary */}
          <div className="bg-gray-50 border rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-gray-600 text-sm">Total Colours</p>
                <p className="text-gray-900 text-xl">{colours.length}</p>
              </div>
              <div>
              </div>
            </div>
          </div>

          {/* Add/Edit Form */}
          {showAddForm && (
            <div className="bg-white border rounded-lg shadow-sm p-6">
              <h3 className="text-gray-900 mb-4">
                {editingColour ? 'Edit Colour' : 'Add New Colour'}
              </h3>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-gray-700 mb-2">Colour Name *</label>
                  <input
                    type="text"
                    value={colourFormData.name}
                    onChange={(e) => setColourFormData({ ...colourFormData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Matt Black, White, Bronze"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={editingColour ? handleEditColour : handleAddColour}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingColour ? 'Update Colour' : 'Add Colour'}
                </button>
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Colours Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredColours.length === 0 ? (
              <div className="col-span-full text-center py-12 bg-white rounded-lg border border-gray-200">
                <Pipette className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">No colours found</p>
                <p className="text-gray-500 text-sm mt-1">
                  {searchTerm ? 'Try a different search term' : 'Add your first colour to get started'}
                </p>
              </div>
            ) : (
              filteredColours.map((colour) => (
                <div
                  key={colour.id}
                  className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 flex items-center gap-3">
                      <div>
                        <h3 className="text-gray-900">{colour.name}</h3>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => startEditColour(colour)}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteColour(colour.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  {colour.description && (
                    <p className="text-gray-600 text-sm mb-2">{colour.description}</p>
                  )}
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}