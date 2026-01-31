/**
 * Unit tests for Error Handler Middleware
 */

import { Request, Response, NextFunction } from 'express';
import { errorHandler, notFoundHandler } from './errorHandler';

describe('Error Handler Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;
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
    mockNext = jest.fn();

    jest.clearAllMocks();
    // Suppress console.error for tests
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('errorHandler', () => {
    it('should handle errors with custom status code and message', () => {
      const error = {
        statusCode: 400,
        message: 'Bad Request',
      };

      errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

      expect(console.error).toHaveBeenCalledWith('Error:', error);
      expect(responseStatus).toHaveBeenCalledWith(400);
      expect(responseJson).toHaveBeenCalledWith({
        error: 'Bad Request',
      });
    });

    it('should default to 500 status code if not provided', () => {
      const error = {
        message: 'Something went wrong',
      };

      errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

      expect(responseStatus).toHaveBeenCalledWith(500);
      expect(responseJson).toHaveBeenCalledWith({
        error: 'Something went wrong',
      });
    });

    it('should default to "Internal Server Error" if message not provided', () => {
      const error = {};

      errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

      expect(responseStatus).toHaveBeenCalledWith(500);
      expect(responseJson).toHaveBeenCalledWith({
        error: 'Internal Server Error',
      });
    });

    it('should include stack trace in development environment', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      const error = {
        statusCode: 500,
        message: 'Test Error',
        stack: 'Error stack trace...',
      };

      errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

      expect(responseJson).toHaveBeenCalledWith({
        error: 'Test Error',
        stack: 'Error stack trace...',
      });

      process.env.NODE_ENV = originalEnv;
    });

    it('should not include stack trace in production environment', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      const error = {
        statusCode: 500,
        message: 'Test Error',
        stack: 'Error stack trace...',
      };

      errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

      expect(responseJson).toHaveBeenCalledWith({
        error: 'Test Error',
      });

      process.env.NODE_ENV = originalEnv;
    });

    it('should handle 404 errors', () => {
      const error = {
        statusCode: 404,
        message: 'Resource not found',
      };

      errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

      expect(responseStatus).toHaveBeenCalledWith(404);
      expect(responseJson).toHaveBeenCalledWith({
        error: 'Resource not found',
      });
    });

    it('should handle 401 unauthorized errors', () => {
      const error = {
        statusCode: 401,
        message: 'Unauthorized',
      };

      errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

      expect(responseStatus).toHaveBeenCalledWith(401);
      expect(responseJson).toHaveBeenCalledWith({
        error: 'Unauthorized',
      });
    });

    it('should handle validation errors', () => {
      const error = {
        statusCode: 422,
        message: 'Validation failed',
      };

      errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

      expect(responseStatus).toHaveBeenCalledWith(422);
      expect(responseJson).toHaveBeenCalledWith({
        error: 'Validation failed',
      });
    });
  });

  describe('notFoundHandler', () => {
    it('should return 404 with appropriate message', () => {
      notFoundHandler(mockRequest as Request, mockResponse as Response);

      expect(responseStatus).toHaveBeenCalledWith(404);
      expect(responseJson).toHaveBeenCalledWith({
        error: 'Route not found',
      });
    });

    it('should be called for unmatched routes', () => {
      mockRequest.path = '/api/nonexistent';

      notFoundHandler(mockRequest as Request, mockResponse as Response);

      expect(responseStatus).toHaveBeenCalledWith(404);
      expect(responseJson).toHaveBeenCalledWith({
        error: 'Route not found',
      });
    });

    it('should work with different HTTP methods', () => {
      mockRequest.method = 'POST';
      mockRequest.path = '/api/unknown';

      notFoundHandler(mockRequest as Request, mockResponse as Response);

      expect(responseStatus).toHaveBeenCalledWith(404);
    });
  });
});
