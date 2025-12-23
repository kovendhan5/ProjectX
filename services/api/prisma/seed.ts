import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create sample products
  const product1 = await prisma.product.create({
    data: {
      sku: 'PARACET-500',
      name: 'Paracetamol 500mg',
      manufacturer: 'PharmaCorp Ltd.',
      description: 'Pain relief and fever reducer',
      blockchainTxId: 'tx_prod_001',
    },
  });

  const product2 = await prisma.product.create({
    data: {
      sku: 'AMOX-250',
      name: 'Amoxicillin 250mg',
      manufacturer: 'MediLabs Inc.',
      description: 'Antibiotic for bacterial infections',
      blockchainTxId: 'tx_prod_002',
    },
  });

  console.log('✅ Products created:', product1.sku, product2.sku);

  // Create batches for products
  const batch1 = await prisma.batch.create({
    data: {
      batchNumber: 'B-2023-001',
      productId: product1.id,
      expiryDate: new Date('2025-12-31'),
      quantity: 500,
      status: 'ACTIVE',
      blockchainTxId: 'tx_batch_001',
    },
  });

  const batch2 = await prisma.batch.create({
    data: {
      batchNumber: 'B-2023-002',
      productId: product1.id,
      expiryDate: new Date('2026-06-30'),
      quantity: 300,
      status: 'ACTIVE',
      blockchainTxId: 'tx_batch_002',
    },
  });

  const batch3 = await prisma.batch.create({
    data: {
      batchNumber: 'B-2023-003',
      productId: product2.id,
      expiryDate: new Date('2025-09-15'),
      quantity: 200,
      status: 'ACTIVE',
      blockchainTxId: 'tx_batch_003',
    },
  });

  console.log('✅ Batches created:', batch1.batchNumber, batch2.batchNumber, batch3.batchNumber);

  // Create sample invoice
  const invoice = await prisma.invoice.create({
    data: {
      invoiceNumber: 'INV-2023-001',
      customerName: 'John Doe',
      totalAmount: 150.50,
      blockchainTxId: 'tx_invoice_001',
      items: {
        create: [
          {
            batchId: batch1.id,
            quantity: 10,
            price: 10.00,
          },
          {
            batchId: batch3.id,
            quantity: 5,
            price: 10.10,
          },
        ],
      },
    },
  });

  console.log('✅ Invoice created:', invoice.invoiceNumber);

  console.log('🎉 Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
