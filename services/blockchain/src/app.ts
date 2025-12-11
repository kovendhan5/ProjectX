import cors from 'cors';
import { SHA256 } from 'crypto-js';
import express, { Express, Request, Response } from 'express';
import helmet from 'helmet';
import morgan from 'morgan';

const app: Express = express();

app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Mock Ledger Storage (In-Memory for MVP)
interface Block {
  index: number;
  timestamp: string;
  data: any;
  previousHash: string;
  hash: string;
}

const chain: Block[] = [];

const calculateHash = (index: number, previousHash: string, timestamp: string, data: any): string => {
  return SHA256(index + previousHash + timestamp + JSON.stringify(data)).toString();
};

// Genesis Block
const createGenesisBlock = () => {
  const genesisBlock: Block = {
    index: 0,
    timestamp: new Date().toISOString(),
    data: "Genesis Block",
    previousHash: "0",
    hash: ""
  };
  genesisBlock.hash = calculateHash(0, "0", genesisBlock.timestamp, "Genesis Block");
  chain.push(genesisBlock);
};

createGenesisBlock();

app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', blocks: chain.length });
});

app.post('/api/v1/record', (req: Request, res: Response) => {
  const data = req.body;
  const previousBlock = chain[chain.length - 1];
  const index = previousBlock.index + 1;
  const timestamp = new Date().toISOString();
  const hash = calculateHash(index, previousBlock.hash, timestamp, data);

  const newBlock: Block = {
    index,
    timestamp,
    data,
    previousHash: previousBlock.hash,
    hash
  };

  chain.push(newBlock);
  console.log(`[Blockchain] New block added: ${hash}`);
  
  res.status(201).json({
    message: 'Transaction recorded on ledger',
    block: newBlock
  });
});

app.get('/api/v1/chain', (_req: Request, res: Response) => {
  res.json(chain);
});

app.get('/api/v1/verify/:hash', (req: Request, res: Response) => {
  const block = chain.find(b => b.hash === req.params.hash);
  if (block) {
    res.json({ valid: true, block });
  } else {
    res.status(404).json({ valid: false, error: 'Block not found' });
  }
});

export default app;
