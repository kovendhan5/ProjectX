// Global test setup
beforeAll(() => {
  // Set test environment variables
  process.env.NODE_ENV = 'test';
  process.env.DATABASE_URL =
    process.env.DATABASE_URL || 'postgresql://user:password@localhost:5432/projectx_test';
  // Disable auth requirement so integration tests work without tokens
  process.env.AUTH_REQUIRED = 'false';
  // Provide a deterministic JWT secret for tests
  process.env.JWT_SECRET = 'test-jwt-secret-do-not-use-in-production';
  // Point blockchain service to a URL that will just fail gracefully (fire-and-forget)
  process.env.BLOCKCHAIN_SERVICE_URL = 'http://localhost:3003';
  // Disable CORS restrictions in test
  process.env.ALLOWED_ORIGINS = 'http://localhost:3002,http://localhost:3004';
});

afterAll(() => {
  // Cleanup
});

// Increase timeout for database operations
jest.setTimeout(15000);
