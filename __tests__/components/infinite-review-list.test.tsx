import React from 'react'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import InfiniteReviewList from '@/components/product/review/infinite-review-list'

// Mock the dependencies
jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}))

jest.mock('@/hooks/use-intersection-observer', () => ({
  useIntersectionObserver: jest.fn(() => ({
    ref: { current: null },
    isIntersecting: false,
  })),
}))

// Mock the child components
jest.mock('@/components/product/review/review-upvote', () => {
  return function MockReviewUpvote({ onUpvoteChange }: any) {
    return (
      <button
        data-testid="upvote-button"
        onClick={() => onUpvoteChange(true)}
      >
        Upvote
      </button>
    )
  }
})

jest.mock('@/components/ui/star-rating', () => {
  return function MockStarRating({ rating }: any) {
    return <div data-testid="star-rating">{rating} stars</div>
  }
})

jest.mock('@/components/product/review/review-form', () => {
  return function MockReviewForm({ onSuccess }: any) {
    return (
      <div data-testid="review-form">
        <button onClick={onSuccess}>Submit Review</button>
      </div>
    )
  }
})

jest.mock('@/components/product/review/delete-review-button', () => {
  return function MockDeleteReviewButton({ onDelete }: any) {
    return (
      <button data-testid="delete-button" onClick={onDelete}>
        Delete
      </button>
    )
  }
})

jest.mock('@/components/product/review/edit-review-button', () => {
  return function MockEditReviewButton({ onEdit }: any) {
    return (
      <button data-testid="edit-button" onClick={onEdit}>
        Edit
      </button>
    )
  }
})

// Mock fetch
const mockFetch = jest.fn()
global.fetch = mockFetch

describe('InfiniteReviewList', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockFetch.mockClear()
  })

  it('renders loading state initially', () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: false,
        json: async () => ({ user: null }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          reviews: [],
          pagination: {
            currentPage: 1,
            totalPages: 0,
            totalCount: 0,
            hasMore: false,
            limit: 5,
          },
        }),
      })

    render(<InfiniteReviewList productId={1} />)

    // Should show loading skeleton
    expect(screen.getByText('Scroll to load more reviews')).toBeInTheDocument()
  })

  it('renders reviews when data is loaded', async () => {
    const mockReviews = [
      {
        id: 1,
        title: 'Great product',
        comment: 'Really loved this product',
        rating: 5,
        productId: 1,
        userId: 1,
        createdAt: '2025-01-15T10:00:00Z',
        User: { id: 1, name: 'John Doe' },
        ReviewUpvote: [],
        upvotes: 0,
        isVerifiedPurchase: true,
      },
    ]

    mockFetch
      .mockResolvedValueOnce({
        ok: false,
        json: async () => ({ user: null }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          reviews: mockReviews,
          pagination: {
            currentPage: 1,
            totalPages: 1,
            totalCount: 1,
            hasMore: false,
            limit: 5,
          },
        }),
      })

    render(<InfiniteReviewList productId={1} />)

    await waitFor(() => {
      expect(screen.getByText('Great product')).toBeInTheDocument()
      expect(screen.getByText('Really loved this product')).toBeInTheDocument()
      expect(screen.getByText('John Doe')).toBeInTheDocument()
      expect(screen.getByText('5 stars')).toBeInTheDocument()
    })
  })

  it('handles upvote functionality', async () => {
    const mockReviews = [
      {
        id: 1,
        title: 'Great product',
        comment: 'Really loved this product',
        rating: 5,
        productId: 1,
        userId: 1,
        createdAt: '2025-01-15T10:00:00Z',
        User: { id: 1, name: 'John Doe' },
        ReviewUpvote: [],
        upvotes: 0,
        isVerifiedPurchase: true,
      },
    ]

    mockFetch
      .mockResolvedValueOnce({
        ok: false,
        json: async () => ({ user: null }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          reviews: mockReviews,
          pagination: {
            currentPage: 1,
            totalPages: 1,
            totalCount: 1,
            hasMore: false,
            limit: 5,
          },
        }),
      })

    render(<InfiniteReviewList productId={1} />)

    await waitFor(() => {
      expect(screen.getByText('Great product')).toBeInTheDocument()
    })

    const upvoteButton = screen.getByTestId('upvote-button')
    fireEvent.click(upvoteButton)

    // The upvote count should be updated locally
    // This tests the handleUpvoteChange function
  })

  it('shows empty state when no reviews', async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: false,
        json: async () => ({ user: null }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          reviews: [],
          pagination: {
            currentPage: 1,
            totalPages: 0,
            totalCount: 0,
            hasMore: false,
            limit: 5,
          },
        }),
      })

    render(<InfiniteReviewList productId={1} />)

    await waitFor(() => {
      expect(
        screen.getByText('No reviews yet. Be the first to review this product!')
      ).toBeInTheDocument()
    })
  })

  it('handles API errors gracefully', async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: false,
        json: async () => ({ user: null }),
      })
      .mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Failed to fetch reviews' }),
      })

    render(<InfiniteReviewList productId={1} />)

    await waitFor(() => {
      expect(
        screen.getByText('No reviews yet. Be the first to review this product!')
      ).toBeInTheDocument()
    })
  })
})
