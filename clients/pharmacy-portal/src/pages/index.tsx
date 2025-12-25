import { Package } from 'lucide-react';
import Head from 'next/head';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <Head>
        <title>Pharmacy Portal | ProjectX</title>
      </Head>
      
      <main className="max-w-2xl w-full bg-white rounded-xl shadow-lg p-8 text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Package className="w-10 h-10 text-blue-600" />
          <h1 className="text-4xl font-bold text-blue-600">
            Pharmacy Portal
          </h1>
        </div>
        <p className="text-gray-600 mb-8">
          Secure billing and provenance verification for trusted pharmacies.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <a href="/scan" className="p-4 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition font-semibold block">
            Scan Product
          </a>
          <a href="/invoice" className="p-4 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition font-semibold block">
            Create Invoice
          </a>
        </div>
      </main>
    </div>
  );
}
