import { useState, useEffect } from 'react';
import { DocumentForm } from './components/DocumentForm';
import { DocumentPreview } from './components/DocumentPreview';
import { Dashboard } from './components/Dashboard';
import { Products } from './components/Products';
import { Customers } from './components/Customers';
import { Documents } from './components/Documents';
import { Styles } from './components/Styles';
import { Login } from './components/Login';
import { UserManagement, AppUser } from './components/UserManagement';
import { FileText, LayoutDashboard, FilePlus, Package, Users, FolderOpen, Edit2, Palette, Database, HardDrive, LogOut, UserCog, Shield, UserIcon } from 'lucide-react';
import * as api from './utils/api';

export type DocumentType = 'quotation' | 'invoice' | 'receipt';
export type Page = 'dashboard' | 'create' | 'products' | 'customers' | 'documents' | 'styles' | 'users';

export interface Product {
  id: string;
  name: string;
  type: 'window' | 'door' | 'balcony';
  pricePerSqm: number;
  description: string;
  material: string;
  color: string;
  calculationType?: 'perSqm' | 'perMeterWidth' | 'perItem';
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
  accessoryPrice?: number; // Total price for accessories (price * quantity)
  calculationType?: 'perSqm' | 'perMeterWidth' | 'perItem';
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
  paymentMethod?: 'CASH' | 'VISA' | 'CHEQUE';
  paymentReference?: string;
  additionalPayments?: Array<{
    date: string;
    method: 'CASH' | 'VISA' | 'CHEQUE';
    reference?: string;
    amount: number;
  }>;
}

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [users, setUsers] = useState<AppUser[]>([]);
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
    taxRate: 15,
    discount: 0,
    notes: '',
  });
  const [savedDocuments, setSavedDocuments] = useState<DocumentData[]>([]);
  const [isEditingDocument, setIsEditingDocument] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [backendConnected, setBackendConnected] = useState<boolean | null>(null);
  const [storageMode, setStorageMode] = useState<'backend' | 'local'>(api.getStorageModePreference());

  const handleLoginSuccess = (userId: string, role: 'admin' | 'user', email: string, name: string) => {
    setIsLoggedIn(true);
    setCurrentUser({
      id: userId,
      email,
      name,
      role,
      createdAt: new Date().toISOString()
    });
  };

  const handleLogout = async () => {
    const { getSupabaseClient } = await import('./utils/supabase/client');
    const supabase = getSupabaseClient();
    await supabase.auth.signOut();
    setIsLoggedIn(false);
    setCurrentUser(null);
    setCurrentPage('dashboard');
  };

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
    const checkSession = async () => {
      const { getSupabaseClient } = await import('./utils/supabase/client');
      const supabase = getSupabaseClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        setIsLoggedIn(true);
        setCurrentUser({
          id: session.user.id,
          email: session.user.email || '',
          name: session.user.user_metadata?.name || 'User',
          role: session.user.user_metadata?.role || 'user',
          createdAt: session.user.created_at || new Date().toISOString()
        });
      }
    };

    checkSession();
  }, []);

  useEffect(() => {
    if (!isLoggedIn) return;

    const loadData = async () => {
      // Check backend status
      const status = await api.getBackendStatus();
      setBackendConnected(status);
      
      // Fetch all data from API
      const [productsData, glassData, stylesData, coloursData, accessoriesData, customersData, documentsData, usersData] = await Promise.all([
        api.fetchProducts(),
        api.fetchGlass(),
        api.fetchStyles(),
        api.fetchColours(),
        api.fetchAccessories(),
        api.fetchCustomers(),
        api.fetchDocuments(),
        api.fetchUsers(),
      ]);
      
      setProducts(productsData);
      setGlass(glassData);
      setStyles(stylesData);
      setColours(coloursData);
      setAccessories(accessoriesData);
      setCustomers(customersData);
      setSavedDocuments(documentsData);
      setUsers(usersData);

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
  }, [isLoggedIn]);

  useEffect(() => {
    if (currentUser?.role !== 'admin') {
      const adminOnlyPages: Page[] = ['products', 'styles', 'users'];
      if (adminOnlyPages.includes(currentPage)) {
        setCurrentPage('dashboard');
      }
    }
  }, [currentPage, currentUser]);

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
      taxRate: 15,
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
      taxRate: 15,
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
      taxRate: 15,
      discount: 0,
      notes: '',
    });
    setIsEditingDocument(false);
    setCurrentPage('create');
  };

  const navItems = [
    { id: 'dashboard' as Page, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'create' as Page, label: 'Create', icon: FilePlus },
    { id: 'products' as Page, label: 'Products', icon: Package, adminOnly: true },
    { id: 'customers' as Page, label: 'Customers', icon: Users },
    { id: 'documents' as Page, label: 'Documents', icon: FolderOpen },
    { id: 'styles' as Page, label: 'Styles', icon: Palette, adminOnly: true },
    { id: 'users' as Page, label: 'Users', icon: UserCog, adminOnly: true },
  ];

  // Filter nav items based on user role
  const visibleNavItems = navItems.filter(item => {
    if (item.adminOnly && currentUser?.role !== 'admin') {
      return false;
    }
    return true;
  });

  // Show login page if not logged in
  if (!isLoggedIn) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
      <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-slate-200/60 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25">
                  <Package className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-gray-900 tracking-tight">HT Aluminium & Granite</h1>
                  <p className="text-gray-500 mt-0.5 text-sm">Windows and Doors Manufacturer</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* User Profile & Logout */}
              <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl border bg-white border-gray-200 shadow-sm">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    currentUser?.role === 'admin' ? 'bg-purple-100' : 'bg-blue-100'
                  }`}>
                    {currentUser?.role === 'admin' ? (
                      <Shield className="w-4 h-4 text-purple-600" />
                    ) : (
                      <UserIcon className="w-4 h-4 text-blue-600" />
                    )}
                  </div>
                  <div className="text-sm">
                    <div className="font-medium text-gray-900">{currentUser?.name}</div>
                    <div className="text-xs text-gray-500 capitalize">{currentUser?.role}</div>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="ml-2 p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>

              {/* Storage Mode Toggle Button */}
              <button
                onClick={handleToggleStorageMode}
                className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl border bg-white hover:bg-gray-50 transition-all duration-200 text-gray-700 border-gray-200 shadow-sm hover:shadow hover:border-gray-300"
                title={`Switch to ${storageMode === 'backend' ? 'Local Storage' : 'Backend Database'}`}
              >
                {storageMode === 'backend' ? (
                  <>
                    <Database className="w-4 h-4 text-blue-600" />
                    <span className="text-sm">Database</span>
                  </>
                ) : (
                  <>
                    <HardDrive className="w-4 h-4 text-slate-600" />
                    <span className="text-sm">Local</span>
                  </>
                )}
              </button>
              
              {/* Status Indicator */}
              {backendConnected !== null && (
                <div className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl border shadow-sm ${
                  storageMode === 'local'
                    ? 'bg-gradient-to-br from-blue-50 to-blue-100/50 border-blue-200/60 text-blue-700'
                    : backendConnected 
                      ? 'bg-gradient-to-br from-emerald-50 to-emerald-100/50 border-emerald-200/60 text-emerald-700' 
                      : 'bg-gradient-to-br from-amber-50 to-amber-100/50 border-amber-200/60 text-amber-700'
                }`}>
                  <div className={`w-2 h-2 rounded-full shadow-sm ${
                    storageMode === 'local'
                      ? 'bg-blue-500 shadow-blue-400/50'
                      : backendConnected ? 'bg-emerald-500 shadow-emerald-400/50' : 'bg-amber-500 shadow-amber-400/50'
                  }`}></div>
                  <span className="text-sm">
                    {storageMode === 'local' 
                      ? 'Local Storage' 
                      : backendConnected 
                        ? 'Connected' 
                        : 'Offline'}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Bar */}
      <nav className="bg-white/90 backdrop-blur-md border-b border-slate-200/60 sticky top-[89px] z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-2">
            {visibleNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentPage(item.id)}
                  className={`flex items-center gap-2.5 px-5 py-3.5 border-b-2 transition-all duration-200 relative group ${
                    currentPage === item.id
                      ? 'border-blue-600 text-blue-700 bg-blue-50/50'
                      : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50/50'
                  }`}
                >
                  <Icon className={`w-4.5 h-4.5 transition-transform duration-200 ${
                    currentPage === item.id ? 'scale-110' : 'group-hover:scale-105'
                  }`} />
                  <span className="text-sm">{item.label}</span>
                  {currentPage === item.id && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-600 to-blue-500 rounded-full"></div>
                  )}
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
              <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3 text-blue-700">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Edit2 className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-sm">Editing Document</div>
                    <div className="text-blue-900">{documentData.documentNumber}</div>
                  </div>
                </div>
                <button
                  onClick={handleNewDocument}
                  className="px-4 py-2.5 bg-white text-blue-600 rounded-xl hover:bg-blue-50 transition-all duration-200 border border-blue-200 shadow-sm hover:shadow"
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
                  onSave={handleSaveDocument}
                  isEditing={isEditingDocument}
                />
                
                {/* Preview Button for Mobile - Only show on mobile */}
                <div className="mt-6 lg:hidden">
                  <button
                    onClick={() => setShowPreviewModal(true)}
                    className="w-full px-6 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                  >
                    <FileText className="w-5 h-5" />
                    Show Preview
                  </button>
                </div>
              </div>

              {/* Preview Section - Desktop: Inline Preview */}
              <div className="hidden lg:block lg:sticky lg:top-8 h-fit">
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
        
        {currentPage === 'users' && currentUser && <UserManagement users={users} onUsersChange={setUsers} currentUserId={currentUser.id} />}
      </div>

      {/* Preview Modal */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          {/* Backdrop with blur */}
          <div 
            className="fixed inset-0 bg-white/10 backdrop-blur-md transition-all"
            onClick={() => setShowPreviewModal(false)}
          ></div>
          
          {/* Modal Content */}
          <div className="flex min-h-screen items-center justify-center p-4">
            <div className="relative bg-white rounded-2xl shadow-2xl max-w-5xl w-full mx-auto max-h-[90vh] overflow-hidden">
              <DocumentPreview 
                documentData={documentData} 
                onSave={handleSaveDocument}
                onNew={handleNewDocument}
                isEditing={isEditingDocument}
                onClose={() => setShowPreviewModal(false)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}