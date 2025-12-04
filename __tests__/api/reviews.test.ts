import { NextRequest, NextResponse } from 'next/server';
import { GET } from '@/app/api/reviews/route';

// Mock the dependencies
jest.mock('@/lib/supabase/api-client', () => ({
  createPublicClient: jest.fn(),
}));

describe('/api/reviews', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET', () => {
    it('should return paginated reviews successfully', async () => {
      const mockReviews = [
        {
          id: 1,
          title: 'Great product',
          comment: 'Really loved this product',
          rating: 5,
          productId: 1,
          userId: 1,
          createdAt: '2025-01-15T10:00:00Z',
          User: { id: 1, name: 'John Doe', email: 'john@example.com' },
          ReviewUpvote: []
        }
      ];

      const mockSupabase = {
        from: jest.fn(() => ({
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              order: jest.fn(() => ({
                range: jest.fn(() => Promise.resolve({ data: mockReviews, error: null }))
              }))
            }))
          }))
        }))
      };

      const { createPublicClient } = require('@/lib/supabase/api-client');
      createPublicClient.mockResolvedValue({ supabase: mockSupabase });

      // Mock count query
      mockSupabase.from.mockReturnValueOnce({
        select: jest.fn(() => ({
          eq: jest.fn(() => Promise.resolve({ count: 1 }))
        }))
      });

      const request = new NextRequest('http://localhost:3000/api/reviews?productId=1&page=1&limit=5');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.reviews).toHaveLength(1);
      expect(data.pagination).toEqual({
        currentPage: 1,
        totalPages: 1,
        totalCount: 1,
        hasMore: false,
        limit: 5
      });
    });

    it('should return 400 if productId is missing', async () => {
      const request = new NextRequest('http://localhost:3000/api/reviews');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Product ID is required');
    });

    it('should handle database errors gracefully', async () => {
      const { createPublicClient } = require('@/lib/supabase/api-client');
      createPublicClient.mockResolvedValue({
        supabase: {
          from: jest.fn(() => ({
            select: jest.fn(() => ({
              eq: jest.fn(() => Promise.resolve({ count: 0 }))
            }))
          }))
        }
      });

      // Mock the main query to fail
      const mockSupabase = {
        from: jest.fn(() => ({
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              order: jest.fn(() => ({
                range: jest.fn(() => Promise.resolve({ data: null, error: { message: 'Database error' } }))
              }))
            }))
          }))
        }))
      };

      createPublicClient.mockResolvedValueOnce({ supabase: mockSupabase });

      const request = new NextRequest('http://localhost:3000/api/reviews?productId=1');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Database error');
    });
  });
});
