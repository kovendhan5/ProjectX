// Global test setup
beforeAll(() => {
  // Set test environment variables
  process.env.NODE_ENV = 'test';
  process.env.DATABASE_URL = 'postgresql://user:password@localhost:5432/projectx_test';
});

afterAll(() => {
  // Cleanup
});

// Increase timeout for database operations
jest.setTimeout(10000);
