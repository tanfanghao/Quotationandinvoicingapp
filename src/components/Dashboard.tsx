import { Page, Product, Customer, DocumentData } from '../App';
import { FileText, FileCheck, Receipt, Banknote, TrendingUp, Users, Package } from 'lucide-react';

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
  
  // Calculate total revenue (excluding pending and sent documents)
  const totalRevenue = documents
    .filter(doc => {
      // Exclude quotations (they have 'Pending' status)
      if (doc.documentType === 'quotation') return false;
      // Exclude invoices (they have 'Sent' status)
      if (doc.documentType === 'invoice') return false;
      // Exclude receipts with 'Pending' payment status
      if (doc.documentType === 'receipt' && doc.paymentStatus === 'Pending') return false;
      return true;
    })
    .reduce((sum, doc) => {
      // For receipts, use the actual payment amount
      if (doc.documentType === 'receipt' && doc.paymentAmount !== undefined) {
        return sum + doc.paymentAmount;
      }
      
      // For other documents, calculate the total
      const itemsTotal = doc.lineItems.reduce((itemSum, item) => {
        const area = (item.width * item.height) / 1000000; // Area in m²
        const priceForOne = area * item.pricePerSqm; // Price for one item
        const areaTotal = priceForOne * item.quantity; // Total for all items
        const accessoryTotal = item.accessoryPrice || 0;
        return itemSum + areaTotal + accessoryTotal;
      }, 0);
      const totalWithTax = itemsTotal - (doc.discount || 0); // This is the tax-inclusive total
      return sum + totalWithTax;
    }, 0);

  // Count only completed receipts
  const completedReceipts = receipts.filter(doc => doc.paymentStatus === 'Completed').length;

  // Get recent quotations (last 24 hours / today)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const recentQuotations = quotations.filter(doc => new Date(doc.date) >= today);
  
  // Get recent invoices (last 24 hours / today)
  const recentInvoices = invoices.filter(doc => new Date(doc.date) >= today);
  
  // Get receipts completed today
  const receiptsCompletedToday = receipts.filter(doc => 
    doc.paymentStatus === 'Completed' && new Date(doc.date) >= today
  ).length;

  const stats = [
    {
      label: 'Total Revenue',
      value: `SCR ${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      change: `${completedReceipts} completed • ${receiptsCompletedToday} today`,
      icon: Banknote,
      gradient: 'from-emerald-500 to-teal-600',
      bgGradient: 'from-emerald-50 to-teal-50',
      iconBg: 'bg-emerald-100',
      iconColor: 'text-emerald-600',
    },
    {
      label: 'Quotations',
      value: quotations.length.toString(),
      change: `+${recentQuotations.length} today`,
      icon: FileText,
      gradient: 'from-blue-500 to-blue-600',
      bgGradient: 'from-blue-50 to-indigo-50',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
    },
    {
      label: 'Invoices',
      value: invoices.length.toString(),
      change: `+${recentInvoices.length} today`,
      icon: FileCheck,
      gradient: 'from-purple-500 to-purple-600',
      bgGradient: 'from-purple-50 to-pink-50',
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600',
    },
    {
      label: 'Customers',
      value: customers.length.toString(),
      change: `${customers.length} total customers`,
      icon: Users,
      gradient: 'from-orange-500 to-orange-600',
      bgGradient: 'from-orange-50 to-amber-50',
      iconBg: 'bg-orange-100',
      iconColor: 'text-orange-600',
    },
  ];

  // Get 5 most recent documents
  const recentDocuments = [...documents]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5)
    .map(doc => {
      const itemsTotal = doc.lineItems.reduce((sum, item) => {
        const area = (item.width * item.height) / 1000000; // Area in m²
        const priceForOne = area * item.pricePerSqm; // Price for one item
        const areaTotal = priceForOne * item.quantity; // Total for all items
        const accessoryTotal = item.accessoryPrice || 0;
        return sum + areaTotal + accessoryTotal;
      }, 0);
      const totalWithTax = itemsTotal - (doc.discount || 0); // This is the tax-inclusive total

      // For receipts, use the paid amount if available, otherwise use total
      const displayAmount = doc.documentType === 'receipt' && doc.paymentAmount !== undefined 
        ? doc.paymentAmount 
        : totalWithTax;

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
        amount: `SCR ${displayAmount.toFixed(2)}`,
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
            <div 
              key={stat.label} 
              className={`relative bg-gradient-to-br ${stat.bgGradient} rounded-2xl shadow-sm border border-gray-100 p-6 overflow-hidden group hover:shadow-md transition-all duration-300`}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/30 rounded-full -mr-16 -mt-16 blur-2xl"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className={`${stat.iconBg} p-3 rounded-xl shadow-sm`}>
                    <Icon className={`w-6 h-6 ${stat.iconColor}`} />
                  </div>
                </div>
                <div className="text-gray-600 text-sm mb-1">{stat.label}</div>
                <div className="text-gray-900 text-3xl mb-2 tracking-tight">{stat.value}</div>
                <div className="text-gray-500 text-xs">{stat.change}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-gray-900 mb-5 flex items-center gap-2">
          <span>Quick Actions</span>
          <div className="h-px flex-1 bg-gradient-to-r from-gray-200 to-transparent"></div>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.label}
                onClick={action.action}
                className="bg-white border border-gray-200 rounded-xl p-6 hover:border-blue-400 hover:bg-gradient-to-br hover:from-blue-50 hover:to-indigo-50/30 transition-all duration-300 group shadow-sm hover:shadow-md"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-gray-50 to-gray-100 group-hover:from-blue-100 group-hover:to-indigo-100 rounded-xl flex items-center justify-center mb-4 transition-all duration-300">
                  <Icon className="w-6 h-6 text-gray-400 group-hover:text-blue-600 transition-colors duration-300" />
                </div>
                <div className="text-gray-900 group-hover:text-blue-700 transition-colors">{action.label}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Recent Documents */}
      <div>
        <h2 className="text-gray-900 mb-5 flex items-center gap-2">
          <span>Recent Documents</span>
          <div className="h-px flex-1 bg-gradient-to-r from-gray-200 to-transparent"></div>
        </h2>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100/50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-gray-700 text-sm">Type</th>
                <th className="px-6 py-4 text-left text-gray-700 text-sm">Number</th>
                <th className="px-6 py-4 text-left text-gray-700 text-sm">Customer</th>
                <th className="px-6 py-4 text-left text-gray-700 text-sm">Amount</th>
                <th className="px-6 py-4 text-left text-gray-700 text-sm">Date</th>
                <th className="px-6 py-4 text-left text-gray-700 text-sm">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recentDocuments.length > 0 ? (
                recentDocuments.map((doc) => (
                  <tr key={doc.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2.5">
                        {doc.type === 'Invoice' && (
                          <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                            <FileCheck className="w-4 h-4 text-purple-600" />
                          </div>
                        )}
                        {doc.type === 'Quotation' && (
                          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                            <FileText className="w-4 h-4 text-blue-600" />
                          </div>
                        )}
                        {doc.type === 'Receipt' && (
                          <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                            <Receipt className="w-4 h-4 text-emerald-600" />
                          </div>
                        )}
                        <span className="text-gray-900">{doc.type}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-700">{doc.number}</td>
                    <td className="px-6 py-4 text-gray-700">{doc.customer}</td>
                    <td className="px-6 py-4 text-gray-900">{doc.amount}</td>
                    <td className="px-6 py-4 text-gray-700">{doc.date}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-3 py-1 rounded-full text-xs ${
                          doc.status === 'Paid' || doc.status === 'Completed'
                            ? 'bg-emerald-100 text-emerald-700'
                            : doc.status === 'Pending'
                            ? 'bg-amber-100 text-amber-700'
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
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                        <FileText className="w-8 h-8 text-gray-400" />
                      </div>
                      <div>
                        <p className="text-gray-900 mb-1">No documents found</p>
                        <p className="text-gray-500 text-sm">Create your first quotation to get started!</p>
                      </div>
                    </div>
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