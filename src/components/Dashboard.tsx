import { Page, Product, Customer, DocumentData } from '../App';
import { FileText, FileCheck, Receipt, DollarSign, TrendingUp, Users, Package } from 'lucide-react';

interface DashboardProps {
  onNavigate: (page: Page) => void;
  products: Product[];
  customers: Customer[];
  documents: DocumentData[];
}

export function Dashboard({ onNavigate, products, customers, documents }: DashboardProps) {
  // Calculate statistics from real data
  const quotations = documents.filter(doc => doc.documentType === 'quotation');
  const invoices = documents.filter(doc => doc.documentType === 'invoice');
  const receipts = documents.filter(doc => doc.documentType === 'receipt');
  
  // Calculate total revenue from receipts (paid invoices)
  const totalRevenue = receipts.reduce((sum, doc) => {
    // Use the paid amount if available, otherwise calculate the full total
    if (doc.paymentAmount !== undefined) {
      return sum + doc.paymentAmount;
    }
    
    const subtotal = doc.lineItems.reduce((itemSum, item) => {
      return itemSum + (item.width * item.height * item.quantity * item.pricePerSqm);
    }, 0);
    const discountAmount = doc.discount || 0;
    const subtotalAfterDiscount = subtotal - discountAmount;
    const taxAmount = (subtotalAfterDiscount * (doc.taxRate || 0)) / 100;
    return sum + subtotalAfterDiscount + taxAmount;
  }, 0);

  // Count only completed receipts
  const completedReceipts = receipts.filter(doc => doc.paymentStatus === 'Completed').length;

  // Get recent quotations (last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const recentQuotations = quotations.filter(doc => new Date(doc.date) >= sevenDaysAgo);
  
  // Get recent invoices (last 7 days)
  const recentInvoices = invoices.filter(doc => new Date(doc.date) >= sevenDaysAgo);

  const stats = [
    {
      label: 'Total Revenue',
      value: `$${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      change: `${completedReceipts} completed`,
      icon: DollarSign,
      color: 'bg-green-500',
    },
    {
      label: 'Quotations',
      value: quotations.length.toString(),
      change: `+${recentQuotations.length} this week`,
      icon: FileText,
      color: 'bg-blue-500',
    },
    {
      label: 'Invoices',
      value: invoices.length.toString(),
      change: `+${recentInvoices.length} this week`,
      icon: FileCheck,
      color: 'bg-purple-500',
    },
    {
      label: 'Customers',
      value: customers.length.toString(),
      change: `${customers.length} total customers`,
      icon: Users,
      color: 'bg-orange-500',
    },
  ];

  // Get 5 most recent documents
  const recentDocuments = [...documents]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5)
    .map(doc => {
      const subtotal = doc.lineItems.reduce((sum, item) => {
        return sum + (item.width * item.height * item.quantity * item.pricePerSqm);
      }, 0);
      const discountAmount = doc.discount || 0;
      const subtotalAfterDiscount = subtotal - discountAmount;
      const taxAmount = (subtotalAfterDiscount * (doc.taxRate || 0)) / 100;
      const total = subtotalAfterDiscount + taxAmount;

      // For receipts, use the paid amount if available, otherwise use total
      const displayAmount = doc.documentType === 'receipt' && doc.paymentAmount !== undefined 
        ? doc.paymentAmount 
        : total;

      // For receipts, use the payment status if available
      let status = doc.documentType === 'quotation' ? 'Pending' : doc.documentType === 'invoice' ? 'Sent' : 'Completed';
      if (doc.documentType === 'receipt' && doc.paymentStatus) {
        status = doc.paymentStatus;
      }

      return {
        id: doc.documentNumber,
        type: doc.documentType === 'quotation' ? 'Quotation' : doc.documentType === 'invoice' ? 'Invoice' : 'Receipt',
        number: doc.documentNumber,
        customer: doc.customer.name,
        amount: `$${displayAmount.toFixed(2)}`,
        date: doc.date,
        status: status,
      };
    });

  const quickActions = [
    { label: 'Create Quotation', icon: FileText, action: () => onNavigate('create') },
    { label: 'Manage Products', icon: Package, action: () => onNavigate('products') },
    { label: 'View Customers', icon: Users, action: () => onNavigate('customers') },
  ];

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <span className="text-green-600 text-sm">{stat.change}</span>
              </div>
              <div className="text-gray-600 mb-1">{stat.label}</div>
              <div className="text-gray-900">{stat.value}</div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.label}
                onClick={action.action}
                className="bg-white border border-gray-200 rounded-lg p-6 hover:border-blue-500 hover:bg-blue-50 transition-all group"
              >
                <Icon className="w-8 h-8 text-gray-400 group-hover:text-blue-600 mb-3" />
                <div className="text-gray-900">{action.label}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Recent Documents */}
      <div>
        <h2 className="text-gray-900 mb-4">Recent Documents</h2>
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-gray-700">Type</th>
                <th className="px-6 py-3 text-left text-gray-700">Number</th>
                <th className="px-6 py-3 text-left text-gray-700">Customer</th>
                <th className="px-6 py-3 text-left text-gray-700">Amount</th>
                <th className="px-6 py-3 text-left text-gray-700">Date</th>
                <th className="px-6 py-3 text-left text-gray-700">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentDocuments.length > 0 ? (
                recentDocuments.map((doc) => (
                  <tr key={doc.id} className="border-b hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {doc.type === 'Invoice' && <FileCheck className="w-4 h-4 text-purple-600" />}
                        {doc.type === 'Quotation' && <FileText className="w-4 h-4 text-blue-600" />}
                        {doc.type === 'Receipt' && <Receipt className="w-4 h-4 text-green-600" />}
                        <span className="text-gray-900">{doc.type}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-700">{doc.number}</td>
                    <td className="px-6 py-4 text-gray-700">{doc.customer}</td>
                    <td className="px-6 py-4 text-gray-900">{doc.amount}</td>
                    <td className="px-6 py-4 text-gray-700">{doc.date}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-2 py-1 rounded text-sm ${
                          doc.status === 'Paid' || doc.status === 'Completed'
                            ? 'bg-green-100 text-green-700'
                            : doc.status === 'Pending'
                            ? 'bg-yellow-100 text-yellow-700'
                            : doc.status === 'Deposit Made'
                            ? 'bg-blue-100 text-blue-700'
                            : doc.status === 'Accepted'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {doc.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    No documents found. Create your first quotation to get started!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}