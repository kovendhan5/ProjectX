export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
export const BLOCKCHAIN_URL = process.env.NEXT_PUBLIC_BLOCKCHAIN_URL || 'http://localhost:3003';

export const API_ENDPOINTS = {
  products: {
    getBySku: (sku: string) => `${API_BASE_URL}/api/v1/products/${sku}`,
  },
  blockchain: {
    verify: (txId: string) => `${BLOCKCHAIN_URL}/api/blockchain/verify/${txId}`,
  },
};
