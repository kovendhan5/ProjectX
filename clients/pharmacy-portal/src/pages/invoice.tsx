import { CheckCircle, FileText, Plus, Search, ShoppingCart, Trash2 } from 'lucide-react';
import Head from 'next/head';
import React, { useState } from 'react';
import Layout from '../components/Layout';

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

interface CartItem {
  batchId: string;
  sku: string;
  productName: string;
  batchNumber: string;
  quantity: number;
  price: number;
}

export default function InvoicePage() {
  const [sku, setSku] = useState('');
  const [product, setProduct] = useState<Product | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successId, setSuccessId] = useState('');
  const [error, setError] = useState('');

  // Temporary state for adding an item
  const [selectedBatchId, setSelectedBatchId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [price, setPrice] = useState(10.00);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sku) return;
    setLoading(true);
    setError('');
    setProduct(null);
    setSelectedBatchId('');

    try {
      const res = await fetch(`http://localhost:3001/api/v1/products/${sku}`);
      if (!res.ok) throw new Error('Product not found');
      const data = await res.json();
      setProduct(data);
      if (data.batches.length > 0) {
        setSelectedBatchId(data.batches[0].id);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = () => {
    if (!product || !selectedBatchId) return;
    
    const batch = product.batches.find(b => b.id === selectedBatchId);
    if (!batch) return;

    if (quantity > batch.quantity) {
      setError(`Only ${batch.quantity} items available in this batch`);
      return;
    }

    const newItem: CartItem = {
      batchId: selectedBatchId,
      sku: product.sku,
      productName: product.name,
      batchNumber: batch.batchNumber,
      quantity,
      price
    };

    setCart([...cart, newItem]);
    setProduct(null);
    setSku('');
    setQuantity(1);
    setError('');
  };

  const removeFromCart = (index: number) => {
    const newCart = [...cart];
    newCart.splice(index, 1);
    setCart(newCart);
  };

  const handleCreateInvoice = async () => {
    if (cart.length === 0) return;
    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('http://localhost:3001/api/v1/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: 'Walk-in Customer',
          items: cart.map(item => ({
            batchId: item.batchId,
            quantity: item.quantity,
            price: item.price
          }))
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to create invoice');
      }

      const data = await res.json();
      setSuccessId(data.invoiceNumber);
      setCart([]);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (successId) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-md w-full">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Invoice Generated!</h2>
          <p className="text-gray-600 mb-6">
            Invoice <span className="font-mono font-bold text-gray-900">{successId}</span> has been successfully created and anchored to the blockchain.
          </p>
          <button 
            onClick={() => setSuccessId('')}
            className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
          >
            Create Another
          </button>
        </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 p-6">
      <Head>
        <title>Create Invoice | Pharmacy Portal</title>
      </Head>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Search & Add */}
        <div className="lg:col-span-2 space-y-6">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <FileText className="w-8 h-8 text-blue-600" />
            New Invoice
          </h1>

          {/* Search Box */}
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <form onSubmit={handleSearch} className="flex gap-4">
              <input
                type="text"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                placeholder="Scan SKU..."
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <button 
                type="submit" 
                disabled={loading}
                className="px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50"
              >
                <Search className="w-5 h-5" />
              </button>
            </form>
            {error && <p className="text-red-500 mt-2 text-sm">{error}</p>}
          </div>

          {/* Product Selection */}
          {product && (
            <div className="bg-white p-6 rounded-xl shadow-sm border-2 border-blue-100">
              <div className="flex justify-between mb-4">
                <h3 className="text-xl font-bold">{product.name}</h3>
                <span className="text-gray-500">{product.manufacturer}</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Select Batch</label>
                  <select 
                    value={selectedBatchId}
                    onChange={(e) => setSelectedBatchId(e.target.value)}
                    className="w-full p-2 border rounded-lg"
                  >
                    {product.batches.map(b => (
                      <option key={b.id} value={b.id}>
                        {b.batchNumber} (Qty: {b.quantity})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Quantity</label>
                  <input 
                    type="number" 
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value))}
                    className="w-full p-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Price ($)</label>
                  <input 
                    type="number" 
                    min="0"
                    step="0.01"
                    value={price}
                    onChange={(e) => setPrice(parseFloat(e.target.value))}
                    className="w-full p-2 border rounded-lg"
                  />
                </div>
              </div>

              <button 
                onClick={addToCart}
                className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Add to Bill
              </button>
            </div>
          )}
        </div>

        {/* Right Column: Cart */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-xl shadow-lg sticky top-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              Current Bill
            </h2>

            {cart.length === 0 ? (
              <div className="text-center py-8 text-gray-400 border-2 border-dashed rounded-lg">
                Cart is empty
              </div>
            ) : (
              <div className="space-y-4">
                {cart.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-start pb-4 border-b">
                    <div>
                      <p className="font-medium">{item.productName}</p>
                      <p className="text-xs text-gray-500">Batch: {item.batchNumber}</p>
                      <p className="text-sm text-gray-600">{item.quantity} x ${item.price.toFixed(2)}</p>
                    </div>
                    <button 
                      onClick={() => removeFromCart(idx)}
                      className="text-red-400 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}

                <div className="pt-2">
                  <div className="flex justify-between text-lg font-bold mb-6">
                    <span>Total</span>
                    <span>${cart.reduce((sum, i) => sum + (i.price * i.quantity), 0).toFixed(2)}</span>
                  </div>

                  <button 
                    onClick={handleCreateInvoice}
                    disabled={submitting}
                    className="w-full py-4 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 shadow-lg shadow-green-200 disabled:opacity-50"
                  >
                    {submitting ? 'Processing...' : 'Generate Invoice'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      </div>
    </Layout>
  );
}
