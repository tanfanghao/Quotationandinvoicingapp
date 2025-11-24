import { projectId, publicAnonKey } from './supabase/info';
import { Product, Customer, DocumentData, Glass, Style, Colour, Accessory } from '../App';

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-ad0536e6`;

const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${publicAnonKey}`,
};

// localStorage keys
const STORAGE_KEYS = {
  PRODUCTS: 'aluminum_products',
  CUSTOMERS: 'aluminum_customers',
  DOCUMENTS: 'aluminum_documents',
  GLASSES: 'aluminum_glasses',
  STYLES: 'aluminum_styles',
  COLOURS: 'aluminum_colours',
  ACCESSORIES: 'aluminum_accessories',
  STORAGE_MODE_PREFERENCE: 'aluminum_storage_mode_preference', // 'backend' or 'local'
};

// Check if backend is available
let backendAvailable = true;
let backendCheckComplete = false;
let forceLocalStorage = false; // Manual override to use localStorage

// Get user's storage mode preference
export function getStorageModePreference(): 'backend' | 'local' {
  const preference = localStorage.getItem(STORAGE_KEYS.STORAGE_MODE_PREFERENCE);
  return (preference as 'backend' | 'local') || 'backend';
}

// Set user's storage mode preference
export function setStorageModePreference(mode: 'backend' | 'local') {
  localStorage.setItem(STORAGE_KEYS.STORAGE_MODE_PREFERENCE, mode);
  forceLocalStorage = mode === 'local';
  backendCheckComplete = false; // Reset to allow recheck
  console.log(`🔄 Storage mode changed to: ${mode === 'backend' ? 'Backend Database' : 'Local Storage'}`);
}

// Initialize storage mode preference on load
const initialPreference = getStorageModePreference();
forceLocalStorage = initialPreference === 'local';

// Check backend availability once on app load
async function checkBackendAvailability() {
  if (backendCheckComplete) return backendAvailable;
  
  console.log('🔍 Checking backend availability...');
  console.log('API Base URL:', API_BASE);
  console.log('Project ID:', projectId);
  
  try {
    const healthUrl = `${API_BASE}/health`;
    console.log('Testing health endpoint:', healthUrl);
    
    const response = await fetch(healthUrl, { 
      headers,
      signal: AbortSignal.timeout(10000) // 10 second timeout
    });
    
    console.log('Response status:', response.status);
    console.log('Response OK:', response.ok);
    
    if (response.ok) {
      const data = await response.json();
      console.log('Health check response:', data);
      backendAvailable = true;
      console.log('✅ Backend is available and connected');
    } else {
      const errorText = await response.text();
      console.log('⚠️ Backend responded but not OK:', response.status, errorText);
      backendAvailable = false;
    }
  } catch (error) {
    backendAvailable = false;
    console.log('❌ Backend connection failed:', error);
    console.log('Error details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : String(error),
    });
  }
  
  backendCheckComplete = true;
  
  if (!backendAvailable) {
    console.info('📦 Using local storage mode - backend not available');
    console.info('💡 The backend server may need time to deploy or may not be running yet');
  }
  
  return backendAvailable;
}

// Export function to check backend status
export async function getBackendStatus() {
  await checkBackendAvailability();
  return backendAvailable;
}

// ===== PRODUCTS =====

export async function fetchProducts(): Promise<Product[]> {
  await checkBackendAvailability();
  
  try {
    if (!backendAvailable || forceLocalStorage) {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.PRODUCTS) || '[]');
    }
    
    const response = await fetch(`${API_BASE}/products`, { 
      headers,
      signal: AbortSignal.timeout(5000)
    });
    
    if (!response.ok) {
      backendAvailable = false;
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.PRODUCTS) || '[]');
    }
    
    const data = await response.json();
    return data.products || [];
  } catch (error) {
    backendAvailable = false;
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.PRODUCTS) || '[]');
  }
}

export async function saveProduct(product: Product): Promise<boolean> {
  try {
    if (backendAvailable && !forceLocalStorage) {
      const response = await fetch(`${API_BASE}/products`, {
        method: 'POST',
        headers,
        body: JSON.stringify(product),
      });
      if (!response.ok) {
        backendAvailable = false;
        // Fallback to localStorage
        const products = JSON.parse(localStorage.getItem(STORAGE_KEYS.PRODUCTS) || '[]');
        const index = products.findIndex((p: Product) => p.id === product.id);
        if (index >= 0) {
          products[index] = product;
        } else {
          products.push(product);
        }
        localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
        return true;
      }
      return true;
    } else {
      // Use localStorage directly
      const products = JSON.parse(localStorage.getItem(STORAGE_KEYS.PRODUCTS) || '[]');
      const index = products.findIndex((p: Product) => p.id === product.id);
      if (index >= 0) {
        products[index] = product;
      } else {
        products.push(product);
      }
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
      return true;
    }
  } catch (error) {
    console.error('Error saving product:', error);
    return false;
  }
}

export async function deleteProduct(id: string): Promise<boolean> {
  try {
    if (backendAvailable && !forceLocalStorage) {
      const response = await fetch(`${API_BASE}/products/${id}`, {
        method: 'DELETE',
        headers,
      });
      if (!response.ok) {
        backendAvailable = false;
        // Fallback to localStorage
        const products = JSON.parse(localStorage.getItem(STORAGE_KEYS.PRODUCTS) || '[]');
        const filtered = products.filter((p: Product) => p.id !== id);
        localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(filtered));
        return true;
      }
      return true;
    } else {
      // Use localStorage directly
      const products = JSON.parse(localStorage.getItem(STORAGE_KEYS.PRODUCTS) || '[]');
      const filtered = products.filter((p: Product) => p.id !== id);
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(filtered));
      return true;
    }
  } catch (error) {
    console.error('Error deleting product:', error);
    return false;
  }
}

// ===== CUSTOMERS =====

export async function fetchCustomers(): Promise<Customer[]> {
  await checkBackendAvailability();
  
  try {
    if (!backendAvailable || forceLocalStorage) {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.CUSTOMERS) || '[]');
    }
    
    const response = await fetch(`${API_BASE}/customers`, { 
      headers,
      signal: AbortSignal.timeout(5000)
    });
    
    if (!response.ok) {
      backendAvailable = false;
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.CUSTOMERS) || '[]');
    }
    
    const data = await response.json();
    return data.customers || [];
  } catch (error) {
    backendAvailable = false;
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.CUSTOMERS) || '[]');
  }
}

export async function saveCustomer(customer: Customer): Promise<boolean> {
  try {
    if (backendAvailable && !forceLocalStorage) {
      const response = await fetch(`${API_BASE}/customers`, {
        method: 'POST',
        headers,
        body: JSON.stringify(customer),
      });
      if (!response.ok) {
        backendAvailable = false;
        // Fallback to localStorage
        const customers = JSON.parse(localStorage.getItem(STORAGE_KEYS.CUSTOMERS) || '[]');
        const index = customers.findIndex((c: Customer) => c.id === customer.id);
        if (index >= 0) {
          customers[index] = customer;
        } else {
          customers.push(customer);
        }
        localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
        return true;
      }
      return true;
    } else {
      // Use localStorage directly
      const customers = JSON.parse(localStorage.getItem(STORAGE_KEYS.CUSTOMERS) || '[]');
      const index = customers.findIndex((c: Customer) => c.id === customer.id);
      if (index >= 0) {
        customers[index] = customer;
      } else {
        customers.push(customer);
      }
      localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
      return true;
    }
  } catch (error) {
    console.error('Error saving customer:', error);
    return false;
  }
}

export async function deleteCustomer(id: string): Promise<boolean> {
  try {
    if (backendAvailable && !forceLocalStorage) {
      const response = await fetch(`${API_BASE}/customers/${id}`, {
        method: 'DELETE',
        headers,
      });
      if (!response.ok) {
        backendAvailable = false;
        // Fallback to localStorage
        const customers = JSON.parse(localStorage.getItem(STORAGE_KEYS.CUSTOMERS) || '[]');
        const filtered = customers.filter((c: Customer) => c.id !== id);
        localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(filtered));
        return true;
      }
      return true;
    } else {
      // Use localStorage directly
      const customers = JSON.parse(localStorage.getItem(STORAGE_KEYS.CUSTOMERS) || '[]');
      const filtered = customers.filter((c: Customer) => c.id !== id);
      localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(filtered));
      return true;
    }
  } catch (error) {
    console.error('Error deleting customer:', error);
    return false;
  }
}

// ===== DOCUMENTS =====

export async function fetchDocuments(): Promise<DocumentData[]> {
  await checkBackendAvailability();
  
  try {
    if (!backendAvailable || forceLocalStorage) {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.DOCUMENTS) || '[]');
    }
    
    const response = await fetch(`${API_BASE}/documents`, { 
      headers,
      signal: AbortSignal.timeout(5000)
    });
    
    if (!response.ok) {
      backendAvailable = false;
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.DOCUMENTS) || '[]');
    }
    
    const data = await response.json();
    return data.documents || [];
  } catch (error) {
    backendAvailable = false;
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.DOCUMENTS) || '[]');
  }
}

export async function saveDocument(document: DocumentData): Promise<boolean> {
  try {
    if (backendAvailable && !forceLocalStorage) {
      const response = await fetch(`${API_BASE}/documents`, {
        method: 'POST',
        headers,
        body: JSON.stringify(document),
      });
      if (!response.ok) {
        backendAvailable = false;
        // Fallback to localStorage
        const documents = JSON.parse(localStorage.getItem(STORAGE_KEYS.DOCUMENTS) || '[]');
        const index = documents.findIndex((d: DocumentData) => d.documentNumber === document.documentNumber);
        if (index >= 0) {
          documents[index] = document;
        } else {
          documents.push(document);
        }
        localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(documents));
        return true;
      }
      return true;
    } else {
      // Use localStorage directly
      const documents = JSON.parse(localStorage.getItem(STORAGE_KEYS.DOCUMENTS) || '[]');
      const index = documents.findIndex((d: DocumentData) => d.documentNumber === document.documentNumber);
      if (index >= 0) {
        documents[index] = document;
      } else {
        documents.push(document);
      }
      localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(documents));
      return true;
    }
  } catch (error) {
    console.error('Error saving document:', error);
    return false;
  }
}

export async function deleteDocument(documentNumber: string): Promise<boolean> {
  try {
    if (backendAvailable && !forceLocalStorage) {
      const response = await fetch(`${API_BASE}/documents/${documentNumber}`, {
        method: 'DELETE',
        headers,
      });
      if (!response.ok) {
        backendAvailable = false;
        // Fallback to localStorage
        const documents = JSON.parse(localStorage.getItem(STORAGE_KEYS.DOCUMENTS) || '[]');
        const filtered = documents.filter((d: DocumentData) => d.documentNumber !== documentNumber);
        localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(filtered));
        return true;
      }
      return true;
    } else {
      // Use localStorage directly
      const documents = JSON.parse(localStorage.getItem(STORAGE_KEYS.DOCUMENTS) || '[]');
      const filtered = documents.filter((d: DocumentData) => d.documentNumber !== documentNumber);
      localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(filtered));
      return true;
    }
  } catch (error) {
    console.error('Error deleting document:', error);
    return false;
  }
}

// ===== GLASSES =====

export async function fetchGlass(): Promise<Glass[]> {
  await checkBackendAvailability();
  
  try {
    if (!backendAvailable || forceLocalStorage) {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.GLASSES) || '[]');
    }
    
    const response = await fetch(`${API_BASE}/glasses`, { 
      headers,
      signal: AbortSignal.timeout(5000)
    });
    
    if (!response.ok) {
      backendAvailable = false;
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.GLASSES) || '[]');
    }
    
    const data = await response.json();
    return data.glasses || [];
  } catch (error) {
    backendAvailable = false;
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.GLASSES) || '[]');
  }
}

export async function saveGlass(glass: Glass): Promise<boolean> {
  try {
    if (backendAvailable && !forceLocalStorage) {
      const response = await fetch(`${API_BASE}/glasses`, {
        method: 'POST',
        headers,
        body: JSON.stringify(glass),
      });
      if (!response.ok) {
        backendAvailable = false;
        // Fallback to localStorage
        const glasses = JSON.parse(localStorage.getItem(STORAGE_KEYS.GLASSES) || '[]');
        const index = glasses.findIndex((g: Glass) => g.id === glass.id);
        if (index >= 0) {
          glasses[index] = glass;
        } else {
          glasses.push(glass);
        }
        localStorage.setItem(STORAGE_KEYS.GLASSES, JSON.stringify(glasses));
        return true;
      }
      return true;
    } else {
      // Use localStorage directly
      const glasses = JSON.parse(localStorage.getItem(STORAGE_KEYS.GLASSES) || '[]');
      const index = glasses.findIndex((g: Glass) => g.id === glass.id);
      if (index >= 0) {
        glasses[index] = glass;
      } else {
        glasses.push(glass);
      }
      localStorage.setItem(STORAGE_KEYS.GLASSES, JSON.stringify(glasses));
      return true;
    }
  } catch (error) {
    console.error('Error saving glass:', error);
    return false;
  }
}

export async function deleteGlass(id: string): Promise<boolean> {
  try {
    if (backendAvailable && !forceLocalStorage) {
      const response = await fetch(`${API_BASE}/glasses/${id}`, {
        method: 'DELETE',
        headers,
      });
      if (!response.ok) {
        backendAvailable = false;
        // Fallback to localStorage
        const glasses = JSON.parse(localStorage.getItem(STORAGE_KEYS.GLASSES) || '[]');
        const filtered = glasses.filter((g: Glass) => g.id !== id);
        localStorage.setItem(STORAGE_KEYS.GLASSES, JSON.stringify(filtered));
        return true;
      }
      return true;
    } else {
      // Use localStorage directly
      const glasses = JSON.parse(localStorage.getItem(STORAGE_KEYS.GLASSES) || '[]');
      const filtered = glasses.filter((g: Glass) => g.id !== id);
      localStorage.setItem(STORAGE_KEYS.GLASSES, JSON.stringify(filtered));
      return true;
    }
  } catch (error) {
    console.error('Error deleting glass:', error);
    return false;
  }
}

// ===== STYLES =====

export async function fetchStyles(): Promise<Style[]> {
  await checkBackendAvailability();
  
  try {
    if (!backendAvailable || forceLocalStorage) {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.STYLES) || '[]');
    }
    
    const response = await fetch(`${API_BASE}/styles`, { 
      headers,
      signal: AbortSignal.timeout(5000)
    });
    
    if (!response.ok) {
      backendAvailable = false;
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.STYLES) || '[]');
    }
    
    const data = await response.json();
    return data.styles || [];
  } catch (error) {
    backendAvailable = false;
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.STYLES) || '[]');
  }
}

export async function saveStyle(style: Style): Promise<boolean> {
  try {
    if (backendAvailable && !forceLocalStorage) {
      const response = await fetch(`${API_BASE}/styles`, {
        method: 'POST',
        headers,
        body: JSON.stringify(style),
      });
      if (!response.ok) {
        backendAvailable = false;
        // Fallback to localStorage
        const styles = JSON.parse(localStorage.getItem(STORAGE_KEYS.STYLES) || '[]');
        const index = styles.findIndex((s: Style) => s.id === style.id);
        if (index >= 0) {
          styles[index] = style;
        } else {
          styles.push(style);
        }
        localStorage.setItem(STORAGE_KEYS.STYLES, JSON.stringify(styles));
        return true;
      }
      return true;
    } else {
      // Use localStorage directly
      const styles = JSON.parse(localStorage.getItem(STORAGE_KEYS.STYLES) || '[]');
      const index = styles.findIndex((s: Style) => s.id === style.id);
      if (index >= 0) {
        styles[index] = style;
      } else {
        styles.push(style);
      }
      localStorage.setItem(STORAGE_KEYS.STYLES, JSON.stringify(styles));
      return true;
    }
  } catch (error) {
    console.error('Error saving style:', error);
    return false;
  }
}

export async function deleteStyle(id: string): Promise<boolean> {
  try {
    if (backendAvailable && !forceLocalStorage) {
      const response = await fetch(`${API_BASE}/styles/${id}`, {
        method: 'DELETE',
        headers,
      });
      if (!response.ok) {
        backendAvailable = false;
        // Fallback to localStorage
        const styles = JSON.parse(localStorage.getItem(STORAGE_KEYS.STYLES) || '[]');
        const filtered = styles.filter((s: Style) => s.id !== id);
        localStorage.setItem(STORAGE_KEYS.STYLES, JSON.stringify(filtered));
        return true;
      }
      return true;
    } else {
      // Use localStorage directly
      const styles = JSON.parse(localStorage.getItem(STORAGE_KEYS.STYLES) || '[]');
      const filtered = styles.filter((s: Style) => s.id !== id);
      localStorage.setItem(STORAGE_KEYS.STYLES, JSON.stringify(filtered));
      return true;
    }
  } catch (error) {
    console.error('Error deleting style:', error);
    return false;
  }
}

// ===== COLOURS =====

export async function fetchColours(): Promise<Colour[]> {
  await checkBackendAvailability();
  
  try {
    if (!backendAvailable || forceLocalStorage) {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.COLOURS) || '[]');
    }
    
    const response = await fetch(`${API_BASE}/colours`, { 
      headers,
      signal: AbortSignal.timeout(5000)
    });
    
    if (!response.ok) {
      backendAvailable = false;
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.COLOURS) || '[]');
    }
    
    const data = await response.json();
    return data.colours || [];
  } catch (error) {
    backendAvailable = false;
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.COLOURS) || '[]');
  }
}

export async function saveColour(colour: Colour): Promise<boolean> {
  try {
    if (backendAvailable && !forceLocalStorage) {
      const response = await fetch(`${API_BASE}/colours`, {
        method: 'POST',
        headers,
        body: JSON.stringify(colour),
      });
      if (!response.ok) {
        backendAvailable = false;
        // Fallback to localStorage
        const colours = JSON.parse(localStorage.getItem(STORAGE_KEYS.COLOURS) || '[]');
        const index = colours.findIndex((c: Colour) => c.id === colour.id);
        if (index >= 0) {
          colours[index] = colour;
        } else {
          colours.push(colour);
        }
        localStorage.setItem(STORAGE_KEYS.COLOURS, JSON.stringify(colours));
        return true;
      }
      return true;
    } else {
      // Use localStorage directly
      const colours = JSON.parse(localStorage.getItem(STORAGE_KEYS.COLOURS) || '[]');
      const index = colours.findIndex((c: Colour) => c.id === colour.id);
      if (index >= 0) {
        colours[index] = colour;
      } else {
        colours.push(colour);
      }
      localStorage.setItem(STORAGE_KEYS.COLOURS, JSON.stringify(colours));
      return true;
    }
  } catch (error) {
    console.error('Error saving colour:', error);
    return false;
  }
}

export async function deleteColour(id: string): Promise<boolean> {
  try {
    if (backendAvailable && !forceLocalStorage) {
      const response = await fetch(`${API_BASE}/colours/${id}`, {
        method: 'DELETE',
        headers,
      });
      if (!response.ok) {
        backendAvailable = false;
        // Fallback to localStorage
        const colours = JSON.parse(localStorage.getItem(STORAGE_KEYS.COLOURS) || '[]');
        const filtered = colours.filter((c: Colour) => c.id !== id);
        localStorage.setItem(STORAGE_KEYS.COLOURS, JSON.stringify(filtered));
        return true;
      }
      return true;
    } else {
      // Use localStorage directly
      const colours = JSON.parse(localStorage.getItem(STORAGE_KEYS.COLOURS) || '[]');
      const filtered = colours.filter((c: Colour) => c.id !== id);
      localStorage.setItem(STORAGE_KEYS.COLOURS, JSON.stringify(filtered));
      return true;
    }
  } catch (error) {
    console.error('Error deleting colour:', error);
    return false;
  }
}

// ===== ACCESSORIES =====

export async function fetchAccessories(): Promise<Accessory[]> {
  await checkBackendAvailability();
  
  try {
    if (!backendAvailable || forceLocalStorage) {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.ACCESSORIES) || '[]');
    }
    
    const response = await fetch(`${API_BASE}/accessories`, { 
      headers,
      signal: AbortSignal.timeout(5000)
    });
    
    if (!response.ok) {
      backendAvailable = false;
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.ACCESSORIES) || '[]');
    }
    
    const data = await response.json();
    return data.accessories || [];
  } catch (error) {
    backendAvailable = false;
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.ACCESSORIES) || '[]');
  }
}

export async function saveAccessory(accessory: Accessory): Promise<boolean> {
  try {
    if (backendAvailable && !forceLocalStorage) {
      const response = await fetch(`${API_BASE}/accessories`, {
        method: 'POST',
        headers,
        body: JSON.stringify(accessory),
      });
      if (!response.ok) {
        backendAvailable = false;
        // Fallback to localStorage
        const accessories = JSON.parse(localStorage.getItem(STORAGE_KEYS.ACCESSORIES) || '[]');
        const index = accessories.findIndex((a: Accessory) => a.id === accessory.id);
        if (index >= 0) {
          accessories[index] = accessory;
        } else {
          accessories.push(accessory);
        }
        localStorage.setItem(STORAGE_KEYS.ACCESSORIES, JSON.stringify(accessories));
        return true;
      }
      return true;
    } else {
      // Use localStorage directly
      const accessories = JSON.parse(localStorage.getItem(STORAGE_KEYS.ACCESSORIES) || '[]');
      const index = accessories.findIndex((a: Accessory) => a.id === accessory.id);
      if (index >= 0) {
        accessories[index] = accessory;
      } else {
        accessories.push(accessory);
      }
      localStorage.setItem(STORAGE_KEYS.ACCESSORIES, JSON.stringify(accessories));
      return true;
    }
  } catch (error) {
    console.error('Error saving accessory:', error);
    return false;
  }
}

export async function deleteAccessory(id: string): Promise<boolean> {
  try {
    if (backendAvailable && !forceLocalStorage) {
      const response = await fetch(`${API_BASE}/accessories/${id}`, {
        method: 'DELETE',
        headers,
      });
      if (!response.ok) {
        backendAvailable = false;
        // Fallback to localStorage
        const accessories = JSON.parse(localStorage.getItem(STORAGE_KEYS.ACCESSORIES) || '[]');
        const filtered = accessories.filter((a: Accessory) => a.id !== id);
        localStorage.setItem(STORAGE_KEYS.ACCESSORIES, JSON.stringify(filtered));
        return true;
      }
      return true;
    } else {
      // Use localStorage directly
      const accessories = JSON.parse(localStorage.getItem(STORAGE_KEYS.ACCESSORIES) || '[]');
      const filtered = accessories.filter((a: Accessory) => a.id !== id);
      localStorage.setItem(STORAGE_KEYS.ACCESSORIES, JSON.stringify(filtered));
      return true;
    }
  } catch (error) {
    console.error('Error deleting accessory:', error);
    return false;
  }
}