import { useState } from 'react';
import { FileText, Receipt, FileCheck, Edit2, Trash2, FileInput, Search, Plus, Eye, DollarSign, X } from 'lucide-react';
import { DocumentData, DocumentType } from '../App';
import { DocumentPreview } from './DocumentPreview';
import * as api from '../utils/api';

interface DocumentsProps {
  documents: DocumentData[];
  onDocumentsChange: (documents: DocumentData[]) => void;
  onEditDocument: (document: DocumentData) => void;
  onCreateNew: (type: DocumentType) => void;
}

export function Documents({ documents, onDocumentsChange, onEditDocument, onCreateNew }: DocumentsProps) {
  const [filterType, setFilterType] = useState<'all' | 'quotation' | 'invoice' | 'receipt'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewingDocument, setViewingDocument] = useState<DocumentData | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [convertingDocument, setConvertingDocument] = useState<DocumentData | null>(null);
  const [convertingToInvoice, setConvertingToInvoice] = useState<DocumentData | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'VISA' | 'CHEQUE'>('CASH');
  const [paymentType, setPaymentType] = useState<'FULL' | '50%' | 'CUSTOM'>('FULL');
  const [customAmount, setCustomAmount] = useState('');
  const [paymentReference, setPaymentReference] = useState('');
  const [showBalanceModal, setShowBalanceModal] = useState(false);
  const [balanceReceipt, setBalanceReceipt] = useState<DocumentData | null>(null);
  const [balanceAmount, setBalanceAmount] = useState('');
  const [balancePaymentMethod, setBalancePaymentMethod] = useState<'CASH' | 'VISA' | 'CHEQUE'>('CASH');
  const [balancePaymentReference, setBalancePaymentReference] = useState('');

  const filteredDocuments = documents.filter(doc => {
    const matchesType = filterType === 'all' || doc.documentType === filterType;
    const matchesSearch = 
      doc.documentNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.customer.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  });

  const handleDelete = async (documentNumber: string) => {
    if (confirm('Are you sure you want to delete this document?')) {
      const success = await api.deleteDocument(documentNumber);
      if (success) {
        onDocumentsChange(documents.filter(doc => doc.documentNumber !== documentNumber));
      } else {
        alert('Failed to delete document. Please try again.');
      }
    }
  };

  const handleConvert = async (doc: DocumentData, newType: DocumentType) => {
    // Generate new document number
    const prefix = newType === 'invoice' ? 'INV' : 'REC';
    const existingNumbers = documents
      .filter(d => d.documentType === newType)
      .map(d => parseInt(d.documentNumber.split('-')[1]))
      .filter(num => !isNaN(num));
    const nextNumber = existingNumbers.length > 0 ? Math.max(...existingNumbers) + 1 : 1;
    const numberStr = nextNumber.toString().padStart(3, '0');

    const convertedDoc: DocumentData = {
      ...doc,
      documentType: newType,
      documentNumber: `${prefix}-${numberStr}`,
      date: new Date().toISOString().split('T')[0],
      notes: doc.notes + `\n\nConverted from ${doc.documentNumber}`,
    };

    const success = await api.saveDocument(convertedDoc);
    if (success) {
      onDocumentsChange([...documents, convertedDoc]);
      alert(`Successfully converted to ${newType}: ${convertedDoc.documentNumber}`);
    } else {
      alert('Failed to convert document. Please try again.');
    }
  };

  const openPaymentModal = (doc: DocumentData) => {
    setConvertingDocument(doc);
    setShowPaymentModal(true);
    setPaymentMethod('CASH');
    setPaymentType('FULL');
    setCustomAmount('');
    setPaymentReference('');
  };

  const openBalanceModal = (doc: DocumentData) => {
    setBalanceReceipt(doc);
    setShowBalanceModal(true);
    setBalancePaymentMethod('CASH');
    const remainingBalance = calculateTotal(doc) - (doc.paymentAmount || 0);
    setBalanceAmount(remainingBalance.toFixed(2));
    setBalancePaymentReference('');
  };

  const openInvoiceModal = (doc: DocumentData) => {
    setConvertingToInvoice(doc);
    setShowInvoiceModal(true);
  };

  const handleConvertToInvoice = async () => {
    if (!convertingToInvoice) return;

    // Generate new document number
    const prefix = 'INV';
    const existingNumbers = documents
      .filter(d => d.documentType === 'invoice')
      .map(d => parseInt(d.documentNumber.split('-')[1]))
      .filter(num => !isNaN(num));
    const nextNumber = existingNumbers.length > 0 ? Math.max(...existingNumbers) + 1 : 1;
    const numberStr = nextNumber.toString().padStart(3, '0');

    const convertedDoc: DocumentData = {
      ...convertingToInvoice,
      documentType: 'invoice',
      documentNumber: `${prefix}-${numberStr}`,
      date: new Date().toISOString().split('T')[0],
      notes: convertingToInvoice.notes + `\\n\\nConverted from ${convertingToInvoice.documentNumber}`,
    };

    const success = await api.saveDocument(convertedDoc);
    if (success) {
      onDocumentsChange([...documents, convertedDoc]);
      alert(`Successfully converted to Invoice: ${convertedDoc.documentNumber}`);
      setShowInvoiceModal(false);
      setConvertingToInvoice(null);
    } else {
      alert('Failed to convert document. Please try again.');
    }
  };

  const handleBalancePayment = async () => {
    if (!balanceReceipt) return;

    // Validate balance amount
    if (!balanceAmount || parseFloat(balanceAmount) <= 0) {
      alert('Please enter a valid payment amount');
      return;
    }

    const total = calculateTotal(balanceReceipt);
    const currentPaid = balanceReceipt.paymentAmount || 0;
    const paymentAmount = parseFloat(balanceAmount);
    const newTotalPaid = currentPaid + paymentAmount;

    // Round to 2 decimal places to avoid floating-point precision issues
    const roundedNewTotalPaid = Math.round(newTotalPaid * 100) / 100;
    const roundedTotal = Math.round(total * 100) / 100;

    // Check if payment exceeds remaining balance
    if (roundedNewTotalPaid > roundedTotal) {
      alert(`Payment amount exceeds remaining balance. Remaining: $${(total - currentPaid).toFixed(2)}`);
      return;
    }

    // Determine new payment status
    const newPaymentStatus: 'Completed' | 'Deposit Made' = roundedNewTotalPaid >= roundedTotal ? 'Completed' : 'Deposit Made';

    // Add payment information to notes
    let paymentInfo = `\n\nBalance Payment (${new Date().toLocaleDateString()})`;
    paymentInfo += `\nPayment Method: ${balancePaymentMethod}`;
    if (balancePaymentReference && (balancePaymentMethod === 'VISA' || balancePaymentMethod === 'CHEQUE')) {
      const referenceLabel = balancePaymentMethod === 'VISA' ? 'Card No.' : 'Cheque No.';
      paymentInfo += `\n${referenceLabel}: ${balancePaymentReference}`;
    }
    paymentInfo += `\nAmount Paid: $${paymentAmount.toFixed(2)}`;
    paymentInfo += `\nTotal Paid: $${newTotalPaid.toFixed(2)} / $${total.toFixed(2)}`;

    const updatedDoc: DocumentData = {
      ...balanceReceipt,
      paymentAmount: newTotalPaid,
      paymentStatus: newPaymentStatus,
      notes: balanceReceipt.notes + paymentInfo,
    };

    const success = await api.saveDocument(updatedDoc);
    if (success) {
      const updatedDocuments = documents.map(doc => 
        doc.documentNumber === balanceReceipt.documentNumber ? updatedDoc : doc
      );
      onDocumentsChange(updatedDocuments);
      alert(`Balance payment recorded successfully. Status: ${newPaymentStatus}`);
      setShowBalanceModal(false);
      setBalanceReceipt(null);
    } else {
      alert('Failed to record payment. Please try again.');
    }
  };

  const handleConvertToReceipt = async () => {
    if (!convertingDocument) return;

    // Validate custom amount
    if (paymentType === 'CUSTOM' && (!customAmount || parseFloat(customAmount) <= 0)) {
      alert('Please enter a valid custom amount');
      return;
    }

    const total = calculateTotal(convertingDocument);
    let paidAmount = total;
    
    if (paymentType === '50%') {
      paidAmount = total * 0.5;
    } else if (paymentType === 'CUSTOM') {
      paidAmount = parseFloat(customAmount);
    }

    // Determine payment status
    const paymentStatus: 'Completed' | 'Deposit Made' = paymentType === 'FULL' ? 'Completed' : 'Deposit Made';

    // Generate new document number
    const prefix = 'REC';
    const existingNumbers = documents
      .filter(d => d.documentType === 'receipt')
      .map(d => parseInt(d.documentNumber.split('-')[1]))
      .filter(num => !isNaN(num));
    const nextNumber = existingNumbers.length > 0 ? Math.max(...existingNumbers) + 1 : 1;
    const numberStr = nextNumber.toString().padStart(3, '0');

    let paymentInfo = `Payment Method: ${paymentMethod}`;
    if (paymentReference && (paymentMethod === 'VISA' || paymentMethod === 'CHEQUE')) {
      const referenceLabel = paymentMethod === 'VISA' ? 'Card No.' : 'Cheque No.';
      paymentInfo += `\n${referenceLabel}: ${paymentReference}`;
    }
    paymentInfo += `\nAmount Paid: $${paidAmount.toFixed(2)}\nTotal: $${total.toFixed(2)}`;
    
    const convertedDoc: DocumentData = {
      ...convertingDocument,
      documentType: 'receipt',
      documentNumber: `${prefix}-${numberStr}`,
      date: new Date().toISOString().split('T')[0],
      notes: convertingDocument.notes + `\n\nConverted from ${convertingDocument.documentNumber}\n${paymentInfo}`,
      paymentAmount: paidAmount,
      paymentStatus: paymentStatus,
    };

    const success = await api.saveDocument(convertedDoc);
    if (success) {
      onDocumentsChange([...documents, convertedDoc]);
      alert(`Successfully converted to Receipt: ${convertedDoc.documentNumber}`);
      setShowPaymentModal(false);
      setConvertingDocument(null);
    } else {
      alert('Failed to convert document. Please try again.');
    }
  };

  const getDocumentIcon = (type: string) => {
    switch (type) {
      case 'quotation':
        return <FileText className="w-5 h-5 text-blue-600" />;
      case 'invoice':
        return <FileCheck className="w-5 h-5 text-green-600" />;
      case 'receipt':
        return <Receipt className="w-5 h-5 text-purple-600" />;
      default:
        return <FileText className="w-5 h-5 text-gray-600" />;
    }
  };

  const calculateTotal = (doc: DocumentData) => {
    const subtotal = doc.lineItems.reduce((sum, item) => {
      return sum + (item.width * item.height * item.quantity * item.pricePerSqm);
    }, 0);
    const subtotalAfterDiscount = subtotal - doc.discount;
    const taxAmount = (subtotalAfterDiscount * doc.taxRate) / 100;
    return subtotalAfterDiscount + taxAmount;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-gray-900">Documents</h1>
          <p className="text-gray-600 mt-1">View and manage your quotations, invoices, and receipts</p>
        </div>
        <div>
          <button
            onClick={() => onCreateNew('quotation')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>New Quotation</span>
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by document number or customer name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Filter Buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => setFilterType('all')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filterType === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterType('quotation')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filterType === 'quotation'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Quotations
            </button>
            <button
              onClick={() => setFilterType('invoice')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filterType === 'invoice'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Invoices
            </button>
            <button
              onClick={() => setFilterType('receipt')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filterType === 'receipt'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Receipts
            </button>
          </div>
        </div>
      </div>

      {/* Documents List */}
      {filteredDocuments.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-gray-900 mb-2">No documents found</h3>
          <p className="text-gray-600">
            {searchTerm || filterType !== 'all'
              ? 'Try adjusting your filters or search term'
              : 'Create your first document in the Create tab'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-gray-700">Type</th>
                <th className="px-6 py-3 text-left text-gray-700">Document #</th>
                <th className="px-6 py-3 text-left text-gray-700">Date</th>
                <th className="px-6 py-3 text-left text-gray-700">Customer</th>
                <th className="px-6 py-3 text-left text-gray-700">Items</th>
                <th className="px-6 py-3 text-right text-gray-700">Total</th>
                <th className="px-6 py-3 text-right text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredDocuments.map((doc) => (
                <tr key={doc.documentNumber} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {getDocumentIcon(doc.documentType)}
                      <span className="capitalize text-gray-900">{doc.documentType}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-900">{doc.documentNumber}</td>
                  <td className="px-6 py-4 text-gray-700">
                    {new Date(doc.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-gray-900">{doc.customer.name || 'N/A'}</div>
                    {doc.customer.email && (
                      <div className="text-sm text-gray-600">{doc.customer.email}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-gray-700">{doc.lineItems.length}</td>
                  <td className="px-6 py-4 text-right text-gray-900">
                    ${doc.documentType === 'receipt' && doc.paymentAmount !== undefined
                      ? doc.paymentAmount.toFixed(2)
                      : calculateTotal(doc).toFixed(2)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setViewingDocument(doc)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="View document"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onEditDocument(doc)}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="Edit document"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      {doc.documentType === 'quotation' && (
                        <>
                          <button
                            onClick={() => openInvoiceModal(doc)}
                            className="flex items-center gap-1 px-3 py-2 text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors text-sm"
                            title="Convert to Invoice"
                          >
                            <FileCheck className="w-4 h-4" />
                            <span>Invoice</span>
                          </button>
                          <button
                            onClick={() => openPaymentModal(doc)}
                            className="flex items-center gap-1 px-3 py-2 text-white bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors text-sm"
                            title="Convert to Receipt"
                          >
                            <Receipt className="w-4 h-4" />
                            <span>Receipt</span>
                          </button>
                        </>
                      )}
                      {doc.documentType === 'receipt' && doc.paymentStatus === 'Deposit Made' && (
                        <button
                          onClick={() => openBalanceModal(doc)}
                          className="flex items-center gap-1 px-3 py-2 text-white bg-orange-600 hover:bg-orange-700 rounded-lg transition-colors text-sm"
                          title="Record Balance Payment"
                        >
                          <DollarSign className="w-4 h-4" />
                          <span>Balance</span>
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(doc.documentNumber)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete document"
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
      )}

      {/* Document Preview Modal */}
      {viewingDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between z-10">
              <h2 className="text-gray-900">Document Preview</h2>
              <button
                onClick={() => setViewingDocument(null)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
            </div>
            <div className="p-6">
              <DocumentPreview documentData={viewingDocument} />
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal - Convert to Receipt */}
      {showPaymentModal && convertingDocument && (
        <div className="fixed inset-0 backdrop-blur-sm bg-white/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-8 py-6 rounded-t-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-white/20 rounded-lg">
                    <Receipt className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-white text-xl">Convert to Receipt</h2>
                    <p className="text-purple-100 text-sm">Complete payment details below</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-8 space-y-6">
              {/* Document Info */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Document Number</p>
                    <p className="text-gray-900">{convertingDocument.documentNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Customer</p>
                    <p className="text-gray-900">{convertingDocument.customer.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Date</p>
                    <p className="text-gray-900">{new Date(convertingDocument.date).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Line Items</p>
                    <p className="text-gray-900">{convertingDocument.lineItems.length} items</p>
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-gray-700 mb-3">Payment Method</label>
                <div className="grid grid-cols-3 gap-3">
                  {['CASH', 'VISA', 'CHEQUE'].map((method) => (
                    <button
                      key={method}
                      onClick={() => setPaymentMethod(method as 'CASH' | 'VISA' | 'CHEQUE')}
                      className={`px-4 py-3 rounded-lg border-2 transition-all ${
                        paymentMethod === method
                          ? 'border-purple-500 bg-purple-50 text-purple-700'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      {method === 'CASH' && '💵'}
                      {method === 'VISA' && '💳'}
                      {method === 'CHEQUE' && '📝'}
                      <span className="ml-2">{method === 'CASH' ? 'Cash' : method === 'VISA' ? 'Card' : 'Cheque'}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Reference Number */}
              {(paymentMethod === 'VISA' || paymentMethod === 'CHEQUE') && (
                <div>
                  <label className="block text-gray-700 mb-2">
                    {paymentMethod === 'VISA' ? 'Card Number' : 'Cheque Number'}
                  </label>
                  <input
                    type="text"
                    value={paymentReference}
                    onChange={(e) => setPaymentReference(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder={paymentMethod === 'VISA' ? 'Enter card number' : 'Enter cheque number'}
                  />
                </div>
              )}

              {/* Payment Type */}
              <div>
                <label className="block text-gray-700 mb-3">Payment Type</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: 'FULL', label: 'Full Payment', icon: '✓' },
                    { value: '50%', label: '50% Payment', icon: '½' },
                    { value: 'CUSTOM', label: 'Custom Amount', icon: '✎' },
                  ].map((type) => (
                    <button
                      key={type.value}
                      onClick={() => setPaymentType(type.value as 'FULL' | '50%' | 'CUSTOM')}
                      className={`px-4 py-3 rounded-lg border-2 transition-all ${
                        paymentType === type.value
                          ? 'border-purple-500 bg-purple-50 text-purple-700'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <span className="mr-2">{type.icon}</span>
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Amount */}
              {paymentType === 'CUSTOM' && (
                <div>
                  <label className="block text-gray-700 mb-2">Custom Amount</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                    <input
                      type="number"
                      value={customAmount}
                      onChange={(e) => setCustomAmount(e.target.value)}
                      className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="0.00"
                      step="0.01"
                    />
                  </div>
                </div>
              )}

              {/* Summary */}
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 space-y-3">
                <div className="flex items-center justify-between text-gray-700">
                  <span>Document Total</span>
                  <span className="text-gray-900">${calculateTotal(convertingDocument).toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between border-t border-purple-200 pt-3">
                  <span className="text-purple-900">Amount to be Paid</span>
                  <span className="text-2xl text-purple-900">
                    ${paymentType === 'FULL' 
                      ? calculateTotal(convertingDocument).toFixed(2) 
                      : paymentType === '50%' 
                      ? (calculateTotal(convertingDocument) * 0.5).toFixed(2) 
                      : customAmount || '0.00'}
                  </span>
                </div>
                {paymentType !== 'FULL' && (
                  <div className="flex items-center justify-between text-sm text-gray-600 border-t border-purple-200 pt-2">
                    <span>Payment Status</span>
                    <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full">Deposit Made</span>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 px-8 py-6 bg-gray-50 border-t rounded-b-xl">
              <button
                onClick={() => setShowPaymentModal(false)}
                className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors text-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleConvertToReceipt}
                className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Receipt className="w-5 h-5" />
                <span>Convert to Receipt</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Balance Payment Modal */}
      {showBalanceModal && balanceReceipt && (
        <div className="fixed inset-0 backdrop-blur-sm bg-white/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full">
            {/* Header */}
            <div className="bg-gradient-to-r from-orange-600 to-orange-700 px-8 py-6 rounded-t-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-white/20 rounded-lg">
                    <DollarSign className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-white text-xl">Record Balance Payment</h2>
                    <p className="text-orange-100 text-sm">Complete the remaining payment</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowBalanceModal(false)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-8 space-y-6">
              {/* Receipt Info */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Receipt Number</p>
                    <p className="text-gray-900">{balanceReceipt.documentNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Customer</p>
                    <p className="text-gray-900">{balanceReceipt.customer.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Original Date</p>
                    <p className="text-gray-900">{new Date(balanceReceipt.date).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Payment Status</p>
                    <p className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full inline-block text-sm">Deposit Made</p>
                  </div>
                </div>
              </div>

              {/* Payment Summary */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Total Amount</span>
                  <span className="text-gray-900 text-lg">${calculateTotal(balanceReceipt).toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between border-t border-blue-200 pt-2">
                  <span className="text-gray-700">Already Paid</span>
                  <span className="text-green-600">${balanceReceipt.paymentAmount ? balanceReceipt.paymentAmount.toFixed(2) : '0.00'}</span>
                </div>
                <div className="flex items-center justify-between border-t border-blue-200 pt-2">
                  <span className="text-blue-900">Remaining Balance</span>
                  <span className="text-2xl text-blue-900">
                    ${(calculateTotal(balanceReceipt) - (balanceReceipt.paymentAmount || 0)).toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-gray-700 mb-3">Payment Method</label>
                <div className="grid grid-cols-3 gap-3">
                  {['CASH', 'VISA', 'CHEQUE'].map((method) => (
                    <button
                      key={method}
                      onClick={() => setBalancePaymentMethod(method as 'CASH' | 'VISA' | 'CHEQUE')}
                      className={`px-4 py-3 rounded-lg border-2 transition-all ${
                        balancePaymentMethod === method
                          ? 'border-orange-500 bg-orange-50 text-orange-700'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      {method === 'CASH' && '💵'}
                      {method === 'VISA' && '💳'}
                      {method === 'CHEQUE' && '📝'}
                      <span className="ml-2">{method === 'CASH' ? 'Cash' : method === 'VISA' ? 'Card' : 'Cheque'}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Reference Number */}
              {(balancePaymentMethod === 'VISA' || balancePaymentMethod === 'CHEQUE') && (
                <div>
                  <label className="block text-gray-700 mb-2">
                    {balancePaymentMethod === 'VISA' ? 'Card Number' : 'Cheque Number'}
                  </label>
                  <input
                    type="text"
                    value={balancePaymentReference}
                    onChange={(e) => setBalancePaymentReference(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={balancePaymentMethod === 'VISA' ? 'Enter card number' : 'Enter cheque number'}
                  />
                </div>
              )}

              {/* Payment Amount */}
              <div>
                <label className="block text-gray-700 mb-2">Payment Amount</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    value={balanceAmount}
                    onChange={(e) => setBalanceAmount(e.target.value)}
                    className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.00"
                    step="0.01"
                  />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 px-8 py-6 bg-gray-50 border-t rounded-b-xl">
              <button
                onClick={() => setShowBalanceModal(false)}
                className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors text-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleBalancePayment}
                className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <DollarSign className="w-5 h-5" />
                <span>Record Payment</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Conversion Modal */}
      {showInvoiceModal && convertingToInvoice && (
        <div className="fixed inset-0 backdrop-blur-sm bg-white/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full">
            {/* Header */}
            <div className="bg-gradient-to-r from-green-600 to-green-700 px-8 py-6 rounded-t-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-white/20 rounded-lg">
                    <FileCheck className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-white text-xl">Convert to Invoice</h2>
                    <p className="text-green-100 text-sm">Complete the conversion process</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowInvoiceModal(false)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-8 space-y-6">
              {/* Document Info */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Document Number</p>
                    <p className="text-gray-900">{convertingToInvoice.documentNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Customer</p>
                    <p className="text-gray-900">{convertingToInvoice.customer.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Date</p>
                    <p className="text-gray-900">{new Date(convertingToInvoice.date).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Line Items</p>
                    <p className="text-gray-900">{convertingToInvoice.lineItems.length} items</p>
                  </div>
                </div>
              </div>

              {/* Summary */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-6 space-y-3">
                <div className="flex items-center justify-between text-gray-700">
                  <span>Document Total</span>
                  <span className="text-gray-900">${calculateTotal(convertingToInvoice).toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between border-t border-green-200 pt-3">
                  <span className="text-green-900">Amount to be Paid</span>
                  <span className="text-2xl text-green-900">
                    ${calculateTotal(convertingToInvoice).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 px-8 py-6 bg-gray-50 border-t rounded-b-xl">
              <button
                onClick={() => setShowInvoiceModal(false)}
                className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors text-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleConvertToInvoice}
                className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <FileCheck className="w-5 h-5" />
                <span>Convert to Invoice</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}