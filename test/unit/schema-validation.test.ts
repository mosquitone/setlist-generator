import { describe, it, expect } from 'vitest'
import { SetListSchema } from '../../src/model'
import * as Yup from 'yup'

describe('SetListSchema', () => {
  const validSetlist = {
    meta: {
      createDate: '2024-01-01T00:00:00Z',
      version: '1.0'
    },
    band: {
      name: 'Test Band'
    },
    event: {
      name: 'Test Event',
      date: '2024-01-01',
      openTime: '18:00',
      startTime: '19:00'
    },
    playings: [
      {
        _id: '1',
        title: 'Song 1',
        note: 'Opening song'
      },
      {
        _id: '2',
        title: 'Song 2',
        note: ''
      }
    ],
    theme: 'mqtn' as const
  }

  describe('valid data', () => {
    it('should validate a complete setlist', async () => {
      const result = await SetListSchema.validate(validSetlist)
      expect(result).toEqual(validSetlist)
    })

    it('should validate with minimal required fields', async () => {
      const minimalSetlist = {
        meta: {
          createDate: '2024-01-01T00:00:00Z',
          version: '1.0'
        },
        band: {
          name: 'Minimal Band'
        },
        event: {
          name: 'Minimal Event'
        },
        playings: [
          {
            _id: '1',
            title: 'Only Song',
            note: ''
          }
        ],
        theme: 'basic' as const
      }

      const result = await SetListSchema.validate(minimalSetlist)
      expect(result.band.name).toBe('Minimal Band')
      expect(result.event.name).toBe('Minimal Event')
      expect(result.playings).toHaveLength(1)
    })

    it('should validate with all theme options', async () => {
      const themes = ['mqtn', 'basic', 'minimal'] as const
      
      for (const theme of themes) {
        const setlistWithTheme = { ...validSetlist, theme }
        const result = await SetListSchema.validate(setlistWithTheme)
        expect(result.theme).toBe(theme)
      }
    })
  })

  describe('invalid data', () => {
    it('should reject empty band name', async () => {
      const invalidSetlist = {
        ...validSetlist,
        band: { name: '' }
      }

      await expect(SetListSchema.validate(invalidSetlist)).rejects.toThrow()
    })

    it('should reject empty event name', async () => {
      const invalidSetlist = {
        ...validSetlist,
        event: { ...validSetlist.event, name: '' }
      }

      await expect(SetListSchema.validate(invalidSetlist)).rejects.toThrow()
    })

    it('should reject empty playings array', async () => {
      const invalidSetlist = {
        ...validSetlist,
        playings: []
      }

      await expect(SetListSchema.validate(invalidSetlist)).rejects.toThrow()
    })

    it('should reject playing with empty title', async () => {
      const invalidSetlist = {
        ...validSetlist,
        playings: [
          {
            _id: '1',
            title: '',
            note: 'Test note'
          }
        ]
      }

      await expect(SetListSchema.validate(invalidSetlist)).rejects.toThrow()
    })

    it('should reject invalid theme', async () => {
      const invalidSetlist = {
        ...validSetlist,
        theme: 'invalid-theme'
      }

      await expect(SetListSchema.validate(invalidSetlist)).rejects.toThrow()
    })

    it('should reject missing required meta fields', async () => {
      const invalidSetlist = {
        ...validSetlist,
        meta: { createDate: '2024-01-01T00:00:00Z' } // missing version
      }

      await expect(SetListSchema.validate(invalidSetlist)).rejects.toThrow()
    })
  })

  describe('default values', () => {
    it('should provide default values for optional fields', () => {
      const defaults = SetListSchema.getDefault()
      
      expect(defaults.meta.createDate).toBe('')
      expect(defaults.meta.version).toBe('')
      expect(defaults.band.name).toBe('')
      expect(defaults.event.name).toBe('')
      expect(defaults.event.date).toBe('')
      expect(defaults.event.openTime).toBe('')
      expect(defaults.event.startTime).toBe('')
      expect(defaults.playings).toEqual([])
      expect(defaults.theme).toBe('mqtn')
    })
  })

  describe('type inference', () => {
    it('should correctly infer types from schema', () => {
      type InferredType = Yup.InferType<typeof SetListSchema>
      
      // This test ensures the type inference works correctly
      const typedSetlist: InferredType = {
        meta: {
          createDate: '2024-01-01T00:00:00Z',
          version: '1.0'
        },
        band: {
          name: 'Type Test Band'
        },
        event: {
          name: 'Type Test Event',
          date: '2024-01-01',
          openTime: '18:00',
          startTime: '19:00'
        },
        playings: [
          {
            _id: '1',
            title: 'Type Test Song',
            note: 'Type test note'
          }
        ],
        theme: 'mqtn'
      }

      expect(typedSetlist.band.name).toBe('Type Test Band')
      expect(typedSetlist.theme).toBe('mqtn')
    })
  })
})