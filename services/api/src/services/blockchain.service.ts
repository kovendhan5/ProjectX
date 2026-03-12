import axios from 'axios';
import logger from '../config/logger';

const BLOCKCHAIN_SERVICE_URL = process.env.BLOCKCHAIN_SERVICE_URL || 'http://localhost:3003';
const BLOCKCHAIN_TIMEOUT = parseInt(process.env.BLOCKCHAIN_TIMEOUT || '5000', 10);

const blockchainClient = axios.create({
  baseURL: BLOCKCHAIN_SERVICE_URL,
  timeout: BLOCKCHAIN_TIMEOUT,
});

export const recordTransaction = async (data: any): Promise<any> => {
  try {
    const response = await blockchainClient.post('/api/v1/record', data);
    return response.data;
  } catch (error) {
    logger.error(
      { error, type: (data as any)?.type },
      'Blockchain recording failed (non-blocking)'
    );
    return null;
  }
};

export const verifyTransaction = async (hash: string): Promise<any> => {
  try {
    const response = await blockchainClient.get(`/api/v1/verify/${hash}`);
    return response.data;
  } catch (error) {
    logger.error({ error, hash }, 'Blockchain verification failed');
    return null;
  }
};

/**
 * BlockchainService class — wraps the functional helpers.
 * Useful for OOP consumers and direct unit testing.
 */
export class BlockchainService {
  async recordTransaction(data: any): Promise<string | null> {
    if (data === null || data === undefined) {
      throw new Error('Transaction data cannot be null');
    }
    const result = await recordTransaction(data);
    return result?.block?.hash ?? null;
  }

  async verifyTransaction(hash: string): Promise<boolean> {
    if (!hash || typeof hash !== 'string') return false;
    const result = await verifyTransaction(hash);
    return result?.valid === true;
  }
}

