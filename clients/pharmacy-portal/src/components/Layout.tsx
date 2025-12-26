import { Home, Package } from 'lucide-react';
import Link from 'next/link';
import { ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition">
              <Package className="w-6 h-6 text-blue-600" />
              <span className="text-lg font-bold text-gray-900">Pharmacy Portal</span>
            </Link>
            
            <nav className="flex items-center gap-6">
              <Link href="/" className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition">
                <Home className="w-4 h-4" />
                <span className="font-medium">Home</span>
              </Link>
              <Link href="/scan" className="text-gray-600 hover:text-blue-600 transition font-medium">
                Scan Product
              </Link>
              <Link href="/invoice" className="text-gray-600 hover:text-blue-600 transition font-medium">
                Create Invoice
              </Link>
            </nav>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main>{children}</main>
    </div>
  );
}
