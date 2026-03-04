import axios from 'axios';
import logger from '../config/logger';

const BLOCKCHAIN_SERVICE_URL = process.env.BLOCKCHAIN_SERVICE_URL || 'http://blockchain:3003';
const BLOCKCHAIN_TIMEOUT = parseInt(process.env.BLOCKCHAIN_TIMEOUT || '5000', 10);

const blockchainClient = axios.create({
  baseURL: BLOCKCHAIN_SERVICE_URL,
  timeout: BLOCKCHAIN_TIMEOUT,
});

export const recordTransaction = async (data: any) => {
  try {
    const response = await blockchainClient.post('/api/v1/record', data);
    return response.data;
  } catch (error) {
    logger.error({ error, data: { type: (data as any)?.type } }, 'Error recording transaction to blockchain');
    // Non-blocking: blockchain anchoring failure should not break the API flow
    return null;
  }
};

export const verifyTransaction = async (hash: string) => {
  try {
    const response = await blockchainClient.get(`/api/v1/verify/${hash}`);
    return response.data;
  } catch (error) {
    logger.error({ error, hash }, 'Error verifying transaction on blockchain');
    return null;
  }
};

