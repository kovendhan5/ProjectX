/**
 * Unit tests for Error Handler Middleware
 */

import { NextFunction, Request, Response } from 'express';
import { errorHandler, notFoundHandler } from './errorHandler';

describe('Error Handler Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;
  let responseJson: jest.Mock;
  let responseStatus: jest.Mock;
  const originalConsoleError = console.error;

  beforeEach(() => {
    responseJson = jest.fn();
    responseStatus = jest.fn().mockReturnValue({ json: responseJson });

    mockRequest = {};
    mockResponse = {
      status: responseStatus,
      json: responseJson,
    };
    mockNext = jest.fn();

    // Suppress console.error during tests
    console.error = jest.fn();
  });

  afterEach(() => {
    console.error = originalConsoleError;
    jest.clearAllMocks();
  });

  describe('errorHandler', () => {
    it('should handle errors with custom status code and message', () => {
      const error = {
        statusCode: 400,
        message: 'Bad Request',
      };

      errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

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

    it('should use default message if not provided', () => {
      const error = {};

      errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

      expect(responseStatus).toHaveBeenCalledWith(500);
      expect(responseJson).toHaveBeenCalledWith({
        error: 'Internal Server Error',
      });
    });

    it('should include stack trace in development mode', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      const error = {
        message: 'Test error',
        stack: 'Error: Test error\n    at someFunction (file.ts:10:5)',
      };

      errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

      expect(responseJson).toHaveBeenCalledWith({
        error: 'Test error',
        stack: error.stack,
      });

      process.env.NODE_ENV = originalEnv;
    });

    it('should not include stack trace in production mode', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      const error = {
        message: 'Test error',
        stack: 'Error: Test error\n    at someFunction (file.ts:10:5)',
      };

      errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

      expect(responseJson).toHaveBeenCalledWith({
        error: 'Test error',
      });

      process.env.NODE_ENV = originalEnv;
    });

    it('should log error to console', () => {
      const error = new Error('Test error');

      errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

      expect(console.error).toHaveBeenCalledWith('Error:', error);
    });

    it('should handle Error objects', () => {
      const error = new Error('Standard error');

      errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

      expect(responseStatus).toHaveBeenCalledWith(500);
      expect(responseJson).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Standard error',
        })
      );
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

    it('should handle any request path', () => {
      mockRequest.path = '/non/existent/route';

      notFoundHandler(mockRequest as Request, mockResponse as Response);

      expect(responseStatus).toHaveBeenCalledWith(404);
    });

    it('should handle any request method', () => {
      mockRequest.method = 'POST';

      notFoundHandler(mockRequest as Request, mockResponse as Response);

      expect(responseStatus).toHaveBeenCalledWith(404);
      expect(responseJson).toHaveBeenCalledWith({
        error: 'Route not found',
      });
    });
  });
});
