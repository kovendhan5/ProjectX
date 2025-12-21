import { Activity, Box, FileText, Search, ShieldCheck } from 'lucide-react';
import Head from 'next/head';
import { useEffect, useState } from 'react';

export default function RegulatorDashboard() {
  const [stats, setStats] = useState({
    totalInvoices: 0,
    totalProducts: 0,
    totalBatches: 0,
    recentTransactions: []
  });

  useEffect(() => {
    // Mock data fetch - in real app, fetch from API
    setStats({
      totalInvoices: 124,
      totalProducts: 45,
      totalBatches: 89,
      recentTransactions: [
        { id: 'tx_123', type: 'INVOICE_CREATED', timestamp: new Date().toISOString(), details: 'Invoice #INV-2023-001' },
        { id: 'tx_124', type: 'BATCH_CREATED', timestamp: new Date(Date.now() - 3600000).toISOString(), details: 'Batch #B-999' },
        { id: 'tx_125', type: 'PRODUCT_REGISTERED', timestamp: new Date(Date.now() - 7200000).toISOString(), details: 'Product SKU-555' },
      ] as any[]
    });
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>Regulator Portal | ProjectX</title>
      </Head>

      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-8 h-8 text-indigo-600" />
            <span className="text-xl font-bold text-gray-900">Regulator Oversight</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">Logged in as Inspector</span>
            <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold">
              I
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-500 font-medium">Total Invoices</h3>
              <FileText className="w-6 h-6 text-blue-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.totalInvoices}</p>
            <p className="text-sm text-green-600 mt-2">+12% from last month</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-500 font-medium">Registered Products</h3>
              <Box className="w-6 h-6 text-purple-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.totalProducts}</p>
            <p className="text-sm text-gray-500 mt-2">{stats.totalBatches} active batches</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-500 font-medium">Network Activity</h3>
              <Activity className="w-6 h-6 text-green-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900">Healthy</p>
            <p className="text-sm text-gray-500 mt-2">Last block: 2s ago</p>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Recent Transactions */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-900">Recent Blockchain Transactions</h3>
              <button className="text-indigo-600 text-sm font-medium hover:text-indigo-800">View All</button>
            </div>
            <div className="divide-y divide-gray-100">
              {stats.recentTransactions.map((tx: any) => (
                <div key={tx.id} className="p-4 hover:bg-gray-50 transition flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      tx.type === 'INVOICE_CREATED' ? 'bg-green-100 text-green-600' :
                      tx.type === 'BATCH_CREATED' ? 'bg-blue-100 text-blue-600' :
                      'bg-purple-100 text-purple-600'
                    }`}>
                      {tx.type === 'INVOICE_CREATED' ? <FileText className="w-5 h-5" /> :
                       tx.type === 'BATCH_CREATED' ? <Box className="w-5 h-5" /> :
                       <ShieldCheck className="w-5 h-5" />}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{tx.type.replace('_', ' ')}</p>
                      <p className="text-sm text-gray-500">{tx.details}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400 font-mono">{tx.id}</p>
                    <p className="text-xs text-gray-500">{new Date(tx.timestamp).toLocaleTimeString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Quick Audit */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Audit</h3>
            <p className="text-sm text-gray-500 mb-6">Verify any invoice or product batch against the blockchain ledger.</p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reference ID (Invoice/Batch)</label>
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="e.g. INV-2023-001"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                  <Search className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
                </div>
              </div>
              <button className="w-full py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700">
                Verify on Ledger
              </button>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-100">
              <h4 className="font-medium text-gray-900 mb-2">System Status</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">API Gateway</span>
                  <span className="text-green-600 font-medium">Online</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Blockchain Node</span>
                  <span className="text-green-600 font-medium">Synced</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Database</span>
                  <span className="text-green-600 font-medium">Connected</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
