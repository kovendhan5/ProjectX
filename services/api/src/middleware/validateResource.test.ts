/**
 * Unit tests for Validate Resource Middleware
 */

import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import validate from './validateResource';

describe('Validate Resource Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;
  let responseSend: jest.Mock;
  let responseStatus: jest.Mock;

  beforeEach(() => {
    responseSend = jest.fn();
    responseStatus = jest.fn().mockReturnValue({ send: responseSend });

    mockRequest = {
      body: {},
      query: {},
      params: {},
    };
    mockResponse = {
      status: responseStatus,
      send: responseSend,
    };
    mockNext = jest.fn();

    jest.clearAllMocks();
  });

  describe('validate', () => {
    it('should call next() when validation passes', () => {
      const schema = z.object({
        body: z.object({
          name: z.string(),
          age: z.number(),
        }),
      });

      mockRequest.body = {
        name: 'John Doe',
        age: 30,
      };

      const middleware = validate(schema);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(responseStatus).not.toHaveBeenCalled();
    });

    it('should return 400 when validation fails', () => {
      const schema = z.object({
        body: z.object({
          name: z.string(),
          age: z.number(),
        }),
      });

      mockRequest.body = {
        name: 'John Doe',
        age: 'not a number', // Invalid type
      };

      const middleware = validate(schema);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(responseStatus).toHaveBeenCalledWith(400);
      expect(responseSend).toHaveBeenCalledWith(expect.any(Array));
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should validate query parameters', () => {
      const schema = z.object({
        query: z.object({
          page: z.string(),
          limit: z.string(),
        }),
      });

      mockRequest.query = {
        page: '1',
        limit: '10',
      };

      const middleware = validate(schema);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(responseStatus).not.toHaveBeenCalled();
    });

    it('should validate route parameters', () => {
      const schema = z.object({
        params: z.object({
          id: z.string(),
        }),
      });

      mockRequest.params = {
        id: '123',
      };

      const middleware = validate(schema);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(responseStatus).not.toHaveBeenCalled();
    });

    it('should validate all parts (body, query, params) together', () => {
      const schema = z.object({
        body: z.object({
          name: z.string(),
        }),
        query: z.object({
          filter: z.string().optional(),
        }),
        params: z.object({
          id: z.string(),
        }),
      });

      mockRequest.body = { name: 'Product' };
      mockRequest.query = { filter: 'active' };
      mockRequest.params = { id: '456' };

      const middleware = validate(schema);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(responseStatus).not.toHaveBeenCalled();
    });

    it('should return validation errors for missing required fields', () => {
      const schema = z.object({
        body: z.object({
          email: z.string().email(),
          password: z.string().min(8),
        }),
      });

      mockRequest.body = {
        email: 'invalid-email',
        // password is missing
      };

      const middleware = validate(schema);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(responseStatus).toHaveBeenCalledWith(400);
      expect(responseSend).toHaveBeenCalled();
      const errors = responseSend.mock.calls[0][0];
      expect(Array.isArray(errors)).toBe(true);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should handle complex nested validation', () => {
      const schema = z.object({
        body: z.object({
          user: z.object({
            name: z.string(),
            address: z.object({
              street: z.string(),
              city: z.string(),
            }),
          }),
        }),
      });

      mockRequest.body = {
        user: {
          name: 'John',
          address: {
            street: '123 Main St',
            city: 'Springfield',
          },
        },
      };

      const middleware = validate(schema);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should handle array validation', () => {
      const schema = z.object({
        body: z.object({
          items: z.array(
            z.object({
              id: z.number(),
              quantity: z.number().positive(),
            })
          ),
        }),
      });

      mockRequest.body = {
        items: [
          { id: 1, quantity: 5 },
          { id: 2, quantity: 10 },
        ],
      };

      const middleware = validate(schema);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should fail validation for invalid array items', () => {
      const schema = z.object({
        body: z.object({
          items: z.array(
            z.object({
              id: z.number(),
              quantity: z.number().positive(),
            })
          ),
        }),
      });

      mockRequest.body = {
        items: [
          { id: 1, quantity: -5 }, // Negative quantity (invalid)
        ],
      };

      const middleware = validate(schema);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(responseStatus).toHaveBeenCalledWith(400);
      expect(mockNext).not.toHaveBeenCalled();
    });
  });
});
