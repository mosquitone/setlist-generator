import { describe, it, expect, vi, beforeEach } from 'vitest'
import handler from '../../api/setlist'
import type { VercelRequest, VercelResponse } from '@vercel/node'

// Mock @vercel/kv
vi.mock('@vercel/kv', () => ({
  kv: {
    hset: vi.fn(),
    hgetall: vi.fn()
  }
}))

// Mock crypto for UUID generation
vi.mock('crypto', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    randomUUID: vi.fn(() => 'mock-uuid-1234')
  }
})

// Import the mocked kv and randomUUID after mocking
import { kv } from '@vercel/kv'
import { randomUUID } from 'crypto'
const mockKv = vi.mocked(kv)
const mockRandomUUID = vi.mocked(randomUUID)

describe('API Handler /api/setlist', () => {
  let mockRequest: Partial<VercelRequest>
  let mockResponse: Partial<VercelResponse>
  let statusMock: ReturnType<typeof vi.fn>
  let jsonMock: ReturnType<typeof vi.fn>

  beforeEach(() => {
    statusMock = vi.fn().mockReturnThis()
    jsonMock = vi.fn().mockReturnThis()
    
    mockResponse = {
      status: statusMock,
      json: jsonMock
    }

    // Reset all mocks
    vi.clearAllMocks()
    
    // Ensure randomUUID returns our mock value
    mockRandomUUID.mockReturnValue('mock-uuid-1234')
  })

  describe('POST - Create setlist', () => {
    it('should create a new setlist and return UUID', async () => {
      const mockSetlistData = {
        meta: { createDate: '2024-01-01T00:00:00Z', version: '1.0' },
        band: { name: 'Test Band' },
        event: { name: 'Test Event', date: '', openTime: '', startTime: '' },
        playings: [{ _id: '1', title: 'Test Song', note: '' }],
        theme: 'mqtn'
      }

      mockRequest = {
        method: 'POST',
        body: mockSetlistData
      }

      mockKv.hset.mockResolvedValueOnce(undefined)

      await handler(mockRequest as VercelRequest, mockResponse as VercelResponse)

      // Get the actual UUID that was generated
      const actualUUID = mockKv.hset.mock.calls[0][0]
      
      expect(mockKv.hset).toHaveBeenCalledWith(actualUUID, mockSetlistData)
      expect(statusMock).toHaveBeenCalledWith(201)
      expect(jsonMock).toHaveBeenCalledWith(actualUUID)
      expect(typeof actualUUID).toBe('string')
      expect(actualUUID).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/)
    })
  })

  describe('PUT - Update setlist', () => {
    it('should update existing setlist', async () => {
      const mockSetlistData = {
        meta: { createDate: '2024-01-01T00:00:00Z', version: '1.0' },
        band: { name: 'Updated Band' },
        event: { name: 'Updated Event', date: '', openTime: '', startTime: '' },
        playings: [{ _id: '1', title: 'Updated Song', note: '' }],
        theme: 'basic'
      }

      mockRequest = {
        method: 'PUT',
        query: { id: 'existing-uuid' },
        body: mockSetlistData
      }

      mockKv.hset.mockResolvedValueOnce(undefined)

      await handler(mockRequest as VercelRequest, mockResponse as VercelResponse)

      expect(mockKv.hset).toHaveBeenCalledWith('existing-uuid', mockSetlistData)
      expect(statusMock).toHaveBeenCalledWith(200)
      expect(jsonMock).toHaveBeenCalledWith('')
    })
  })

  describe('GET - Retrieve setlist(s)', () => {
    it('should retrieve single setlist by id', async () => {
      const mockSetlistData = {
        meta: { createDate: '2024-01-01T00:00:00Z', version: '1.0' },
        band: { name: 'Retrieved Band' },
        event: { name: 'Retrieved Event', date: '', openTime: '', startTime: '' },
        playings: [{ _id: '1', title: 'Retrieved Song', note: '' }],
        theme: 'mqtn'
      }

      mockRequest = {
        method: 'GET',
        query: { id: 'test-uuid' }
      }

      mockKv.hgetall.mockResolvedValueOnce(mockSetlistData)

      await handler(mockRequest as VercelRequest, mockResponse as VercelResponse)

      expect(mockKv.hgetall).toHaveBeenCalledWith('test-uuid')
      expect(statusMock).toHaveBeenCalledWith(200)
      expect(jsonMock).toHaveBeenCalledWith([mockSetlistData])
    })

    it('should retrieve multiple setlists by array of ids', async () => {
      const mockSetlists = [
        {
          meta: { createDate: '2024-01-01T00:00:00Z', version: '1.0' },
          band: { name: 'Band 1' },
          event: { name: 'Event 1', date: '', openTime: '', startTime: '' },
          playings: [{ _id: '1', title: 'Song 1', note: '' }],
          theme: 'mqtn'
        },
        {
          meta: { createDate: '2024-01-02T00:00:00Z', version: '1.0' },
          band: { name: 'Band 2' },
          event: { name: 'Event 2', date: '', openTime: '', startTime: '' },
          playings: [{ _id: '2', title: 'Song 2', note: '' }],
          theme: 'basic'
        }
      ]

      mockRequest = {
        method: 'GET',
        query: { id: ['uuid-1', 'uuid-2'] }
      }

      mockKv.hgetall
        .mockResolvedValueOnce(mockSetlists[0])
        .mockResolvedValueOnce(mockSetlists[1])

      await handler(mockRequest as VercelRequest, mockResponse as VercelResponse)

      expect(mockKv.hgetall).toHaveBeenCalledTimes(2)
      expect(mockKv.hgetall).toHaveBeenNthCalledWith(1, 'uuid-1')
      expect(mockKv.hgetall).toHaveBeenNthCalledWith(2, 'uuid-2')
      expect(statusMock).toHaveBeenCalledWith(200)
      expect(jsonMock).toHaveBeenCalledWith(mockSetlists)
    })

    it('should handle non-existent setlist', async () => {
      mockRequest = {
        method: 'GET',
        query: { id: 'non-existent-uuid' }
      }

      mockKv.hgetall.mockResolvedValueOnce(null)

      await handler(mockRequest as VercelRequest, mockResponse as VercelResponse)

      expect(mockKv.hgetall).toHaveBeenCalledWith('non-existent-uuid')
      expect(statusMock).toHaveBeenCalledWith(200)
      expect(jsonMock).toHaveBeenCalledWith([null])
    })
  })

  describe('Error handling', () => {
    it('should handle KV storage errors for POST', async () => {
      mockRequest = {
        method: 'POST',
        body: { test: 'data' }
      }

      const kvError = new Error('KV storage error')
      mockKv.hset.mockRejectedValueOnce(kvError)

      await expect(
        handler(mockRequest as VercelRequest, mockResponse as VercelResponse)
      ).rejects.toThrow('KV storage error')
    })

    it('should handle KV storage errors for GET', async () => {
      mockRequest = {
        method: 'GET',
        query: { id: 'test-uuid' }
      }

      const kvError = new Error('KV retrieval error')
      mockKv.hgetall.mockRejectedValueOnce(kvError)

      await expect(
        handler(mockRequest as VercelRequest, mockResponse as VercelResponse)
      ).rejects.toThrow('KV retrieval error')
    })
  })

  describe('Request method handling', () => {
    it('should default to GET behavior for undefined method', async () => {
      mockRequest = {
        query: { id: 'test-uuid' }
      }

      mockKv.hgetall.mockResolvedValueOnce({ test: 'data' })

      await handler(mockRequest as VercelRequest, mockResponse as VercelResponse)

      expect(mockKv.hgetall).toHaveBeenCalledWith('test-uuid')
      expect(statusMock).toHaveBeenCalledWith(200)
    })
  })
})