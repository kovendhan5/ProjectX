import { AlertTriangle, Calendar, CheckCircle, Package, Search } from 'lucide-react';
import Head from 'next/head';
import React, { useState } from 'react';

interface Batch {
  id: string;
  batchNumber: string;
  expiryDate: string;
  quantity: number;
  status: string;
}

interface Product {
  id: string;
  sku: string;
  name: string;
  manufacturer: string;
  description: string;
  batches: Batch[];
}

export default function ScanPage() {
  const [sku, setSku] = useState('');
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sku) return;

    setLoading(true);
    setError('');
    setProduct(null);

    try {
      // In a real app, use an environment variable for the API URL
      const res = await fetch(`http://localhost:3001/api/v1/products/${sku}`);
      
      if (!res.ok) {
        if (res.status === 404) {
          throw new Error('Product not found');
        }
        throw new Error('Failed to fetch product');
      }

      const data = await res.json();
      setProduct(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <Head>
        <title>Scan Product | Pharmacy Portal</title>
      </Head>

      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-3">
          <Search className="w-8 h-8 text-blue-600" />
          Product Verification
        </h1>

        {/* Scan Input */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <form onSubmit={handleScan} className="flex gap-4">
            <input
              type="text"
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              placeholder="Enter Product SKU (e.g., PROD-001)"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
            >
              {loading ? 'Scanning...' : 'Verify'}
            </button>
          </form>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-8 rounded-r-lg flex items-center gap-3">
            <AlertTriangle className="text-red-500" />
            <p className="text-red-700 font-medium">{error}</p>
          </div>
        )}

        {/* Product Details */}
        {product && (
          <div className="space-y-6">
            {/* Main Info Card */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
              <div className="bg-green-50 px-6 py-4 border-b border-green-100 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <CheckCircle className="text-green-600 w-5 h-5" />
                  <span className="text-green-800 font-semibold">Verified on Blockchain</span>
                </div>
                <span className="text-xs font-mono text-green-600 bg-green-100 px-2 py-1 rounded">
                  ID: {product.id.slice(0, 8)}...
                </span>
              </div>
              
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-1">{product.name}</h2>
                    <p className="text-gray-500">{product.description}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Manufacturer</p>
                    <p className="font-semibold text-gray-900">{product.manufacturer}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <span className="text-gray-500 block mb-1">SKU</span>
                    <span className="font-mono font-medium">{product.sku}</span>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <span className="text-gray-500 block mb-1">Total Batches</span>
                    <span className="font-medium">{product.batches.length}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Batches List */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Package className="w-5 h-5 text-gray-500" />
                Available Batches
              </h3>
              
              {product.batches.length === 0 ? (
                <p className="text-gray-500 italic">No batches found for this product.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="pb-3 font-semibold text-gray-600">Batch #</th>
                        <th className="pb-3 font-semibold text-gray-600">Expiry</th>
                        <th className="pb-3 font-semibold text-gray-600">Qty</th>
                        <th className="pb-3 font-semibold text-gray-600">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {product.batches.map((batch) => (
                        <tr key={batch.id} className="group hover:bg-gray-50 transition">
                          <td className="py-3 font-mono text-blue-600">{batch.batchNumber}</td>
                          <td className="py-3 flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            {new Date(batch.expiryDate).toLocaleDateString()}
                          </td>
                          <td className="py-3">{batch.quantity}</td>
                          <td className="py-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              batch.status === 'PRODUCED' ? 'bg-blue-100 text-blue-700' :
                              batch.status === 'SOLD' ? 'bg-gray-100 text-gray-700' :
                              'bg-yellow-100 text-yellow-700'
                            }`}>
                              {batch.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
