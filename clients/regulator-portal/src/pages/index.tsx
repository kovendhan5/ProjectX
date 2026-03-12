import { Activity, Box, FileText, ShieldCheck } from 'lucide-react';
import Head from 'next/head';
import { useEffect, useState } from 'react';
import { API_ENDPOINTS } from '../config/api';

interface Transaction {
  id: string;
  type: string;
  timestamp: string;
  details: string;
}

interface DashboardStats {
  totalInvoices: number;
  totalProducts: number;
  totalBatches: number;
  recentTransactions: Transaction[];
  loading: boolean;
  error: string | null;
}

export default function RegulatorDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalInvoices: 0,
    totalProducts: 0,
    totalBatches: 0,
    recentTransactions: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const [productsRes, invoicesRes] = await Promise.all([
          fetch(API_ENDPOINTS.products.list),
          fetch(API_ENDPOINTS.invoices.list),
        ]);

        if (!productsRes.ok || !invoicesRes.ok) {
          throw new Error('Failed to fetch dashboard data');
        }

        const products: any[] = await productsRes.json();
        const invoices: any[] = await invoicesRes.json();

        const totalBatches = products.reduce(
          (sum: number, p: any) => sum + (p.batches?.length || 0),
          0
        );

        // Build recent transactions from invoices and products
        const txFromInvoices: Transaction[] = invoices.slice(0, 5).map((inv: any) => ({
          id: inv.blockchainTxId || inv.id,
          type: 'INVOICE_CREATED',
          timestamp: inv.createdAt,
          details: `Invoice ${inv.invoiceNumber} — ${inv.customerName || 'N/A'}`,
        }));

        const txFromProducts: Transaction[] = products.slice(0, 3).map((p: any) => ({
          id: p.blockchainTxId || p.id,
          type: 'PRODUCT_REGISTERED',
          timestamp: p.createdAt,
          details: `Product ${p.sku} — ${p.name}`,
        }));

        const allTx: Transaction[] = [...txFromInvoices, ...txFromProducts]
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
          .slice(0, 8);

        setStats({
          totalInvoices: invoices.length,
          totalProducts: products.length,
          totalBatches,
          recentTransactions: allTx,
          loading: false,
          error: null,
        });
      } catch (err: any) {
        setStats((prev) => ({
          ...prev,
          loading: false,
          error: err.message || 'Unable to load dashboard data',
        }));
      }
    }

    fetchDashboardData();
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
        {/* Error banner */}
        {stats.error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 text-sm">
            ⚠️ {stats.error} — showing cached data if available.
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-500 font-medium">Total Invoices</h3>
              <FileText className="w-6 h-6 text-blue-500" />
            </div>
            {stats.loading ? (
              <div className="h-8 w-16 bg-gray-200 animate-pulse rounded" />
            ) : (
              <p className="text-3xl font-bold text-gray-900">{stats.totalInvoices}</p>
            )}
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-500 font-medium">Registered Products</h3>
              <Box className="w-6 h-6 text-purple-500" />
            </div>
            {stats.loading ? (
              <div className="h-8 w-16 bg-gray-200 animate-pulse rounded" />
            ) : (
              <>
                <p className="text-3xl font-bold text-gray-900">{stats.totalProducts}</p>
                <p className="text-sm text-gray-500 mt-2">{stats.totalBatches} active batches</p>
              </>
            )}
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-500 font-medium">Network Activity</h3>
              <Activity className="w-6 h-6 text-green-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900">Healthy</p>
            <p className="text-sm text-gray-500 mt-2">Live data connected</p>
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
              {stats.loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="p-4 flex items-center gap-4">
                    <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-1/3" />
                      <div className="h-3 bg-gray-100 rounded animate-pulse w-2/3" />
                    </div>
                  </div>
                ))
              ) : stats.recentTransactions.length === 0 ? (
                <div className="p-8 text-center text-gray-400 text-sm">No transactions yet.</div>
              ) : (
                stats.recentTransactions.map((tx) => (
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
                        <p className="font-medium text-gray-900">{tx.type.replace(/_/g, ' ')}</p>
                        <p className="text-sm text-gray-500">{tx.details}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-400 font-mono truncate max-w-[120px]">{tx.id?.slice(0, 12)}…</p>
                      <p className="text-xs text-gray-500">{tx.timestamp ? new Date(tx.timestamp).toLocaleTimeString() : ''}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Right: Quick Audit */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Audit</h3>
            <p className="text-sm text-gray-500 mb-6">Verify any invoice or product batch against the blockchain ledger.</p>

            <div className="space-y-4">
              <a
                href="/verify"
                className="block w-full py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 text-center"
              >
                Open Verification Tool
              </a>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-100">
              <h4 className="font-medium text-gray-900 mb-2">System Status</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">API Gateway</span>
                  <span className={stats.error ? 'text-red-500 font-medium' : 'text-green-600 font-medium'}>
                    {stats.error ? 'Unreachable' : 'Online'}
                  </span>
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
