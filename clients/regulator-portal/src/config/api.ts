export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
export const BLOCKCHAIN_URL = process.env.NEXT_PUBLIC_BLOCKCHAIN_URL || 'http://localhost:3003';

export const API_ENDPOINTS = {
  products: {
    list: `${API_BASE_URL}/api/v1/products`,
    getBySku: (sku: string) => `${API_BASE_URL}/api/v1/products/${sku}`,
  },
  invoices: {
    list: `${API_BASE_URL}/api/v1/invoices`,
    getById: (id: string) => `${API_BASE_URL}/api/v1/invoices/${id}`,
  },
  blockchain: {
    chain: `${BLOCKCHAIN_URL}/api/v1/chain`,
    verify: (hash: string) => `${BLOCKCHAIN_URL}/api/v1/verify/${hash}`,
  },
};

