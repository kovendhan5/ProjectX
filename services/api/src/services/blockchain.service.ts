import axios from 'axios';

const BLOCKCHAIN_SERVICE_URL = process.env.BLOCKCHAIN_SERVICE_URL || 'http://blockchain:3003';

export const recordTransaction = async (data: any) => {
  try {
    const response = await axios.post(`${BLOCKCHAIN_SERVICE_URL}/api/v1/record`, data);
    return response.data;
  } catch (error) {
    console.error('Error recording transaction to blockchain:', error);
    // In a real system, we might want to queue this or handle it more robustly
    return null;
  }
};

export const verifyTransaction = async (hash: string) => {
  try {
    const response = await axios.get(`${BLOCKCHAIN_SERVICE_URL}/api/v1/verify/${hash}`);
    return response.data;
  } catch (error) {
    console.error('Error verifying transaction on blockchain:', error);
    return null;
  }
};
