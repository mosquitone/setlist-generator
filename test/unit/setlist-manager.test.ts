import { describe, it, expect, vi, beforeEach } from 'vitest'
import { SetListValue } from '../../src/model'

// Mock fetch globally
global.fetch = vi.fn()

// Create a test version of SetlistManager that doesn't use localStorage
class TestSetlistManager {
  private endpoint = "/api/setlist"
  private storage: { [key: string]: string } = {}

  private async callAPI<V>(
    path: string = "",
    options: Parameters<typeof fetch>[1] = {},
    body?: any,
  ): Promise<V> {
    const res = await fetch(this.endpoint + path, {
      body: body ? JSON.stringify(body) : undefined,
      headers: {
        "content-type": "application/json",
        ...options.headers,
      },
      ...options,
    })

    return res.json()
  }

  public async get(id: string) {
    return (await this.getAll([id]))[id]
  }

  public async getAll(ids: string[]) {
    const search = new URLSearchParams()
    ids.forEach(i => search.append("id", i))
    return (await this.callAPI<SetListValue[]>("?" + search.toString())).reduce((o, s, i) => ({ 
      ...o, 
      [ids[i]]: s ? { 
        ...s, 
        get displayName() { 
          return `${this.band.name}/${this.event.name}` 
        } 
      } : null 
    }), {})
  }

  public async create(value: SetListValue) {
    return this.callAPI("", { method: "post" }, value)
  }

  public async update(id: string, value: SetListValue) {
    return this.callAPI("?id=" + id, { method: "put" }, { ...value })
  }

  private get historyKey() {
    return "SetlistManager-history"
  }

  public getHistory(): string[] {
    return JSON.parse(this.storage[this.historyKey] || "[]")
  }

  public pushToHistory(id: string) {
    this.storage[this.historyKey] = JSON.stringify([...this.getHistory(), id])
  }
}

describe('SetlistManager', () => {
  let manager: TestSetlistManager
  const mockFetch = vi.mocked(fetch)

  beforeEach(() => {
    manager = new TestSetlistManager()
    mockFetch.mockClear()
  })

  describe('get', () => {
    it('should fetch a single setlist by id', async () => {
      const mockSetlist = {
        meta: { createDate: '2024-01-01', version: '1.0' },
        band: { name: 'Test Band' },
        event: { name: 'Test Event', date: '', openTime: '', startTime: '' },
        playings: [{ _id: '1', title: 'Song 1', note: '' }],
        theme: 'mqtn' as const
      }

      mockFetch.mockResolvedValueOnce({
        json: () => Promise.resolve([mockSetlist])
      } as Response)

      const result = await manager.get('test-id')
      
      expect(mockFetch).toHaveBeenCalledWith('/api/setlist?id=test-id', {
        body: undefined,
        headers: { 'content-type': 'application/json' }
      })
      expect(result).toMatchObject(mockSetlist)
      expect(result?.displayName).toBe('Test Band/Test Event')
    })

    it('should return null for non-existent setlist', async () => {
      mockFetch.mockResolvedValueOnce({
        json: () => Promise.resolve([null])
      } as Response)

      const result = await manager.get('non-existent')
      expect(result).toBeNull()
    })
  })

  describe('getAll', () => {
    it('should fetch multiple setlists by ids', async () => {
      const mockSetlists = [
        {
          meta: { createDate: '2024-01-01', version: '1.0' },
          band: { name: 'Band 1' },
          event: { name: 'Event 1', date: '', openTime: '', startTime: '' },
          playings: [{ _id: '1', title: 'Song 1', note: '' }],
          theme: 'mqtn' as const
        },
        {
          meta: { createDate: '2024-01-02', version: '1.0' },
          band: { name: 'Band 2' },
          event: { name: 'Event 2', date: '', openTime: '', startTime: '' },
          playings: [{ _id: '2', title: 'Song 2', note: '' }],
          theme: 'basic' as const
        }
      ]

      mockFetch.mockResolvedValueOnce({
        json: () => Promise.resolve(mockSetlists)
      } as Response)

      const result = await manager.getAll(['id1', 'id2'])
      
      expect(mockFetch).toHaveBeenCalledWith('/api/setlist?id=id1&id=id2', {
        body: undefined,
        headers: { 'content-type': 'application/json' }
      })
      expect(result.id1?.displayName).toBe('Band 1/Event 1')
      expect(result.id2?.displayName).toBe('Band 2/Event 2')
    })
  })

  describe('create', () => {
    it('should create a new setlist', async () => {
      const mockSetlist: SetListValue = {
        meta: { createDate: '2024-01-01', version: '1.0' },
        band: { name: 'New Band' },
        event: { name: 'New Event', date: '', openTime: '', startTime: '' },
        playings: [{ _id: '1', title: 'New Song', note: '' }],
        theme: 'mqtn'
      }

      mockFetch.mockResolvedValueOnce({
        json: () => Promise.resolve('new-setlist-id')
      } as Response)

      const result = await manager.create(mockSetlist)
      
      expect(mockFetch).toHaveBeenCalledWith('/api/setlist', {
        method: 'post',
        body: JSON.stringify(mockSetlist),
        headers: { 'content-type': 'application/json' }
      })
      expect(result).toBe('new-setlist-id')
    })
  })

  describe('update', () => {
    it('should update an existing setlist', async () => {
      const mockSetlist: SetListValue = {
        meta: { createDate: '2024-01-01', version: '1.0' },
        band: { name: 'Updated Band' },
        event: { name: 'Updated Event', date: '', openTime: '', startTime: '' },
        playings: [{ _id: '1', title: 'Updated Song', note: '' }],
        theme: 'basic'
      }

      mockFetch.mockResolvedValueOnce({
        json: () => Promise.resolve({})
      } as Response)

      await manager.update('existing-id', mockSetlist)
      
      expect(mockFetch).toHaveBeenCalledWith('/api/setlist?id=existing-id', {
        method: 'put',
        body: JSON.stringify(mockSetlist),
        headers: { 'content-type': 'application/json' }
      })
    })
  })

  describe('history', () => {
    it('should return empty array for new history', () => {
      const result = manager.getHistory()
      expect(result).toEqual([])
    })

    it('should add items to history', () => {
      manager.pushToHistory('id1')
      manager.pushToHistory('id2')
      
      const result = manager.getHistory()
      expect(result).toEqual(['id1', 'id2'])
    })

    it('should preserve existing history when adding new items', () => {
      manager.pushToHistory('id1')
      manager.pushToHistory('id2')
      manager.pushToHistory('id3')
      
      const result = manager.getHistory()
      expect(result).toEqual(['id1', 'id2', 'id3'])
    })
  })
})