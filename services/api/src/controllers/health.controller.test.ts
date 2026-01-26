/**
 * Unit tests for Health Controller
 */

import { Request, Response } from 'express';
import { healthCheck, getApiInfo } from './health.controller';

describe('Health Controller', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let responseJson: jest.Mock;
  let responseStatus: jest.Mock;

  beforeEach(() => {
    responseJson = jest.fn();
    responseStatus = jest.fn().mockReturnValue({ json: responseJson });

    mockRequest = {};
    mockResponse = {
      status: responseStatus,
      json: responseJson,
    };

    jest.clearAllMocks();
  });

  describe('healthCheck', () => {
    it('should return health status', () => {
      healthCheck(mockRequest as Request, mockResponse as Response);

      expect(responseStatus).toHaveBeenCalledWith(200);
      expect(responseJson).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'healthy',
          service: 'ProjectX API',
          timestamp: expect.any(String),
          uptime: expect.any(Number),
        })
      );
    });

    it('should include environment information', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      healthCheck(mockRequest as Request, mockResponse as Response);

      const callArgs = responseJson.mock.calls[0][0];
      expect(callArgs.environment).toBe('production');

      process.env.NODE_ENV = originalEnv;
    });

    it('should default to development environment', () => {
      const originalEnv = process.env.NODE_ENV;
      delete process.env.NODE_ENV;

      healthCheck(mockRequest as Request, mockResponse as Response);

      const callArgs = responseJson.mock.calls[0][0];
      expect(callArgs.environment).toBe('development');

      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('getApiInfo', () => {
    it('should return API information', () => {
      getApiInfo(mockRequest as Request, mockResponse as Response);

      expect(responseStatus).toHaveBeenCalledWith(200);
      expect(responseJson).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'ProjectX API',
          version: '1.0.0',
          description: expect.any(String),
          endpoints: expect.any(Object),
        })
      );
    });

    it('should include product endpoints', () => {
      getApiInfo(mockRequest as Request, mockResponse as Response);

      const callArgs = responseJson.mock.calls[0][0];
      expect(callArgs.endpoints).toHaveProperty('products');
      expect(callArgs.endpoints.products).toHaveProperty('GET /api/v1/products/:sku');
      expect(callArgs.endpoints.products).toHaveProperty('POST /api/v1/products');
    });

    it('should include invoice endpoints', () => {
      getApiInfo(mockRequest as Request, mockResponse as Response);

      const callArgs = responseJson.mock.calls[0][0];
      expect(callArgs.endpoints).toHaveProperty('invoices');
      expect(callArgs.endpoints.invoices).toHaveProperty('POST /api/v1/invoices');
    });

    it('should include health endpoints', () => {
      getApiInfo(mockRequest as Request, mockResponse as Response);

      const callArgs = responseJson.mock.calls[0][0];
      expect(callArgs.endpoints).toHaveProperty('health');
      expect(callArgs.endpoints.health).toHaveProperty('GET /health');
      expect(callArgs.endpoints.health).toHaveProperty('GET /');
    });

    it('should include documentation reference', () => {
      getApiInfo(mockRequest as Request, mockResponse as Response);

      const callArgs = responseJson.mock.calls[0][0];
      expect(callArgs.documentation).toContain('README.md');
    });
  });
});
