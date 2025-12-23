import { AlertCircle, ArrowLeft, CheckCircle, Search, Shield, XCircle } from 'lucide-react';
import Head from 'next/head';
import Link from 'next/link';
import { useState } from 'react';

interface VerificationResult {
  found: boolean;
  type?: 'product' | 'batch' | 'invoice';
  data?: any;
  blockchainVerified?: boolean;
  message?: string;
}

export default function VerifyPage() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VerificationResult | null>(null);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setResult(null);

    try {
      // Try to determine what type of entity this is and verify it
      let response;
      let type: 'product' | 'batch' | 'invoice' = 'product';

      // Simple heuristic: Invoice numbers start with INV-, batch numbers with B-, otherwise try as SKU
      if (query.startsWith('INV-')) {
        type = 'invoice';
        // For now, mock the invoice lookup since we don't have a GET endpoint
        response = { ok: false, status: 404 };
      } else if (query.startsWith('B-') || query.startsWith('BATCH-')) {
        type = 'batch';
        // Mock batch lookup
        response = { ok: false, status: 404 };
      } else {
        type = 'product';
        response = await fetch(`http://localhost:3001/api/v1/products/${query}`);
      }

      if (!response.ok) {
        setResult({
          found: false,
          message: `No ${type} found with identifier: ${query}`
        });
        setLoading(false);
        return;
      }

      const data = await response.json();
      
      // Verify blockchain transaction if present
      let blockchainVerified = false;
      if (data.blockchainTxId) {
        try {
          const bcResponse = await fetch(
            `http://localhost:3003/api/blockchain/verify/${data.blockchainTxId}`
          );
          if (bcResponse.ok) {
            const bcData = await bcResponse.json();
            blockchainVerified = bcData.valid === true;
          }
        } catch (err) {
          console.error('Blockchain verification failed:', err);
        }
      }

      setResult({
        found: true,
        type,
        data,
        blockchainVerified,
        message: `${type.charAt(0).toUpperCase() + type.slice(1)} verified successfully`
      });
    } catch (error: any) {
      setResult({
        found: false,
        message: `Verification failed: ${error.message}`
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>Verify Entity | Regulator Portal</title>
      </Head>

      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-gray-600 hover:text-gray-900">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-2">
              <Shield className="w-8 h-8 text-indigo-600" />
              <span className="text-xl font-bold text-gray-900">Entity Verification</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Search Form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Verify on Ledger</h2>
          <p className="text-gray-600 mb-6">
            Enter an Invoice Number, Batch ID, or Product SKU to verify its authenticity against the blockchain ledger.
          </p>

          <form onSubmit={handleVerify} className="flex gap-4">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g., INV-2023-001, B-12345, or SKU-789"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-lg"
            />
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="px-8 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Search className="w-5 h-5" />
              {loading ? 'Verifying...' : 'Verify'}
            </button>
          </form>
        </div>

        {/* Results */}
        {result && (
          <div className={`bg-white rounded-xl shadow-sm border-2 p-8 ${
            result.found 
              ? 'border-green-200 bg-green-50/50' 
              : 'border-red-200 bg-red-50/50'
          }`}>
            <div className="flex items-start gap-4 mb-6">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                result.found 
                  ? 'bg-green-100 text-green-600' 
                  : 'bg-red-100 text-red-600'
              }`}>
                {result.found ? (
                  <CheckCircle className="w-7 h-7" />
                ) : (
                  <XCircle className="w-7 h-7" />
                )}
              </div>
              <div className="flex-1">
                <h3 className={`text-xl font-bold mb-1 ${
                  result.found ? 'text-green-900' : 'text-red-900'
                }`}>
                  {result.found ? 'Verification Successful' : 'Verification Failed'}
                </h3>
                <p className={result.found ? 'text-green-700' : 'text-red-700'}>
                  {result.message}
                </p>
              </div>
            </div>

            {/* Details */}
            {result.found && result.data && (
              <div className="border-t border-gray-200 pt-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Type</p>
                    <p className="font-semibold text-gray-900 capitalize">{result.type}</p>
                  </div>
                  {result.type === 'product' && (
                    <>
                      <div>
                        <p className="text-sm text-gray-500 mb-1">SKU</p>
                        <p className="font-mono font-semibold text-gray-900">{result.data.sku}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Name</p>
                        <p className="font-semibold text-gray-900">{result.data.name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Manufacturer</p>
                        <p className="font-semibold text-gray-900">{result.data.manufacturer}</p>
                      </div>
                    </>
                  )}
                </div>

                {/* Blockchain Status */}
                <div className="bg-white rounded-lg border border-gray-200 p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      result.blockchainVerified 
                        ? 'bg-blue-100 text-blue-600' 
                        : 'bg-yellow-100 text-yellow-600'
                    }`}>
                      {result.blockchainVerified ? (
                        <Shield className="w-5 h-5" />
                      ) : (
                        <AlertCircle className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Blockchain Status</p>
                      <p className="text-sm text-gray-600">
                        {result.blockchainVerified 
                          ? 'Verified on ledger' 
                          : result.data.blockchainTxId 
                            ? 'Pending verification' 
                            : 'Not anchored'}
                      </p>
                    </div>
                  </div>
                  {result.data.blockchainTxId && (
                    <span className="text-xs font-mono text-gray-500 bg-gray-100 px-3 py-1 rounded">
                      {result.data.blockchainTxId}
                    </span>
                  )}
                </div>

                {/* Batch Info for Products */}
                {result.type === 'product' && result.data.batches && result.data.batches.length > 0 && (
                  <div>
                    <p className="text-sm font-semibold text-gray-900 mb-2">
                      Active Batches ({result.data.batches.length})
                    </p>
                    <div className="space-y-2">
                      {result.data.batches.map((batch: any) => (
                        <div key={batch.id} className="bg-gray-50 rounded p-3 flex justify-between items-center text-sm">
                          <div>
                            <span className="font-mono font-medium text-gray-900">{batch.batchNumber}</span>
                            <span className="text-gray-500 ml-2">• Qty: {batch.quantity}</span>
                          </div>
                          <span className="text-xs text-gray-500">
                            Exp: {new Date(batch.expiryDate).toLocaleDateString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Info Box */}
        {!result && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-900">
                <p className="font-semibold mb-1">How Verification Works</p>
                <p className="text-blue-700">
                  All products, batches, and invoices in the system are anchored to a blockchain ledger. 
                  This ensures immutability and provides cryptographic proof of authenticity. 
                  Enter any identifier above to verify its status.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
