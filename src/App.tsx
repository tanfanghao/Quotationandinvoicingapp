import { useState, useEffect } from 'react';
import { DocumentForm } from './components/DocumentForm';
import { DocumentPreview } from './components/DocumentPreview';
import { Dashboard } from './components/Dashboard';
import { Products } from './components/Products';
import { Customers } from './components/Customers';
import { Documents } from './components/Documents';
import { Styles } from './components/Styles';
import { FileText, Receipt, FileCheck, LayoutDashboard, FilePlus, Package, Users, FolderOpen, Save, Edit2, Palette, Database, HardDrive } from 'lucide-react';
import * as api from './utils/api';

export type DocumentType = 'quotation' | 'invoice' | 'receipt';
export type Page = 'dashboard' | 'create' | 'products' | 'customers' | 'documents' | 'styles';

export interface Product {
  id: string;
  name: string;
  type: 'window' | 'door' | 'balcony';
  pricePerSqm: number;
  description: string;
  material: string;
  color: string;
}

export interface Glass {
  id: string;
  name: string;
  type: string;
  thickness: number;
  pricePerSqm: number;
  description: string;
  specifications: string;
}

export interface Style {
  id: string;
  name: string;
  description: string;
  category: string;
  pricePerSqm: number;
}

export interface Colour {
  id: string;
  name: string;
  description: string;
  hexCode: string;
  pricePerSqm: number;
}

export interface Accessory {
  id: string;
  name: string;
  description: string;
  price: number;
  type: string;
  specifications: string;
  category: 'Window' | 'Door' | 'Balcony' | 'Window & Door';
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  totalOrders: number;
  totalSpent: number;
}

export interface CustomerDetails {
  name: string;
  email: string;
  phone: string;
  address: string;
}

export interface LineItem {
  id: string;
  type: 'window' | 'door' | 'balcony' | 'accessories';
  width: number;
  height: number;
  quantity: number;
  pricePerSqm: number;
  description: string;
  colour?: string;
  glass?: string;
  style?: string;
  accessories?: string;
}

export interface DocumentData {
  documentType: DocumentType;
  documentNumber: string;
  date: string;
  customer: Customer;
  lineItems: LineItem[];
  taxRate: number;
  discount: number;
  notes: string;
  paymentAmount?: number;
  paymentStatus?: 'Completed' | 'Deposit Made';
}

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [documentType, setDocumentType] = useState<DocumentType>('quotation');
  const [products, setProducts] = useState<Product[]>([]);
  const [glass, setGlass] = useState<Glass[]>([]);
  const [styles, setStyles] = useState<Style[]>([]);
  const [colours, setColours] = useState<Colour[]>([]);
  const [accessories, setAccessories] = useState<Accessory[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [documentData, setDocumentData] = useState<DocumentData>({
    documentType: 'quotation',
    documentNumber: 'QT-001',
    date: new Date().toISOString().split('T')[0],
    customer: {
      id: '',
      name: '',
      email: '',
      phone: '',
      address: '',
      totalOrders: 0,
      totalSpent: 0,
    },
    lineItems: [],
    taxRate: 10,
    discount: 0,
    notes: '',
  });
  const [savedDocuments, setSavedDocuments] = useState<DocumentData[]>([]);
  const [isEditingDocument, setIsEditingDocument] = useState(false);
  const [backendConnected, setBackendConnected] = useState<boolean | null>(null);
  const [storageMode, setStorageMode] = useState<'backend' | 'local'>(api.getStorageModePreference());

  const handleToggleStorageMode = async () => {
    const newMode = storageMode === 'backend' ? 'local' : 'backend';
    setStorageMode(newMode);
    api.setStorageModePreference(newMode);
    
    // Reload all data after changing mode
    const [productsData, glassData, stylesData, coloursData, accessoriesData, customersData, documentsData] = await Promise.all([
      api.fetchProducts(),
      api.fetchGlass(),
      api.fetchStyles(),
      api.fetchColours(),
      api.fetchAccessories(),
      api.fetchCustomers(),
      api.fetchDocuments(),
    ]);
    
    setProducts(productsData);
    setGlass(glassData);
    setStyles(stylesData);
    setColours(coloursData);
    setAccessories(accessoriesData);
    setCustomers(customersData);
    setSavedDocuments(documentsData);
    
    // Update backend status
    const status = await api.getBackendStatus();
    setBackendConnected(status && newMode === 'backend');
  };

  useEffect(() => {
    const loadData = async () => {
      // Check backend status
      const status = await api.getBackendStatus();
      setBackendConnected(status);
      
      // Fetch all data from API
      const [productsData, glassData, stylesData, coloursData, accessoriesData, customersData, documentsData] = await Promise.all([
        api.fetchProducts(),
        api.fetchGlass(),
        api.fetchStyles(),
        api.fetchColours(),
        api.fetchAccessories(),
        api.fetchCustomers(),
        api.fetchDocuments(),
      ]);
      
      setProducts(productsData);
      setGlass(glassData);
      setStyles(stylesData);
      setColours(coloursData);
      setAccessories(accessoriesData);
      setCustomers(customersData);
      setSavedDocuments(documentsData);

      // Generate correct document number after loading saved documents
      const prefix = 'QT';
      const existingNumbers = documentsData
        .filter(doc => doc.documentType === 'quotation')
        .map(doc => parseInt(doc.documentNumber.split('-')[1]))
        .filter(num => !isNaN(num));
      const nextNumber = existingNumbers.length > 0 ? Math.max(...existingNumbers) + 1 : 1;
      const numberStr = nextNumber.toString().padStart(3, '0');

      setDocumentData(prev => ({
        ...prev,
        documentNumber: `${prefix}-${numberStr}`,
      }));
    };
    
    loadData();
  }, []);

  const handleDocumentTypeChange = (type: DocumentType) => {
    setDocumentType(type);
    const prefix = type === 'quotation' ? 'QT' : type === 'invoice' ? 'INV' : 'REC';
    const number = documentData.documentNumber.split('-')[1] || '001';
    setDocumentData({
      ...documentData,
      documentType: type,
      documentNumber: `${prefix}-${number}`,
    });
  };

  const handleSaveDocument = async () => {
    // Validate document
    if (!documentData.customer.name) {
      alert('Please enter customer name');
      return;
    }
    if (documentData.lineItems.length === 0) {
      alert('Please add at least one item');
      return;
    }

    const success = await api.saveDocument(documentData);
    if (!success) {
      alert('Failed to save document. Please try again.');
      return;
    }

    let updatedDocuments = [...savedDocuments];

    if (isEditingDocument) {
      // Update existing document
      updatedDocuments = savedDocuments.map(doc => 
        doc.documentNumber === documentData.documentNumber ? documentData : doc
      );
      setSavedDocuments(updatedDocuments);
      setIsEditingDocument(false);
      alert('Document updated successfully!');
    } else {
      // Check if document number already exists
      if (savedDocuments.find(doc => doc.documentNumber === documentData.documentNumber)) {
        alert('Document number already exists. Please use a different number.');
        return;
      }
      // Save new document
      updatedDocuments = [...savedDocuments, documentData];
      setSavedDocuments(updatedDocuments);
      alert('Document saved successfully!');
    }
    
    // Generate next document number based on updated documents list
    const prefix = documentType === 'quotation' ? 'QT' : documentType === 'invoice' ? 'INV' : 'REC';
    const existingNumbers = updatedDocuments
      .filter(doc => doc.documentType === documentType)
      .map(doc => parseInt(doc.documentNumber.split('-')[1]))
      .filter(num => !isNaN(num));
    const nextNumber = existingNumbers.length > 0 ? Math.max(...existingNumbers) + 1 : 1;
    const numberStr = nextNumber.toString().padStart(3, '0');

    // Reset form with new document number
    setDocumentData({
      documentType: documentType,
      documentNumber: `${prefix}-${numberStr}`,
      date: new Date().toISOString().split('T')[0],
      customer: {
        id: '',
        name: '',
        email: '',
        phone: '',
        address: '',
        totalOrders: 0,
        totalSpent: 0,
      },
      lineItems: [],
      taxRate: 10,
      discount: 0,
      notes: '',
    });
  };

  const handleNewDocument = () => {
    // Generate next document number
    const prefix = documentType === 'quotation' ? 'QT' : documentType === 'invoice' ? 'INV' : 'REC';
    const existingNumbers = savedDocuments
      .filter(doc => doc.documentType === documentType)
      .map(doc => parseInt(doc.documentNumber.split('-')[1]))
      .filter(num => !isNaN(num));
    const nextNumber = existingNumbers.length > 0 ? Math.max(...existingNumbers) + 1 : 1;
    const numberStr = nextNumber.toString().padStart(3, '0');

    setDocumentData({
      documentType: documentType,
      documentNumber: `${prefix}-${numberStr}`,
      date: new Date().toISOString().split('T')[0],
      customer: {
        id: '',
        name: '',
        email: '',
        phone: '',
        address: '',
        totalOrders: 0,
        totalSpent: 0,
      },
      lineItems: [],
      taxRate: 10,
      discount: 0,
      notes: '',
    });
    setIsEditingDocument(false);
  };

  const handleEditDocument = (doc: DocumentData) => {
    setDocumentData(doc);
    setDocumentType(doc.documentType);
    setIsEditingDocument(true);
    setCurrentPage('create');
  };

  const handleCreateNew = (type: DocumentType) => {
    // Generate next document number for the specified type
    const prefix = type === 'quotation' ? 'QT' : type === 'invoice' ? 'INV' : 'REC';
    const existingNumbers = savedDocuments
      .filter(doc => doc.documentType === type)
      .map(doc => parseInt(doc.documentNumber.split('-')[1]))
      .filter(num => !isNaN(num));
    const nextNumber = existingNumbers.length > 0 ? Math.max(...existingNumbers) + 1 : 1;
    const numberStr = nextNumber.toString().padStart(3, '0');

    setDocumentType(type);
    setDocumentData({
      documentType: type,
      documentNumber: `${prefix}-${numberStr}`,
      date: new Date().toISOString().split('T')[0],
      customer: {
        id: '',
        name: '',
        email: '',
        phone: '',
        address: '',
        totalOrders: 0,
        totalSpent: 0,
      },
      lineItems: [],
      taxRate: 10,
      discount: 0,
      notes: '',
    });
    setIsEditingDocument(false);
    setCurrentPage('create');
  };

  const navItems = [
    { id: 'dashboard' as Page, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'create' as Page, label: 'Create', icon: FilePlus },
    { id: 'products' as Page, label: 'Products', icon: Package },
    { id: 'customers' as Page, label: 'Customers', icon: Users },
    { id: 'documents' as Page, label: 'Documents', icon: FolderOpen },
    { id: 'styles' as Page, label: 'Styles', icon: Palette },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-gray-900">Aluminum Windows & Doors</h1>
              <p className="text-gray-600 mt-1">Create professional quotations, invoices, and receipts</p>
            </div>
            <div className="flex items-center gap-3">
              {/* Storage Mode Toggle Button */}
              <button
                onClick={handleToggleStorageMode}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border bg-white hover:bg-gray-50 transition-colors text-gray-700 border-gray-300"
                title={`Switch to ${storageMode === 'backend' ? 'Local Storage' : 'Backend Database'}`}
              >
                {storageMode === 'backend' ? (
                  <>
                    <Database className="w-4 h-4" />
                    <span className="text-sm">Use Database</span>
                  </>
                ) : (
                  <>
                    <HardDrive className="w-4 h-4" />
                    <span className="text-sm">Use Local</span>
                  </>
                )}
              </button>
              
              {/* Status Indicator */}
              {backendConnected !== null && (
                <div className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${
                  storageMode === 'local'
                    ? 'bg-blue-50 border-blue-200 text-blue-700'
                    : backendConnected 
                      ? 'bg-green-50 border-green-200 text-green-700' 
                      : 'bg-orange-50 border-orange-200 text-orange-700'
                }`}>
                  <div className={`w-2 h-2 rounded-full ${
                    storageMode === 'local'
                      ? 'bg-blue-500'
                      : backendConnected ? 'bg-green-500' : 'bg-orange-500'
                  }`}></div>
                  <span className="text-sm">
                    {storageMode === 'local' 
                      ? 'Using Local Storage' 
                      : backendConnected 
                        ? 'Database Connected' 
                        : 'Database Unavailable'}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Bar */}
      <nav className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentPage(item.id)}
                  className={`flex items-center gap-2 px-6 py-4 border-b-2 transition-all ${
                    currentPage === item.id
                      ? 'border-blue-500 text-blue-600 bg-blue-50/50'
                      : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentPage === 'dashboard' && (
          <Dashboard 
            onNavigate={setCurrentPage}
            products={products}
            customers={customers}
            documents={savedDocuments}
          />
        )}
        
        {currentPage === 'create' && (
          <>
            {/* Action Buttons */}
            {isEditingDocument && (
              <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between">
                <div className="flex items-center gap-2 text-blue-700">
                  <Edit2 className="w-5 h-5" />
                  <span>Editing document: {documentData.documentNumber}</span>
                </div>
                <button
                  onClick={handleNewDocument}
                  className="px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-blue-100 transition-colors border border-blue-300"
                >
                  Cancel & Create New
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Form Section */}
              <div>
                <DocumentForm
                  documentData={documentData}
                  onDataChange={setDocumentData}
                  products={products}
                  customers={customers}
                  onCustomersChange={setCustomers}
                  glass={glass}
                  styles={styles}
                  colours={colours}
                  accessories={accessories}
                />
              </div>

              {/* Preview Section */}
              <div className="lg:sticky lg:top-8 h-fit">
                <DocumentPreview 
                  documentData={documentData} 
                  onSave={handleSaveDocument}
                  onNew={handleNewDocument}
                  isEditing={isEditingDocument}
                />
              </div>
            </div>
          </>
        )}

        {currentPage === 'products' && <Products products={products} onProductsChange={setProducts} glass={glass} onGlassChange={setGlass} accessories={accessories} onAccessoriesChange={setAccessories} />}
        
        {currentPage === 'customers' && <Customers customers={customers} onCustomersChange={setCustomers} />}
        
        {currentPage === 'documents' && (
          <Documents 
            documents={savedDocuments} 
            onDocumentsChange={setSavedDocuments}
            onEditDocument={handleEditDocument}
            onCreateNew={handleCreateNew}
          />
        )}
        
        {currentPage === 'styles' && <Styles styles={styles} onStylesChange={setStyles} colours={colours} onColoursChange={setColours} />}
      </div>
    </div>
  );
}